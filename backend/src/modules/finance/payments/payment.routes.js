import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import * as controller from './payment.controller.js';

const router = Router();

router.use(auth);

router.post('/create-order', controller.createOrder);
router.post('/verify', controller.verifyPayment);

export default router;
