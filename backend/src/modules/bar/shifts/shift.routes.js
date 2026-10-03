import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { openShiftSchema, closeShiftSchema, shiftIdParamSchema } from '../../../shared/index.js';
import * as controller from './shift.controller.js';

const router = Router();

router.use(auth);

router.post('/open', authorize('OWNER', 'BAR_STAFF'), validate({ body: openShiftSchema }), controller.openShift);
router.post('/:id/close', authorize('OWNER', 'BAR_STAFF'), validate({ params: shiftIdParamSchema, body: closeShiftSchema }), controller.closeShift);
router.get('/active', authorize('OWNER', 'BAR_STAFF'), controller.getActiveShift);
router.get('/:id/report', authorize('OWNER', 'BAR_STAFF'), validate({ params: shiftIdParamSchema }), controller.getShiftReport);

export default router;
