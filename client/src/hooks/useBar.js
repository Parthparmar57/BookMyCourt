import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk, toCollection } from '../lib/queryKeys';
import { menuApi, barTablesApi, barOrdersApi, tabsApi, kitchenApi, shiftsApi } from '../services/bar.service';

/* ---------------- Menu ---------------- */
export const useMenu = () =>
  useQuery({ queryKey: qk.menu.list(), queryFn: menuApi.list, select: (d) => toCollection(d, 'items').items });

export const useCreateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: menuApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: qk.menu.all }) });
};
export const useUpdateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => menuApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.menu.all }),
  });
};
export const useDeleteMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: menuApi.remove, onSuccess: () => qc.invalidateQueries({ queryKey: qk.menu.all }) });
};

/* ---------------- Bar tables ---------------- */
export const useBarTables = () =>
  useQuery({ queryKey: qk.barTables.list(), queryFn: barTablesApi.list, select: (d) => toCollection(d, 'tables').items });

export const useCreateBarTable = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: barTablesApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: qk.barTables.all }) });
};
export const useUpdateBarTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => barTablesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.barTables.all }),
  });
};
export const useDeleteBarTable = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: barTablesApi.remove, onSuccess: () => qc.invalidateQueries({ queryKey: qk.barTables.all }) });
};

/* ---------------- Bar orders ---------------- */
export const useBarOrders = () =>
  useQuery({ queryKey: qk.barOrders.list(), queryFn: barOrdersApi.list, select: (d) => toCollection(d, 'orders').items });

export const useCreateBarOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: barOrdersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.barOrders.all });
      qc.invalidateQueries({ queryKey: qk.kitchen.queue });
    },
  });
};

export const useSettleBarOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => barOrdersApi.settle(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.barOrders.all });
      qc.invalidateQueries({ queryKey: qk.tabs.all });
    },
  });
};

/* ---------------- Tabs ---------------- */
export const useTabs = () =>
  useQuery({ queryKey: qk.tabs.list(), queryFn: tabsApi.list, select: (d) => toCollection(d, 'tabs').items });

export const useTab = (id) =>
  useQuery({ queryKey: qk.tabs.detail(id), queryFn: () => tabsApi.get(id), enabled: !!id });

export const useOpenTab = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: tabsApi.open, onSuccess: () => qc.invalidateQueries({ queryKey: qk.tabs.all }) });
};

export const useSettleTab = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => tabsApi.settle(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tabs.all }),
  });
};

/* ---------------- Kitchen (KDS) ---------------- */
export const useKitchenQueue = (options = {}) =>
  useQuery({
    queryKey: qk.kitchen.queue,
    queryFn: kitchenApi.queue,
    select: (d) => toCollection(d, 'orders').items,
    // Poll as a fallback until Socket.IO is added in Phase 5.
    refetchInterval: options.refetchInterval ?? 10000,
    ...options,
  });

export const useUpdateKitchenStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => kitchenApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.kitchen.queue }),
  });
};

/* ---------------- Shifts ---------------- */
export const useActiveShift = () =>
  useQuery({ queryKey: qk.shifts.active, queryFn: shiftsApi.active, retry: false });

export const useShiftReport = (id) =>
  useQuery({ queryKey: qk.shifts.report(id), queryFn: () => shiftsApi.report(id), enabled: !!id });

export const useOpenShift = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: shiftsApi.open, onSuccess: () => qc.invalidateQueries({ queryKey: qk.shifts.active }) });
};

export const useCloseShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => shiftsApi.close(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.shifts.active }),
  });
};
