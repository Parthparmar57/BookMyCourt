import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import {
  createInvoiceSchema,
  recordPaymentSchema,
  invoiceIdParamSchema,
} from '../../../shared/index.js';
import * as controller from './invoice.controller.js';

const router = Router();

router.use(auth);

router.post(
  '/',
  authorize('OWNER'),
  validate({ body: createInvoiceSchema }),
  controller.createInvoice
);

router.get(
  '/',
  authorize('OWNER', 'FRONT_DESK', 'MEMBER'),
  controller.listInvoices
);

router.get(
  '/:id',
  authorize('OWNER', 'FRONT_DESK', 'MEMBER'),
  validate({ params: invoiceIdParamSchema }),
  controller.getInvoice
);

router.get(
  '/:id/pdf',
  authorize('OWNER', 'FRONT_DESK', 'MEMBER'),
  validate({ params: invoiceIdParamSchema }),
  controller.downloadPDF
);

router.post(
  '/:id/payment',
  authorize('OWNER'),
  validate({ params: invoiceIdParamSchema, body: recordPaymentSchema }),
  controller.recordPayment
);

export default router;
