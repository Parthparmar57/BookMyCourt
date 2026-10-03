import { Router } from 'express';
import { auth, optionalAuth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createProductSchema, updateProductSchema, productIdParamSchema } from '../../../shared/index.js';
import * as controller from './product.controller.js';

const router = Router();

router.get('/', optionalAuth, controller.listProducts);
router.get('/:id', validate({ params: productIdParamSchema }), controller.getProduct);

router.post('/', auth, authorize('OWNER', 'SHOP_STAFF'), validate({ body: createProductSchema }), controller.createProduct);
router.patch('/:id', auth, authorize('OWNER', 'SHOP_STAFF'), validate({ params: productIdParamSchema, body: updateProductSchema }), controller.updateProduct);
router.delete('/:id', auth, authorize('OWNER'), validate({ params: productIdParamSchema }), controller.deleteProduct);

export default router;
