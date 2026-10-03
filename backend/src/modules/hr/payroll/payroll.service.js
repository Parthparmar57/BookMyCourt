import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { PAYROLL_STATUS } from '../../../shared/index.js';

export const runPayroll = async ({ month, year }) => {
  const employees = await prisma.employee.findMany();

  return prisma.$transaction(async (tx) => {
    const results = [];

    for (const emp of employees) {
      const basic = Number(emp.salary);
      const allowances = 0;
      const deductions = 0;
      const netSalary = basic + allowances - deductions;

      const payrollNo = `PAY-${year}-${String(month).padStart(2, '0')}-${emp.employeeNo}`;

      const payroll = await tx.payroll.upsert({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month: Number(month),
            year: Number(year),
          },
        },
        update: {
          basicSalary: basic,
          allowances,
          deductions,
          netSalary,
        },
        create: {
          payrollNo,
          employeeId: emp.id,
          month: Number(month),
          year: Number(year),
          basicSalary: basic,
          allowances,
          deductions,
          netSalary,
          status: PAYROLL_STATUS.DRAFT,
        },
        include: { employee: { include: { user: true } } },
      });

      results.push(payroll);
    }

    return results;
  });
};

export const listPayrolls = async ({ month, year, employeeId }) => {
  return prisma.payroll.findMany({
    where: {
      ...(month && { month: Number(month) }),
      ...(year && { year: Number(year) }),
      ...(employeeId && { employeeId }),
    },
    include: {
      employee: { include: { user: true } },
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
};

export const updatePayrollStatus = async (id, { status, paidDate }) => {
  return prisma.payroll.update({
    where: { id },
    data: {
      status,
      paidDate: paidDate ? new Date(paidDate) : new Date(),
    },
    include: { employee: { include: { user: true } } },
  });
};
