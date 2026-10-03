import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as controller from './dashboard.controller.js';

const router = Router();

router.use(auth, authorize('OWNER'));

router.get('/summary', controller.getDashboardSummary);
router.get('/utilisation', controller.getCourtUtilisation);

export default router;
