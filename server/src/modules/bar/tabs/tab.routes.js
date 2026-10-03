import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { openTabSchema, settleTabSchema } from '../../../shared/index.js';
import * as controller from './tab.controller.js';

const router = Router();

router.use(auth);

router.post('/', authorize('OWNER', 'BAR_STAFF', 'MEMBER'), validate({ body: openTabSchema }), controller.openTab);
router.get('/', authorize('OWNER', 'BAR_STAFF', 'MEMBER'), controller.listTabs);
router.get('/:id', authorize('OWNER', 'BAR_STAFF', 'MEMBER'), controller.getTab);
router.post('/:id/settle', authorize('OWNER', 'BAR_STAFF'), validate({ body: settleTabSchema }), controller.settleTab);

export default router;
