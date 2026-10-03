import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import {
  createLeadSchema,
  updateLeadSchema,
  leadIdParamSchema,
  createFollowUpSchema,
  createQuotationSchema,
  updateQuotationStatusSchema,
  convertLeadSchema,
} from '../../../shared/index.js';
import * as controller from './lead.controller.js';

const router = Router();

router.use(auth, authorize('OWNER', 'FRONT_DESK'));

router.get('/', controller.listLeads);
router.post('/', validate({ body: createLeadSchema }), controller.createLead);
router.get('/:id', validate({ params: leadIdParamSchema }), controller.getLead);
router.patch('/:id', validate({ params: leadIdParamSchema, body: updateLeadSchema }), controller.updateLead);

router.post('/:id/follow-ups', validate({ params: leadIdParamSchema, body: createFollowUpSchema }), controller.addFollowUp);
router.post('/:id/quotations', validate({ params: leadIdParamSchema, body: createQuotationSchema }), controller.createQuotation);
router.patch('/quotations/:id/status', validate({ body: updateQuotationStatusSchema }), controller.updateQuotationStatus);
router.post('/:id/convert', validate({ params: leadIdParamSchema, body: convertLeadSchema }), controller.convertLead);

export default router;
