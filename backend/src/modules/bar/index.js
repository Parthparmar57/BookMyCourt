import { Router } from 'express';
import tableRoutes from './tables/table.routes.js';
import barOrderRoutes from './orders/bar-order.routes.js';
import tabRoutes from './tabs/tab.routes.js';
import kitchenRoutes from './kitchen/kitchen.routes.js';
import menuRoutes from './menu/menu.routes.js';
import shiftRoutes from './shifts/shift.routes.js';

const router = Router();

router.use('/tables', tableRoutes);
router.use('/orders', barOrderRoutes);
router.use('/tabs', tabRoutes);
router.use('/kitchen', kitchenRoutes);
router.use('/menu', menuRoutes);
router.use('/shifts', shiftRoutes);

export { tableRoutes, barOrderRoutes, tabRoutes, kitchenRoutes, menuRoutes, shiftRoutes };
export default router;
