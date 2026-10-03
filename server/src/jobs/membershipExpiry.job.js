import cron from 'node-cron';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { sendEmail } from '../lib/mailer.js';
import { MEMBER_STATUS } from '../shared/index.js';

const REMINDER_DAYS = [15, 7, 1];

const sendExpiryReminders = async (now) => {
  for (const daysBefore of REMINDER_DAYS) {
    const targetDay = addDays(now, daysBefore);
    const members = await prisma.member.findMany({
      where: {
        status: MEMBER_STATUS.ACTIVE,
        endDate: { gte: startOfDay(targetDay), lte: endOfDay(targetDay) },
      },
      include: { user: true, plan: true },
    });

    for (const member of members) {
      if (!member.user?.email) continue;
      await sendEmail({
        to: member.user.email,
        subject: `Your BookMyCourt membership expires in ${daysBefore} day(s)`,
        text: `Hi ${member.user.name}, your ${member.plan?.name || ''} membership expires on ${new Date(member.endDate).toDateString()}. Please renew to keep your benefits.`,
      });
    }
    if (members.length > 0) {
      logger.info(`Sent ${members.length} expiry reminder(s) for the ${daysBefore}-day threshold.`);
    }
  }
};

export const runMembershipExpiry = async () => {
  const now = new Date();

  // 1. Flip memberships whose end date has passed to EXPIRED (BR7).
  const result = await prisma.member.updateMany({
    where: { endDate: { lt: now }, status: MEMBER_STATUS.ACTIVE },
    data: { status: MEMBER_STATUS.EXPIRED },
  });
  if (result.count > 0) {
    logger.info(`Expired ${result.count} memberships that reached end date.`);
  }

  // 2. Send 15/7/1-day reminders (BR7).
  await sendExpiryReminders(now);
};

export const startMembershipExpiryJob = () => {
  // Daily at 00:05 IST so the "expiry day" aligns with the club's timezone.
  cron.schedule(
    '5 0 * * *',
    async () => {
      logger.info('Running daily membership expiry job...');
      try {
        await runMembershipExpiry();
      } catch (error) {
        logger.error({ error: error.message }, 'Error in membershipExpiry job');
      }
    },
    { timezone: 'Asia/Kolkata' }
  );
};
