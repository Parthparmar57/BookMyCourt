import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'vinu@gmail.com';
  const rawPassword = '123456789';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // 1. Find or create Gold Plan
  let goldPlan = await prisma.plan.findFirst({
    where: {
      name: { contains: 'Gold', mode: 'insensitive' },
    },
  });

  if (!goldPlan) {
    goldPlan = await prisma.plan.create({
      data: {
        name: 'Gold Membership',
        price: 9999.00,
        durationMonths: 12,
        courtRate: 0.00,
        freeSessions: 20,
        shopDiscountPct: 15,
        barDiscountPct: 15,
        maxBookingsDay: 4,
      },
    });
    console.log('Created Gold Plan:', goldPlan.id, goldPlan.name);
  } else {
    console.log('Found existing Gold Plan:', goldPlan.id, goldPlan.name);
  }

  // 2. Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    user = await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
        name: 'Vinu Kumar',
        role: 'MEMBER',
      },
    });
    console.log('Updated existing User:', user.id, user.email);
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Vinu Kumar',
        phone: '9876543299',
        passwordHash: hashedPassword,
        role: 'MEMBER',
      },
    });
    console.log('Created new User:', user.id, user.email);
  }

  // 3. Create or update Member record
  let member = await prisma.member.findUnique({
    where: { userId: user.id },
  });

  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  if (member) {
    member = await prisma.member.update({
      where: { id: member.id },
      data: {
        planId: goldPlan.id,
        status: 'ACTIVE',
        startDate: now,
        endDate: nextYear,
      },
    });
    console.log('Updated existing Member record:', member.id, member.memberNo);
  } else {
    const memberCount = await prisma.member.count();
    const memberNo = `MEM-GOLD-${String(memberCount + 101).padStart(4, '0')}`;
    
    member = await prisma.member.create({
      data: {
        userId: user.id,
        planId: goldPlan.id,
        memberNo,
        dob: new Date('1996-08-15'),
        emergencyContact: '9876543210',
        status: 'ACTIVE',
        startDate: now,
        endDate: nextYear,
        qrCode: `DATA-QR-${memberNo}`,
      },
    });
    console.log('Created new Member record:', member.id, member.memberNo);
  }

  console.log('SUCCESSFULLY CREATED GOLD MEMBER!');
  console.log('---------------------------------');
  console.log('Email:', email);
  console.log('Password:', rawPassword);
  console.log('Plan:', goldPlan.name);
  console.log('Member No:', member.memberNo);
  console.log('Status:', member.status);
}

main()
  .catch((e) => {
    console.error('Error creating member:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
