import { asyncHandler } from '../../utils/asyncHandler.js';
import { success } from '../../utils/response.js';
import { exportToExcel } from '../../lib/excel.js';
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
