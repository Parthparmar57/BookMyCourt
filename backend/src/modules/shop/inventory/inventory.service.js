import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { broadcastEvent } from '../../../lib/socket.js';

export const stockIn = async ({ productId, quantity, cost, supplier, notes }) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) throw new ApiError(404, 'Product not found');

  return prisma.$transaction(async (tx) => {
    // 1. Update product stock
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        stock: { increment: quantity },
      },
    });

    // 2. Log inventory transaction
    const log = await tx.inventoryLog.create({
      data: {
        productId,
        quantity,
        cost: cost ? Number(cost) : null,
        supplier: supplier || null,
        notes: notes || null,
        type: 'STOCK_IN',
      },
    });

    broadcastEvent('inventory_updated', { productId, newStock: updatedProduct.stock });
    return { product: updatedProduct, log };
  });
};

export const getInventoryLogs = async ({ productId, page = 1, limit = 20 }) => {
  const where = { ...(productId && { productId }) };

  const [total, logs] = await Promise.all([
    prisma.inventoryLog.count({ where }),
    prisma.inventoryLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    }),
  ]);

  return { logs, total, page, totalPages: Math.ceil(total / limit) };
};

export const getLowStockProducts = async () => {
  return prisma.$queryRaw`
    SELECT id, name, sku, category, stock, "reorderLevel", price
    FROM "Product"
    WHERE stock <= "reorderLevel"
    ORDER BY stock ASC
  `;
};
