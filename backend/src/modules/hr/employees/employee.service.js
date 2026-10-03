import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { genDocNo } from '../../../utils/ids.js';

export const listEmployees = async () => {
  return prisma.employee.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
    },
    orderBy: { employeeNo: 'asc' },
  });
};

export const getEmployeeById = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: true,
      leaves: { orderBy: { createdAt: 'desc' } },
      payrolls: { orderBy: { year: 'desc', month: 'desc' } },
      attendances: { orderBy: { date: 'desc' }, take: 30 },
    },
  });
  if (!employee) throw new ApiError(404, 'Employee not found');
  return employee;
};

export const createEmployee = async (data) => {
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { phone: data.phone }] },
  });
  if (existingUser) {
    throw new ApiError(409, 'User with this email or phone already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password || 'Staff@123', salt);
  const employeeNo = genDocNo('EMP');

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: data.role,
      },
    });

    const employee = await tx.employee.create({
      data: {
        userId: user.id,
        employeeNo,
        designation: data.designation,
        joiningDate: new Date(data.joiningDate),
        salary: Number(data.salary),
        bankAccountNo: data.bankAccountNo || null,
        ifscCode: data.ifscCode || null,
        panNo: data.panNo || null,
        leaveBalance: data.leaveBalance || 18,
      },
      include: { user: true },
    });

    return employee;
  });
};

export const updateEmployee = async (id, data) => {
  return prisma.employee.update({
    where: { id },
    data,
    include: { user: true },
  });
};
