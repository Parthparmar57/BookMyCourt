import { z } from 'zod';
import { ROLES } from '../constants/roles.js';
import { ATTENDANCE_STATUS } from '../constants/enums.js';

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(6).default('Password@123'),
  role: z.enum(['FRONT_DESK', 'BAR_STAFF', 'KITCHEN', 'SHOP_STAFF', 'OWNER']),
  designation: z.string().min(2, 'Designation is required'),
  joiningDate: z.coerce.date().default(() => new Date()),
  salary: z.coerce.number().positive('Salary must be positive'),
  bankAccountNo: z.string().optional().nullable(),
  ifscCode: z.string().optional().nullable(),
  panNo: z.string().optional().nullable(),
  leaveBalance: z.coerce.number().int().min(0).default(18),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
export const employeeIdParamSchema = z.object({ id: z.string().uuid() });

export const checkInSchema = z.object({
  notes: z.string().optional().nullable(),
});

export const checkOutSchema = z.object({
  notes: z.string().optional().nullable(),
});
