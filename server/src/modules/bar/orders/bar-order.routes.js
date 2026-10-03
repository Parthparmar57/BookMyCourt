import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createBarOrderSchema, settleBarOrderSchema } from '../../../shared/index.js';
import * as controller from './bar-order.controller.js';

const router = Router();

router.use(auth);

router.post(
  '/',
  authorize('OWNER', 'BAR_STAFF', 'MEMBER'),
  validate({ body: createBarOrderSchema }),
  controller.createOrder
);

router.get(
  '/',
  authorize('OWNER', 'BAR_STAFF', 'KITCHEN', 'MEMBER'),
  controller.listOrders
);

router.post(
  '/:id/settle',
  authorize('OWNER', 'BAR_STAFF'),
  validate({ body: settleBarOrderSchema }),
  controller.settleOrder
);

router.patch(
  '/:id/status',
  authorize('OWNER', 'BAR_STAFF', 'KITCHEN'),
  controller.updateOrderStatus
);

router.post(
  '/:id/void',
  authorize('OWNER'),
  controller.voidOrder
);

export default router;
