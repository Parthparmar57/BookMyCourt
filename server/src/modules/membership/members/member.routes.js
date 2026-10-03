import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import {
  registerMemberSchema,
  renewMemberSchema,
  memberIdParamSchema,
  memberSearchQuerySchema,
} from '../../../shared/index.js';
import * as controller from './member.controller.js';

const router = Router();

// Staff (OWNER, FRONT_DESK) and members
router.use(auth);

router.post(
  '/',
  authorize('OWNER', 'FRONT_DESK'),
  validate({ body: registerMemberSchema }),
  controller.registerMember
);

router.get(
  '/',
  authorize('OWNER', 'FRONT_DESK', 'BAR_STAFF', 'SHOP_STAFF'),
  validate({ query: memberSearchQuerySchema }),
  controller.searchMembers
);

// G3 — QR scan lookup: POST /members/scan  body: { payload: "<QR string>" }
router.post(
  '/scan',
  authorize('OWNER', 'FRONT_DESK', 'BAR_STAFF', 'SHOP_STAFF'),
  controller.scanMember
);

router.get(
  '/:id',
  authorize('OWNER', 'FRONT_DESK', 'BAR_STAFF', 'SHOP_STAFF', 'MEMBER'),
  controller.getMemberProfile
);

router.post(
  '/:id/renew',
  authorize('OWNER', 'FRONT_DESK', 'MEMBER'),
  validate({ params: memberIdParamSchema, body: renewMemberSchema }),
  controller.renewMembership
);

export default router;
