import { startMembershipExpiryJob } from './membershipExpiry.job.js';
import { startLowStockJob } from './lowStock.job.js';
import { logger } from '../lib/logger.js';

export const startJobs = () => {
  try {
    startMembershipExpiryJob();
    startLowStockJob();
    logger.info('Scheduled cron jobs initialized');
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to initialize cron jobs');
  }
};
