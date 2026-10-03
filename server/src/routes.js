import { Router } from 'express';
import { authRoutes } from './modules/auth/index.js';
import { userRoutes } from './modules/users/index.js';
import membershipRoutes, { planRoutes, memberRoutes } from './modules/membership/index.js';
import courtRoutes, { bookingRoutes, socialPlayRoutes } from './modules/courts/index.js';
import shopRoutes, { productRoutes, inventoryRoutes, orderRoutes } from './modules/shop/index.js';
import barRoutes, { tableRoutes, barOrderRoutes, tabRoutes, kitchenRoutes, menuRoutes, shiftRoutes } from './modules/bar/index.js';
import crmRoutes, { publicRoutes, enquiryRoutes, leadRoutes } from './modules/crm/index.js';
import financeRoutes, { paymentRoutes, ledgerRoutes, invoiceRoutes, expenseRoutes } from './modules/finance/index.js';
import hrRoutes, { employeeRoutes, leaveRoutes, payrollRoutes } from './modules/hr/index.js';
import { dashboardRoutes } from './modules/dashboard/index.js';
import { reportRoutes } from './modules/reports/index.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BookMyCourt (The Champions Club Backend)',
  });
});

// Grouped 11 Modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/membership', membershipRoutes);
router.use('/courts', courtRoutes);
router.use('/shop', shopRoutes);
router.use('/bar', barRoutes);
router.use('/crm', crmRoutes);
router.use('/finance', financeRoutes);
router.use('/hr', hrRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

// Direct Aliases for frontend convenience & full backward compatibility
router.use('/plans', planRoutes);
router.use('/members', memberRoutes);
router.use('/bookings', bookingRoutes);
router.use('/social-play', socialPlayRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/shop-orders', orderRoutes);
router.use('/bar-tables', tableRoutes);
router.use('/bar-orders', barOrderRoutes);
router.use('/tabs', tabRoutes);
router.use('/kitchen', kitchenRoutes);
router.use('/menu', menuRoutes);
router.use('/shifts', shiftRoutes);
router.use('/public', publicRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/leads', leadRoutes);
router.use('/payments', paymentRoutes);
router.use('/ledger', ledgerRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/expenses', expenseRoutes);
router.use('/employees', employeeRoutes);
router.use('/leave', leaveRoutes);
router.use('/payroll', payrollRoutes);

export default router;
