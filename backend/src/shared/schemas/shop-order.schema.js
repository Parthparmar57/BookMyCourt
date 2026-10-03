import { z } from 'zod';
import { FULFILMENT_TYPE, ORDER_CHANNEL, ORDER_STATUS, PAYMENT_MODE } from '../constants/enums.js';

export const createShopOrderSchema = z.object({
  memberId: z.string().uuid().optional().nullable(),
  channel: z.nativeEnum(ORDER_CHANNEL).default(ORDER_CHANNEL.COUNTER),
  fulfilment: z.nativeEnum(FULFILMENT_TYPE).default(FULFILMENT_TYPE.PICKUP),
  deliveryAddress: z.string().optional().nullable(),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits').optional().nullable(),
  paymentMode: z.nativeEnum(PAYMENT_MODE).default(PAYMENT_MODE.UPI),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
  })).min(1, 'Order must contain at least 1 item'),
  notes: z.string().optional().nullable(),
}).refine(d => {
  if (d.fulfilment === FULFILMENT_TYPE.DELIVERY && (!d.deliveryAddress || !d.pinCode)) {
    return false;
  }
  return true;
}, {
  message: 'Delivery address and 6-digit PIN code are required for delivery orders',
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(ORDER_STATUS),
});

export const orderIdParamSchema = z.object({ id: z.string().uuid() });
