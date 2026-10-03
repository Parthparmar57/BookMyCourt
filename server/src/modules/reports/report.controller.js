import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/response.js';
import { exportToExcel } from '../../lib/excel.js';
import PDFDocument from 'pdfkit';
import * as reportService from './report.service.js';
import { drawPdfHeader, drawPdfFooter, drawSummaryCards, drawPdfTable } from '../../lib/pdf.js';

export const getTaxReport = asyncHandler(async (req, res) => {
  const report = await reportService.getTaxReport(req.query);
  return success(res, report);
});

export const getInventoryReport = asyncHandler(async (req, res) => {
  const report = await reportService.getInventoryReport();
  return success(res, report);
});

export const getMembershipReport = asyncHandler(async (req, res) => {
  const report = await reportService.getMembershipReport();
  return success(res, report);
});

export const getRevenueReport = asyncHandler(async (req, res) => {
  const report = await reportService.getRevenueReport(req.query);
  return success(res, report);
});

// ── Excel exports ────────────────────────────────────────────────────────────

export const exportInventoryExcel = asyncHandler(async (req, res) => {
  const report = await reportService.getInventoryReport();
  const columns = [
    { header: 'Product Name', key: 'name', width: 30 },
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Price (Rs.)', key: 'price', width: 12 },
    { header: 'Stock', key: 'stock', width: 10 },
    { header: 'Stock Value (Rs.)', key: 'stockValue', width: 18 },
  ];

  await exportToExcel(res, 'Inventory Report', columns, report.items, 'inventory-report.xlsx');
});

export const exportTaxExcel = asyncHandler(async (req, res) => {
  const report = await reportService.getTaxReport(req.query);
  const columns = [
    { header: 'Source / Category', key: 'category', width: 22 },
    { header: 'Taxable Amount (Rs.)', key: 'totalAmount', width: 22 },
    { header: 'Tax Collected (Rs.)', key: 'tax', width: 20 },
  ];
  const rows = [
    ...report.byCategory,
    { category: 'TOTAL', totalAmount: report.totalTaxableAmount, tax: report.totalCollectedTax },
  ];
  await exportToExcel(res, 'Tax Report', columns, rows, 'tax-report.xlsx');
});

export const exportMembershipExcel = asyncHandler(async (req, res) => {
  const report = await reportService.getMembershipReport();
  const columns = [
    { header: 'Plan', key: 'plan', width: 20 },
    { header: 'Member Count', key: 'memberCount', width: 15 },
  ];
  await exportToExcel(res, 'Membership Report', columns, report.plans, 'membership-report.xlsx');
});

export const exportRevenueExcel = asyncHandler(async (req, res) => {
  const report = await reportService.getRevenueReport(req.query);
  const columns = [
    { header: 'Source', key: 'source', width: 20 },
    { header: 'Revenue (Rs.)', key: 'amount', width: 18 },
    { header: 'Tax (Rs.)', key: 'tax', width: 15 },
  ];
  const rows = [
    ...report.bySource,
    { source: 'TOTAL', amount: report.totalRevenue, tax: report.totalTax },
  ];
  await exportToExcel(res, 'Revenue Report', columns, rows, 'revenue-report.xlsx');
});

// ── PDF Exports ─────────────────────────────────────────────────────────────

export const exportRevenuePdf = asyncHandler(async (req, res) => {
  const report = await reportService.getRevenueReport(req.query);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="revenue-report.pdf"');
  doc.pipe(res);

  const nowStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  drawPdfHeader(doc, 'REVENUE & EARNINGS REPORT', `Generated on ${nowStr}`);

  let y = doc.y;

  // Revenue Stat Cards
  y = drawSummaryCards(doc, [
    { label: 'Total Revenue', value: `Rs. ${Number(report.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#059669' },
    { label: 'Total Tax (GST)', value: `Rs. ${Number(report.totalTax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#0284c7' },
    { label: 'Total Transactions', value: report.totalTransactions, color: '#0f172a' },
  ], y);

  // Revenue by Source Section
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text('REVENUE BY SOURCE', 40, y);
  y += 14;

  const sourceRows = report.bySource.map((s) => ({
    source: s.source,
    amount: `Rs. ${Number(s.amount).toFixed(2)}`,
    tax: `Rs. ${Number(s.tax).toFixed(2)}`,
  }));

  const sourceCols = [
    { header: 'Revenue Source', key: 'source', x: 15, width: 200, align: 'left' },
    { header: 'Gross Revenue', key: 'amount', x: 220, width: 140, align: 'right' },
    { header: 'Tax Collected', key: 'tax', x: 370, width: 130, align: 'right' },
  ];

  y = drawPdfTable(doc, sourceCols, sourceRows, y);
  y += 8;

  // Revenue by Payment Mode Section
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text('REVENUE BY PAYMENT MODE', 40, y);
  y += 14;

  const modeRows = report.byPaymentMode.map((m) => ({
    mode: m.mode,
    amount: `Rs. ${Number(m.amount).toFixed(2)}`,
  }));

  const modeCols = [
    { header: 'Payment Method', key: 'mode', x: 15, width: 280, align: 'left' },
    { header: 'Total Collected', key: 'amount', x: 300, width: 200, align: 'right' },
  ];

  y = drawPdfTable(doc, modeCols, modeRows, y);

  drawPdfFooter(doc);
  doc.end();
});

export const exportInventoryPdf = asyncHandler(async (req, res) => {
  const report = await reportService.getInventoryReport();
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory-report.pdf"');
  doc.pipe(res);

  const nowStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  drawPdfHeader(doc, 'INVENTORY & STOCK REPORT', `Generated on ${nowStr}`);

  let y = doc.y;

  // Stat cards
  y = drawSummaryCards(doc, [
    { label: 'Total Products', value: report.totalProducts, color: '#0f172a' },
    { label: 'Low Stock Items', value: report.lowStockCount, color: report.lowStockCount > 0 ? '#dc2626' : '#166534' },
    { label: 'Total Stock Value', value: `Rs. ${Number(report.totalStockValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#059669' },
  ], y);

  // Table
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text('PRODUCT INVENTORY DETAILS', 40, y);
  y += 14;

  const itemRows = report.items.map((item) => ({
    name: item.name,
    sku: item.sku || 'N/A',
    category: item.category,
    stock: `${item.stock}${item.isLowStock ? ' ⚠ LOW' : ''}`,
    price: `Rs. ${Number(item.price).toFixed(2)}`,
    value: `Rs. ${Number(item.stockValue).toFixed(2)}`,
    isLowStock: item.isLowStock,
  }));

  const itemCols = [
    { header: 'Product Name', key: 'name', x: 10, width: 160, align: 'left' },
    { header: 'SKU', key: 'sku', x: 175, width: 75, align: 'left' },
    { header: 'Category', key: 'category', x: 255, width: 70, align: 'left' },
    { header: 'Stock', key: 'stock', x: 330, width: 50, align: 'center', textColor: (row) => (row.isLowStock ? '#dc2626' : '#1e293b') },
    { header: 'Price', key: 'price', x: 385, width: 60, align: 'right' },
    { header: 'Stock Value', key: 'value', x: 450, width: 55, align: 'right' },
  ];

  y = drawPdfTable(doc, itemCols, itemRows, y);

  drawPdfFooter(doc);
  doc.end();
});

export const exportMembershipPdf = asyncHandler(async (req, res) => {
  const report = await reportService.getMembershipReport();
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="membership-report.pdf"');
  doc.pipe(res);

  const nowStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  drawPdfHeader(doc, 'MEMBERSHIP REPORT', `Generated on ${nowStr}`);

  let y = doc.y;

  const totalMembers = report.statusBreakdown?.reduce((acc, s) => acc + s.count, 0) || 0;
  const activeCount = report.statusBreakdown?.find(s => s.status === 'ACTIVE')?.count || 0;

  y = drawSummaryCards(doc, [
    { label: 'Total Registered', value: totalMembers, color: '#0f172a' },
    { label: 'Active Members', value: activeCount, color: '#166534' },
    { label: 'Membership Plans', value: report.plans?.length || 0, color: '#0284c7' },
  ], y);

  // Plans table
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text('MEMBERS BY PLAN TIER', 40, y);
  y += 14;

  const planRows = (report.plans || []).map((p) => ({
    plan: p.plan,
    count: p.memberCount,
  }));

  const planCols = [
    { header: 'Membership Plan Tier', key: 'plan', x: 15, width: 320, align: 'left' },
    { header: 'Active Member Count', key: 'count', x: 340, width: 160, align: 'right' },
  ];

  y = drawPdfTable(doc, planCols, planRows, y);
  y += 10;

  // Status table
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text('MEMBERS BY ACCOUNT STATUS', 40, y);
  y += 14;

  const statusRows = (report.statusBreakdown || []).map((s) => ({
    status: s.status,
    count: s.count,
  }));

  const statusCols = [
    { header: 'Membership Status', key: 'status', x: 15, width: 320, align: 'left' },
    { header: 'Member Count', key: 'count', x: 340, width: 160, align: 'right' },
  ];

  y = drawPdfTable(doc, statusCols, statusRows, y);

  drawPdfFooter(doc);
  doc.end();
});
