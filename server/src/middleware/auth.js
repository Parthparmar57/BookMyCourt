import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../lib/prisma.js';

export const auth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new ApiError(401, 'Authentication token missing or invalid'));
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        member: { select: { id: true, memberNo: true, status: true } },
        employee: { select: { id: true, employeeNo: true, designation: true } },
      },
    });

    if (!user) {
      return next(new ApiError(401, 'User account no longer exists'));
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      memberId: user.member?.id || null,
      memberNo: user.member?.memberNo || null,
      employeeId: user.employee?.id || null,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token has expired, please refresh'));
    }
    return next(new ApiError(401, 'Invalid authentication token'));
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { member: true },
      });
      if (user) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          memberId: user.member?.id || null,
        };
      }
    }
    next();
  } catch (err) {
    // optional, so continue without req.user
    next();
  }
};
