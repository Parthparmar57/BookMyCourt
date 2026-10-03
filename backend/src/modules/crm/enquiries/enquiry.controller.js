import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as enquiryService from './enquiry.service.js';

export const listEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await enquiryService.listEnquiries();
  return success(res, enquiries);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const enquiry = await enquiryService.updateEnquiryStatus(req.params.id, req.body.status);
  return success(res, enquiry, 'Enquiry status updated');
});
