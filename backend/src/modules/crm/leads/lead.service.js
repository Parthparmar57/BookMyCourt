import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { LEAD_STAGE, QUOTATION_STATUS } from '../../../shared/index.js';

export const listLeads = async ({ stage, assignedToId }) => {
  return prisma.lead.findMany({
    where: {
      ...(stage && { stage }),
      ...(assignedToId && { assignedToId }),
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      quotations: true,
      followUps: { orderBy: { date: 'desc' } },
      trialBookings: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
};

export const getLeadById = async (id) => {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      quotations: { include: { plan: true } },
      followUps: { orderBy: { date: 'desc' } },
      trialBookings: true,
    },
  });
  if (!lead) throw new ApiError(404, 'Lead not found');
  return lead;
};

export const createLead = async (data) => {
  return prisma.lead.create({ data });
};

export const updateLead = async (id, data) => {
  return prisma.lead.update({
    where: { id },
    data,
  });
};

export const addFollowUp = async (leadId, data) => {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new ApiError(404, 'Lead not found');

  return prisma.leadFollowUp.create({
    data: {
      leadId,
      date: new Date(data.date),
      type: data.type || 'CALL',
      notes: data.notes,
    },
  });
};

export const createQuotation = async (data) => {
  const quotationNo = `QUO-${Date.now().toString().slice(-6)}`;
  const amount = Number(data.amount);
  const discount = Number(data.discount || 0);
  const total = Math.max(0, amount - discount);

  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.create({
      data: {
        quotationNo,
        leadId: data.leadId,
        planId: data.planId || null,
        amount,
        discount,
        total,
        validUntil: new Date(data.validUntil),
        status: QUOTATION_STATUS.DRAFT,
      },
      include: { lead: true, plan: true },
    });

    // Update lead stage to QUOTED automatically
    await tx.lead.update({
      where: { id: data.leadId },
      data: { stage: LEAD_STAGE.QUOTED },
    });

    return quotation;
  });
};

export const updateQuotationStatus = async (id, status) => {
  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.update({
      where: { id },
      data: { status },
      include: { lead: true },
    });

    if (status === QUOTATION_STATUS.ACCEPTED) {
      await tx.lead.update({
        where: { id: quotation.leadId },
        data: { stage: LEAD_STAGE.WON },
      });
    } else if (status === QUOTATION_STATUS.REJECTED) {
      await tx.lead.update({
        where: { id: quotation.leadId },
        data: { stage: LEAD_STAGE.LOST },
      });
    }

    return quotation;
  });
};
