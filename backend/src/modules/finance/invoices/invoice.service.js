import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { INVOICE_STATUS, TRANSACTION_SOURCE, PAYMENT_MODE } from '../../../shared/index.js';

export const createInvoice = async (data) => {
  const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;

  let amount = 0;
  let tax = 0;

  const itemsData = data.items.map((item) => {
    const unitPrice = Number(item.unitPrice);
    const quantity = Number(item.quantity || 1);
    const taxPct = Number(item.taxPct || 0);
    const lineSubtotal = unitPrice * quantity;
    const lineTax = (lineSubtotal * taxPct) / 100;

    amount += lineSubtotal;
    tax += lineTax;

    return {
      description: item.description,
      quantity,
      unitPrice,
      taxPct,
      total: lineSubtotal + lineTax,
    };
  });

  const total = amount + tax;

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

export const listInvoices = async ({ status, memberId, page = 1, limit = 20 }) => {
  const where = {
    ...(status && { status }),
    ...(memberId && { memberId }),
  };

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        member: { include: { user: true } },
      },
    }),
  ]);

  return { invoices, total, page, totalPages: Math.ceil(total / limit) };
};

export const getInvoiceById = async (id) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      member: { include: { user: true } },
      transactions: true,
    },
  });
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  return invoice;
};

export const recordInvoicePayment = async (invoiceId, { amount, paymentMode = PAYMENT_MODE.UPI, reference, notes }) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  return prisma.$transaction(async (tx) => {
    const updatedInvoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: INVOICE_STATUS.PAID },
      include: { items: true, member: true },
    });

    await tx.transaction.create({
      data: {
        transactionNo: `TXN-INV-${Date.now().toString().slice(-6)}`,
        source: invoice.type === 'MEMBERSHIP' ? TRANSACTION_SOURCE.MEMBERSHIP : TRANSACTION_SOURCE.OTHER,
        amount: Number(amount || invoice.total),
        tax: Number(invoice.tax || 0),
        paymentMode,
        reference: reference || invoice.invoiceNo,
        invoiceId: invoice.id,
        memberId: invoice.memberId,
        notes: notes || `Payment received for invoice ${invoice.invoiceNo}`,
      },
    });

    return updatedInvoice;
  });
};
