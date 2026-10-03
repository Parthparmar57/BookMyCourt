import { Router } from 'express';
import { auth, optionalAuth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createMenuItemSchema, updateMenuItemSchema, menuItemIdParamSchema } from '../../../shared/index.js';
import * as controller from './menu.controller.js';

const router = Router();

router.get('/', optionalAuth, controller.listMenu);

router.post('/', auth, authorize('OWNER'), validate({ body: createMenuItemSchema }), controller.createMenuItem);
router.patch('/:id', auth, authorize('OWNER'), validate({ params: menuItemIdParamSchema, body: updateMenuItemSchema }), controller.updateMenuItem);
router.delete('/:id', auth, authorize('OWNER'), validate({ params: menuItemIdParamSchema }), controller.deleteMenuItem);

export default router;
