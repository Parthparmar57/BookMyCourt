import { prisma } from '../../../lib/prisma.js';
import { LEAD_STAGE } from '../../../shared/index.js';

export const submitEnquiry = async (data) => {
  return prisma.$transaction(async (tx) => {
    // 1. Create Enquiry record
    const enquiry = await tx.enquiry.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        interest: data.interest || null,
        message: data.message || null,
      },
    });

    // 2. Auto-create Lead in CRM (PRD Scene 5)
    await tx.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        source: 'WEBSITE_ENQUIRY',
        interest: data.interest || null,
        stage: LEAD_STAGE.NEW,
      },
    });

    return enquiry;
  });
};

export const bookTrial = async (data) => {
  return prisma.$transaction(async (tx) => {
    // 1. Create TrialBooking
    const trial = await tx.trialBooking.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        sport: data.sport,
        preferredDate: new Date(data.preferredDate),
        preferredTime: data.preferredTime,
        courtId: data.courtId || null,
      },
    });

    // 2. Auto-create Lead in CRM (PRD Scene 5)
    const lead = await tx.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        source: 'WEBSITE_TRIAL',
        interest: `Trial session in ${data.sport}`,
        stage: LEAD_STAGE.NEW,
      },
    });

    await tx.trialBooking.update({
      where: { id: trial.id },
      data: { leadId: lead.id },
    });

    return trial;
  });
};
