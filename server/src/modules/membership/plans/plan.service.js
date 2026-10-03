import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';

export const listPlans = async () => {
  return prisma.plan.findMany({
    orderBy: { price: 'asc' },
    include: {
      _count: { select: { members: true } },
    },
  });
};

export const getPlanById = async (id) => {
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true } },
    },
  });
  if (!plan) throw new ApiError(404, 'Plan not found');
  return plan;
};

export const createPlan = async (data) => {
  const existing = await prisma.plan.findUnique({ where: { name: data.name } });
  if (existing) throw new ApiError(409, 'Plan with this name already exists');

  return prisma.plan.create({ data });
};

export const updatePlan = async (id, data) => {
  return prisma.plan.update({
    where: { id },
    data,
  });
};

export const deletePlan = async (id) => {
  const count = await prisma.member.count({ where: { planId: id } });
  if (count > 0) {
    throw new ApiError(400, 'Cannot delete plan with active members');
  }
  return prisma.plan.delete({ where: { id } });
};
