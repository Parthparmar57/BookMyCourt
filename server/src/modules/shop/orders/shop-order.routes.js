import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import {
  createShopOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
} from '../../../shared/index.js';
import * as controller from './shop-order.controller.js';

const router = Router();

router.use(auth);

router.post(
  '/',
  authorize('OWNER', 'SHOP_STAFF', 'MEMBER'),
  validate({ body: createShopOrderSchema }),
  controller.createOrder
);

router.get(
  '/',
  authorize('OWNER', 'SHOP_STAFF', 'MEMBER'),
  controller.listOrders
);

router.get(
  '/:id',
  validate({ params: orderIdParamSchema }),
  controller.getOrder
);

router.patch(
  '/:id/status',
  authorize('OWNER', 'SHOP_STAFF'),
  validate({ params: orderIdParamSchema, body: updateOrderStatusSchema }),
  controller.updateStatus
);

export default router;
