import { Router } from 'express';
import { auth, optionalAuth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import {
  createBookingSchema,
  cancelBookingSchema,
  bookingIdParamSchema,
  availabilityQuerySchema,
} from '../../../shared/index.js';
import * as controller from './booking.controller.js';

const router = Router();

router.get(
  '/availability',
  optionalAuth,
  validate({ query: availabilityQuerySchema }),
  controller.getAvailability
);

router.get(
  '/',
  auth,
  authorize('OWNER', 'FRONT_DESK', 'MEMBER'),
  controller.listBookings
);

router.post(
  '/',
  auth,
  authorize('OWNER', 'FRONT_DESK', 'MEMBER'),
  validate({ body: createBookingSchema }),
  controller.createBooking
);

router.patch(
  '/:id/cancel',
  auth,
  authorize('OWNER', 'FRONT_DESK', 'MEMBER'),
  validate({ params: bookingIdParamSchema, body: cancelBookingSchema }),
  controller.cancelBooking
);

export default router;
