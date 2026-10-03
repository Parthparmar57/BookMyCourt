import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { LEAD_STAGE, QUOTATION_STATUS } from '../../../shared/index.js';
import { genDocNo } from '../../../utils/ids.js';
import { registerMember } from '../../membership/members/member.service.js';

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

const ALLOWED_STAGE_TRANSITIONS = {
  NEW: ['CONTACTED', 'LOST'],
  CONTACTED: ['QUOTED', 'LOST'],
  QUOTED: ['WON', 'LOST'],
  WON: [], // Terminal — converted to member
  LOST: ['CONTACTED'], // Reopen lead
};

export const updateLead = async (id, data) => {
  const currentLead = await prisma.lead.findUnique({ where: { id } });
  if (!currentLead) throw new ApiError(404, 'Lead not found');

  if (data.stage && data.stage !== currentLead.stage) {
    const allowed = ALLOWED_STAGE_TRANSITIONS[currentLead.stage] || [];
    if (!allowed.includes(data.stage)) {
      throw new ApiError(
        400,
        `Invalid CRM stage transition from ${currentLead.stage} to ${data.stage}. Stage progression is forward-only.`
      );
    }
  }

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
  const quotationNo = genDocNo('QUO');
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

// PRD M6: a Won lead converts to a member. Conversion is explicit because a lead
// does not carry the plan, date of birth (needed for the BR6 age check) or start
// date that member registration requires.
export const convertLeadToMember = async (leadId, data, actorId) => {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new ApiError(404, 'Lead not found');

  const email = data.email || lead.email;
  if (!email) {
    throw new ApiError(400, 'An email address is required to create a member account');
  }

  const member = await registerMember(
    {
      name: lead.name,
      phone: lead.phone,
      email,
      planId: data.planId,
      dob: data.dob,
      startDate: data.startDate,
      password: data.password,
      emergencyContact: data.emergencyContact || null,
    },
    actorId
  );

  await prisma.lead.update({ where: { id: leadId }, data: { stage: LEAD_STAGE.WON } });
  return member;
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

// ─── G1: Quotation PDF helper ─────────────────────────────────────────────────
export const getQuotationById = async (id) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { lead: true, plan: true },
  });
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  return quotation;
};
