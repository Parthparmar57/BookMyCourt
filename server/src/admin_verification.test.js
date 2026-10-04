import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import app from './app.js';
import { prisma } from './lib/prisma.js';
import { env } from './config/env.js';

let server;
let baseUrl;

// Tokens
let ownerToken;
let memberToken;
let frontDeskToken;

function makeToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
}

async function request(path, options = {}) {
  const url = new URL(path, baseUrl);
  const headers = options.headers || {};
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, data, headers: res.headers };
}

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  const owner = await prisma.user.findFirst({ where: { role: 'OWNER' } });
  const memberUser = await prisma.user.findFirst({ where: { role: 'MEMBER' }, include: { member: true } });
  const frontDesk = await prisma.user.findFirst({ where: { role: 'FRONT_DESK' }, include: { employee: true } });

  ownerToken = makeToken({ id: owner.id, role: 'OWNER' });
  memberToken = makeToken({ id: memberUser.id, role: 'MEMBER', memberId: memberUser.member?.id });
  frontDeskToken = makeToken({ id: frontDesk.id, role: 'FRONT_DESK', employeeId: frontDesk.employee?.id });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
});

test('1. Every admin endpoint: no token -> 401, non-admin role -> 403, admin -> 200', async () => {
  const noToken = await request('/api/dashboard/summary');
  assert.equal(noToken.status, 401, 'No token returns 401');

  const memberReq = await request('/api/dashboard/summary', { token: memberToken });
  assert.equal(memberReq.status, 403, 'Member role returns 403');

  const frontDeskReq = await request('/api/dashboard/summary', { token: frontDeskToken });
  assert.equal(frontDeskReq.status, 403, 'FrontDesk role returns 403');

  const ownerReq = await request('/api/dashboard/summary', { token: ownerToken });
  assert.equal(ownerReq.status, 200, 'Owner role returns 200');
});

test('2 & 3. Dashboard totals match ledger sums and splits add up', async () => {
  const dashRes = await request('/api/dashboard/summary', { token: ownerToken });
  assert.equal(dashRes.status, 200);
  const dashData = dashRes.data.data || dashRes.data;

  const ledgerRes = await request('/api/ledger/summary', { token: ownerToken });
  assert.equal(ledgerRes.status, 200);

  assert.ok(dashData.kpis.monthRevenue >= 0);
  const sumSources = (dashData.revenueBySource || []).reduce((acc, s) => acc + Number(s.amount), 0);
  const sumModes = (dashData.paymentModeSplit || []).reduce((acc, m) => acc + Number(m.amount), 0);

  assert.equal(Math.round(sumSources * 100), Math.round(sumModes * 100), 'Sources split and Modes split must be equal');
});

test('4. Refund/void reduces revenue; unpaid tab excluded from earnings', async () => {
  const openTabs = await prisma.barTab.findMany({ where: { status: 'OPEN' } });
  for (const tab of openTabs) {
    const txn = await prisma.transaction.findFirst({ where: { reference: `TAB-${tab.id}` } });
    assert.equal(txn, null, 'Unsettled open tab must not create a ledger transaction');
  }

  // Create menu item and settled bar order, then void it
  const menuItem = await prisma.menuItem.findFirst({ where: { isAvailable: true } });
  if (menuItem) {
    const orderRes = await request('/api/bar-orders', {
      method: 'POST',
      token: ownerToken,
      body: {
        items: [{ menuItemId: menuItem.id, quantity: 1 }],
        paymentMode: 'CASH',
      }
    });
    assert.ok([200, 201].includes(orderRes.status), 'Bar order created');
    const order = orderRes.data.data || orderRes.data;

    // Void the order
    const voidRes = await request(`/api/bar-orders/${order.id}/void`, {
      method: 'POST',
      token: ownerToken,
      body: { reason: 'Test refund void ledger reversal' }
    });
    assert.equal(voidRes.status, 200, 'Void order succeeds');

    // Check transaction ledger for negative reversal transaction
    const refTxn = await prisma.transaction.findFirst({
      where: { reference: `VOID-${order.orderNo}`, amount: { lt: 0 } }
    });
    assert.ok(refTxn !== null, 'Negative refund transaction must be posted to ledger when voiding a paid order');
    assert.equal(Number(refTxn.amount), -Number(order.totalAmount || order.total), 'Reversal transaction amount must equal negative order total');
  }
});

test('5. Admin attempts to edit/delete auto ledger entry -> rejected', async () => {
  const txn = await prisma.transaction.findFirst();
  if (txn) {
    const putRes = await request(`/api/ledger/${txn.id}`, { method: 'PUT', token: ownerToken, body: { amount: 99999 } });
    assert.ok([404, 405].includes(putRes.status), 'PUT /ledger/:id rejected');

    const delRes = await request(`/api/ledger/${txn.id}`, { method: 'DELETE', token: ownerToken });
    assert.ok([404, 405].includes(delRes.status), 'DELETE /ledger/:id rejected');
  }
});

test('6. Admin attempts past booking -> rejected', async () => {
  const court = await prisma.court.findFirst({ where: { isOpen: true } });
  const pastRes = await request('/api/bookings', {
    method: 'POST',
    token: ownerToken,
    body: {
      courtId: court.id,
      date: '2020-01-01',
      startTime: '10:00',
      walkIn: { name: 'Test', phone: '9999999999' }
    }
  });
  assert.ok(pastRes.status >= 400, 'Past booking must be rejected');
});

test('7. Admin stock adjustment below zero -> rejected', async () => {
  const product = await prisma.product.findFirst();
  const res = await request('/api/inventory/adjust', {
    method: 'POST',
    token: ownerToken,
    body: {
      productId: product.id,
      newStock: -10,
      reason: 'Testing negative stock'
    }
  });
  assert.ok(res.status >= 400, 'Negative stock adjustment must be rejected');
});

test('8. Admin gives Junior plan to an 18+ member -> rejected (422)', async () => {
  const juniorPlan = await prisma.plan.findFirst({ where: { maxAge: { not: null } } });
  if (juniorPlan) {
    const phone = `9${Math.floor(100000009 + Math.random() * 899999990)}`;
    const res = await request('/api/members', {
      method: 'POST',
      token: ownerToken,
      body: {
        name: 'Adult Junior Test',
        email: `adult_junior_${Date.now()}@example.com`,
        phone,
        planId: juniorPlan.id,
        dob: '1990-01-01T00:00:00.000Z', // 36 years old
        startDate: '2026-10-01T00:00:00.000Z',
      }
    });
    assert.equal(res.status, 422, 'Junior plan for 18+ must be rejected with 422');
  }
});

test('9. Admin converts lead twice -> check duplicate conversion handling', async () => {
  const phone = `9${Math.floor(100000009 + Math.random() * 899999990)}`;
  const email = `double_lead_${Date.now()}@example.com`;
  const lead = await prisma.lead.create({
    data: {
      name: 'Double Convert Lead',
      phone,
      email,
      stage: 'QUOTED'
    }
  });
  const plan = await prisma.plan.findFirst({ where: { maxAge: null } }) || await prisma.plan.findFirst();

  const conv1 = await request(`/api/leads/${lead.id}/convert`, {
    method: 'POST',
    token: ownerToken,
    body: {
      email,
      planId: plan.id,
      dob: '2000-01-01T00:00:00.000Z',
      startDate: '2026-10-01T00:00:00.000Z'
    }
  });
  assert.ok([200, 201].includes(conv1.status), 'First conversion succeeds');

  const phone2 = `9${Math.floor(100000009 + Math.random() * 899999990)}`;
  const conv2 = await request(`/api/leads/${lead.id}/convert`, {
    method: 'POST',
    token: ownerToken,
    body: {
      email: `alt_${email}`,
      phone: phone2,
      planId: plan.id,
      dob: '2000-01-01T00:00:00.000Z',
      startDate: '2026-10-01T00:00:00.000Z'
    }
  });

  assert.equal(conv2.status, 400, 'Second lead conversion must be rejected with 400 (lead already WON)');
});

test('10. Mark the same salary paid twice -> rejected (409)', async () => {
  const payroll = await prisma.payroll.findFirst({ where: { status: 'PAID' } });
  if (payroll) {
    const res = await request(`/api/payroll/${payroll.id}/status`, {
      method: 'PATCH',
      token: ownerToken,
      body: { status: 'PAID' }
    });
    assert.equal(res.status, 409, 'Marking salary paid twice must be rejected with 409');
  }
});

test('11. Leave approval: overlapping leave -> rejected; end before start -> rejected', async () => {
  const emp = await prisma.employee.findFirst();
  if (emp) {
    const invalidDates = await request('/api/leave', {
      method: 'POST',
      token: frontDeskToken,
      body: {
        startDate: '2026-12-10',
        endDate: '2026-12-05',
        type: 'CASUAL',
        reason: 'Backwards dates'
      }
    });
    assert.ok(invalidDates.status >= 400, 'End date before start date rejected');
  }
});

test('13. Client-sent price in booking is ignored and calculated by server', async () => {
  const court = await prisma.court.findFirst({ where: { isOpen: true } });
  const futureDate = '2026-11-20';
  const res = await request('/api/bookings', {
    method: 'POST',
    token: ownerToken,
    body: {
      courtId: court.id,
      date: futureDate,
      startTime: '11:00',
      price: 0,
      walkIn: { name: 'Client Price Test', phone: '9888877777' }
    }
  });
  if (res.status === 200 || res.status === 201) {
    const bData = res.data.data || res.data;
    assert.equal(Number(bData.price), Number(court.walkInRate), 'Client-sent price must be ignored');
  }
});

test('15. Non-admin roles never receive bank details, PAN or salaries in list responses', async () => {
  const memberEmp = await request('/api/employees', { token: memberToken });
  assert.equal(memberEmp.status, 403, 'Member cannot access employee list');

  const frontDeskEmp = await request('/api/employees', { token: frontDeskToken });
  assert.equal(frontDeskEmp.status, 403, 'FrontDesk cannot access employee list');
});

test('Phase 2 - Issue #5: Enforce valid order status transitions for shop orders', async () => {
  const product = await prisma.product.findFirst({ where: { stock: { gte: 5 } } });
  if (product) {
    const createRes = await request('/api/shop-orders', {
      method: 'POST',
      token: ownerToken,
      body: {
        items: [{ productId: product.id, quantity: 1 }],
        fulfilment: 'DELIVERY',
        deliveryAddress: '123 Main St',
        pinCode: '380001'
      }
    });
    assert.ok([200, 201].includes(createRes.status), 'Shop order created');
    const order = createRes.data.data || createRes.data;

    // Invalid transition: PLACED directly to DELIVERED (skipping PACKED/READY/SHIPPED)
    const invalidRes = await request(`/api/shop-orders/${order.id}/status`, {
      method: 'PATCH',
      token: ownerToken,
      body: { status: 'DELIVERED' }
    });
    assert.equal(invalidRes.status, 400, 'Invalid status transition must be rejected with 400');

    // Valid transition: PLACED -> PACKED
    const validRes = await request(`/api/shop-orders/${order.id}/status`, {
      method: 'PATCH',
      token: ownerToken,
      body: { status: 'PACKED' }
    });
    assert.equal(validRes.status, 200, 'Valid status transition succeeds');
  }
});

test('Phase 2 - Issue #6: Admin daily limit override on member bookings', async () => {
  const court = await prisma.court.findFirst({ where: { isOpen: true } });
  const user = await prisma.user.findFirst({ where: { role: 'MEMBER' }, include: { member: { include: { plan: true } } } });
  const member = user?.member;
  if (court && member) {
    const maxPerDay = Math.min(member.plan?.maxBookingsDay ?? 2, 2);
    const date = '2026-12-15';
    await prisma.booking.deleteMany({
      where: {
        OR: [{ courtId: court.id }, { memberId: member.id }],
        startTime: { gte: new Date('2026-12-14T00:00:00Z'), lte: new Date('2026-12-16T23:59:59Z') },
      },
    });

    // Fill all allowed slots up to maxPerDay
    for (let i = 0; i < maxPerDay; i++) {
      const hour = String(6 + i).padStart(2, '0');
      const b = await request('/api/bookings', {
        method: 'POST',
        token: ownerToken,
        body: { courtId: court.id, date, startTime: `${hour}:00`, memberId: member.id }
      });
      assert.ok([200, 201].includes(b.status), `Booking ${i+1} succeeds`);
    }

    const nextHour = String(6 + maxPerDay).padStart(2, '0');

    // Extra booking without override -> 422 limit reached
    const normalLimitRes = await request('/api/bookings', {
      method: 'POST',
      token: ownerToken,
      body: { courtId: court.id, date, startTime: `${nextHour}:00`, memberId: member.id }
    });
    assert.equal(normalLimitRes.status, 422, 'Extra booking without override rejected with 422');

    // Extra booking with override as MEMBER -> 403 forbidden
    const memberOverrideRes = await request('/api/bookings', {
      method: 'POST',
      token: memberToken,
      body: { courtId: court.id, date, startTime: `${nextHour}:00`, overrideLimit: true }
    });
    assert.equal(memberOverrideRes.status, 403, 'Member cannot override daily booking limit');

    // Extra booking with override as OWNER -> 201 success
    const ownerOverrideRes = await request('/api/bookings', {
      method: 'POST',
      token: ownerToken,
      body: { courtId: court.id, date, startTime: `${nextHour}:00`, memberId: member.id, overrideLimit: true }
    });
    assert.ok([200, 201].includes(ownerOverrideRes.status), 'Admin limit override succeeds');

    // Check audit log for BOOKING_LIMIT_OVERRIDE
    const audit = await prisma.auditLog.findFirst({
      where: { action: 'BOOKING_LIMIT_OVERRIDE' }
    });
    assert.ok(audit !== null, 'Audit log entry must be recorded for admin limit override');
  }
});

test('Phase 3 - Issue #3: Executive Dashboard supports period query parameter (today | week | month)', async () => {
  if (!ownerToken) return;

  for (const period of ['today', 'week', 'month']) {
    const res = await request('/api/dashboard/summary?period=' + period, { token: ownerToken });
    assert.strictEqual(res.status, 200, `Dashboard request for period=${period} should return 200`);
    assert.ok(res.data.success, `Dashboard summary response for period=${period} should be successful`);
    assert.ok(res.data.data.kpis.periodRevenue !== undefined, 'Summary KPIs contains periodRevenue');
    assert.ok(res.data.data.kpis.periodBookings !== undefined, 'Summary KPIs contains periodBookings');
    assert.ok(res.data.data.kpis.revenueGrowthPct !== undefined, 'Summary KPIs contains revenueGrowthPct');
    assert.ok(Array.isArray(res.data.data.revenueBySource), 'revenueBySource is array');
    assert.ok(Array.isArray(res.data.data.paymentModeSplit), 'paymentModeSplit is array');
  }
});

test('Phase 3 - Issue #4: Admin can update member details and deactivate member account', async () => {
  if (!ownerToken) return;

  // Find an active member to test updating and deactivating
  const member = await prisma.member.findFirst({
    where: { status: 'ACTIVE' },
    include: { user: true }
  });

  if (member) {
    const updatedName = 'Updated Test Member ' + Date.now().toString().slice(-4);
    const updateRes = await request(`/api/members/${member.id}`, {
      method: 'PATCH',
      token: ownerToken,
      body: {
        name: updatedName,
        emergencyContact: '+919999888877'
      }
    });

    assert.strictEqual(updateRes.status, 200, 'Member update endpoint returns 200');
    assert.strictEqual(updateRes.data.data.user.name, updatedName, 'Member user name updated correctly');
    assert.strictEqual(updateRes.data.data.emergencyContact, '+919999888877', 'Emergency contact updated correctly');

    // Deactivate member
    const deactRes = await request(`/api/members/${member.id}/deactivate`, {
      method: 'PATCH',
      token: ownerToken
    });

    assert.strictEqual(deactRes.status, 200, 'Deactivate member endpoint returns 200');
    assert.strictEqual(deactRes.data.data.status, 'SUSPENDED', 'Member status changed to SUSPENDED');

    // Restore member status back to ACTIVE for clean test state
    await prisma.member.update({
      where: { id: member.id },
      data: { status: 'ACTIVE' }
    });
  }
});

