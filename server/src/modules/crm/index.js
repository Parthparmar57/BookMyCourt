import { Router } from 'express';
import publicRoutes from './public/public.routes.js';
import enquiryRoutes from './enquiries/enquiry.routes.js';
import leadRoutes from './leads/lead.routes.js';

const router = Router();

router.use('/public', publicRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/leads', leadRoutes);

export { publicRoutes, enquiryRoutes, leadRoutes };
export default router;
