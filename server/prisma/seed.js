import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addMonths, subDays, addDays, setHours, setMinutes } from 'date-fns';

const prisma = new PrismaClient();

// High variety realistic Indian names generator
const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Rohan', 'Dhruv', 'Kabir', 'Ananya', 'Diya', 'Gauri', 'Aanya', 'Pari',
  'Saanvi', 'Anika', 'Navya', 'Avani', 'Myra', 'Ira', 'Aadhya', 'Kiara', 'Sara', 'Rhea',
  'Pooja', 'Neha', 'Sneha', 'Deepak', 'Vikram', 'Rajesh', 'Suresh', 'Amit', 'Manish', 'Karan',
  'Tarun', 'Naveen', 'Gautam', 'Kunal', 'Pranav', 'Harsh', 'Alok', 'Sachin', 'Virat', 'Rohit',
  'Hardik', 'Jasprit', 'Shubman', 'Shreyas', 'Suryakumar', 'Ravindra', 'Kuldeep', 'Yuzvendra', 'Sanju', 'Ruturaj',
  'Ishan', 'Rishabh', 'Axar', 'Shardul', 'Mohammed', 'Umesh', 'Bhuvneshwar', 'Varun', 'Chetan', 'Jaydev',
  'Prithvi', 'Devdutt', 'Mayank', 'Karun', 'Hanuma', 'Cheteshwar', 'Ajinkya', 'Dinesh', 'Robin', 'Ambati',
  'Kedar', 'Abhinav', 'Parthiv', 'Naman', 'Stuart', 'Pawan', 'Rajat', 'Shahbaz', 'Tilak', 'Jitesh',
  'Rinku', 'Shivam', 'Mukesh', 'Avesh', 'Prasidh', 'Umran', 'Yash', 'Tushar', 'Akash', 'Arshdeep',
  'Tanvi', 'Deepika', 'Sania', 'Sindhu', 'Saina', 'Anushka', 'Kareena', 'Alia', 'Kiara', 'Taapsee',
  'Bhumi', 'Shafali', 'Richa', 'Manu', 'Anmol', 'Smriti', 'Harmanpreet', 'Jemimah', 'Deepti', 'Renuka',
  'Radha', 'Pooja', 'Yastika', 'Sushma', 'Mithali', 'Jhulan', 'Veda', 'Ekta', 'Shikha', 'Taniya'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Verma', 'Singh', 'Mehta', 'Iyer', 'Gupta', 'Rao', 'Nair', 'Joshi',
  'Chopra', 'Kapoor', 'Reddy', 'Deshmukh', 'Bhatia', 'Malhotra', 'Kulkarni', 'Agarwal', 'Bansal', 'Saxena',
  'Pandey', 'Mishra', 'Trivedi', 'Shah', 'Chauhan', 'Yadav', 'Gowda', 'Menon', 'Pillai', 'Mukherjee',
  'Banerjee', 'Chatterjee', 'Ghosh', 'Dutta', 'Sengupta', 'Bose', 'Das', 'Roy', 'Sen', 'Chakraborty',
  'Bopanna', 'Mirza', 'Paes', 'Bhupathi', 'Nehwal', 'Sindhu', 'Kohli', 'Dhoni', 'Tendulkar', 'Raina'
];

async function main() {
  console.log('🚀 Seeding comprehensive Master Dataset with 550 users and club operations...');

  const passwordHash = await bcrypt.hash('Password@123', 10);
  const now = new Date();
  const seedTimestamp = Date.now();

  // ─── 0. CLEAN EXISTING DATABASE ───────────────────────────────────────────
  console.log('Cleaning existing records for a fresh, consistent database state...');
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
  console.log('Database cleanup completed.');

  // ─── 1. CORE ROLE & STAFF USERS (10 Users) ─────────────────────────────────
  console.log('1. Creating 10 management and operational staff users...');
  const staffUsersData = [
    { name: 'Vikram Mehta', email: 'owner@bookmycourt.com', phone: '9876543210', role: 'OWNER', empNo: 'EMP-000', desig: 'Managing Director & Owner', salary: 150000 },
    { name: 'Priya Sharma', email: 'frontdesk@bookmycourt.com', phone: '9876543211', role: 'FRONT_DESK', empNo: 'EMP-001', desig: 'Head Receptionist', salary: 35000 },
    { name: 'Rahul Verma', email: 'bar@bookmycourt.com', phone: '9876543212', role: 'BAR_STAFF', empNo: 'EMP-002', desig: 'Bar & Cafe Supervisor', salary: 32000 },
    { name: 'Anthony D\'Souza', email: 'kitchen@bookmycourt.com', phone: '9876543213', role: 'KITCHEN', empNo: 'EMP-003', desig: 'Executive Head Chef', salary: 42000 },
    { name: 'Sunil Kumar', email: 'shop@bookmycourt.com', phone: '9876543214', role: 'SHOP_STAFF', empNo: 'EMP-004', desig: 'Pro Shop Manager', salary: 30000 },
    { name: 'Mahesh Bhupathi', email: 'coach.tennis@bookmycourt.com', phone: '9876543280', role: 'FRONT_DESK', empNo: 'EMP-005', desig: 'Senior Tennis Coach', salary: 55000 },
    { name: 'Pullela Gopichand', email: 'coach.badminton@bookmycourt.com', phone: '9876543281', role: 'FRONT_DESK', empNo: 'EMP-006', desig: 'Head Badminton Coach', salary: 50000 },
    { name: 'Anjali Bhagwat', email: 'trainer@bookmycourt.com', phone: '9876543282', role: 'FRONT_DESK', empNo: 'EMP-007', desig: 'Strength & Conditioning Coach', salary: 38000 },
    { name: 'Ramesh Patel', email: 'accounts@bookmycourt.com', phone: '9876543283', role: 'FRONT_DESK', empNo: 'EMP-008', desig: 'Senior Club Accountant', salary: 40000 },
    { name: 'Devendra Joshi', email: 'facilities@bookmycourt.com', phone: '9876543284', role: 'FRONT_DESK', empNo: 'EMP-009', desig: 'Court & Turf Facility Manager', salary: 32000 },
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
        joiningDate: subDays(now, 240),
        salary: s.salary,
        bankAccountNo: `91823746${s.empNo.replace('EMP-', '')}`,
        ifscCode: 'HDFC0001234',
        panNo: 'ABCDE1234F',
        leaveBalance: 15,
      },
    });
    createdEmployees.push(emp);

    // September Payroll
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
        paidDate: subDays(now, 10),
      },
    });

    // October Payroll
    await prisma.payroll.create({
      data: {
        payrollNo: `PAY-2026-10-${s.empNo}-${seedTimestamp}`,
        employeeId: emp.id,
        month: 10,
        year: 2026,
        basicSalary: s.salary,
        allowances: 3000,
        deductions: 1200,
        netSalary: s.salary + 1800,
        status: 'PAID',
        paidDate: subDays(now, 1),
      },
    });
  }

  const ownerUser = createdStaffUsers[0];
  const frontDeskUser = createdStaffUsers[1];

  // ─── 2. MEMBERSHIP PLANS ──────────────────────────────────────────────────
  console.log('2. Creating membership plan tiers...');
  const goldPlan = await prisma.plan.upsert({
    where: { name: 'Gold' },
    update: {},
    create: {
      name: 'Gold',
      price: 15000,
      durationMonths: 12,
      courtRate: 0,
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

  // ─── 3. 540 MEMBERS (550 USERS TOTAL) ──────────────────────────────────────
  console.log('3. Generating 540 unique member profiles across Gold, Silver, Junior & Expired tiers...');

  // Target Distribution:
  // - 240 Gold VIP Members
  // - 200 Silver Members
  // - 75 Junior Members
  // - 25 Expired / Suspended Members
  // Total: 540 Members + 10 Staff = 550 Users

  const totalMembersTarget = 540;
  const createdMembers = [];

  // Helper for generating deterministic unique identities
  for (let i = 0; i < totalMembersTarget; i++) {
    const fIdx = (i * 7 + 3) % FIRST_NAMES.length;
    const lIdx = (i * 11 + 5) % LAST_NAMES.length;
    const firstName = FIRST_NAMES[fIdx];
    const lastName = LAST_NAMES[lIdx];
    const memberNum = 1001 + i;
    const memberNo = `MEM-${String(memberNum).padStart(6, '0')}`;

    let plan = goldPlan;
    let status = 'ACTIVE';
    let age = 22 + (i % 40);
    let endMonths = 6 + (i % 7);
    let name = `${firstName} ${lastName}`;
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${memberNum}@bookmycourt.com`;
    let phone = `98${String(10000000 + i).padStart(8, '0')}`;

    if (i === 0) {
      // Primary Demo Member
      name = 'Rohan Gupta (Gold Member)';
      email = 'member@bookmycourt.com';
      phone = '9876543215';
      plan = goldPlan;
      status = 'ACTIVE';
      age = 28;
      endMonths = 10;
    } else if (i < 240) {
      // 239 Gold Members
      plan = goldPlan;
      status = 'ACTIVE';
      age = 24 + (i % 38);
      endMonths = 4 + (i % 9);
    } else if (i < 440) {
      // 200 Silver Members
      plan = silverPlan;
      status = 'ACTIVE';
      age = 21 + (i % 42);
      endMonths = 2 + (i % 6);
    } else if (i < 515) {
      // 75 Junior Members (Age 12 - 17)
      plan = juniorPlan;
      status = 'ACTIVE';
      age = 12 + (i % 6);
      endMonths = 1 + (i % 6);
      name = `${firstName} ${lastName} (Junior)`;
    } else {
      // 25 Expired / Suspended
      plan = i % 2 === 0 ? goldPlan : silverPlan;
      status = i % 5 === 0 ? 'SUSPENDED' : 'EXPIRED';
      age = 28 + (i % 30);
      endMonths = -1 * ((i % 4) + 1);
      name = `${firstName} ${lastName} (${status})`;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'MEMBER',
      },
    });

    const dob = subDays(now, age * 365);
    const startDate = subDays(now, 120);
    const endDate = endMonths > 0 ? addMonths(startDate, endMonths) : subDays(now, 5 + (i % 30));

    const qrCode = JSON.stringify({
      memberNo,
      email,
      plan: plan.name,
      name,
    });

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        memberNo,
        planId: plan.id,
        dob,
        emergencyContact: '9876540000',
        status,
        startDate,
        endDate,
        qrCode,
      },
      include: { plan: true, user: true },
    });

    createdMembers.push(member);

    // Initial Membership Fee Invoices & Transactions (Every active member has payment record)
    if (status === 'ACTIVE' && i % 2 === 0) {
      const memTxnDate = subDays(now, 10 + (i % 80));
      const inv = await prisma.invoice.create({
        data: {
          invoiceNo: `INV-MEM-${seedTimestamp}-${memberNo}`,
          memberId: member.id,
          type: 'MEMBERSHIP',
          amount: plan.price,
          tax: Number(plan.price) * 0.18,
          total: Number(plan.price) * 1.18,
          dueDate: memTxnDate,
          status: 'PAID',
          items: {
            create: [
              {
                description: `${plan.name} Tier Annual Sports Membership (${memberNo})`,
                quantity: 1,
                unitPrice: plan.price,
                taxPct: 18,
                total: Number(plan.price) * 1.18,
              },
            ],
          },
        },
      });

      await prisma.transaction.create({
        data: {
          transactionNo: `TXN-MEM-${seedTimestamp}-${memberNo}`,
          source: 'MEMBERSHIP',
          amount: plan.price,
          tax: Number(plan.price) * 0.18,
          paymentMode: i % 3 === 0 ? 'UPI' : i % 3 === 1 ? 'ONLINE' : 'CARD',
          reference: inv.invoiceNo,
          invoiceId: inv.id,
          memberId: member.id,
          date: memTxnDate,
          notes: `Membership Subscription - ${plan.name} Tier for ${name}`,
        },
      });
    }

    if ((i + 1) % 100 === 0 || i === totalMembersTarget - 1) {
      console.log(`  -> Processed ${i + 1} / ${totalMembersTarget} members...`);
    }
  }

  console.log(`✅ User Population Complete: ${createdStaffUsers.length} Staff + ${createdMembers.length} Members = ${createdStaffUsers.length + createdMembers.length} Total Users!`);

  // ─── 4. COURTS & PITCHES ──────────────────────────────────────────────────
  console.log('4. Creating 6 premier sports courts...');
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

  // ─── 5. 350+ HISTORICAL, TODAY & FUTURE COURT BOOKINGS ────────────────────
  console.log('5. Generating 350+ court bookings across past 30 days, today, and future...');

  // Historical Past 28 Days Bookings (COMPLETED)
  let bookingIndex = 0;
  for (let dayOffset = 1; dayOffset <= 28; dayOffset++) {
    const day = subDays(now, dayOffset);
    for (let cIdx = 0; cIdx < createdCourts.length; cIdx++) {
      const c = createdCourts[cIdx];
      // 2 distinct slots per court per day: morning and evening
      const hours = [6 + (cIdx % 3), 16 + (cIdx % 4)];
      for (const startHour of hours) {
        bookingIndex++;
        const m = createdMembers[bookingIndex % createdMembers.length];
        const startTime = setHours(setMinutes(day, 0), startHour);
        const endTime = setHours(setMinutes(day, 0), startHour + 1);
        const price = m.plan.name === 'Gold' ? 0 : m.plan.courtRate;

        const booking = await prisma.booking.create({
          data: {
            courtId: c.id,
            memberId: m.id,
            startTime,
            endTime,
            type: 'NORMAL',
            status: 'COMPLETED',
            price,
            createdById: m.userId,
          },
        });

        if (Number(price) > 0) {
          await prisma.transaction.create({
            data: {
              transactionNo: `TXN-CRT-${seedTimestamp}-${bookingIndex}`,
              source: 'COURT',
              amount: price,
              tax: 0,
              paymentMode: bookingIndex % 2 === 0 ? 'UPI' : 'CARD',
              reference: booking.id,
              bookingId: booking.id,
              memberId: m.id,
              date: day,
              notes: `Court Booking - ${c.name} (${m.plan.name} Tier)`,
            },
          });
        }
      }
    }
  }

  // Today's Live Active Court Bookings (Covering Morning & Evening slots)
  const todayCourtSlots = [
    { court: createdCourts[0], startHour: 6, member: createdMembers[0], status: 'COMPLETED' },
    { court: createdCourts[1], startHour: 7, member: createdMembers[1], status: 'COMPLETED' },
    { court: createdCourts[2], startHour: 8, member: createdMembers[2], status: 'COMPLETED' },
    { court: createdCourts[3], startHour: 8, member: createdMembers[3], status: 'COMPLETED' },
    { court: createdCourts[4], startHour: 9, member: createdMembers[4], status: 'COMPLETED' },
    { court: createdCourts[5], startHour: 10, member: createdMembers[5], status: 'COMPLETED' },
    { court: createdCourts[0], startHour: 17, member: createdMembers[6], status: 'CONFIRMED' },
    { court: createdCourts[1], startHour: 18, member: createdMembers[7], status: 'CONFIRMED' },
    { court: createdCourts[2], startHour: 18, member: createdMembers[8], status: 'CONFIRMED' },
    { court: createdCourts[3], startHour: 19, member: createdMembers[9], status: 'CONFIRMED' },
    { court: createdCourts[4], startHour: 20, member: createdMembers[10], status: 'CONFIRMED' },
    { court: createdCourts[5], startHour: 20, member: createdMembers[11], status: 'CONFIRMED' },
    { court: createdCourts[0], startHour: 21, member: createdMembers[12], status: 'CONFIRMED' },
  ];

  for (const ts of todayCourtSlots) {
    const s = setHours(setMinutes(now, 0), ts.startHour);
    const e = setHours(setMinutes(now, 0), ts.startHour + 1);
    const p = ts.member.plan.name === 'Gold' ? 0 : ts.member.plan.courtRate;

    const b = await prisma.booking.create({
      data: {
        courtId: ts.court.id,
        memberId: ts.member.id,
        startTime: s,
        endTime: e,
        type: 'NORMAL',
        status: ts.status,
        price: p,
        createdById: ts.member.userId,
      },
    });

    if (Number(p) > 0) {
      await prisma.transaction.create({
        data: {
          transactionNo: `TXN-CRT-TODAY-${seedTimestamp}-${ts.startHour}-${ts.court.name.slice(0, 3)}`,
          source: 'COURT',
          amount: p,
          tax: 0,
          paymentMode: 'UPI',
          reference: b.id,
          bookingId: b.id,
          memberId: ts.member.id,
          date: now,
          notes: `Today Court Booking - ${ts.court.name}`,
        },
      });
    }
  }

  // Future Upcoming Bookings (Next 7 days, distinct hours)
  for (let fDay = 1; fDay <= 7; fDay++) {
    const futureDay = addDays(now, fDay);
    for (let cIdx = 0; cIdx < createdCourts.length; cIdx++) {
      const c = createdCourts[cIdx];
      const startHour = 8 + (cIdx % 4) * 2;
      bookingIndex++;
      const m = createdMembers[bookingIndex % createdMembers.length];

      await prisma.booking.create({
        data: {
          courtId: c.id,
          memberId: m.id,
          startTime: setHours(setMinutes(futureDay, 0), startHour),
          endTime: setHours(setMinutes(futureDay, 0), startHour + 1),
          type: 'NORMAL',
          status: 'CONFIRMED',
          price: m.plan.name === 'Gold' ? 0 : m.plan.courtRate,
          createdById: m.userId,
        },
      });
    }
  }

  // 4 Social Play Sessions with Participants (At 19:00 - 21:00 on future days 8, 9, 10, 11)
  for (let sIdx = 1; sIdx <= 4; sIdx++) {
    const sessionDate = addDays(now, 7 + sIdx);
    const socialSession = await prisma.booking.create({
      data: {
        courtId: createdCourts[(sIdx - 1) % createdCourts.length].id,
        startTime: setHours(setMinutes(sessionDate, 0), 19),
        endTime: setHours(setMinutes(sessionDate, 0), 21),
        type: 'SOCIAL',
        status: 'CONFIRMED',
        price: 250,
        maxPlayers: 12,
        createdById: ownerUser.id,
      },
    });

    for (let p = 0; p < 8; p++) {
      await prisma.socialParticipant.create({
        data: {
          bookingId: socialSession.id,
          memberId: createdMembers[(sIdx * 8 + p) % createdMembers.length].id,
          fee: 250,
          paymentStatus: 'PAID',
        },
      });
    }
  }

  // ─── 6. PRO SHOP PRODUCTS & MULTI-ORDER SALES ─────────────────────────────
  console.log('6. Creating pro shop inventory & multi-product member orders...');
  const shopProducts = [
    { name: 'Wilson Pro Staff 97 v14', sku: 'RACK-WIL-01', category: 'RACKETS', price: 14999, stock: 15, reorderLevel: 3 },
    { name: 'Yonex Astrox 88D Pro', sku: 'RACK-YON-01', category: 'RACKETS', price: 9499, stock: 22, reorderLevel: 4 },
    { name: 'Head Flash Padel Racket', sku: 'RACK-PAD-01', category: 'RACKETS', price: 6200, stock: 14, reorderLevel: 2 },
    { name: 'Babolat Pure Aero 2026', sku: 'RACK-BAB-02', category: 'RACKETS', price: 16500, stock: 10, reorderLevel: 2 },
    { name: 'Dunlop Fort All-Court Balls (Can of 4)', sku: 'BALL-DUN-04', category: 'BALLS', price: 650, stock: 3, reorderLevel: 10 }, // LOW STOCK
    { name: 'Yonex Mavis 350 Nylon Shuttles (Tube of 6)', sku: 'BALL-YON-06', category: 'BALLS', price: 750, stock: 4, reorderLevel: 12 }, // LOW STOCK
    { name: 'Wilson US Open Extra Duty Balls', sku: 'BALL-WIL-04', category: 'BALLS', price: 720, stock: 2, reorderLevel: 8 }, // LOW STOCK
    { name: 'Asics Gel-Resolution 9 Tennis Shoes', sku: 'SHOE-ASC-09', category: 'SHOES', price: 11999, stock: 12, reorderLevel: 3 },
    { name: 'Babolat Jet Mach 3 Shoes', sku: 'SHOE-BAB-03', category: 'SHOES', price: 8500, stock: 9, reorderLevel: 2 },
    { name: 'Yonex Power Cushion 65 Z3', sku: 'SHOE-YON-65', category: 'SHOES', price: 10499, stock: 11, reorderLevel: 3 },
    { name: 'BookMyCourt Dry-Fit Match Jersey', sku: 'APP-DRY-01', category: 'APPAREL', price: 1299, stock: 45, reorderLevel: 10 },
    { name: 'Nike Court Athletic Shorts', sku: 'APP-NIK-02', category: 'APPAREL', price: 999, stock: 50, reorderLevel: 8 },
    { name: 'Tourna Grip Original Overgrip (Pack of 3)', sku: 'ACC-TRN-03', category: 'ACCESSORIES', price: 450, stock: 80, reorderLevel: 15 },
    { name: 'Wilson Wristbands (Pair)', sku: 'ACC-WIL-WR', category: 'ACCESSORIES', price: 299, stock: 60, reorderLevel: 10 },
    { name: 'BookMyCourt Insulated Thermal Bottle (750ml)', sku: 'ACC-BOT-01', category: 'ACCESSORIES', price: 899, stock: 35, reorderLevel: 5 },
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

  // 120 Pro Shop Customer Orders across the past 30 days
  for (let o = 1; o <= 120; o++) {
    const orderDate = subDays(now, o % 28);
    const m = createdMembers[o % createdMembers.length];
    const prod = createdProducts[o % createdProducts.length];
    const qty = (o % 3) + 1;
    const subtotal = Number(prod.price) * qty;
    const discount = (subtotal * m.plan.shopDiscountPct) / 100;
    const taxable = subtotal - discount;
    const tax = taxable * 0.12;
    const total = taxable + tax;

    const order = await prisma.order.create({
      data: {
        orderNo: `ORD-SHOP-${seedTimestamp}-${1000 + o}`,
        memberId: m.id,
        channel: o % 3 === 0 ? 'ONLINE' : 'COUNTER',
        status: 'DELIVERED',
        fulfilment: 'PICKUP',
        subtotal,
        discount,
        tax,
        total,
        paymentStatus: 'PAID',
        paymentMode: o % 2 === 0 ? 'UPI' : 'CARD',
        createdAt: orderDate,
        items: {
          create: [
            {
              productId: prod.id,
              quantity: qty,
              unitPrice: prod.price,
              taxPct: 12,
              totalPrice: subtotal,
            },
          ],
        },
      },
    });

    await prisma.transaction.create({
      data: {
        transactionNo: `TXN-SHOP-${seedTimestamp}-${1000 + o}`,
        source: 'SHOP',
        amount: total,
        tax,
        paymentMode: o % 2 === 0 ? 'UPI' : 'CARD',
        reference: order.orderNo,
        orderId: order.id,
        memberId: m.id,
        date: orderDate,
        notes: `Pro Shop POS - ${prod.name} (${qty}x)`,
      },
    });
  }

  // ─── 7. CAFETERIA MENU & BAR ORDERS ───────────────────────────────────────
  console.log('7. Creating cafeteria menu, 8 tables, and 150+ bar orders...');
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

  // 8 Tables
  const createdTables = [];
  for (let i = 1; i <= 8; i++) {
    const table = await prisma.barTable.upsert({
      where: { number: `T${i}` },
      update: {},
      create: {
        number: `T${i}`,
        capacity: i <= 4 ? 4 : 8,
        status: i === 1 || i === 2 || i === 3 ? 'OCCUPIED' : 'AVAILABLE',
      },
    });
    createdTables.push(table);
  }

  // 150 Bar Orders across the past 30 days
  for (let bo = 1; bo <= 150; bo++) {
    const boDate = subDays(now, bo % 28);
    const m = createdMembers[bo % createdMembers.length];
    const item1 = createdMenuItems[bo % createdMenuItems.length];
    const item2 = createdMenuItems[(bo + 3) % createdMenuItems.length];
    const subtotal = Number(item1.price) + Number(item2.price);
    const discount = (subtotal * m.plan.barDiscountPct) / 100;
    const taxable = subtotal - discount;
    const tax = taxable * 0.05;
    const total = taxable + tax;

    const order = await prisma.order.create({
      data: {
        orderNo: `ORD-BAR-${seedTimestamp}-${1000 + bo}`,
        memberId: m.id,
        channel: 'BAR',
        barTableId: createdTables[bo % createdTables.length].id,
        status: 'COMPLETED',
        fulfilment: 'DINE_IN',
        subtotal,
        discount,
        tax,
        total,
        paymentStatus: 'PAID',
        paymentMode: bo % 2 === 0 ? 'UPI' : 'CASH',
        createdAt: boDate,
        items: {
          create: [
            {
              menuItemId: item1.id,
              quantity: 1,
              unitPrice: item1.price,
              taxPct: 5,
              totalPrice: item1.price,
            },
            {
              menuItemId: item2.id,
              quantity: 1,
              unitPrice: item2.price,
              taxPct: 5,
              totalPrice: item2.price,
            },
          ],
        },
      },
    });

    await prisma.transaction.create({
      data: {
        transactionNo: `TXN-BAR-${seedTimestamp}-${1000 + bo}`,
        source: 'BAR',
        amount: total,
        tax,
        paymentMode: bo % 2 === 0 ? 'UPI' : 'CASH',
        reference: order.orderNo,
        orderId: order.id,
        memberId: m.id,
        date: boDate,
        notes: `Bar & Lounge POS - ${item1.name} + ${item2.name}`,
      },
    });
  }

  // Open Running Bar Tabs
  for (let t = 0; t < 6; t++) {
    const tabMember = createdMembers[t];
    const tabTable = createdTables[t % createdTables.length];
    const runningTab = await prisma.barTab.create({
      data: {
        memberId: tabMember.id,
        status: 'OPEN',
        totalAmount: 420 + (t * 110),
      },
    });

    await prisma.order.create({
      data: {
        orderNo: `ORD-TAB-${seedTimestamp}-${t + 1}`,
        memberId: tabMember.id,
        channel: 'BAR',
        barTableId: tabTable.id,
        barTabId: runningTab.id,
        status: 'PREPARING',
        fulfilment: 'DINE_IN',
        subtotal: 420 + (t * 110),
        discount: 40,
        tax: 20,
        total: 400 + (t * 110),
        paymentStatus: 'PENDING',
        items: {
          create: [
            {
              menuItemId: createdMenuItems[0].id,
              quantity: 2,
              unitPrice: 90,
              taxPct: 5,
              totalPrice: 180,
            },
            {
              menuItemId: createdMenuItems[5].id,
              quantity: 1,
              unitPrice: 220,
              taxPct: 5,
              totalPrice: 220,
            },
          ],
        },
      },
    });
  }

  // ─── 8. TODAY'S LIVE OPERATIONS TRANSACTIONS ─────────────────────────────
  console.log('8. Injecting today live transactions for executive dashboard...');
  const todayLiveTransactions = [
    { src: 'COURT', amount: 1800, mode: 'UPI', notes: 'Morning Clay Tennis Court 1 & 2 Sessions' },
    { src: 'SHOP', amount: 4850, mode: 'CARD', notes: 'Wilson US Open Balls & Asics Tennis Shoes POS' },
    { src: 'BAR', amount: 3215, mode: 'UPI', notes: 'Post-Workout Protein Shakes & Panini Table Orders' },
    { src: 'MEMBERSHIP', amount: 15000, mode: 'UPI', notes: 'Annual Gold VIP Membership Subscription' },
    { src: 'COURT', amount: 1200, mode: 'CASH', notes: 'Evening Padel Court 1 Glass Court Booking' },
    { src: 'SHOP', amount: 2450, mode: 'UPI', notes: 'Yonex Astrox Shuttle Tubes & Tourna Grips' },
  ];

  for (let j = 0; j < todayLiveTransactions.length; j++) {
    const tt = todayLiveTransactions[j];
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

  // ─── 9. CORPORATE INVOICES & OPERATIONAL EXPENSES ─────────────────────────
  console.log('9. Creating B2B corporate league invoices and operating expenses...');
  const corporateClients = [
    { name: 'TechCorp India Pvt Ltd', gstin: '24AAACT1234F1Z5', email: 'sports@techcorp.com', amount: 45000, desc: 'Corporate Tennis & Padel Weekend League' },
    { name: 'Tata Consultancy Services Sports Club', gstin: '27AAATT5678G1Z2', email: 'wellness@tcs.com', amount: 60000, desc: 'TCS Inter-Division Badminton Tournament' },
    { name: 'Reliance Industries Recreational Club', gstin: '24AAACR9988H1Z1', email: 'club@ril.com', amount: 85000, desc: 'Annual Corporate Sports Day Ground & Turf Booking' },
    { name: 'Zomato Athlete Club', gstin: '07AAACZ1122K1Z9', email: 'events@zomato.com', amount: 35000, desc: 'Zomato Weekend Padel Cup Rental' },
    { name: 'HDFC Bank Sports Council', gstin: '27AAACH4455P1Z8', email: 'sports@hdfcbank.com', amount: 50000, desc: 'Quarterly Corporate Badminton Championship' },
  ];

  for (let ci = 0; ci < corporateClients.length; ci++) {
    const cc = corporateClients[ci];
    await prisma.invoice.create({
      data: {
        invoiceNo: `INV-CORP-2026-${seedTimestamp}-${ci + 1}`,
        companyName: cc.name,
        gstin: cc.gstin,
        clientEmail: cc.email,
        type: 'BUSINESS',
        amount: cc.amount,
        tax: cc.amount * 0.18,
        total: cc.amount * 1.18,
        dueDate: addDays(now, 10 + ci),
        status: ci < 3 ? 'PAID' : 'SENT',
        items: {
          create: [
            {
              description: cc.desc,
              quantity: 1,
              unitPrice: cc.amount,
              taxPct: 18,
              total: cc.amount * 1.18,
            },
          ],
        },
      },
    });
  }

  const operationalExpenses = [
    { no: 'EXP-001', vendor: 'Torrent Power Ltd', cat: 'UTILITIES', amount: 28500, status: 'PAID' },
    { no: 'EXP-002', vendor: 'Wilson Sports India Distributors', cat: 'INVENTORY', amount: 65000, status: 'PAID' },
    { no: 'EXP-003', vendor: 'Yonex India Distribution Logistics', cat: 'INVENTORY', amount: 48000, status: 'PAID' },
    { no: 'EXP-004', vendor: 'Green Valley Organic Farms', cat: 'CAFETERIA', amount: 22000, status: 'PAID' },
    { no: 'EXP-005', vendor: 'ProTurf Court Maintenance & Clay Dressing', cat: 'MAINTENANCE', amount: 18500, status: 'PAID' },
    { no: 'EXP-006', vendor: 'Airtel Enterprise Fiber Internet (1 Gbps)', cat: 'UTILITIES', amount: 4500, status: 'PAID' },
    { no: 'EXP-007', vendor: 'AquaPure Commercial Water Filter AMC', cat: 'MAINTENANCE', amount: 6200, status: 'PAID' },
    { no: 'EXP-008', vendor: 'CleanPro Facility Housekeeping Staffing', cat: 'MAINTENANCE', amount: 16000, status: 'PAID' },
  ];

  for (const exp of operationalExpenses) {
    await prisma.expense.create({
      data: {
        expenseNo: `EXP-${seedTimestamp}-${exp.no}`,
        vendor: exp.vendor,
        category: exp.cat,
        amount: exp.amount,
        dueDate: now,
        paidDate: now,
        status: exp.status,
        paymentMode: 'UPI',
        reference: `CHQ-${exp.no}`,
      },
    });
  }

  // ─── 10. CRM LEADS & SALES PIPELINE ───────────────────────────────────────
  console.log('10. Creating CRM leads across all Kanban sales stages...');
  const crmLeads = [
    { name: 'Aditya Birla Group Corp League', phone: '9811122233', email: 'aditya.corp@example.com', source: 'CORPORATE', stage: 'QUOTED' },
    { name: 'Tata Consultancy Sports Club', phone: '9822233344', email: 'tcs.sports@example.com', source: 'CORPORATE', stage: 'NEW' },
    { name: 'Karan Mehra', phone: '9833344455', email: 'karan.m@example.com', source: 'WEBSITE', stage: 'NEW' },
    { name: 'Shreya Ghoshal', phone: '9844455566', email: 'shreya.g@example.com', source: 'INSTAGRAM', stage: 'CONTACTED' },
    { name: 'Manish Malhotra', phone: '9855566677', email: 'manish.m@example.com', source: 'REFERRAL', stage: 'WON' },
    { name: 'Zomato Wellness League', phone: '9866677788', email: 'wellness@zomato.com', source: 'CORPORATE', stage: 'CONTACTED' },
    { name: 'Vijay Mallya', phone: '9877788899', email: 'vijay.m@example.com', source: 'WEBSITE', stage: 'LOST' },
    { name: 'Pooja Hegde', phone: '9888899900', email: 'pooja.h@example.com', source: 'INSTAGRAM', stage: 'CONTACTED' },
    { name: 'Infosys Badminton League', phone: '9899900011', email: 'sports@infosys.com', source: 'CORPORATE', stage: 'QUOTED' },
    { name: 'Wipro Corporate Cup', phone: '9800011122', email: 'wipro.cup@wipro.com', source: 'CORPORATE', stage: 'CONTACTED' },
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

  // ─── FINAL AUDIT & SUMMARY REPORT ─────────────────────────────────────────
  const userCount = await prisma.user.count();
  const memberCount = await prisma.member.count();
  const bookingCount = await prisma.booking.count();
  const txnCount = await prisma.transaction.count();
  const orderCount = await prisma.order.count();
  const invoiceCount = await prisma.invoice.count();
  const expenseCount = await prisma.expense.count();

  console.log('\n============================================================');
  console.log('🎉 550 USER MASTER ENTERPRISE DATASET SEEDED SUCCESSFULLY! 🎉');
  console.log('============================================================');
  console.log(`👤 Total Users in Database:     ${userCount}`);
  console.log(`🏅 Club Members:                ${memberCount}`);
  console.log(`🎾 Court Bookings:              ${bookingCount}`);
  console.log(`🛒 Shop & Bar Orders:           ${orderCount}`);
  console.log(`💳 Financial Transactions:      ${txnCount}`);
  console.log(`📄 Invoices Generated:          ${invoiceCount}`);
  console.log(`🧾 Operational Expenses:        ${expenseCount}`);
  console.log('------------------------------------------------------------');
  console.log('👑 Owner:      owner@bookmycourt.com      / Password@123');
  console.log('🏢 Front Desk: frontdesk@bookmycourt.com  / Password@123');
  console.log('🍸 Bar Staff:  bar@bookmycourt.com        / Password@123');
  console.log('👨‍🍳 Kitchen:    kitchen@bookmycourt.com    / Password@123');
  console.log('🛍️ Shop Staff: shop@bookmycourt.com       / Password@123');
  console.log('🎾 VIP Member: member@bookmycourt.com     / Password@123');
  console.log('============================================================\n');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
