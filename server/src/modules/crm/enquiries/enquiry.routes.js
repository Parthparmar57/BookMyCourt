import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { updateEnquiryStatusSchema, enquiryIdParamSchema } from '../../../shared/index.js';
import * as controller from './enquiry.controller.js';

const router = Router();

router.use(auth, authorize('OWNER', 'FRONT_DESK'));

router.get('/', controller.listEnquiries);
router.patch(
  '/:id/status',
  validate({ params: enquiryIdParamSchema, body: updateEnquiryStatusSchema }),
  controller.updateStatus
);

export default router;
