import { z } from 'zod';
import { PRODUCT_CATEGORY } from '../constants/enums.js';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(120),
  category: z.nativeEnum(PRODUCT_CATEGORY),
  sku: z.string().min(3).regex(/^[A-Z0-9-]+$/, 'SKU must be uppercase letters, numbers, and dashes'),
  brand: z.string().optional().nullable(),
  variant: z.string().optional().nullable(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  taxPct: z.coerce.number().min(0).max(100).default(18),
  stock: z.coerce.number().int().min(0).default(0),
  reorderLevel: z.coerce.number().int().min(0).default(5),
  imageUrl: z.string().url().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();
export const productIdParamSchema = z.object({ id: z.string().uuid() });

export const stockInSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
  cost: z.coerce.number().min(0).optional().nullable(),
  supplier: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
