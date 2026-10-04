import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { genDocNo } from '../../../utils/ids.js';
import { round2 } from '../../../utils/money.js';
import { writeAudit } from '../../../utils/audit.js';
import { INVOICE_STATUS, TRANSACTION_SOURCE, PAYMENT_MODE } from '../../../shared/index.js';

export const createInvoice = async (data) => {
  const invoiceNo = genDocNo('INV');

  let amount = 0;
  let tax = 0;

  const itemsData = data.items.map((item) => {
    const unitPrice = Number(item.unitPrice);
    const quantity = Number(item.quantity || 1);
    const taxPct = Number(item.taxPct || 0);
    const lineSubtotal = round2(unitPrice * quantity);
    const lineTax = round2((lineSubtotal * taxPct) / 100);

    amount = round2(amount + lineSubtotal);
    tax = round2(tax + lineTax);

    return {
      description: item.description,
      quantity,
      unitPrice,
      taxPct,
      total: round2(lineSubtotal + lineTax),
    };
  });

  const total = round2(amount + tax);

  return prisma.invoice.create({
    data: {
      invoiceNo,
      memberId: data.memberId || null,
      companyName: data.companyName || null,
      gstin: data.gstin || null,
      clientEmail: data.clientEmail || null,
      type: data.type || 'BUSINESS',
      amount,
      tax,
      total,
      dueDate: new Date(data.dueDate),
      status: INVOICE_STATUS.DRAFT,
      items: {
        create: itemsData,
      },
    },
    include: { items: true, member: { include: { user: true } } },
  });
};

export const listInvoices = async ({ status, memberId, page = 1, limit = 20 }, actor) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 20);
  // A MEMBER may only ever see their own invoices, regardless of query params.
  const scopedMemberId = actor && actor.role === 'MEMBER' ? actor.memberId || '__none__' : memberId;

  const where = {
    ...(status && { status }),
    ...(scopedMemberId && { memberId: scopedMemberId }),
  };

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      skip: (p - 1) * l,
      take: l,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        member: { include: { user: true } },
      },
    }),
  ]);

  return { invoices, total, page: p, totalPages: Math.ceil(total / l) };
};

export const getInvoiceById = async (id, actor) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      member: { include: { user: true } },
      transactions: true,
    },
  });
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  // A MEMBER may only access their own invoice.
  if (actor && actor.role === 'MEMBER' && invoice.memberId !== actor.memberId) {
    throw new ApiError(403, 'You can only access your own invoices');
  }

  return invoice;
};

export const recordInvoicePayment = async (invoiceId, { amount, paymentMode = PAYMENT_MODE.UPI, reference, notes }) => {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new ApiError(404, 'Invoice not found');
    if (invoice.status === INVOICE_STATUS.PAID) {
      throw new ApiError(409, 'Invoice is already fully paid');
    }
    if (invoice.status === INVOICE_STATUS.CANCELLED) {
      throw new ApiError(409, 'Cannot record payment on a cancelled invoice');
    }

    const total = Number(invoice.total);
    const invoiceTax = Number(invoice.tax);

    // How much has already been paid against this invoice.
    const paidAgg = await tx.transaction.aggregate({
      where: { invoiceId: invoice.id },
      _sum: { amount: true },
    });
    const alreadyPaid = Number(paidAgg._sum.amount || 0);
    const remaining = round2(total - alreadyPaid);

    const payAmount = round2(amount);
    if (payAmount <= 0) throw new ApiError(400, 'Payment amount must be positive');
    if (payAmount > remaining) {
      throw new ApiError(422, `Payment exceeds the remaining balance of ${remaining}`);
    }

    // Post tax proportionally to the amount paid so the ledger's tax total stays correct.
    const taxPortion = total > 0 ? round2((invoiceTax * payAmount) / total) : 0;

    await tx.transaction.create({
      data: {
        transactionNo: genDocNo('TXN-INV'),
        source: invoice.type === 'MEMBERSHIP' ? TRANSACTION_SOURCE.MEMBERSHIP : TRANSACTION_SOURCE.OTHER,
        amount: payAmount,
        tax: taxPortion,
        paymentMode,
        reference: reference || invoice.invoiceNo,
        invoiceId: invoice.id,
        memberId: invoice.memberId,
        notes: notes || `Payment received for invoice ${invoice.invoiceNo}`,
      },
    });

    const fullyPaid = round2(alreadyPaid + payAmount) >= total;
    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: fullyPaid ? INVOICE_STATUS.PAID : INVOICE_STATUS.SENT },
      include: { items: true, member: true },
    });

    await writeAudit(tx, {
      action: 'INVOICE_PAYMENT',
      entity: 'Invoice',
      entityId: invoice.id,
      meta: { amount: payAmount, paymentMode, fullyPaid },
    });

    return updated;
  });
};
