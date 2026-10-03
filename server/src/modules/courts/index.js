import { Router } from 'express';
import courtRoutes from './courts/court.routes.js';
import bookingRoutes from './bookings/booking.routes.js';
import socialPlayRoutes from './social-play/social-play.routes.js';

const router = Router();

router.use('/', courtRoutes);
router.use('/bookings', bookingRoutes);
router.use('/social-play', socialPlayRoutes);

export { courtRoutes, bookingRoutes, socialPlayRoutes };
export default router;
