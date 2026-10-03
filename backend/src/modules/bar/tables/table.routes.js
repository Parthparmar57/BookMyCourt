import { Router } from 'express';
import { auth } from '../../../middleware/auth.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createBarTableSchema, updateBarTableSchema, tableIdParamSchema } from '../../../shared/index.js';
import * as controller from './table.controller.js';

const router = Router();

router.use(auth);

router.get('/', authorize('OWNER', 'BAR_STAFF', 'KITCHEN'), controller.listTables);
router.post('/', authorize('OWNER', 'BAR_STAFF'), validate({ body: createBarTableSchema }), controller.createTable);
router.patch('/:id', authorize('OWNER', 'BAR_STAFF'), validate({ params: tableIdParamSchema, body: updateBarTableSchema }), controller.updateTable);
router.delete('/:id', authorize('OWNER'), validate({ params: tableIdParamSchema }), controller.deleteTable);

export default router;
