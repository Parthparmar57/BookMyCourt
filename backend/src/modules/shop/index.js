import { Router } from 'express';
import productRoutes from './products/product.routes.js';
import inventoryRoutes from './inventory/inventory.routes.js';
import orderRoutes from './orders/shop-order.routes.js';

const router = Router();

router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', orderRoutes);

export { productRoutes, inventoryRoutes, orderRoutes };
export default router;
