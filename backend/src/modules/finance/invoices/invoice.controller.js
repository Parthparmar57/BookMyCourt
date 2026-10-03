import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import { generateInvoicePDF } from '../../../lib/pdf.js';
import * as invoiceService from './invoice.service.js';

export const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.body);
  return success(res, invoice, 'Invoice created successfully', 201);
});

export const listInvoices = asyncHandler(async (req, res) => {
  const result = await invoiceService.listInvoices(req.query);
  return success(res, result);
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);
  return success(res, invoice);
});

export const recordPayment = asyncHandler(async (req, res) => {
  const result = await invoiceService.recordInvoicePayment(req.params.id, req.body);
  return success(res, result, 'Payment recorded successfully');
});

export const downloadPDF = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="invoice-${invoice.invoiceNo}.pdf"`);
  generateInvoicePDF(invoice, res);
});
