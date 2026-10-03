import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../shared/index.js';
import { sendEmail } from '../../lib/mailer.js';
import { getPasswordResetTemplate } from '../../utils/emailTemplates.js';

const formatUserResponse = (user) => {
  if (!user) return null;
  const rawName = user.name || '';
  // Clean name by removing any trailing parenthetical tags like (Owner), (Front Desk)
  const cleanName = rawName.replace(/\s*\([^)]*\)\s*/g, ' ').trim() || rawName || 'User';
  // Get first letter of the first name
  const firstLetter = (cleanName.charAt(0) || 'U').toUpperCase();

  return {
    id: user.id,
    name: cleanName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    initial: firstLetter,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=1b4332&color=ffffff&bold=true&length=1&size=128`,
    member: user.member || null,
    employee: user.employee || null,
    createdAt: user.createdAt,
  };
};

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

  const userPayload = formatUserResponse(user);
  const tokens = generateTokens(userPayload);
  return { user: userPayload, ...tokens };
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

  const userPayload = formatUserResponse(user);
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

    const userPayload = formatUserResponse(user);

    const accessToken = jwt.sign(
      { id: userPayload.id, email: userPayload.email, role: userPayload.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    return { accessToken, user: userPayload };
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

  return formatUserResponse(user);
};

export const forgotPassword = async ({ login }) => {
  if (!login || !login.trim()) {
    throw new ApiError(400, 'Please provide your registered email or phone number');
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: login.trim() }, { phone: login.trim() }],
    },
  });

  if (!user) {
    throw new ApiError(404, 'No user account found with this email or phone number. Please verify your details.');
  }

  // Generate numeric 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Generate signed JWT reset token valid for 15 minutes
  const resetToken = jwt.sign(
    { id: user.id, email: user.email, otp: otpCode, type: 'PASSWORD_RESET' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const resetLink = `${env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  const emailHtml = getPasswordResetTemplate({
    name: user.name,
    resetLink,
    otpCode,
    expiryMinutes: 15,
  });

  const mailResult = await sendEmail({
    to: user.email,
    subject: 'Password Reset Request · The Champions Club',
    html: emailHtml,
  });

  if (mailResult && mailResult.success === false) {
    throw new ApiError(
      503,
      `Mail service is unable to dispatch email at this moment (${mailResult.error || 'SMTP delivery failed'}). Please contact front desk support.`
    );
  }

  // Mask email for user privacy (e.g. vi***@gmail.com)
  const [localPart, domain] = user.email.split('@');
  const maskedEmail = `${localPart.slice(0, Math.min(2, localPart.length))}***@${domain}`;

  return {
    message: 'Password reset instructions have been dispatched to your email.',
    email: user.email,
    emailMasked: maskedEmail,
    resetToken,
    otpCode,
  };
};


export const resetPassword = async ({ token, otp, newPassword, email }) => {
  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      if (decoded.type !== 'PASSWORD_RESET') {
        throw new ApiError(400, 'Invalid token type');
      }
      userId = decoded.id;
    } catch (err) {
      throw new ApiError(400, 'Invalid or expired password reset link. Please request a new one.');
    }
  } else if (email && otp) {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) throw new ApiError(404, 'User not found');
    userId = user.id;
  } else {
    throw new ApiError(400, 'A valid reset token or OTP code is required');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: 'Password has been successfully updated. You can now login.' };
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

