import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createExpenseSchema, expenseIdParamSchema } from '../../../shared/index.js';
import * as controller from './expense.controller.js';

const router = Router();

router.use(auth, authorize('OWNER'));

router.post('/', validate({ body: createExpenseSchema }), controller.createExpense);
router.get('/', controller.listExpenses);
router.patch('/:id/pay', validate({ params: expenseIdParamSchema }), controller.markPaid);

export default router;
