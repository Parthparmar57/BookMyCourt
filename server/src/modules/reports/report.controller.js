import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/response.js';
import { exportToExcel } from '../../lib/excel.js';
import PDFDocument from 'pdfkit';
import * as reportService from './report.service.js';

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

// ── Excel exports (existing) ────────────────────────────────────────────────

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

// ── G2: New Excel exports ────────────────────────────────────────────────────

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

// ── G2: PDF exports ──────────────────────────────────────────────────────────

/** Helper: write a simple two-column table into a PDFDocument */
const writeTable = (doc, headers, rows) => {
  const colWidth = 230;
  doc.font('Helvetica-Bold');
  headers.forEach((h, i) => doc.text(h, 50 + i * colWidth, doc.y, { width: colWidth, continued: i < headers.length - 1 }));
  doc.font('Helvetica').moveDown(0.5);
  rows.forEach((row) => {
    row.forEach((cell, i) => doc.text(String(cell ?? '—'), 50 + i * colWidth, doc.y, { width: colWidth, continued: i < row.length - 1 }));
    doc.moveDown(0.3);
  });
};

export const exportRevenuePdf = asyncHandler(async (req, res) => {
  const report = await reportService.getRevenueReport(req.query);
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="revenue-report.pdf"');
  doc.pipe(res);

  doc.fontSize(20).font('Helvetica-Bold').text('THE CHAMPIONS CLUB', { align: 'center' });
  doc.fontSize(11).font('Helvetica').text('Revenue Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).font('Helvetica-Bold').text('Summary');
  doc.font('Helvetica');
  doc.text(`Total Revenue     : Rs. ${Number(report.totalRevenue).toFixed(2)}`);
  doc.text(`Total Tax         : Rs. ${Number(report.totalTax).toFixed(2)}`);
  doc.text(`Total Transactions: ${report.totalTransactions}`);
  doc.moveDown();

  doc.font('Helvetica-Bold').text('Revenue by Source');
  doc.moveDown(0.3);
  writeTable(doc, ['Source', 'Amount (Rs.)', 'Tax (Rs.)'],
    report.bySource.map((s) => [s.source, Number(s.amount).toFixed(2), Number(s.tax).toFixed(2)]));
  doc.moveDown();

  doc.font('Helvetica-Bold').text('Revenue by Payment Mode');
  doc.moveDown(0.3);
  writeTable(doc, ['Mode', 'Amount (Rs.)'],
    report.byPaymentMode.map((m) => [m.mode, Number(m.amount).toFixed(2)]));

  doc.end();
});

export const exportInventoryPdf = asyncHandler(async (req, res) => {
  const report = await reportService.getInventoryReport();
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory-report.pdf"');
  doc.pipe(res);

  doc.fontSize(20).font('Helvetica-Bold').text('THE CHAMPIONS CLUB', { align: 'center' });
  doc.fontSize(11).font('Helvetica').text('Inventory Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).font('Helvetica-Bold').text('Summary');
  doc.font('Helvetica');
  doc.text(`Total Products   : ${report.totalProducts}`);
  doc.text(`Low Stock Items  : ${report.lowStockCount}`);
  doc.text(`Total Stock Value: Rs. ${Number(report.totalStockValue).toFixed(2)}`);
  doc.moveDown();

  doc.font('Helvetica-Bold').text('Product Details');
  doc.moveDown(0.3);
  report.items.forEach((item) => {
    const flag = item.isLowStock ? ' ⚠ LOW STOCK' : '';
    doc.font('Helvetica').fontSize(10)
      .text(`${item.name} (${item.sku}) | Category: ${item.category} | Stock: ${item.stock} | Price: Rs.${Number(item.price).toFixed(2)} | Value: Rs.${Number(item.stockValue).toFixed(2)}${flag}`);
    doc.moveDown(0.2);
  });

  doc.end();
});

export const exportMembershipPdf = asyncHandler(async (req, res) => {
  const report = await reportService.getMembershipReport();
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="membership-report.pdf"');
  doc.pipe(res);

  doc.fontSize(20).font('Helvetica-Bold').text('THE CHAMPIONS CLUB', { align: 'center' });
  doc.fontSize(11).font('Helvetica').text('Membership Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).font('Helvetica-Bold').text('Members by Plan');
  doc.moveDown(0.3);
  writeTable(doc, ['Plan', 'Members'],
    report.plans.map((p) => [p.plan, p.memberCount]));
  doc.moveDown();

  doc.font('Helvetica-Bold').text('Members by Status');
  doc.moveDown(0.3);
  writeTable(doc, ['Status', 'Count'],
    report.statusBreakdown.map((s) => [s.status, s.count]));

  doc.end();
});
