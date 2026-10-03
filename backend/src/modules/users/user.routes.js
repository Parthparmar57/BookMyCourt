import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { registerUserSchema } from '../../shared/index.js';
import * as controller from './user.controller.js';

const router = Router();

// Only OWNER can manage staff users
router.use(auth, authorize('OWNER'));

router.get('/', controller.listUsers);
router.get('/:id', controller.getUser);
router.post('/', validate(registerUserSchema), controller.createUser);
router.patch('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

export default router;
