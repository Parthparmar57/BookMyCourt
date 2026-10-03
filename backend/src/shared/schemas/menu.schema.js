import { z } from 'zod';
import { MENU_CATEGORY } from '../constants/enums.js';

export const createMenuItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  category: z.nativeEnum(MENU_CATEGORY),
  price: z.coerce.number().positive('Price must be greater than 0'),
  taxPct: z.coerce.number().min(0).max(100).default(5),
  isAvailable: z.boolean().default(true),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();
export const menuItemIdParamSchema = z.object({ id: z.string().uuid() });
