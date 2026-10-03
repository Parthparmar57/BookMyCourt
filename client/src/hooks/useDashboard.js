import { useQuery } from '@tanstack/react-query';
import { qk } from '../lib/queryKeys';
import { dashboardApi, reportsApi } from '../services/dashboard.service';

/* ---------------- Dashboard KPIs ---------------- */
export const useDashboardSummary = (period = 'today') =>
  useQuery({
    queryKey: ['dashboard', 'summary', period],
    queryFn: () => dashboardApi.summary({ period }),
  });

export const useDashboardUtilisation = (period = 'today') =>
  useQuery({
    queryKey: ['dashboard', 'utilisation', period],
    queryFn: () => dashboardApi.utilisation({ period }),
  });

/* ---------------- Reports ---------------- */
export const useTaxReport = (filters = {}) =>
  useQuery({ queryKey: qk.reports.byType('tax', filters), queryFn: () => reportsApi.tax(filters) });

export const useInventoryReport = (filters = {}) =>
  useQuery({ queryKey: qk.reports.byType('inventory', filters), queryFn: () => reportsApi.inventory(filters) });

export const useMembershipReport = (filters = {}) =>
  useQuery({ queryKey: qk.reports.byType('membership', filters), queryFn: () => reportsApi.membership(filters) });

export const useRevenueReport = (filters = {}) =>
  useQuery({ queryKey: qk.reports.byType('revenue', filters), queryFn: () => reportsApi.revenue(filters) });

// Excel export helper (returns a Blob the caller can download).
export { reportsApi };
