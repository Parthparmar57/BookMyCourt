import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import * as controller from './ledger.controller.js';

const router = Router();

router.use(auth, authorize('OWNER'));

router.get('/', controller.listTransactions);
router.get('/summary', controller.getSummary);

export default router;
