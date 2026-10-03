import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../shared/index.js';

export const registerUser = async ({ name, email, phone, password }) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(409, 'A user with this email already exists');
    }
    throw new ApiError(409, 'A user with this phone number already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      // Public registration always creates a plain MEMBER. Elevated roles are
      // assigned only through the OWNER-only user-management route.
      role: ROLES.MEMBER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  const tokens = generateTokens(user);
  return { user, ...tokens };
};

export const loginUser = async ({ login, password }) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: login }, { phone: login }],
    },
    include: {
      member: {
        include: { plan: true },
      },
      employee: true,
    },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email/phone or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email/phone or password');
  }

  const userPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    member: user.member || null,
    employee: user.employee || null,
  };

  const tokens = generateTokens(userPayload);
  return { user: userPayload, ...tokens };
};

export const refreshAccessToken = async (token) => {
  if (!token) {
    throw new ApiError(401, 'Refresh token required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { member: true, employee: true },
    });

    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = jwt.sign(userPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });

    return { accessToken };
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};
