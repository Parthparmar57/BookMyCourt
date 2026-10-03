import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as controller from './report.controller.js';

const router = Router();

router.use(auth, authorize('OWNER'));

// ── JSON endpoints ───────────────────────────────────────────────────────────
router.get('/tax', controller.getTaxReport);
router.get('/inventory', controller.getInventoryReport);
router.get('/membership', controller.getMembershipReport);
router.get('/revenue', controller.getRevenueReport);           // G2

// ── Excel exports (existing + new) ──────────────────────────────────────────
router.get('/tax/export', controller.exportTaxExcel);
router.get('/inventory/export', controller.exportInventoryExcel);
router.get('/membership/export', controller.exportMembershipExcel);  // G2
router.get('/revenue/export', controller.exportRevenueExcel);        // G2

// ── PDF exports (G2) ────────────────────────────────────────────────────────
router.get('/revenue/pdf', controller.exportRevenuePdf);
router.get('/inventory/pdf', controller.exportInventoryPdf);
router.get('/membership/pdf', controller.exportMembershipPdf);

export default router;
