import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { auth } from '../../middleware/auth.js';
import { authLimiter, refreshLimiter } from '../../middleware/rateLimit.js';
import { loginSchema, registerUserSchema, refreshTokenSchema } from '../../shared/index.js';
import * as controller from './auth.controller.js';

const router = Router();

router.post('/register', authLimiter, validate(registerUserSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', refreshLimiter, validate(refreshTokenSchema), controller.refresh);
router.post('/logout', authLimiter, controller.logout);
router.get('/me', auth, controller.getMe);
router.post('/forgot-password', authLimiter, controller.forgotPassword);
router.post('/reset-password', authLimiter, controller.resetPassword);

export default router;

