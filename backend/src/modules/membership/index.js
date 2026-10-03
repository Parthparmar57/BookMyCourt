import { Router } from 'express';
import planRoutes from './plans/plan.routes.js';
import memberRoutes from './members/member.routes.js';

const router = Router();

router.use('/plans', planRoutes);
router.use('/members', memberRoutes);

export { planRoutes, memberRoutes };
export default router;
