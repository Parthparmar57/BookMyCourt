import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { subDays, subMonths } from 'date-fns';

const prisma = new PrismaClient();

const additionalStaff = [
  // ─── Sports Academies & Coaching ───
  {
    name: 'Somdev Devvarman',
    email: 'tennis.assistant@bookmycourt.com',
    phone: '9876543220',
    role: 'FRONT_DESK',
    empNo: 'EMP-010',
    desig: 'Assistant Tennis Coach',
    salary: 42000,
    leaveBal: 16,
    joiningDate: '2026-01-15',
  },
  {
    name: 'Jwala Gutta',
    email: 'badminton.coach@bookmycourt.com',
    phone: '9876543221',
    role: 'FRONT_DESK',
    empNo: 'EMP-011',
    desig: 'Senior Badminton Specialist',
    salary: 48000,
    leaveBal: 14,
    joiningDate: '2026-02-01',
  },
  {
    name: 'Ritwik Bhattacharya',
    email: 'squash.pro@bookmycourt.com',
    phone: '9876543222',
    role: 'FRONT_DESK',
    empNo: 'EMP-012',
    desig: 'Head Squash Coach & Pro',
    salary: 45000,
    leaveBal: 18,
    joiningDate: '2026-01-10',
  },
  {
    name: 'Dr. Nikhil Rao',
    email: 'physio@bookmycourt.com',
    phone: '9876543223',
    role: 'FRONT_DESK',
    empNo: 'EMP-013',
    desig: 'Sports Physiotherapist & Rehab',
    salary: 52000,
    leaveBal: 15,
    joiningDate: '2026-02-15',
  },
  {
    name: 'Aryan Kapse',
    email: 'cricket.pickleball@bookmycourt.com',
    phone: '9876543224',
    role: 'FRONT_DESK',
    empNo: 'EMP-014',
    desig: 'Box Cricket & Pickleball Lead',
    salary: 36000,
    leaveBal: 17,
    joiningDate: '2026-03-01',
  },

  // ─── Front Desk & Guest Relations ───
  {
    name: 'Neha Kapoor',
    email: 'frontdesk.morning@bookmycourt.com',
    phone: '9876543225',
    role: 'FRONT_DESK',
    empNo: 'EMP-015',
    desig: 'Front Desk Associate (Morning)',
    salary: 30000,
    leaveBal: 18,
    joiningDate: '2026-03-10',
  },
  {
    name: 'Rohan Mehra',
    email: 'frontdesk.evening@bookmycourt.com',
    phone: '9876543226',
    role: 'FRONT_DESK',
    empNo: 'EMP-016',
    desig: 'Front Desk Associate (Evening)',
    salary: 30000,
    leaveBal: 18,
    joiningDate: '2026-03-15',
  },
  {
    name: 'Simran Walia',
    email: 'member.relations@bookmycourt.com',
    phone: '9876543227',
    role: 'FRONT_DESK',
    empNo: 'EMP-017',
    desig: 'VIP Member Relations Coordinator',
    salary: 34000,
    leaveBal: 15,
    joiningDate: '2026-01-20',
  },

  // ─── Food & Beverage (Bar & Kitchen) ───
  {
    name: 'Karan Malhotra',
    email: 'barista@bookmycourt.com',
    phone: '9876543228',
    role: 'BAR_STAFF',
    empNo: 'EMP-018',
    desig: 'Senior Barista & Juice Specialist',
    salary: 28000,
    leaveBal: 16,
    joiningDate: '2026-02-10',
  },
  {
    name: 'Deepak Thapa',
    email: 'bartender@bookmycourt.com',
    phone: '9876543229',
    role: 'BAR_STAFF',
    empNo: 'EMP-019',
    desig: 'Mixologist & Evening Bar Lead',
    salary: 30000,
    leaveBal: 18,
    joiningDate: '2026-03-01',
  },
  {
    name: 'Manish Rawat',
    email: 'sous.chef@bookmycourt.com',
    phone: '9876543230',
    role: 'KITCHEN',
    empNo: 'EMP-020',
    desig: 'Sous Chef (Kitchen Operations)',
    salary: 35000,
    leaveBal: 14,
    joiningDate: '2026-01-15',
  },
  {
    name: 'Suresh Yadav',
    email: 'linecook.grill@bookmycourt.com',
    phone: '9876543231',
    role: 'KITCHEN',
    empNo: 'EMP-021',
    desig: 'Line Cook - Grill & Healthy Bowls',
    salary: 26000,
    leaveBal: 18,
    joiningDate: '2026-02-20',
  },
  {
    name: 'Ganesh Shinde',
    email: 'kitchen.prep@bookmycourt.com',
    phone: '9876543232',
    role: 'KITCHEN',
    empNo: 'EMP-022',
    desig: 'Kitchen Steward & Prep Cook',
    salary: 22000,
    leaveBal: 18,
    joiningDate: '2026-03-05',
  },

  // ─── Pro Shop & Equipment ───
  {
    name: 'Sameer Joshi',
    email: 'shop.sales@bookmycourt.com',
    phone: '9876543233',
    role: 'SHOP_STAFF',
    empNo: 'EMP-023',
    desig: 'Pro Shop Sales Associate',
    salary: 25000,
    leaveBal: 17,
    joiningDate: '2026-02-15',
  },
  {
    name: 'Pradeep Pandey',
    email: 'racquet.stringer@bookmycourt.com',
    phone: '9876543234',
    role: 'SHOP_STAFF',
    empNo: 'EMP-024',
    desig: 'Certified Racquet Stringer & Tech',
    salary: 28000,
    leaveBal: 18,
    joiningDate: '2026-01-25',
  },

  // ─── Facilities, Court Care & Groundkeeping ───
  {
    name: 'Laxman Gaikwad',
    email: 'court.care@bookmycourt.com',
    phone: '9876543235',
    role: 'FRONT_DESK',
    empNo: 'EMP-025',
    desig: 'Clay Court & Turf Specialist',
    salary: 26000,
    leaveBal: 16,
    joiningDate: '2026-01-05',
  },
  {
    name: 'Santosh Kamble',
    email: 'facilities.tech@bookmycourt.com',
    phone: '9876543236',
    role: 'FRONT_DESK',
    empNo: 'EMP-026',
    desig: 'Electrical & Floodlight Tech',
    salary: 27000,
    leaveBal: 18,
    joiningDate: '2026-02-10',
  },
  {
    name: 'Rekha Solanki',
    email: 'locker.attendant@bookmycourt.com',
    phone: '9876543237',
    role: 'FRONT_DESK',
    empNo: 'EMP-027',
    desig: 'Locker Room & Towel Supervisor',
    salary: 22000,
    leaveBal: 18,
    joiningDate: '2026-02-01',
  },
];

async function main() {
  console.log('🚀 Seeding Full Club HR Staff Personnel...');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Staff@123', salt);
  const now = new Date();

  let createdCount = 0;

  for (const s of additionalStaff) {
    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: { OR: [{ email: s.email }, { phone: s.phone }] },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: s.name,
          email: s.email,
          phone: s.phone,
          passwordHash,
          role: s.role,
        },
      });
    }

    let emp = await prisma.employee.findUnique({
      where: { employeeNo: s.empNo },
    });

    if (!emp) {
      emp = await prisma.employee.create({
        data: {
          userId: user.id,
          employeeNo: s.empNo,
          designation: s.desig,
          joiningDate: new Date(s.joiningDate),
          salary: s.salary,
          leaveBalance: s.leaveBal,
        },
      });
      createdCount++;

      // Create September and October payroll records
      await prisma.payroll.upsert({
        where: { employeeId_month_year: { employeeId: emp.id, month: 9, year: 2026 } },
        update: {},
        create: {
          payrollNo: `PAY-2026-09-${s.empNo}`,
          employeeId: emp.id,
          month: 9,
          year: 2026,
          basicSalary: s.salary,
          allowances: 2500,
          deductions: 1000,
          netSalary: s.salary + 1500,
          status: 'PAID',
          paidDate: subDays(now, 10),
        },
      });

      await prisma.payroll.upsert({
        where: { employeeId_month_year: { employeeId: emp.id, month: 10, year: 2026 } },
        update: {},
        create: {
          payrollNo: `PAY-2026-10-${s.empNo}`,
          employeeId: emp.id,
          month: 10,
          year: 2026,
          basicSalary: s.salary,
          allowances: 2500,
          deductions: 1000,
          netSalary: s.salary + 1500,
          status: 'PAID',
          paidDate: subDays(now, 1),
        },
      });
    }
  }

  console.log(`✅ Registered ${createdCount} additional club staff members.`);

  // ─── Create Sample Leave Applications in Leave Queue ───
  console.log('Generating active leave applications for the Leave Queue...');
  const allEmployees = await prisma.employee.findMany({ include: { user: true } });

  const sampleLeaves = [
    {
      empIdx: 2, // Rahul Verma (Bar)
      type: 'CASUAL',
      daysAgo: 1,
      durationDays: 2,
      reason: 'Attending family wedding ceremony out of town.',
      status: 'PENDING',
    },
    {
      empIdx: 5, // Mahesh Bhupathi (Coach)
      type: 'PAID',
      daysAgo: 2,
      durationDays: 4,
      reason: 'Traveling for All-India Junior Tennis Championship scouting.',
      status: 'PENDING',
    },
    {
      empIdx: 11, // Jwala Gutta (Coach)
      type: 'CASUAL',
      daysAgo: 1,
      durationDays: 1,
      reason: 'Personal administrative work at passport office.',
      status: 'PENDING',
    },
    {
      empIdx: 15, // Neha Kapoor (Front Desk)
      type: 'SICK',
      daysAgo: 0,
      durationDays: 2,
      reason: 'Viral fever and prescribed medical rest by club physician.',
      status: 'PENDING',
    },
    {
      empIdx: 18, // Karan Malhotra (Barista)
      type: 'CASUAL',
      daysAgo: 5,
      durationDays: 1,
      reason: 'Attending specialty coffee roast masterclass.',
      status: 'APPROVED',
    },
    {
      empIdx: 4, // Sunil Kumar (Pro Shop)
      type: 'SICK',
      daysAgo: 12,
      durationDays: 3,
      reason: 'Dental surgery and post-op recovery.',
      status: 'APPROVED',
    },
  ];

  for (const sl of sampleLeaves) {
    if (allEmployees[sl.empIdx]) {
      const emp = allEmployees[sl.empIdx];
      const start = subDays(now, sl.daysAgo);
      const end = subDays(now, sl.daysAgo - sl.durationDays + 1);

      // Check existing leave to avoid duplicates
      const exists = await prisma.leaveRequest.findFirst({
        where: { employeeId: emp.id, reason: sl.reason },
      });

      if (!exists) {
        await prisma.leaveRequest.create({
          data: {
            employeeId: emp.id,
            type: sl.type,
            startDate: start,
            endDate: end,
            days: sl.durationDays,
            reason: sl.reason,
            status: sl.status,
          },
        });
      }
    }
  }

  const finalEmpCount = await prisma.employee.count();
  const finalLeaveCount = await prisma.leaveRequest.count();
  const finalPayrollCount = await prisma.payroll.count();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 HR STAFF & PERSONNEL ROSTER SEEDING COMPLETED!');
  console.log(`• Total Club Staff: ${finalEmpCount} employees on record`);
  console.log(`• Leave Applications in Queue: ${finalLeaveCount} requests`);
  console.log(`• Monthly Payroll Sheets: ${finalPayrollCount} payslips`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('HR seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
