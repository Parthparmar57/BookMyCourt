import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { MEMBER_STATUS } from '../shared/index.js';

export const startMembershipExpiryJob = () => {
  // Run daily at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running daily membership expiry job...');
    try {
      const now = new Date();
      const result = await prisma.member.updateMany({
        where: {
          endDate: { lt: now },
          status: MEMBER_STATUS.ACTIVE,
        },
        data: {
          status: MEMBER_STATUS.EXPIRED,
        },
      });

      if (result.count > 0) {
        logger.info(`Expired ${result.count} memberships that reached end date.`);
      }
    } catch (error) {
      logger.error({ error: error.message }, 'Error in membershipExpiry job');
    }
  });
};
