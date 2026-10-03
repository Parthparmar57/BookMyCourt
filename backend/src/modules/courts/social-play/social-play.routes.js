import { Router } from 'express';
import { auth, optionalAuth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import {
  createSocialSessionSchema,
  joinSocialPlaySchema,
  socialSessionIdParamSchema,
} from '../../../shared/index.js';
import * as controller from './social-play.controller.js';

const router = Router();

router.get('/', optionalAuth, controller.listSessions);

router.post(
  '/',
  auth,
  authorize('OWNER', 'FRONT_DESK'),
  validate({ body: createSocialSessionSchema }),
  controller.createSession
);

router.post(
  '/:id/join',
  auth,
  authorize('OWNER', 'FRONT_DESK', 'MEMBER'),
  validate({ params: socialSessionIdParamSchema, body: joinSocialPlaySchema }),
  controller.joinSession
);

router.delete(
  '/:id/participants/:participantId',
  auth,
  authorize('OWNER', 'FRONT_DESK', 'MEMBER'),
  controller.leaveSession
);

export default router;
