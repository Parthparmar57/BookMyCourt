import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';

export const listEnquiries = async () => {
  return prisma.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const updateEnquiryStatus = async (id, status) => {
  return prisma.enquiry.update({
    where: { id },
    data: { status },
  });
};
