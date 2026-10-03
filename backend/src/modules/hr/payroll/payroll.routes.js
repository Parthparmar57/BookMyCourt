import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { runPayrollSchema, updatePayrollStatusSchema, payrollIdParamSchema } from '../../../shared/index.js';
import * as controller from './payroll.controller.js';

const router = Router();

router.use(auth);

router.post('/run', authorize('OWNER'), validate({ body: runPayrollSchema }), controller.runPayroll);
router.get('/', authorize('OWNER'), controller.listPayrolls);
router.patch('/:id/status', authorize('OWNER'), validate({ params: payrollIdParamSchema, body: updatePayrollStatusSchema }), controller.updateStatus);

export default router;
