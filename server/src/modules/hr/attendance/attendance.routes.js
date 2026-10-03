import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import * as controller from './attendance.controller.js';

const router = Router();

router.use(auth);

// Any staff can check in/out
router.post('/check-in', authorize('OWNER', 'FRONT_DESK', 'BAR_STAFF', 'KITCHEN', 'SHOP_STAFF'), controller.checkIn);
router.post('/check-out', authorize('OWNER', 'FRONT_DESK', 'BAR_STAFF', 'KITCHEN', 'SHOP_STAFF'), controller.checkOut);
router.get('/', authorize('OWNER'), controller.listAttendance);

export default router;
