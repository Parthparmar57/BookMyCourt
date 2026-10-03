import { Router } from 'express';
import { auth, optionalAuth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createPlanSchema, updatePlanSchema, planIdParamSchema } from '../../../shared/index.js';
import * as controller from './plan.controller.js';

const router = Router();

// Public / all logged in can view plans
router.get('/', optionalAuth, controller.listPlans);
router.get('/:id', validate({ params: planIdParamSchema }), controller.getPlan);

// Only OWNER can modify plans
router.post('/', auth, authorize('OWNER'), validate({ body: createPlanSchema }), controller.createPlan);
router.patch('/:id', auth, authorize('OWNER'), validate({ params: planIdParamSchema, body: updatePlanSchema }), controller.updatePlan);
router.delete('/:id', auth, authorize('OWNER'), validate({ params: planIdParamSchema }), controller.deletePlan);

export default router;
