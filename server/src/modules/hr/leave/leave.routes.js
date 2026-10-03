import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createLeaveRequestSchema, updateLeaveStatusSchema, leaveIdParamSchema } from '../../../shared/index.js';
import * as controller from './leave.controller.js';

const router = Router();

router.use(auth);

router.post('/', validate({ body: createLeaveRequestSchema }), controller.requestLeave);
router.get('/', controller.listLeaves);
router.patch('/:id/status', authorize('OWNER'), validate({ params: leaveIdParamSchema, body: updateLeaveStatusSchema }), controller.updateStatus);

export default router;
