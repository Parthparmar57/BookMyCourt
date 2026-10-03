import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as controller from './report.controller.js';

const router = Router();

router.use(auth, authorize('OWNER'));

router.get('/tax', controller.getTaxReport);
router.get('/inventory', controller.getInventoryReport);
router.get('/inventory/export', controller.exportInventoryExcel);
router.get('/membership', controller.getMembershipReport);

export default router;
