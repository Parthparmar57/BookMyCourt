import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

export const listUsers = async ({ role, search, page = 1, limit = 20 }) => {
  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ],
    }),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        member: { select: { id: true, memberNo: true, status: true } },
        employee: { select: { id: true, employeeNo: true, designation: true } },
      },
    }),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
};

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      member: {
        include: { plan: true },
      },
      employee: true,
    },
  });

  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const createUser = async ({ name, email, phone, password, role }) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) {
    throw new ApiError(409, 'User with this email or phone already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password || 'Password@123', salt);

  return prisma.user.create({
    data: { name, email, phone, passwordHash, role },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
};

export const updateUser = async (id, data) => {
  // Whitelist updatable fields — never let the request body set arbitrary columns.
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.passwordHash = await bcrypt.hash(data.password, salt);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      updatedAt: true,
    },
  });
};

export const deleteUser = async (id, actor) => {
  if (actor?.id === id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user) throw new ApiError(404, 'User not found');

  // Never allow removing the last OWNER — it would lock everyone out.
  if (user.role === 'OWNER') {
    const ownerCount = await prisma.user.count({ where: { role: 'OWNER' } });
    if (ownerCount <= 1) {
      throw new ApiError(400, 'Cannot delete the last remaining OWNER account');
    }
  }

  return prisma.user.delete({ where: { id } });
};
