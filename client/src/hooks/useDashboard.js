import { useQuery } from '@tanstack/react-query';
import { qk } from '../lib/queryKeys';
import { dashboardApi, reportsApi } from '../services/dashboard.service';

/* ---------------- Dashboard KPIs ---------------- */
export const useDashboardSummary = () =>
  useQuery({ queryKey: qk.dashboard.summary, queryFn: dashboardApi.summary });

export const useDashboardUtilisation = () =>
  useQuery({ queryKey: qk.dashboard.utilisation, queryFn: dashboardApi.utilisation });

/* ---------------- Reports ---------------- */
export const useTaxReport = (filters = {}) =>
  useQuery({ queryKey: qk.reports.byType('tax', filters), queryFn: () => reportsApi.tax(filters) });

export const useInventoryReport = (filters = {}) =>
  useQuery({ queryKey: qk.reports.byType('inventory', filters), queryFn: () => reportsApi.inventory(filters) });

export const useMembershipReport = (filters = {}) =>
  useQuery({ queryKey: qk.reports.byType('membership', filters), queryFn: () => reportsApi.membership(filters) });

// Excel export helper (returns a Blob the caller can download).
export { reportsApi };
