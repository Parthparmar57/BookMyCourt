import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { broadcastEvent } from '../lib/socket.js';

export const startLowStockJob = () => {
  // Check hourly
  cron.schedule('0 * * * *', async () => {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          reorderLevel: true,
        },
      });

      const lowStockProducts = products.filter((p) => p.stock <= p.reorderLevel);

      if (lowStockProducts && lowStockProducts.length > 0) {
        logger.warn({ count: lowStockProducts.length }, 'Low stock products detected');
        broadcastEvent('stock_alert', {
          type: 'LOW_STOCK',
          products: lowStockProducts,
        });
      }
    } catch (error) {
      logger.error({ error: error.message }, 'Error in lowStock job');
    }
  });
};
