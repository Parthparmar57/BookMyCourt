import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { broadcastEvent } from '../lib/socket.js';

export const startLowStockJob = () => {
  // Check hourly
  cron.schedule('0 * * * *', async () => {
    try {
      const lowStockProducts = await prisma.$queryRaw`
        SELECT id, name, sku, stock, "reorderLevel"
        FROM "Product"
        WHERE stock <= "reorderLevel"
      `;

      if (lowStockProducts && lowStockProducts.length > 0) {
        logger.warn({ count: lowStockProducts.length }, 'Low stock products detected');
        broadcastEvent('stock_alert', {
          type: 'LOW_STOCK',
          products: lowStockProducts,
        });
      }
    } catch (error) {
      // Ignore if table not created yet
    }
  });
};
