import { Router } from 'express';
import paymentRoutes from './payments/payment.routes.js';
import ledgerRoutes from './ledger/ledger.routes.js';
import invoiceRoutes from './invoices/invoice.routes.js';
import expenseRoutes from './expenses/expense.routes.js';

const router = Router();

router.use('/payments', paymentRoutes);
router.use('/ledger', ledgerRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/expenses', expenseRoutes);

export { paymentRoutes, ledgerRoutes, invoiceRoutes, expenseRoutes };
export default router;
