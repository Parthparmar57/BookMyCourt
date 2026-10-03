import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createOrderSchema, verifyPaymentSchema } from '../../../shared/index.js';
import * as controller from './payment.controller.js';

const router = Router();

router.use(auth, authorize('OWNER', 'FRONT_DESK', 'MEMBER', 'SHOP_STAFF', 'BAR_STAFF'));

router.post('/create-order', validate({ body: createOrderSchema }), controller.createOrder);
router.post('/verify', validate({ body: verifyPaymentSchema }), controller.verifyPayment);

export default router;
