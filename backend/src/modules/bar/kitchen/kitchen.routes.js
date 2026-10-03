import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { updateKitchenStatusSchema } from '../../../shared/index.js';
import * as controller from './kitchen.controller.js';

const router = Router();

router.use(auth);

// OWNER, KITCHEN, and BAR_STAFF can access kitchen screen
router.get('/queue', authorize('OWNER', 'KITCHEN', 'BAR_STAFF'), controller.getQueue);
router.patch('/:id/status', authorize('OWNER', 'KITCHEN', 'BAR_STAFF'), validate({ body: updateKitchenStatusSchema }), controller.updateStatus);

export default router;
