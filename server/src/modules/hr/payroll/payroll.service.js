import { prisma } from '../../../lib/prisma.js';
import { ApiError } from '../../../utils/ApiError.js';
import { round2 } from '../../../utils/money.js';
import { PAYROLL_STATUS, ATTENDANCE_STATUS } from '../../../shared/index.js';

export const runPayroll = async ({ month, year, allowances = 0 }) => {
  const employees = await prisma.employee.findMany();
  const m = Number(month);
  const y = Number(year);
  // Month window for attendance lookups (month is 1-based).
  const monthStart = new Date(Date.UTC(y, m - 1, 1));
  const monthEnd = new Date(Date.UTC(y, m, 0));
  const daysInMonth = monthEnd.getUTCDate();

  return prisma.$transaction(async (tx) => {
    const results = [];

    for (const emp of employees) {
      const basic = Number(emp.salary);

      // Attendance feeds payroll: unpaid absences are deducted at the daily rate.
      const absentDays = await tx.attendance.count({
        where: {
          employeeId: emp.id,
          status: ATTENDANCE_STATUS.ABSENT,
          date: { gte: monthStart, lte: monthEnd },
        },
      });
      const perDay = basic / daysInMonth;
      const empAllowances = round2(Number(allowances) || 0);
      const deductions = round2(absentDays * perDay);
      const netSalary = round2(basic + empAllowances - deductions);

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
          allowances: empAllowances,
          deductions,
          netSalary,
        },
        create: {
          payrollNo,
          employeeId: emp.id,
          month: m,
          year: y,
          basicSalary: basic,
          allowances: empAllowances,
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
