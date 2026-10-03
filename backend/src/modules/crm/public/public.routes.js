import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
import { publicApiLimiter } from '../../../middleware/rateLimit.js';
import { publicEnquirySchema, publicTrialBookingSchema } from '../../../shared/index.js';
import * as controller from './public.controller.js';

const router = Router();

router.post('/enquiry', publicApiLimiter, validate({ body: publicEnquirySchema }), controller.submitEnquiry);
router.post('/trial', publicApiLimiter, validate({ body: publicTrialBookingSchema }), controller.bookTrial);

export default router;
