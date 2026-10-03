import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../../shared/index.js';
import * as controller from './user.controller.js';

const router = Router();

// Only OWNER can manage staff users
router.use(auth, authorize('OWNER'));

router.get('/', controller.listUsers);
router.get('/:id', controller.getUser);
router.post('/', validate({ body: createUserSchema }), controller.createUser);
router.patch('/:id', validate({ body: updateUserSchema }), controller.updateUser);
router.delete('/:id', controller.deleteUser);

export default router;
