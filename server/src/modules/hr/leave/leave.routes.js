import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createLeaveRequestSchema, updateLeaveStatusSchema, leaveIdParamSchema } from '../../../shared/index.js';
import * as controller from './leave.controller.js';

const router = Router();

router.use(auth);

// Leave is staff-only — MEMBER has no employee record and must never reach HR data.
const STAFF = ['OWNER', 'FRONT_DESK', 'BAR_STAFF', 'SHOP_STAFF', 'KITCHEN'];

router.post('/', authorize(...STAFF), validate({ body: createLeaveRequestSchema }), controller.requestLeave);
router.get('/', authorize(...STAFF), controller.listLeaves);
router.patch('/:id/status', authorize('OWNER'), validate({ params: leaveIdParamSchema, body: updateLeaveStatusSchema }), controller.updateStatus);

export default router;
