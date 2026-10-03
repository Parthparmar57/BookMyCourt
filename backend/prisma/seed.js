import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addMonths } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with demo data...');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Users
  console.log('Creating role-based users...');
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@championsclub.com' },
    update: {},
    create: {
      name: 'Vikram Mehta (Owner)',
      email: 'owner@championsclub.com',
      phone: '9876543210',
      passwordHash,
      role: 'OWNER',
    },
  });

  const frontDeskUser = await prisma.user.upsert({
    where: { email: 'frontdesk@championsclub.com' },
    update: {},
    create: {
      name: 'Priya Sharma (Front Desk)',
      email: 'frontdesk@championsclub.com',
      phone: '9876543211',
      passwordHash,
      role: 'FRONT_DESK',
    },
  });

  const barUser = await prisma.user.upsert({
    where: { email: 'bar@championsclub.com' },
    update: {},
    create: {
      name: 'Rahul Verma (Bar Staff)',
      email: 'bar@championsclub.com',
      phone: '9876543212',
      passwordHash,
      role: 'BAR_STAFF',
    },
  });

  const kitchenUser = await prisma.user.upsert({
    where: { email: 'kitchen@championsclub.com' },
    update: {},
    create: {
      name: 'Chef Anthony (Kitchen)',
      email: 'kitchen@championsclub.com',
      phone: '9876543213',
      passwordHash,
      role: 'KITCHEN',
    },
  });

  const shopUser = await prisma.user.upsert({
    where: { email: 'shop@championsclub.com' },
    update: {},
    create: {
      name: 'Sunil Kumar (Shop Staff)',
      email: 'shop@championsclub.com',
      phone: '9876543214',
      passwordHash,
      role: 'SHOP_STAFF',
    },
  });

  const memberUser = await prisma.user.upsert({
    where: { email: 'member@championsclub.com' },
    update: {},
    create: {
      name: 'Rohan Gupta (Gold Member)',
      email: 'member@championsclub.com',
      phone: '9876543215',
      passwordHash,
      role: 'MEMBER',
    },
  });

  // 2. Employees
  console.log('Creating employee records...');
  await prisma.employee.upsert({
    where: { employeeNo: 'EMP-001' },
    update: {},
    create: {
      userId: frontDeskUser.id,
      employeeNo: 'EMP-001',
      designation: 'Head Receptionist',
      joiningDate: new Date('2024-01-15'),
      salary: 35000,
    },
  });

  await prisma.employee.upsert({
    where: { employeeNo: 'EMP-002' },
    update: {},
    create: {
      userId: barUser.id,
      employeeNo: 'EMP-002',
      designation: 'Bar & Cafe Supervisor',
      joiningDate: new Date('2024-02-01'),
      salary: 32000,
    },
  });

  await prisma.employee.upsert({
    where: { employeeNo: 'EMP-003' },
    update: {},
    create: {
      userId: kitchenUser.id,
      employeeNo: 'EMP-003',
      designation: 'Head Chef',
      joiningDate: new Date('2024-02-01'),
      salary: 40000,
    },
  });

  await prisma.employee.upsert({
    where: { employeeNo: 'EMP-004' },
    update: {},
    create: {
      userId: shopUser.id,
      employeeNo: 'EMP-004',
      designation: 'Pro Shop Manager',
      joiningDate: new Date('2024-03-01'),
      salary: 30000,
    },
  });

  // 3. Plans
  console.log('Creating membership plans...');
  const goldPlan = await prisma.plan.upsert({
    where: { name: 'Gold' },
    update: {},
    create: {
      name: 'Gold',
      price: 15000,
      durationMonths: 12,
      courtRate: 0, // Free courts
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

  // 4. Member Profile
  console.log('Creating member profile...');
  await prisma.member.upsert({
    where: { memberNo: 'MEM-001001' },
    update: {},
    create: {
      memberNo: 'MEM-001001',
      userId: memberUser.id,
      planId: goldPlan.id,
      dob: new Date('1995-06-15'),
      startDate: new Date(),
      endDate: addMonths(new Date(), goldPlan.durationMonths),
      status: 'ACTIVE',
      qrCode: 'data:image/png;base64,mockQrCode',
    },
  });

  // 5. Courts
  console.log('Creating courts...');
  const tennisCourt1 = await prisma.court.upsert({
    where: { name: 'Tennis Court 1' },
    update: {},
    create: {
      name: 'Tennis Court 1',
      sport: 'Tennis',
      walkInRate: 500,
      openTime: '06:00',
      closeTime: '23:00',
      isOpen: true,
    },
  });

  await prisma.court.upsert({
    where: { name: 'Tennis Court 2' },
    update: {},
    create: {
      name: 'Tennis Court 2',
      sport: 'Tennis',
      walkInRate: 500,
      openTime: '06:00',
      closeTime: '23:00',
      isOpen: true,
    },
  });

  await prisma.court.upsert({
    where: { name: 'Padel Court 1' },
    update: {},
    create: {
      name: 'Padel Court 1',
      sport: 'Padel',
      walkInRate: 600,
      openTime: '06:00',
      closeTime: '23:00',
      isOpen: true,
    },
  });

  await prisma.court.upsert({
    where: { name: 'Badminton Court 1' },
    update: {},
    create: {
      name: 'Badminton Court 1',
      sport: 'Badminton',
      walkInRate: 350,
      openTime: '06:00',
      closeTime: '23:00',
      isOpen: true,
    },
  });

  await prisma.court.upsert({
    where: { name: 'Cricket Practice Pitch' },
    update: {},
    create: {
      name: 'Cricket Practice Pitch',
      sport: 'Cricket',
      walkInRate: 800,
      openTime: '06:00',
      closeTime: '22:00',
      isOpen: true,
    },
  });

  // 6. Gear Shop Products
  console.log('Creating gear shop products...');
  await prisma.product.upsert({
    where: { sku: 'RACK-WIL-001' },
    update: {},
    create: {
      name: 'Wilson Pro Staff 97 Racket',
      category: 'RACKETS',
      sku: 'RACK-WIL-001',
      brand: 'Wilson',
      variant: 'Standard / 315g',
      price: 13999,
      taxPct: 18,
      stock: 12,
      reorderLevel: 3,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'BALL-DUN-003' },
    update: {},
    create: {
      name: 'Dunlop Fort All Court Tennis Balls (Can of 3)',
      category: 'BALLS',
      sku: 'BALL-DUN-003',
      brand: 'Dunlop',
      price: 450,
      taxPct: 18,
      stock: 45,
      reorderLevel: 10,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'SHOE-ASI-008' },
    update: {},
    create: {
      name: 'Asics Gel-Resolution 9 Clay Court Shoes',
      category: 'SHOES',
      sku: 'SHOE-ASI-008',
      brand: 'Asics',
      variant: 'UK 9 / Blue',
      price: 8999,
      taxPct: 18,
      stock: 8,
      reorderLevel: 2,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'ACC-YON-GRP' },
    update: {},
    create: {
      name: 'Yonex Super Grap Overgrip (Pack of 3)',
      category: 'ACCESSORIES',
      sku: 'ACC-YON-GRP',
      brand: 'Yonex',
      variant: 'White',
      price: 299,
      taxPct: 18,
      stock: 60,
      reorderLevel: 15,
    },
  });

  // 7. Bar Menu Items
  console.log('Creating bar & cafeteria menu items...');
  await prisma.menuItem.createMany({
    data: [
      { name: 'Protein Power Shake (Banana & Whey)', category: 'HEALTH_DRINKS', price: 180, taxPct: 5 },
      { name: 'Cold Brew Citrus Nitro', category: 'BEVERAGES', price: 140, taxPct: 5 },
      { name: 'Fresh Mint Lime Soda', category: 'BEVERAGES', price: 80, taxPct: 5 },
      { name: 'Grilled Chicken & Hummus Bowl', category: 'MEALS', price: 320, taxPct: 5 },
      { name: 'Multigrain Club Sandwich with Fries', category: 'SNACKS', price: 220, taxPct: 5 },
      { name: 'Dark Chocolate Energy Brownie', category: 'DESSERTS', price: 120, taxPct: 5 },
    ],
    skipDuplicates: true,
  });

  // 8. Bar Tables
  console.log('Creating bar tables...');
  await prisma.barTable.createMany({
    data: [
      { number: 'T-01', capacity: 4, status: 'AVAILABLE' },
      { number: 'T-02', capacity: 4, status: 'AVAILABLE' },
      { number: 'T-03', capacity: 6, status: 'AVAILABLE' },
      { number: 'T-04', capacity: 2, status: 'AVAILABLE' },
      { number: 'T-05', capacity: 8, status: 'AVAILABLE' },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeded successfully!');
  console.log('--- DEFAULT CREDENTIALS ---');
  console.log('Owner:      owner@championsclub.com / Password@123');
  console.log('Front Desk: frontdesk@championsclub.com / Password@123');
  console.log('Bar Staff:  bar@championsclub.com / Password@123');
  console.log('Kitchen:    kitchen@championsclub.com / Password@123');
  console.log('Shop Staff: shop@championsclub.com / Password@123');
  console.log('Member:     member@championsclub.com / Password@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
