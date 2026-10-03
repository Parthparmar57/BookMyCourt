import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as leadService from './lead.service.js';

export const listLeads = asyncHandler(async (req, res) => {
  const leads = await leadService.listLeads(req.query);
  return success(res, leads);
});

export const getLead = asyncHandler(async (req, res) => {
  const lead = await leadService.getLeadById(req.params.id);
  return success(res, lead);
});

export const createLead = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.body);
  return success(res, lead, 'Lead created successfully', 201);
});

export const updateLead = asyncHandler(async (req, res) => {
  const lead = await leadService.updateLead(req.params.id, req.body);
  return success(res, lead, 'Lead updated successfully');
});

export const addFollowUp = asyncHandler(async (req, res) => {
  const followUp = await leadService.addFollowUp(req.params.id, req.body);
  return success(res, followUp, 'Follow-up logged successfully', 201);
});

export const createQuotation = asyncHandler(async (req, res) => {
  const quotation = await leadService.createQuotation(req.body);
  return success(res, quotation, 'Quotation generated successfully', 201);
});

export const updateQuotationStatus = asyncHandler(async (req, res) => {
  const quotation = await leadService.updateQuotationStatus(req.params.id, req.body.status);
  return success(res, quotation, 'Quotation status updated');
});

export const convertLead = asyncHandler(async (req, res) => {
  const member = await leadService.convertLeadToMember(req.params.id, req.body, req.user?.id);
  return success(res, member, 'Lead converted to member successfully', 201);
});
