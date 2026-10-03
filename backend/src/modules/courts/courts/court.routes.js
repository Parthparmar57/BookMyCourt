import { Router } from 'express';
import { auth, optionalAuth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createCourtSchema, updateCourtSchema, courtIdParamSchema } from '../../../shared/index.js';
import * as controller from './court.controller.js';

const router = Router();

router.get('/', optionalAuth, controller.listCourts);
router.get('/:id', validate({ params: courtIdParamSchema }), controller.getCourt);

router.post('/', auth, authorize('OWNER'), validate({ body: createCourtSchema }), controller.createCourt);
router.patch('/:id', auth, authorize('OWNER'), validate({ params: courtIdParamSchema, body: updateCourtSchema }), controller.updateCourt);
router.delete('/:id', auth, authorize('OWNER'), validate({ params: courtIdParamSchema }), controller.deleteCourt);

export default router;
