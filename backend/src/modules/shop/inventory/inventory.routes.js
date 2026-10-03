import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { stockInSchema } from '../../../shared/index.js';
import * as controller from './inventory.controller.js';

const router = Router();

router.use(auth, authorize('OWNER', 'SHOP_STAFF'));

router.post('/stock-in', validate({ body: stockInSchema }), controller.stockIn);
router.get('/logs', controller.getLogs);
router.get('/low-stock', controller.getLowStock);

export default router;
