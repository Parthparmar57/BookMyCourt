import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as paymentService from './payment.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await paymentService.createRazorpayOrder(req.body);
  return success(res, order, 'Razorpay order created');
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyAndRecordPayment(req.body);
  return success(res, result, 'Payment verified and transaction recorded');
});
