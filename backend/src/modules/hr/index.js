import { Router } from 'express';
import employeeRoutes from './employees/employee.routes.js';
import attendanceRoutes from './attendance/attendance.routes.js';
import leaveRoutes from './leave/leave.routes.js';
import payrollRoutes from './payroll/payroll.routes.js';

const router = Router();

router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leave', leaveRoutes);
router.use('/payroll', payrollRoutes);

export { employeeRoutes, attendanceRoutes, leaveRoutes, payrollRoutes };
export default router;
