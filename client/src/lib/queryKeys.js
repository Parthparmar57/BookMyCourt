/**
 * Centralized React Query key factory (Phase 3).
 *
 * Using one source of truth for keys keeps cache reads, writes and
 * invalidations consistent across hooks. Pass filters as the last element so
 * partial invalidation works, e.g. queryClient.invalidateQueries({ queryKey:
 * qk.bookings.all }) clears every ['bookings', ...] entry.
 */
export const qk = {
  // Membership
  plans: {
    all: ['plans'],
    list: () => ['plans'],
    detail: (id) => ['plan', id],
  },
  members: {
    all: ['members'],
    list: (filters = {}) => ['members', filters],
    detail: (id) => ['member', id],
  },

  // Courts
  courts: {
    all: ['courts'],
    list: () => ['courts'],
    detail: (id) => ['court', id],
  },
  bookings: {
    all: ['bookings'],
    list: (filters = {}) => ['bookings', filters],
    availability: (filters = {}) => ['availability', filters],
  },
  socialPlay: {
    all: ['social-play'],
    list: () => ['social-play'],
  },

  // Shop
  products: {
    all: ['products'],
    list: (filters = {}) => ['products', filters],
    detail: (id) => ['product', id],
  },
  inventory: {
    logs: ['inventory', 'logs'],
    lowStock: ['inventory', 'low-stock'],
  },
  shopOrders: {
    all: ['shop-orders'],
    list: (filters = {}) => ['shop-orders', filters],
    detail: (id) => ['shop-order', id],
  },

  // Bar / F&B
  menu: { all: ['menu'], list: () => ['menu'] },
  barTables: { all: ['bar-tables'], list: () => ['bar-tables'] },
  barOrders: { all: ['bar-orders'], list: () => ['bar-orders'] },
  tabs: { all: ['tabs'], list: () => ['tabs'], detail: (id) => ['tab', id] },
  kitchen: { queue: ['kitchen', 'queue'] },
  shifts: { active: ['shifts', 'active'], report: (id) => ['shift', id, 'report'] },

  // CRM
  enquiries: { all: ['enquiries'], list: () => ['enquiries'] },
  leads: {
    all: ['leads'],
    list: (filters = {}) => ['leads', filters],
    detail: (id) => ['lead', id],
  },
  publicData: {
    plans: ['public', 'plans'],
    availability: (filters = {}) => ['public', 'availability', filters],
    shop: ['public', 'shop'],
  },

  // Finance
  ledger: { all: ['ledger'], list: (filters = {}) => ['ledger', filters], summary: ['ledger', 'summary'] },
  invoices: { all: ['invoices'], list: (filters = {}) => ['invoices', filters], detail: (id) => ['invoice', id] },
  expenses: { all: ['expenses'], list: () => ['expenses'] },

  // Dashboard & reports
  dashboard: { summary: ['dashboard', 'summary'], utilisation: ['dashboard', 'utilisation'] },
  reports: { byType: (type, filters = {}) => ['reports', type, filters] },

  // HR
  employees: { all: ['employees'], list: () => ['employees'], detail: (id) => ['employee', id] },
  leave: { all: ['leave'], list: () => ['leave'] },
  payroll: { all: ['payroll'], list: () => ['payroll'] },
};

/**
 * Normalize a list response into a consistent shape. The backend returns either
 * a bare array or a paginated object like { members: [...], total, page }.
 */
export const toCollection = (data, key) => {
  if (Array.isArray(data)) return { items: data, total: data.length, page: 1, totalPages: 1 };
  const items = (key && data?.[key]) || data?.items || [];
  return {
    items,
    total: data?.total ?? items.length,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
  };
};

export default qk;
