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
      member: true,
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
  const updateData = { ...data };
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.passwordHash = await bcrypt.hash(data.password, salt);
    delete updateData.password;
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

export const deleteUser = async (id) => {
  return prisma.user.delete({ where: { id } });
};
