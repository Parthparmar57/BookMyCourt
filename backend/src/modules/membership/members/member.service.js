import bcrypt from 'bcryptjs';
import { addMonths, differenceInYears, differenceInDays } from 'date-fns';
import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { generateQRCodeDataUrl } from '../../../lib/qr.js';
import { genDocNo } from '../../../utils/ids.js';
import { round2 } from '../../../utils/money.js';
import { writeAudit } from '../../../utils/audit.js';
import { MEMBER_STATUS, ROLES, TRANSACTION_SOURCE, PAYMENT_MODE, INVOICE_STATUS } from '../../../shared/index.js';

export const registerMember = async (data, createdById) => {
  const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
  if (!plan) throw new ApiError(404, 'Selected plan not found');

  // Rule BR6: Junior plan only for members under 18
  const age = differenceInYears(new Date(data.startDate), new Date(data.dob));
  if (plan.maxAge && age >= plan.maxAge) {
    throw new ApiError(422, `Member age is ${age}. This plan requires age under ${plan.maxAge}`);
  }

  // Check unique email and phone
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { phone: data.phone }] },
  });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email or phone number already exists');
  }

  const startDate = new Date(data.startDate);
  const endDate = addMonths(startDate, plan.durationMonths);
  const memberNo = genDocNo('MEM');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password || 'Member@123', salt);

  const qrData = JSON.stringify({ memberNo, email: data.email, plan: plan.name });
  const qrCode = await generateQRCodeDataUrl(qrData);

  return prisma.$transaction(async (tx) => {
    // 1. Create user account
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: ROLES.MEMBER,
      },
    });

    // 2. Create member profile
    const member = await tx.member.create({
      data: {
        memberNo,
        userId: user.id,
        planId: plan.id,
        dob: new Date(data.dob),
        emergencyContact: data.emergencyContact || null,
        photoUrl: data.photoUrl || null,
        status: MEMBER_STATUS.ACTIVE,
        qrCode,
        startDate,
        endDate,
      },
      include: {
        plan: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // 3. Create invoice for membership fee
    const invoiceNo = genDocNo('INV-MEM');
    const invoice = await tx.invoice.create({
      data: {
        invoiceNo,
        memberId: member.id,
        type: 'MEMBERSHIP',
        amount: plan.price,
        tax: 0,
        total: plan.price,
        dueDate: startDate,
        status: INVOICE_STATUS.PAID,
        items: {
          create: [
            {
              description: `${plan.name} Membership (${plan.durationMonths} months)`,
              quantity: 1,
              unitPrice: plan.price,
              taxPct: 0,
              total: plan.price,
            },
          ],
        },
      },
    });

    // 4. Post to Transaction Ledger (Rule BR11)
    await tx.transaction.create({
      data: {
        transactionNo: genDocNo('TXN-MEM'),
        source: TRANSACTION_SOURCE.MEMBERSHIP,
        amount: plan.price,
        tax: 0,
        paymentMode: PAYMENT_MODE.UPI,
        reference: invoice.invoiceNo,
        invoiceId: invoice.id,
        memberId: member.id,
        notes: `New registration for ${plan.name} plan`,
      },
    });

    await writeAudit(tx, {
      actorId: createdById || null,
      action: 'MEMBER_REGISTER',
      entity: 'Member',
      entityId: member.id,
      meta: { planId: plan.id, memberNo },
    });

    return member;
  });
};

export const searchMembers = async ({ q, planId, status, page = 1, limit = 20 }) => {
  const where = {
    ...(status && { status }),
    ...(planId && { planId }),
    ...(q && {
      OR: [
        { memberNo: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { phone: { contains: q } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, members] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        plan: true,
      },
    }),
  ]);

  return { members, total, page, totalPages: Math.ceil(total / limit) };
};

const STAFF_ROLES = new Set([ROLES.OWNER, ROLES.FRONT_DESK, ROLES.BAR_STAFF, ROLES.SHOP_STAFF]);

export const getMemberProfile = async (idOrMemberNo, actor) => {
  const member = await prisma.member.findFirst({
    where: {
      OR: [{ id: idOrMemberNo }, { memberNo: idOrMemberNo }],
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      plan: true,
      bookings: {
        take: 10,
        orderBy: { startTime: 'desc' },
        include: { court: true },
      },
      orders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      },
      tabs: {
        where: { status: 'OPEN' },
        take: 5,
      },
      invoices: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      transactions: {
        take: 10,
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!member) throw new ApiError(404, 'Member not found');

  // A MEMBER may only view their own profile; staff may view anyone.
  if (actor && !STAFF_ROLES.has(actor.role) && member.userId !== actor.id) {
    throw new ApiError(403, 'You can only view your own profile');
  }

  return member;
};

export const renewMembership = async (memberId, { planId, paymentMode = PAYMENT_MODE.UPI }, actor) => {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { plan: true },
  });
  if (!member) throw new ApiError(404, 'Member not found');

  // A MEMBER may only renew/upgrade their own membership.
  if (actor && actor.role === ROLES.MEMBER && member.userId !== actor.id) {
    throw new ApiError(403, 'You can only renew your own membership');
  }

  const newPlan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!newPlan) throw new ApiError(404, 'Plan not found');

  const now = new Date();
  const currentEnd = new Date(member.endDate);
  const baseDate = currentEnd > now ? currentEnd : now;
  const newEndDate = addMonths(baseDate, newPlan.durationMonths);

  // Pro-rated upgrade: if the member is still active and switching to a different
  // plan, credit the unused value of the remaining days on the current plan.
  const isUpgrade = newPlan.id !== member.planId && currentEnd > now;
  let credit = 0;
  if (isUpgrade && member.plan) {
    const remainingDays = Math.max(0, differenceInDays(currentEnd, now));
    const currentPlanDays = (member.plan.durationMonths || 1) * 30;
    const currentDailyRate = Number(member.plan.price) / currentPlanDays;
    credit = round2(remainingDays * currentDailyRate);
  }

  const price = Number(newPlan.price);
  const chargeAmount = round2(Math.max(0, price - credit));
  const description = isUpgrade
    ? `Upgrade to ${newPlan.name} (${newPlan.durationMonths} months, pro-rated credit ${credit})`
    : `Renewal of ${newPlan.name} (${newPlan.durationMonths} months)`;

  return prisma.$transaction(async (tx) => {
    const updatedMember = await tx.member.update({
      where: { id: memberId },
      data: {
        planId: newPlan.id,
        endDate: newEndDate,
        status: MEMBER_STATUS.ACTIVE,
      },
      include: { plan: true, user: true },
    });

    const invoice = await tx.invoice.create({
      data: {
        invoiceNo: genDocNo('INV-REN'),
        memberId: member.id,
        type: 'MEMBERSHIP',
        amount: chargeAmount,
        tax: 0,
        total: chargeAmount,
        dueDate: now,
        status: INVOICE_STATUS.PAID,
        items: {
          create: [
            {
              description,
              quantity: 1,
              unitPrice: chargeAmount,
              taxPct: 0,
              total: chargeAmount,
            },
          ],
        },
      },
    });

    await tx.transaction.create({
      data: {
        transactionNo: genDocNo('TXN-REN'),
        source: TRANSACTION_SOURCE.MEMBERSHIP,
        amount: chargeAmount,
        tax: 0,
        paymentMode,
        reference: invoice.invoiceNo,
        invoiceId: invoice.id,
        memberId: member.id,
        notes: description,
      },
    });

    return updatedMember;
  });
};
