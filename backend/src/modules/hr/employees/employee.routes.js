import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createEmployeeSchema, employeeIdParamSchema } from '../../../shared/index.js';
import * as controller from './employee.controller.js';

const router = Router();

router.use(auth);

router.get('/', authorize('OWNER'), controller.listEmployees);
router.post('/', authorize('OWNER'), validate({ body: createEmployeeSchema }), controller.createEmployee);
router.get('/:id', authorize('OWNER'), validate({ params: employeeIdParamSchema }), controller.getEmployee);
router.patch('/:id', authorize('OWNER'), validate({ params: employeeIdParamSchema }), controller.updateEmployee);

export default router;
