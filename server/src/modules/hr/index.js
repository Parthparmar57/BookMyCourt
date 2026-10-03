import { Router } from 'express';
import employeeRoutes from './employees/employee.routes.js';
import leaveRoutes from './leave/leave.routes.js';
import payrollRoutes from './payroll/payroll.routes.js';

const router = Router();

router.use('/employees', employeeRoutes);
router.use('/leave', leaveRoutes);
router.use('/payroll', payrollRoutes);

export { employeeRoutes, leaveRoutes, payrollRoutes };
export default router;
