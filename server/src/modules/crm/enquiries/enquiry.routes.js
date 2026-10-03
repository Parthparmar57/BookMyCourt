import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import * as controller from './enquiry.controller.js';

const router = Router();

router.use(auth, authorize('OWNER', 'FRONT_DESK'));

router.get('/', controller.listEnquiries);
router.patch('/:id/status', controller.updateStatus);

export default router;
