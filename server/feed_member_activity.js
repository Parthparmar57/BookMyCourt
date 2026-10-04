import { PrismaClient } from '@prisma/client';
import { addDays, subDays, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

const genId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

async function main() {
  console.log('🚀 Starting Member Activity & Dashboard Statistics Feed...');

  // 1. Load context
  const members = await prisma.member.findMany({
    orderBy: { memberNo: 'asc' },
    include: { user: true, plan: true, tabs: true },
  });
  console.log(`Found ${members.length} members in the database.`);

  const courts = await prisma.court.findMany({ where: { isOpen: true } });
  const products = await prisma.product.findMany();
  const menuItems = await prisma.menuItem.findMany();
  const frontDeskUser = await prisma.user.findFirst({
    where: { role: { in: ['FRONT_DESK', 'OWNER'] } },
  });

  if (!frontDeskUser) {
    throw new Error('Front desk or owner user required for booking createdById.');
  }

  const now = new Date();
  const todayStart = startOfDay(now);

  // Clean up any previously created feed activity if re-run
  console.log('Cleaning up previous feed activity if present...');
  await prisma.transaction.deleteMany({ where: { notes: { startsWith: 'FEED_ACT_' } } });
  await prisma.orderItem.deleteMany({
    where: { order: { notes: { startsWith: 'FEED_ACT_' } } },
  });
  await prisma.order.deleteMany({ where: { notes: { startsWith: 'FEED_ACT_' } } });
  await prisma.booking.deleteMany({ where: { cancelReason: 'FEED_ACT_BOOKING' } });

  // ─── 2. DYNAMIC BAR TABS & F&B ACTIVITY ─────────────────────────────────────
  console.log('Generating dynamic Bar Tab balances across members...');
  let totalActiveTabs = 0;
  let totalOpenAmount = 0;

  const tabAmountsGold = [650, 850, 1200, 1450, 1850, 2200, 2650, 3200, 3850];
  const tabAmountsSilver = [350, 480, 620, 850, 1150, 1400, 1750];
  const tabAmountsJunior = [180, 240, 320, 420, 480];

  const paymentModes = ['UPI', 'CARD', 'ONLINE', 'CASH'];

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const isGold = /gold/i.test(member.plan?.name || '');
    const isJunior = /junior/i.test(member.plan?.name || '');

    const existingOpenTab = await prisma.barTab.findFirst({
      where: { memberId: member.id, status: 'OPEN' },
    });

    // ~66% of members get an OPEN bar tab with dynamic realistic balances
    if (i % 3 !== 0) {
      let chosenAmount = 450;
      if (isGold) {
        chosenAmount = tabAmountsGold[i % tabAmountsGold.length];
      } else if (isJunior) {
        chosenAmount = tabAmountsJunior[i % tabAmountsJunior.length];
      } else {
        chosenAmount = tabAmountsSilver[i % tabAmountsSilver.length];
      }

      const openedAt = subDays(now, i % 4);
      let tab;

      if (existingOpenTab) {
        tab = await prisma.barTab.update({
          where: { id: existingOpenTab.id },
          data: {
            totalAmount: chosenAmount,
            notes: 'FEED_ACT_TAB',
          },
        });
      } else {
        tab = await prisma.barTab.create({
          data: {
            memberId: member.id,
            status: 'OPEN',
            openedAt,
            totalAmount: chosenAmount,
            notes: 'FEED_ACT_TAB',
          },
        });
      }

      // Create linked café/bar order
      const orderDate = openedAt;
      const order = await prisma.order.create({
        data: {
          orderNo: `ORD-BAR-${member.memberNo}-${Date.now().toString(36)}-${i}`,
          memberId: member.id,
          barTabId: tab.id,
          channel: 'BAR',
          status: 'COMPLETED',
          fulfilment: 'DINE_IN',
          subtotal: chosenAmount,
          tax: 0,
          total: chosenAmount,
          paymentStatus: 'PENDING',
          notes: 'FEED_ACT_BAR_ORDER',
          createdAt: orderDate,
          updatedAt: orderDate,
        },
      });

      // Add 1 or 2 menu items
      if (menuItems.length > 0) {
        const item1 = menuItems[i % menuItems.length];
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: item1.id,
            quantity: 1,
            unitPrice: chosenAmount,
            taxPct: 0,
            totalPrice: chosenAmount,
          },
        });
      }

      totalActiveTabs++;
      totalOpenAmount += chosenAmount;
    } else {
      // 33% have zero / settled balance
      if (existingOpenTab) {
        await prisma.barTab.update({
          where: { id: existingOpenTab.id },
          data: {
            totalAmount: 0,
            status: 'SETTLED',
            settledAt: now,
            notes: 'FEED_ACT_ZERO_TAB',
          },
        });
      }
    }

    // For ~100 members, create a transaction for bar purchases to boost Bar Revenue in Dashboard
    if (i % 5 === 0) {
      const settledAmount = isGold ? 1200 : isJunior ? 350 : 750;
      const daysAgo = 1 + (i % 25);
      const settledDate = subDays(now, daysAgo);

      const pastOrder = await prisma.order.create({
        data: {
          orderNo: `ORD-BAR-HIST-${member.memberNo}-${Date.now().toString(36)}-${i}`,
          memberId: member.id,
          channel: 'BAR',
          status: 'COMPLETED',
          fulfilment: 'DINE_IN',
          subtotal: settledAmount,
          tax: 0,
          total: settledAmount,
          paymentMode: paymentModes[i % paymentModes.length],
          paymentStatus: 'PAID',
          notes: 'FEED_ACT_SETTLED_ORDER',
          createdAt: settledDate,
          updatedAt: settledDate,
        },
      });

      await prisma.transaction.create({
        data: {
          transactionNo: genId('TXN-BAR'),
          date: settledDate,
          source: 'BAR',
          amount: settledAmount,
          tax: 0,
          paymentMode: paymentModes[i % paymentModes.length],
          orderId: pastOrder.id,
          memberId: member.id,
          notes: 'FEED_ACT_BAR_TXN',
        },
      });
    }
  }

  console.log(`✅ Configured ${totalActiveTabs} active Bar Tabs totaling ₹${totalOpenAmount.toLocaleString('en-IN')}!`);

  // ─── 3. COURT BOOKINGS (Today, This Week, This Month) ─────────────────────
  console.log('Generating court bookings across today, this week, and this month...');
  let totalBookings = 0;
  const slotHours = [6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 20, 21];
  let memberCursor = 0;

  // A. Today (Day 0) — High activity for Daily Dashboard
  for (let cIdx = 0; cIdx < courts.length; cIdx++) {
    const court = courts[cIdx];
    for (let sIdx = 0; sIdx < 6; sIdx++) {
      const hour = slotHours[sIdx * 2]; // 6, 8, 10, 16, 18, 20
      const slotStart = new Date(todayStart);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(todayStart);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check slot availability before creating to avoid any GiST constraint conflict
      const conflict = await prisma.booking.findFirst({
        where: {
          courtId: court.id,
          startTime: { lt: slotEnd },
          endTime: { gt: slotStart },
          status: { not: 'CANCELLED' },
        },
      });
      if (conflict) continue;

      const member = members[memberCursor % members.length];
      memberCursor++;

      const isGold = /gold/i.test(member.plan?.name || '');
      const courtRate = isGold ? 0 : Number(court.walkInRate || 600) * 0.5;

      const booking = await prisma.booking.create({
        data: {
          courtId: court.id,
          memberId: member.id,
          startTime: slotStart,
          endTime: slotEnd,
          type: 'NORMAL',
          status: 'CONFIRMED',
          price: courtRate,
          maxPlayers: 4,
          createdById: frontDeskUser.id,
          cancelReason: 'FEED_ACT_BOOKING',
          createdAt: subDays(slotStart, 1),
          updatedAt: subDays(slotStart, 1),
        },
      });

      if (courtRate > 0) {
        await prisma.transaction.create({
          data: {
            transactionNo: genId('TXN-CRT-TODAY'),
            date: slotStart,
            source: 'COURT',
            amount: courtRate,
            tax: 0,
            paymentMode: paymentModes[memberCursor % paymentModes.length],
            bookingId: booking.id,
            memberId: member.id,
            notes: 'FEED_ACT_COURT_TXN',
          },
        });
      }
      totalBookings++;
    }
  }

  // B. This Week (Days -1 to -6) — ~100 to 140 bookings
  for (let dayOffset = 1; dayOffset <= 6; dayOffset++) {
    const dayDate = subDays(todayStart, dayOffset);
    for (let cIdx = 0; cIdx < courts.length; cIdx++) {
      const court = courts[cIdx];
      for (let sIdx = 0; sIdx < 4; sIdx++) {
        const hour = slotHours[(sIdx * 3 + dayOffset) % slotHours.length];
        const slotStart = new Date(dayDate);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(dayDate);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        const conflict = await prisma.booking.findFirst({
          where: {
            courtId: court.id,
            startTime: { lt: slotEnd },
            endTime: { gt: slotStart },
            status: { not: 'CANCELLED' },
          },
        });
        if (conflict) continue;

        const member = members[memberCursor % members.length];
        memberCursor++;

        const isGold = /gold/i.test(member.plan?.name || '');
        const courtRate = isGold ? 0 : Number(court.walkInRate || 600) * 0.5;

        const booking = await prisma.booking.create({
          data: {
            courtId: court.id,
            memberId: member.id,
            startTime: slotStart,
            endTime: slotEnd,
            type: 'NORMAL',
            status: 'CONFIRMED',
            price: courtRate,
            maxPlayers: 4,
            createdById: frontDeskUser.id,
            cancelReason: 'FEED_ACT_BOOKING',
            createdAt: subDays(slotStart, 1),
            updatedAt: subDays(slotStart, 1),
          },
        });

        if (courtRate > 0) {
          await prisma.transaction.create({
            data: {
              transactionNo: genId('TXN-CRT-WEEK'),
              date: slotStart,
              source: 'COURT',
              amount: courtRate,
              tax: 0,
              paymentMode: paymentModes[memberCursor % paymentModes.length],
              bookingId: booking.id,
              memberId: member.id,
              notes: 'FEED_ACT_COURT_TXN',
            },
          });
        }
        totalBookings++;
      }
    }
  }

  // C. This Month (Days -7 to -28) — ~200 to 250 bookings
  for (let dayOffset = 7; dayOffset <= 28; dayOffset += 2) {
    const dayDate = subDays(todayStart, dayOffset);
    for (let cIdx = 0; cIdx < courts.length; cIdx++) {
      const court = courts[cIdx];
      for (let sIdx = 0; sIdx < 3; sIdx++) {
        const hour = slotHours[(sIdx * 4 + dayOffset) % slotHours.length];
        const slotStart = new Date(dayDate);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(dayDate);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        const conflict = await prisma.booking.findFirst({
          where: {
            courtId: court.id,
            startTime: { lt: slotEnd },
            endTime: { gt: slotStart },
            status: { not: 'CANCELLED' },
          },
        });
        if (conflict) continue;

        const member = members[memberCursor % members.length];
        memberCursor++;

        const isGold = /gold/i.test(member.plan?.name || '');
        const courtRate = isGold ? 0 : Number(court.walkInRate || 600) * 0.5;

        const booking = await prisma.booking.create({
          data: {
            courtId: court.id,
            memberId: member.id,
            startTime: slotStart,
            endTime: slotEnd,
            type: 'NORMAL',
            status: 'CONFIRMED',
            price: courtRate,
            maxPlayers: 4,
            createdById: frontDeskUser.id,
            cancelReason: 'FEED_ACT_BOOKING',
            createdAt: subDays(slotStart, 1),
            updatedAt: subDays(slotStart, 1),
          },
        });

        if (courtRate > 0) {
          await prisma.transaction.create({
            data: {
              transactionNo: genId('TXN-CRT-MONTH'),
              date: slotStart,
              source: 'COURT',
              amount: courtRate,
              tax: 0,
              paymentMode: paymentModes[memberCursor % paymentModes.length],
              bookingId: booking.id,
              memberId: member.id,
              notes: 'FEED_ACT_COURT_TXN',
            },
          });
        }
        totalBookings++;
      }
    }
  }

  console.log(`✅ Generated ${totalBookings} court bookings cleanly distributed across today, week, and month!`);

  // ─── 4. PRO SHOP PURCHASES (Today, This Week, This Month) ───────────────────
  console.log('Generating pro shop purchases...');
  let totalShopOrders = 0;

  if (products.length > 0) {
    // 12 shop orders for today
    for (let i = 0; i < 12; i++) {
      const member = members[(i * 13) % members.length];
      const prod = products[i % products.length];
      const qty = 1 + (i % 2);
      const total = Number(prod.sellingPrice || 450) * qty;

      const order = await prisma.order.create({
        data: {
          orderNo: genId('ORD-SHP-TODAY'),
          memberId: member.id,
          channel: 'COUNTER',
          status: 'COMPLETED',
          fulfilment: 'PICKUP',
          subtotal: total,
          tax: 0,
          total,
          paymentMode: paymentModes[i % paymentModes.length],
          paymentStatus: 'PAID',
          notes: 'FEED_ACT_SHOP_ORDER',
          createdAt: now,
          updatedAt: now,
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: prod.id,
          quantity: qty,
          unitPrice: prod.sellingPrice || 450,
          taxPct: 0,
          totalPrice: total,
        },
      });

      await prisma.transaction.create({
        data: {
          transactionNo: genId('TXN-SHP-TODAY'),
          date: now,
          source: 'SHOP',
          amount: total,
          tax: 0,
          paymentMode: paymentModes[i % paymentModes.length],
          orderId: order.id,
          memberId: member.id,
          notes: 'FEED_ACT_SHOP_TXN',
        },
      });
      totalShopOrders++;
    }

    // 40 shop orders across this week
    for (let i = 0; i < 40; i++) {
      const member = members[(i * 17) % members.length];
      const prod = products[i % products.length];
      const qty = 1 + (i % 3);
      const total = Number(prod.sellingPrice || 450) * qty;
      const orderDate = subDays(now, 1 + (i % 6));

      const order = await prisma.order.create({
        data: {
          orderNo: genId('ORD-SHP-WEEK'),
          memberId: member.id,
          channel: 'COUNTER',
          status: 'COMPLETED',
          fulfilment: 'PICKUP',
          subtotal: total,
          tax: 0,
          total,
          paymentMode: paymentModes[i % paymentModes.length],
          paymentStatus: 'PAID',
          notes: 'FEED_ACT_SHOP_ORDER',
          createdAt: orderDate,
          updatedAt: orderDate,
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: prod.id,
          quantity: qty,
          unitPrice: prod.sellingPrice || 450,
          taxPct: 0,
          totalPrice: total,
        },
      });

      await prisma.transaction.create({
        data: {
          transactionNo: genId('TXN-SHP-WEEK'),
          date: orderDate,
          source: 'SHOP',
          amount: total,
          tax: 0,
          paymentMode: paymentModes[i % paymentModes.length],
          orderId: order.id,
          memberId: member.id,
          notes: 'FEED_ACT_SHOP_TXN',
        },
      });
      totalShopOrders++;
    }

    // 80 shop orders across this month
    for (let i = 0; i < 80; i++) {
      const member = members[(i * 19) % members.length];
      const prod = products[i % products.length];
      const qty = 1 + (i % 2);
      const total = Number(prod.sellingPrice || 450) * qty;
      const orderDate = subDays(now, 7 + (i % 21));

      const order = await prisma.order.create({
        data: {
          orderNo: genId('ORD-SHP-MONTH'),
          memberId: member.id,
          channel: 'COUNTER',
          status: 'COMPLETED',
          fulfilment: 'PICKUP',
          subtotal: total,
          tax: 0,
          total,
          paymentMode: paymentModes[i % paymentModes.length],
          paymentStatus: 'PAID',
          notes: 'FEED_ACT_SHOP_ORDER',
          createdAt: orderDate,
          updatedAt: orderDate,
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: prod.id,
          quantity: qty,
          unitPrice: prod.sellingPrice || 450,
          taxPct: 0,
          totalPrice: total,
        },
      });

      await prisma.transaction.create({
        data: {
          transactionNo: genId('TXN-SHP-MONTH'),
          date: orderDate,
          source: 'SHOP',
          amount: total,
          tax: 0,
          paymentMode: paymentModes[i % paymentModes.length],
          orderId: order.id,
          memberId: member.id,
          notes: 'FEED_ACT_SHOP_TXN',
        },
      });
      totalShopOrders++;
    }
  }

  console.log(`✅ Generated ${totalShopOrders} Pro Shop orders and ledger transactions!`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 MEMBER ACTIVITY & DASHBOARD DATA FEED COMPLETED!');
  console.log(`• Members updated: ${members.length} members (Gold, Silver, Junior, Expired)`);
  console.log(`• Active Bar Tabs: ${totalActiveTabs} tabs (total ₹${totalOpenAmount.toLocaleString('en-IN')})`);
  console.log(`• Court Bookings: ${totalBookings} sessions across today, week, and month`);
  console.log(`• Pro Shop Orders: ${totalShopOrders} transactions`);
  console.log('• Daily, Weekly & Monthly Dashboard metrics fully synchronized.');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('Feed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
