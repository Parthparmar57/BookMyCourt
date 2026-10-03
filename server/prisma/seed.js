import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addMonths, subDays, addDays, setHours, setMinutes } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding comprehensive dataset with 65+ users and multi-day club operations...');

  const passwordHash = await bcrypt.hash('Password@123', 10);
  const now = new Date();
  const seedTimestamp = Date.now();

  // ─── CLEAN TABLES IN STRICT FOREIGN KEY DEPENDENCY ORDER ───────────────────
  console.log('Cleaning existing records for a 100% fresh, clean database...');
  const deleteOrder = [
    'orderItem',
    'transaction',
    'invoiceItem',
    'invoice',
    'order',
    'barTab',
    'socialParticipant',
    'trialBooking',
    'booking',
    'court',
    'leadFollowUp',
    'quotation',
    'lead',
    'enquiry',
    'attendance',
    'payroll',
    'leaveRequest',
    'shift',
    'inventoryLog',
    'expense',
    'auditLog',
    'member',
    'employee',
    'user',
    'plan',
  ];
  for (const model of deleteOrder) {
    if (prisma[model]) {
      await prisma[model].deleteMany();
    }
  }
  console.log('Cleanup completed successfully.');

  // ─── 1. CORE ROLE & STAFF USERS (10 Users) ─────────────────────────────────
  console.log('1. Creating core staff and management users...');

  const staffUsersData = [
    { name: 'Vikram Mehta', email: 'owner@championsclub.com', phone: '9876543210', role: 'OWNER', empNo: 'EMP-000', desig: 'Managing Director & Owner', salary: 150000 },
    { name: 'Priya Sharma', email: 'frontdesk@championsclub.com', phone: '9876543211', role: 'FRONT_DESK', empNo: 'EMP-001', desig: 'Head Receptionist', salary: 35000 },
    { name: 'Rahul Verma', email: 'bar@championsclub.com', phone: '9876543212', role: 'BAR_STAFF', empNo: 'EMP-002', desig: 'Bar & Cafe Supervisor', salary: 32000 },
    { name: 'Anthony D\'Souza', email: 'kitchen@championsclub.com', phone: '9876543213', role: 'KITCHEN', empNo: 'EMP-003', desig: 'Executive Head Chef', salary: 42000 },
    { name: 'Sunil Kumar', email: 'shop@championsclub.com', phone: '9876543214', role: 'SHOP_STAFF', empNo: 'EMP-004', desig: 'Pro Shop Manager', salary: 30000 },
    { name: 'Mahesh Bhupathi', email: 'coach.tennis@championsclub.com', phone: '9876543280', role: 'FRONT_DESK', empNo: 'EMP-005', desig: 'Senior Tennis Coach', salary: 55000 },
    { name: 'Pullela Gopichand', email: 'coach.badminton@championsclub.com', phone: '9876543281', role: 'FRONT_DESK', empNo: 'EMP-006', desig: 'Head Badminton Coach', salary: 50000 },
    { name: 'Anjali Bhagwat', email: 'trainer@championsclub.com', phone: '9876543282', role: 'FRONT_DESK', empNo: 'EMP-007', desig: 'Strength & Conditioning Coach', salary: 38000 },
    { name: 'Ramesh Patel', email: 'accounts@championsclub.com', phone: '9876543283', role: 'FRONT_DESK', empNo: 'EMP-008', desig: 'Senior Club Accountant', salary: 40000 },
    { name: 'Devendra Joshi', email: 'facilities@championsclub.com', phone: '9876543284', role: 'FRONT_DESK', empNo: 'EMP-009', desig: 'Court & Turf Facility Manager', salary: 32000 },
  ];

  const createdStaffUsers = [];
  const createdEmployees = [];

  for (const s of staffUsersData) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        phone: s.phone,
        passwordHash,
        role: s.role,
      },
    });
    createdStaffUsers.push(user);

    const emp = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeNo: s.empNo,
        designation: s.desig,
        joiningDate: subDays(now, 180),
        salary: s.salary,
        bankAccountNo: `91823746${s.empNo.replace('EMP-', '')}`,
        ifscCode: 'HDFC0001234',
        panNo: 'ABCDE1234F',
        leaveBalance: 15,
      },
    });
    createdEmployees.push(emp);

    // Attendance records for past 5 days
    for (let i = 1; i <= 5; i++) {
      const attDate = subDays(now, i);
      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          date: attDate,
          checkIn: setHours(attDate, 8),
          checkOut: setHours(attDate, 17),
          status: i === 4 ? 'HALF_DAY' : 'PRESENT',
        },
      });
    }

    // Processed payroll
    await prisma.payroll.create({
      data: {
        payrollNo: `PAY-2026-09-${s.empNo}-${seedTimestamp}`,
        employeeId: emp.id,
        month: 9,
        year: 2026,
        basicSalary: s.salary,
        allowances: 3000,
        deductions: 1200,
        netSalary: s.salary + 1800,
        status: 'PAID',
        paidDate: subDays(now, 3),
      },
    });
  }

  const ownerUser = createdStaffUsers[0];
  const frontDeskUser = createdStaffUsers[1];

  // ─── 2. MEMBERSHIP PLANS ──────────────────────────────────────────────────
  console.log('2. Creating membership tiers...');
  const goldPlan = await prisma.plan.upsert({
    where: { name: 'Gold' },
    update: {},
    create: {
      name: 'Gold',
      price: 15000,
      durationMonths: 12,
      courtRate: 0, // 100% Free courts
      freeSessions: 12,
      shopDiscountPct: 20,
      barDiscountPct: 15,
      maxBookingsDay: 2,
    },
  });

  const silverPlan = await prisma.plan.upsert({
    where: { name: 'Silver' },
    update: {},
    create: {
      name: 'Silver',
      price: 8000,
      durationMonths: 6,
      courtRate: 200,
      freeSessions: 4,
      shopDiscountPct: 10,
      barDiscountPct: 5,
      maxBookingsDay: 2,
    },
  });

  const juniorPlan = await prisma.plan.upsert({
    where: { name: 'Junior' },
    update: {},
    create: {
      name: 'Junior',
      price: 4000,
      durationMonths: 6,
      courtRate: 100,
      freeSessions: 2,
      shopDiscountPct: 15,
      barDiscountPct: 10,
      maxBookingsDay: 2,
      maxAge: 18,
    },
  });

  // ─── 3. 55+ MEMBER PROFILES (Gold, Silver, Junior, Expired) ───────────────
  console.log('3. Creating 55+ diverse member profiles (65+ total users in DB)...');

  const rawMembers = [
    // Primary Demo User
    { name: 'Rohan Gupta (Gold Member)', email: 'member@championsclub.com', phone: '9876543215', plan: goldPlan, status: 'ACTIVE', age: 28, endMonths: 10 },
    // 24 More Gold VIP Members
    { name: 'Suresh Raina', email: 'suresh.raina@championsclub.com', phone: '9876543216', plan: goldPlan, status: 'ACTIVE', age: 37, endMonths: 11 },
    { name: 'Deepika Padukone', email: 'deepika.p@championsclub.com', phone: '9876543222', plan: goldPlan, status: 'ACTIVE', age: 36, endMonths: 9 },
    { name: 'Rajesh Khanna', email: 'rajesh.k@championsclub.com', phone: '9876543221', plan: goldPlan, status: 'ACTIVE', age: 49, endMonths: 8 },
    { name: 'Sania Mirza', email: 'sania.mirza@championsclub.com', phone: '9876543231', plan: goldPlan, status: 'ACTIVE', age: 37, endMonths: 12 },
    { name: 'Leander Paes', email: 'leander.p@championsclub.com', phone: '9876543232', plan: goldPlan, status: 'ACTIVE', age: 50, endMonths: 10 },
    { name: 'Rohan Bopanna', email: 'rohan.bopanna@championsclub.com', phone: '9876543233', plan: goldPlan, status: 'ACTIVE', age: 44, endMonths: 11 },
    { name: 'PV Sindhu', email: 'pv.sindhu@championsclub.com', phone: '9876543234', plan: goldPlan, status: 'ACTIVE', age: 29, endMonths: 8 },
    { name: 'Saina Nehwal', email: 'saina.nehwal@championsclub.com', phone: '9876543235', plan: goldPlan, status: 'ACTIVE', age: 34, endMonths: 9 },
    { name: 'Virat Kohli', email: 'virat.k@championsclub.com', phone: '9876543236', plan: goldPlan, status: 'ACTIVE', age: 35, endMonths: 12 },
    { name: 'MS Dhoni', email: 'ms.dhoni@championsclub.com', phone: '9876543237', plan: goldPlan, status: 'ACTIVE', age: 43, endMonths: 11 },
    { name: 'Sachin Tendulkar', email: 'sachin.t@championsclub.com', phone: '9876543238', plan: goldPlan, status: 'ACTIVE', age: 51, endMonths: 10 },
    { name: 'Rohit Sharma', email: 'rohit.s@championsclub.com', phone: '9876543239', plan: goldPlan, status: 'ACTIVE', age: 37, endMonths: 7 },
    { name: 'Jasprit Bumrah', email: 'jasprit.b@championsclub.com', phone: '9876543240', plan: goldPlan, status: 'ACTIVE', age: 30, endMonths: 8 },
    { name: 'Hardik Pandya', email: 'hardik.p@championsclub.com', phone: '9876543241', plan: goldPlan, status: 'ACTIVE', age: 30, endMonths: 9 },
    { name: 'Shubman Gill', email: 'shubman.g@championsclub.com', phone: '9876543242', plan: goldPlan, status: 'ACTIVE', age: 25, endMonths: 10 },
    { name: 'KL Rahul', email: 'kl.rahul@championsclub.com', phone: '9876543243', plan: goldPlan, status: 'ACTIVE', age: 32, endMonths: 6 },
    { name: 'Rishabh Pant', email: 'rishabh.p@championsclub.com', phone: '9876543244', plan: goldPlan, status: 'ACTIVE', age: 26, endMonths: 11 },
    { name: 'Neeraj Chopra', email: 'neeraj.c@championsclub.com', phone: '9876543245', plan: goldPlan, status: 'ACTIVE', age: 26, endMonths: 12 },
    { name: 'Abhinav Bindra', email: 'abhinav.b@championsclub.com', phone: '9876543246', plan: goldPlan, status: 'ACTIVE', age: 41, endMonths: 8 },
    { name: 'Sunil Chhetri', email: 'sunil.c@championsclub.com', phone: '9876543247', plan: goldPlan, status: 'ACTIVE', age: 40, endMonths: 7 },
    { name: 'Mary Kom', email: 'mary.kom@championsclub.com', phone: '9876543248', plan: goldPlan, status: 'ACTIVE', age: 41, endMonths: 9 },
    { name: 'Gautam Adani', email: 'gautam.a@championsclub.com', phone: '9876543249', plan: goldPlan, status: 'ACTIVE', age: 58, endMonths: 12 },
    { name: 'Anand Mahindra', email: 'anand.m@championsclub.com', phone: '9876543250', plan: goldPlan, status: 'ACTIVE', age: 60, endMonths: 10 },
    { name: 'Kiran Mazumdar', email: 'kiran.m@championsclub.com', phone: '9876543251', plan: goldPlan, status: 'ACTIVE', age: 55, endMonths: 11 },

    // 18 Silver Members
    { name: 'Amitabh Sen', email: 'amitabh.sen@championsclub.com', phone: '9876543217', plan: silverPlan, status: 'ACTIVE', age: 42, endMonths: 4 },
    { name: 'Kavita Krishnan', email: 'kavita.k@championsclub.com', phone: '9876543218', plan: silverPlan, status: 'ACTIVE', age: 31, endMonths: 5 },
    { name: 'Nikhil Kamath', email: 'nikhil.kamath@championsclub.com', phone: '9876543223', plan: silverPlan, status: 'ACTIVE', age: 38, endMonths: 2 },
    { name: 'Meera Nambiar', email: 'meera.n@championsclub.com', phone: '9876543224', plan: silverPlan, status: 'ACTIVE', age: 27, endMonths: 6 },
    { name: 'Arjun Rampal', email: 'arjun.r@championsclub.com', phone: '9876543252', plan: silverPlan, status: 'ACTIVE', age: 35, endMonths: 5 },
    { name: 'Anushka Sharma', email: 'anushka.s@championsclub.com', phone: '9876543253', plan: silverPlan, status: 'ACTIVE', age: 35, endMonths: 4 },
    { name: 'Farhan Akhtar', email: 'farhan.a@championsclub.com', phone: '9876543254', plan: silverPlan, status: 'ACTIVE', age: 45, endMonths: 3 },
    { name: 'Kareena Kapoor', email: 'kareena.k@championsclub.com', phone: '9876543255', plan: silverPlan, status: 'ACTIVE', age: 40, endMonths: 5 },
    { name: 'Ranbir Kapoor', email: 'ranbir.k@championsclub.com', phone: '9876543256', plan: silverPlan, status: 'ACTIVE', age: 39, endMonths: 6 },
    { name: 'Alia Bhatt', email: 'alia.b@championsclub.com', phone: '9876543257', plan: silverPlan, status: 'ACTIVE', age: 30, endMonths: 4 },
    { name: 'Varun Dhawan', email: 'varun.d@championsclub.com', phone: '9876543258', plan: silverPlan, status: 'ACTIVE', age: 34, endMonths: 5 },
    { name: 'Sidharth Malhotra', email: 'sidharth.m@championsclub.com', phone: '9876543259', plan: silverPlan, status: 'ACTIVE', age: 36, endMonths: 2 },
    { name: 'Kiara Advani', email: 'kiara.a@championsclub.com', phone: '9876543260', plan: silverPlan, status: 'ACTIVE', age: 31, endMonths: 6 },
    { name: 'Ayushmann Khurrana', email: 'ayushmann.k@championsclub.com', phone: '9876543261', plan: silverPlan, status: 'ACTIVE', age: 38, endMonths: 3 },
    { name: 'Taapsee Pannu', email: 'taapsee.p@championsclub.com', phone: '9876543262', plan: silverPlan, status: 'ACTIVE', age: 33, endMonths: 5 },
    { name: 'Rajkummar Rao', email: 'rajkummar.r@championsclub.com', phone: '9876543263', plan: silverPlan, status: 'ACTIVE', age: 37, endMonths: 4 },
    { name: 'Bhumi Pednekar', email: 'bhumi.p@championsclub.com', phone: '9876543264', plan: silverPlan, status: 'ACTIVE', age: 32, endMonths: 5 },
    { name: 'Kartik Aaryan', email: 'kartik.a@championsclub.com', phone: '9876543265', plan: silverPlan, status: 'ACTIVE', age: 32, endMonths: 6 },

    // 10 Junior Members (Age < 18)
    { name: 'Aryan Sharma (Junior)', email: 'aryan.sharma@championsclub.com', phone: '9876543219', plan: juniorPlan, status: 'ACTIVE', age: 15, endMonths: 4 },
    { name: 'Tanvi Deshmukh (Junior)', email: 'tanvi.d@championsclub.com', phone: '9876543220', plan: juniorPlan, status: 'ACTIVE', age: 16, endMonths: 3 },
    { name: 'Dhruv Jurel', email: 'dhruv.j@championsclub.com', phone: '9876543266', plan: juniorPlan, status: 'ACTIVE', age: 17, endMonths: 5 },
    { name: 'Yashasvi Jaiswal', email: 'yashasvi.j@championsclub.com', phone: '9876543267', plan: juniorPlan, status: 'ACTIVE', age: 17, endMonths: 6 },
    { name: 'Shafali Verma', email: 'shafali.v@championsclub.com', phone: '9876543268', plan: juniorPlan, status: 'ACTIVE', age: 16, endMonths: 4 },
    { name: 'Richa Ghosh', email: 'richa.g@championsclub.com', phone: '9876543269', plan: juniorPlan, status: 'ACTIVE', age: 17, endMonths: 5 },
    { name: 'Aman Sehrawat', email: 'aman.s@championsclub.com', phone: '9876543270', plan: juniorPlan, status: 'ACTIVE', age: 16, endMonths: 6 },
    { name: 'Manu Bhaker', email: 'manu.b@championsclub.com', phone: '9876543271', plan: juniorPlan, status: 'ACTIVE', age: 17, endMonths: 5 },
    { name: 'Lakshya Sen (Junior Grad)', email: 'lakshya.s@championsclub.com', phone: '9876543272', plan: juniorPlan, status: 'ACTIVE', age: 18, endMonths: 2 },
    { name: 'Anmol Kharb', email: 'anmol.k@championsclub.com', phone: '9876543273', plan: juniorPlan, status: 'ACTIVE', age: 15, endMonths: 5 },

    // 5 Expired / Inactive Members
    { name: 'Vikramaditya Rao (Expired)', email: 'vikram.rao@championsclub.com', phone: '9876543225', plan: goldPlan, status: 'EXPIRED', age: 45, endMonths: -1 },
    { name: 'Sneha Roy (Expired)', email: 'sneha.roy@championsclub.com', phone: '9876543226', plan: silverPlan, status: 'EXPIRED', age: 29, endMonths: -2 },
    { name: 'Prashant Nair (Expired)', email: 'prashant.n@championsclub.com', phone: '9876543274', plan: silverPlan, status: 'EXPIRED', age: 41, endMonths: -3 },
    { name: 'Divya Agarwal (Expired)', email: 'divya.a@championsclub.com', phone: '9876543275', plan: juniorPlan, status: 'EXPIRED', age: 18, endMonths: -1 },
    { name: 'Harsh Vardhan (Suspended)', email: 'harsh.v@championsclub.com', phone: '9876543276', plan: goldPlan, status: 'SUSPENDED', age: 39, endMonths: 1 },
  ];

  const createdMembers = [];

  for (let idx = 0; idx < rawMembers.length; idx++) {
    const m = rawMembers[idx];
    const memberNo = `MEM-${String(1001 + idx).padStart(6, '0')}`;

    const user = await prisma.user.create({
      data: {
        name: m.name,
        email: m.email,
        phone: m.phone,
        passwordHash,
        role: 'MEMBER',
      },
    });

    const dob = subDays(now, m.age * 365);
    const startDate = subDays(now, 90);
    const endDate = addMonths(startDate, m.endMonths > 0 ? m.endMonths : 1);

    const qrCode = JSON.stringify({
      memberNo,
      email: m.email,
      plan: m.plan.name,
      name: m.name,
    });

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        memberNo,
        planId: m.plan.id,
        dob,
        emergencyContact: '9876540000',
        status: m.status,
        startDate,
        endDate: m.endMonths < 0 ? subDays(now, 5) : endDate,
        qrCode,
      },
      include: { plan: true, user: true },
    });

    createdMembers.push(member);
  }

  console.log(`Created ${createdStaffUsers.length} staff + ${createdMembers.length} members = ${createdStaffUsers.length + createdMembers.length} total users!`);

  // ─── 4. COURTS & PITCHES ──────────────────────────────────────────────────
  console.log('4. Creating sports courts...');
  const courtsData = [
    { name: 'Tennis Court 1 (Clay)', sport: 'Tennis', openTime: '06:00', closeTime: '23:00', walkInRate: 500 },
    { name: 'Tennis Court 2 (Hard)', sport: 'Tennis', openTime: '06:00', closeTime: '23:00', walkInRate: 500 },
    { name: 'Padel Court 1 (Panoramic Glass)', sport: 'Padel', openTime: '06:00', closeTime: '23:00', walkInRate: 600 },
    { name: 'Badminton Court 1 (Teak Wood)', sport: 'Badminton', openTime: '06:00', closeTime: '23:00', walkInRate: 350 },
    { name: 'Badminton Court 2 (Synthetic BWF)', sport: 'Badminton', openTime: '06:00', closeTime: '23:00', walkInRate: 350 },
    { name: 'Cricket Practice Turf & Net', sport: 'Cricket', openTime: '06:00', closeTime: '23:00', walkInRate: 800 },
  ];

  const createdCourts = [];
  for (const c of courtsData) {
    const court = await prisma.court.upsert({
      where: { name: c.name },
      update: { walkInRate: c.walkInRate },
      create: c,
    });
    createdCourts.push(court);
  }

  // ─── 5. 50+ HISTORICAL, TODAY & FUTURE COURT BOOKINGS ────────────────────
  console.log('5. Generating 50+ court bookings across past 14 days, today, and future...');

  // Historical Past 14 Days Bookings (COMPLETED)
  for (let i = 1; i <= 35; i++) {
    const dayOffset = (i % 14) + 1;
    const day = subDays(now, dayOffset);
    const c = createdCourts[i % createdCourts.length];
    const m = createdMembers[i % createdMembers.length];
    const startHour = 6 + (i % 14);
    const startTime = setHours(setMinutes(day, 0), startHour);
    const endTime = setHours(setMinutes(day, 0), startHour + 1);

    const booking = await prisma.booking.create({
      data: {
        courtId: c.id,
        memberId: m.id,
        startTime,
        endTime,
        type: 'NORMAL',
        status: 'COMPLETED',
        price: m.plan.name === 'Gold' ? 0 : m.plan.courtRate,
        createdById: m.userId,
      },
    });

    if (Number(m.plan.courtRate) > 0) {
      await prisma.transaction.create({
        data: {
          transactionNo: `TXN-CRT-${seedTimestamp}-${i}`,
          source: 'COURT',
          amount: m.plan.courtRate,
          tax: 0,
          paymentMode: i % 2 === 0 ? 'UPI' : 'CARD',
          reference: booking.id,
          bookingId: booking.id,
          memberId: m.id,
          date: day,
          notes: `Court Booking - ${c.name}`,
        },
      });
    }
  }

  // Today's Live Active Bookings
  const todaySchedule = [
    { court: createdCourts[0], startHour: 6, member: createdMembers[0], status: 'COMPLETED' },
    { court: createdCourts[1], startHour: 7, member: createdMembers[1], status: 'COMPLETED' },
    { court: createdCourts[2], startHour: 8, member: createdMembers[2], status: 'COMPLETED' },
    { court: createdCourts[0], startHour: 17, member: createdMembers[3], status: 'CONFIRMED' },
    { court: createdCourts[1], startHour: 18, member: createdMembers[0], status: 'CONFIRMED' },
    { court: createdCourts[2], startHour: 19, member: createdMembers[4], status: 'CONFIRMED' },
    { court: createdCourts[3], startHour: 20, member: createdMembers[5], status: 'CONFIRMED' },
    { court: createdCourts[4], startHour: 21, member: createdMembers[6], status: 'CONFIRMED' },
  ];

  for (const ts of todaySchedule) {
    const s = setHours(setMinutes(now, 0), ts.startHour);
    const e = setHours(setMinutes(now, 0), ts.startHour + 1);

    await prisma.booking.create({
      data: {
        courtId: ts.court.id,
        memberId: ts.member.id,
        startTime: s,
        endTime: e,
        type: 'NORMAL',
        status: ts.status,
        price: ts.member.plan.name === 'Gold' ? 0 : ts.member.plan.courtRate,
        createdById: ts.member.userId,
      },
    });
  }

  // Future Upcoming Bookings (Next 5 days)
  for (let f = 1; f <= 10; f++) {
    const futureDay = addDays(now, (f % 5) + 1);
    const c = createdCourts[f % createdCourts.length];
    const m = createdMembers[(f + 5) % createdMembers.length];
    const sHour = 7 + (f % 12);

    await prisma.booking.create({
      data: {
        courtId: c.id,
        memberId: m.id,
        startTime: setHours(setMinutes(futureDay, 0), sHour),
        endTime: setHours(setMinutes(futureDay, 0), sHour + 1),
        type: 'NORMAL',
        status: 'CONFIRMED',
        price: m.plan.name === 'Gold' ? 0 : m.plan.courtRate,
        createdById: m.userId,
      },
    });
  }

  // Friday Night Social Play Session with 8 Participants
  const fridayDate = addDays(now, (5 - now.getDay() + 7) % 7);
  const socialSession = await prisma.booking.create({
    data: {
      courtId: createdCourts[0].id,
      startTime: setHours(setMinutes(fridayDate, 0), 19),
      endTime: setHours(setMinutes(fridayDate, 0), 21),
      type: 'SOCIAL',
      status: 'CONFIRMED',
      price: 200,
      maxPlayers: 12,
      createdById: ownerUser.id,
    },
  });

  for (let p = 0; p < 8; p++) {
    await prisma.socialParticipant.create({
      data: {
        bookingId: socialSession.id,
        memberId: createdMembers[p].id,
        fee: 200,
        paymentStatus: 'PAID',
      },
    });
  }

  // ─── 6. PRO SHOP PRODUCTS & LOW-STOCK INVENTORY ───────────────────────────
  console.log('6. Creating pro shop inventory & stock alerts...');
  const shopProducts = [
    { name: 'Wilson Pro Staff 97 v14', sku: 'RACK-WIL-01', category: 'RACKETS', price: 14999, stock: 8, reorderLevel: 3 },
    { name: 'Yonex Astrox 88D Pro', sku: 'RACK-YON-01', category: 'RACKETS', price: 9499, stock: 12, reorderLevel: 4 },
    { name: 'Head Flash Padel Racket', sku: 'RACK-PAD-01', category: 'RACKETS', price: 6200, stock: 6, reorderLevel: 2 },
    { name: 'Babolat Pure Aero 2026', sku: 'RACK-BAB-02', category: 'RACKETS', price: 16500, stock: 5, reorderLevel: 2 },
    { name: 'Dunlop Fort All-Court Balls (Can of 4)', sku: 'BALL-DUN-04', category: 'BALLS', price: 650, stock: 3, reorderLevel: 10 }, // ⚠️ LOW STOCK
    { name: 'Yonex Mavis 350 Nylon Shuttles (Tube of 6)', sku: 'BALL-YON-06', category: 'BALLS', price: 750, stock: 4, reorderLevel: 12 }, // ⚠️ LOW STOCK
    { name: 'Wilson US Open Extra Duty Balls', sku: 'BALL-WIL-04', category: 'BALLS', price: 720, stock: 2, reorderLevel: 8 }, // ⚠️ LOW STOCK
    { name: 'Asics Gel-Resolution 9 Tennis Shoes', sku: 'SHOE-ASC-09', category: 'SHOES', price: 11999, stock: 7, reorderLevel: 3 },
    { name: 'Babolat Jet Mach 3 Shoes', sku: 'SHOE-BAB-03', category: 'SHOES', price: 8500, stock: 5, reorderLevel: 2 },
    { name: 'Yonex Power Cushion 65 Z3', sku: 'SHOE-YON-65', category: 'SHOES', price: 10499, stock: 6, reorderLevel: 3 },
    { name: 'Champions Club Dry-Fit Match Jersey', sku: 'APP-DRY-01', category: 'APPAREL', price: 1299, stock: 28, reorderLevel: 10 },
    { name: 'Nike Court Athletic Shorts', sku: 'APP-NIK-02', category: 'APPAREL', price: 999, stock: 32, reorderLevel: 8 },
    { name: 'Tourna Grip Original Overgrip (Pack of 3)', sku: 'ACC-TRN-03', category: 'ACCESSORIES', price: 450, stock: 45, reorderLevel: 15 },
    { name: 'Wilson Wristbands (Pair)', sku: 'ACC-WIL-WR', category: 'ACCESSORIES', price: 299, stock: 35, reorderLevel: 10 },
    { name: 'Champions Club Insulated Thermal Bottle (750ml)', sku: 'ACC-BOT-01', category: 'ACCESSORIES', price: 899, stock: 20, reorderLevel: 5 },
  ];

  const createdProducts = [];
  for (const sp of shopProducts) {
    const prod = await prisma.product.upsert({
      where: { sku: sp.sku },
      update: { stock: sp.stock, price: sp.price, reorderLevel: sp.reorderLevel },
      create: {
        name: sp.name,
        sku: sp.sku,
        category: sp.category,
        price: sp.price,
        taxPct: 12,
        stock: sp.stock,
        reorderLevel: sp.reorderLevel,
      },
    });
    createdProducts.push(prod);
  }

  // ─── 7. CAFETERIA MENU & TABLES ───────────────────────────────────────────
  console.log('7. Creating cafeteria menu, tables, and live member orders...');
  const menuItems = [
    { name: 'Hydration Electrolyte Booster (500ml)', category: 'HEALTH_DRINKS', price: 90 },
    { name: 'Whey Protein Recovery Shake (Banana Berry)', category: 'HEALTH_DRINKS', price: 160 },
    { name: 'Artisan Espresso Coffee', category: 'BEVERAGES', price: 110 },
    { name: 'Fresh Watermelon Juice (Cold Pressed)', category: 'BEVERAGES', price: 120 },
    { name: 'Iced Matcha Green Tea Latte', category: 'BEVERAGES', price: 150 },
    { name: 'Grilled Chicken & Herb Panini', category: 'MEALS', price: 220 },
    { name: 'Paneer Tikka Protein Wrap', category: 'MEALS', price: 190 },
    { name: 'Post-Match Quinoa Power Bowl', category: 'MEALS', price: 280 },
    { name: 'Pasta Arrabbiata with Garden Veggies', category: 'MEALS', price: 240 },
    { name: 'Oats, Peanut Butter & Honey Energy Bar', category: 'SNACKS', price: 80 },
    { name: 'Baked Sweet Potato Wedges with Dip', category: 'SNACKS', price: 130 },
    { name: 'Greek Yogurt Parfait with Fresh Berries', category: 'DESSERTS', price: 160 },
  ];

  const createdMenuItems = [];
  for (const mi of menuItems) {
    const item = await prisma.menuItem.upsert({
      where: { name: mi.name },
      update: { price: mi.price },
      create: {
        name: mi.name,
        category: mi.category,
        price: mi.price,
        taxPct: 5,
        isAvailable: true,
      },
    });
    createdMenuItems.push(item);
  }

  // 8 Bar / Lounge Tables
  const createdTables = [];
  for (let i = 1; i <= 8; i++) {
    const table = await prisma.barTable.upsert({
      where: { number: `T${i}` },
      update: {},
      create: {
        number: `T${i}`,
        capacity: i <= 4 ? 4 : 8,
        status: i === 2 || i === 4 ? 'OCCUPIED' : 'AVAILABLE',
      },
    });
    createdTables.push(table);
  }

  // Active Open Tab for Rohan Gupta (Gold Member) on Table 2
  const rohanMember = createdMembers[0];
  const table2 = createdTables[1];

  const activeTab = await prisma.barTab.create({
    data: {
      memberId: rohanMember.id,
      status: 'OPEN',
      totalAmount: 380,
    },
  });

  await prisma.order.create({
    data: {
      orderNo: `ORD-BAR-${seedTimestamp}-001`,
      memberId: rohanMember.id,
      channel: 'BAR',
      barTableId: table2.id,
      barTabId: activeTab.id,
      status: 'PREPARING',
      fulfilment: 'DINE_IN',
      subtotal: 380,
      discount: 57, // 15% Gold discount
      tax: 16.15,
      total: 339.15,
      paymentStatus: 'PENDING',
      items: {
        create: [
          {
            menuItemId: createdMenuItems[5].id,
            quantity: 1,
            unitPrice: 220,
            taxPct: 5,
            totalPrice: 220,
          },
          {
            menuItemId: createdMenuItems[1].id,
            quantity: 1,
            unitPrice: 160,
            taxPct: 5,
            totalPrice: 160,
          },
        ],
      },
    },
  });

  // ─── 8. CRM SALES PIPELINE & QUOTATIONS ───────────────────────────────────
  console.log('8. Creating CRM leads across all Kanban stages...');
  const crmLeads = [
    { name: 'Aditya Birla Group Corp League', phone: '9811122233', email: 'aditya.corp@example.com', source: 'CORPORATE', stage: 'QUOTED' },
    { name: 'Tata Consultancy Sports Club', phone: '9822233344', email: 'tcs.sports@example.com', source: 'CORPORATE', stage: 'NEW' },
    { name: 'Karan Mehra', phone: '9833344455', email: 'karan.m@example.com', source: 'WEBSITE', stage: 'NEW' },
    { name: 'Shreya Ghoshal', phone: '9844455566', email: 'shreya.g@example.com', source: 'INSTAGRAM', stage: 'CONTACTED' },
    { name: 'Manish Malhotra', phone: '9855566677', email: 'manish.m@example.com', source: 'REFERRAL', stage: 'WON' },
    { name: 'Zomato Wellness League', phone: '9866677788', email: 'wellness@zomato.com', source: 'CORPORATE', stage: 'CONTACTED' },
    { name: 'Vijay Mallya', phone: '9877788899', email: 'vijay.m@example.com', source: 'WEBSITE', stage: 'LOST' },
    { name: 'Pooja Hegde', phone: '9888899900', email: 'pooja.h@example.com', source: 'INSTAGRAM', stage: 'CONTACTED' },
  ];

  for (const leadData of crmLeads) {
    const lead = await prisma.lead.create({
      data: {
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        source: leadData.source,
        stage: leadData.stage,
        assignedToId: frontDeskUser.id,
        followUps: {
          create: [
            {
              date: now,
              type: 'CALL',
              notes: 'Discussed corporate weekend court rentals & VIP Gold group membership tiers.',
              status: 'COMPLETED',
            },
          ],
        },
      },
    });

    if (leadData.stage === 'QUOTED') {
      await prisma.quotation.create({
        data: {
          quotationNo: `QT-2026-${lead.id.slice(0, 4).toUpperCase()}`,
          leadId: lead.id,
          planId: goldPlan.id,
          amount: 15000,
          discount: 1000,
          total: 14000,
          validUntil: addDays(now, 14),
          status: 'SENT',
        },
      });
    }
  }

  // ─── 9. 60+ FINANCIAL LEDGER TRANSACTIONS ─────────────────────────────────
  console.log('9. Creating 60+ multi-channel financial ledger transactions for analytics...');
  const sources = ['COURT', 'SHOP', 'BAR', 'MEMBERSHIP'];
  const modes = ['UPI', 'CARD', 'CASH'];

  // Past 30 Days Transactions
  for (let i = 1; i <= 55; i++) {
    const txDate = subDays(now, (i % 28) + 1);
    const src = sources[i % sources.length];
    const pMode = modes[i % modes.length];
    const amount = src === 'MEMBERSHIP' ? 15000 : src === 'SHOP' ? 2450 + (i * 50) : src === 'COURT' ? 800 + (i * 20) : 450 + (i * 15);

    await prisma.transaction.create({
      data: {
        transactionNo: `TXN-GEN-${seedTimestamp}-${1000 + i}`,
        source: src,
        amount,
        tax: amount * 0.12,
        paymentMode: pMode,
        reference: `INV-2026-${100 + i}`,
        memberId: createdMembers[i % createdMembers.length].id,
        date: txDate,
        notes: `${src} Revenue collected via ${pMode}`,
      },
    });
  }

  // Today's Live Transactions (ensures positive Today Revenue on Dashboard!)
  const todayTransactions = [
    { src: 'COURT', amount: 1500, mode: 'UPI', notes: 'Morning Tennis 1 & 2 Sessions' },
    { src: 'SHOP', amount: 3200, mode: 'CARD', notes: 'Wilson Balls & Tourna Grips POS' },
    { src: 'BAR', amount: 1850, mode: 'UPI', notes: 'Post-Workout Shakes & Panini Tabs' },
    { src: 'MEMBERSHIP', amount: 15000, mode: 'UPI', notes: 'Annual Gold Membership Renewal' },
    { src: 'COURT', amount: 800, mode: 'CASH', notes: 'Afternoon Padel Court 1 Booking' },
  ];

  for (let j = 0; j < todayTransactions.length; j++) {
    const tt = todayTransactions[j];
    await prisma.transaction.create({
      data: {
        transactionNo: `TXN-TODAY-${seedTimestamp}-${j + 1}`,
        source: tt.src,
        amount: tt.amount,
        tax: tt.amount * 0.05,
        paymentMode: tt.mode,
        reference: `POS-TODAY-${j + 1}`,
        date: now,
        notes: tt.notes,
      },
    });
  }

  // ─── 10. INVOICES & EXPENSES (BALANCE SHEET) ──────────────────────────────
  console.log('10. Creating corporate invoices and operational expense records...');
  await prisma.invoice.create({
    data: {
      invoiceNo: `INV-CORP-2026-${seedTimestamp}`,
      companyName: 'TechCorp India Pvt Ltd',
      gstin: '24AAACT1234F1Z5',
      clientEmail: 'admin@techcorp.com',
      type: 'BUSINESS',
      amount: 25000,
      tax: 4500,
      total: 29500,
      dueDate: addDays(now, 10),
      status: 'SENT',
      items: {
        create: [
          {
            description: 'Corporate Tennis League 4-Court Weekend Rental',
            quantity: 1,
            unitPrice: 25000,
            taxPct: 18,
            total: 29500,
          },
        ],
      },
    },
  });

  const expenses = [
    { no: 'EXP-001', vendor: 'Torrent Power Ltd', cat: 'UTILITIES', amount: 18500, status: 'UNPAID' },
    { no: 'EXP-002', vendor: 'Wilson Sports India Distributors', cat: 'INVENTORY', amount: 32000, status: 'PAID' },
    { no: 'EXP-003', vendor: 'Green Valley Organic Farms', cat: 'CAFETERIA', amount: 14000, status: 'PAID' },
    { no: 'EXP-004', vendor: 'ProTurf Court Maintenance Services', cat: 'MAINTENANCE', amount: 8500, status: 'PAID' },
    { no: 'EXP-005', vendor: 'Airtel Enterprise Fiber Internet', cat: 'UTILITIES', amount: 3500, status: 'PAID' },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        expenseNo: `EXP-${seedTimestamp}-${exp.no}`,
        vendor: exp.vendor,
        category: exp.cat,
        amount: exp.amount,
        dueDate: now,
        paidDate: exp.status === 'PAID' ? now : null,
        status: exp.status,
        paymentMode: 'UPI',
        reference: `CHQ-${exp.no}`,
      },
    });
  }

  console.log('✅ 65+ User Master Dataset seeded successfully into local database!');
  console.log('----------------------------------------------------');
  console.log('👑 Owner:      owner@championsclub.com      / Password@123');
  console.log('🏢 Front Desk: frontdesk@championsclub.com  / Password@123');
  console.log('🍸 Bar Staff:  bar@championsclub.com        / Password@123');
  console.log('👨‍🍳 Kitchen:    kitchen@championsclub.com    / Password@123');
  console.log('🛍️ Shop Staff: shop@championsclub.com       / Password@123');
  console.log('🎾 VIP Member: member@championsclub.com     / Password@123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
