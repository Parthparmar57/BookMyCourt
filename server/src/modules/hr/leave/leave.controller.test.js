// Issue #7 regression test — a non-OWNER without an employee record (e.g. a MEMBER
// that slipped past the route guard) must NEVER receive other employees' leave.
// Before the fix, listLeaves called the service with { employeeId: undefined },
// which the service treated as "no filter" and returned ALL leave records.
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

let serviceCalls;

// Mock the service so no DB is touched; record how it is (or isn't) called.
mock.module('./leave.service.js', {
  namedExports: {
    listLeaveRequests: async (query) => {
      serviceCalls.push(query);
      return [{ id: 'ALL-LEAVE' }]; // stand-in for "the whole table"
    },
    requestLeave: async () => ({}),
    updateLeaveStatus: async () => ({}),
  },
});

const { listLeaves } = await import('./leave.controller.js');

const makeRes = () => ({
  statusCode: null,
  body: null,
  status(c) { this.statusCode = c; return this; },
  json(b) { this.body = b; return this; },
});

beforeEach(() => { serviceCalls = []; });

test('non-owner without employeeId gets an empty list and never queries all leave', async () => {
  const req = { user: { role: 'MEMBER', employeeId: null }, query: {} };
  const res = makeRes();
  await listLeaves(req, res, (e) => { throw e; });

  assert.deepEqual(res.body.data, [], 'should return an empty array, not all leave');
  assert.equal(serviceCalls.length, 0, 'service must not be called with an unfiltered query');
});

test('owner sees all leave (service called with the raw query)', async () => {
  const req = { user: { role: 'OWNER', employeeId: null }, query: { status: 'PENDING' } };
  const res = makeRes();
  await listLeaves(req, res, (e) => { throw e; });

  assert.equal(serviceCalls.length, 1);
  assert.deepEqual(serviceCalls[0], { status: 'PENDING' });
});

test('staff with an employeeId are scoped to their own leave', async () => {
  const req = { user: { role: 'BAR_STAFF', employeeId: 'emp-1' }, query: {} };
  const res = makeRes();
  await listLeaves(req, res, (e) => { throw e; });

  assert.equal(serviceCalls.length, 1);
  assert.equal(serviceCalls[0].employeeId, 'emp-1');
});
