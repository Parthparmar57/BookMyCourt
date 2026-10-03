import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
import { publicApiLimiter } from '../../../middleware/rateLimit.js';
import { publicEnquirySchema, publicTrialBookingSchema } from '../../../shared/index.js';
import * as controller from './public.controller.js';

const router = Router();

router.post('/enquiry', publicApiLimiter, validate({ body: publicEnquirySchema }), controller.submitEnquiry);
router.post('/trial', publicApiLimiter, validate({ body: publicTrialBookingSchema }), controller.bookTrial);

// Public read-only website data (PRD M5).
router.get('/plans', publicApiLimiter, controller.getPlans);
router.get('/availability', publicApiLimiter, controller.getAvailability);
router.get('/shop', publicApiLimiter, controller.getShop);

export default router;
