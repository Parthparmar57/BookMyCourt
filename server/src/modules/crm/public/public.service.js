import { prisma } from '../../../lib/prisma.js';
import { LEAD_STAGE, ROLES } from '../../../shared/index.js';
import { sendEmail } from '../../../lib/mailer.js';
import { logger } from '../../../lib/logger.js';
import { getAvailability } from '../../courts/bookings/booking.service.js';
import { getEnquiryAcknowledgmentTemplate } from '../../../utils/emailTemplates.js';

// Notify front-desk/owner staff of a new lead (best-effort; never blocks the request).
const notifyStaff = async (subject, text) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: [ROLES.OWNER, ROLES.FRONT_DESK] } },
      select: { email: true },
    });
    const emails = staff.map((s) => s.email).filter(Boolean);
    if (emails.length > 0) await sendEmail({ to: emails.join(','), subject, text });
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to notify staff of new lead');
  }
};

// Send auto-acknowledgment email to the visitor
const sendVisitorAcknowledgment = async ({ name, email, interest, message }) => {
  if (!email) return;
  try {
    const html = getEnquiryAcknowledgmentTemplate({ name, interest, message });
    await sendEmail({
      to: email,
      subject: 'Inquiry Received · The Champions Club',
      html,
    });
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to send visitor acknowledgment email');
  }
};

// --- Public read endpoints (PRD M5) ---

export const getPublicPlans = async () => {
  return prisma.plan.findMany({ orderBy: { price: 'asc' } });
};

export const getPublicAvailability = async ({ date, sport }) => {
  return getAvailability({ date: date ? new Date(date) : new Date(), sport });
};

export const getPublicShop = async () => {
  // Only show items that can actually be ordered.
  return prisma.product.findMany({
    where: { stock: { gt: 0 } },
    select: { id: true, name: true, category: true, brand: true, variant: true, price: true, imageUrl: true, stock: true },
    orderBy: { category: 'asc' },
  });
};

export const submitEnquiry = async (data) => {
  const enquiry = await prisma.$transaction(async (tx) => {
    // 1. Create Enquiry record
    const created = await tx.enquiry.create({
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

    return created;
  });

  await notifyStaff('New website enquiry', `New enquiry from ${data.name} (${data.phone}). Interest: ${data.interest || 'N/A'}`);
  await sendVisitorAcknowledgment({
    name: data.name,
    email: data.email,
    interest: data.interest || 'General Membership & Court Inquiry',
    message: data.message,
  });

  return enquiry;
};

export const bookTrial = async (data) => {
  const trial = await prisma.$transaction(async (tx) => {
    // 1. Create TrialBooking
    const created = await tx.trialBooking.create({
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
      where: { id: created.id },
      data: { leadId: lead.id },
    });

    return created;
  });

  await notifyStaff('New trial booking', `${data.name} (${data.phone}) requested a ${data.sport} trial on ${new Date(data.preferredDate).toDateString()} at ${data.preferredTime}.`);
  await sendVisitorAcknowledgment({
    name: data.name,
    email: data.email,
    interest: `Free Trial Session in ${data.sport} (${new Date(data.preferredDate).toLocaleDateString('en-GB')} at ${data.preferredTime})`,
    message: `Trial session booking requested on ${data.sport} court.`,
  });

  return trial;
};

