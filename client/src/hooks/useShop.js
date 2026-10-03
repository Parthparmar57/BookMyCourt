import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk, toCollection } from '../lib/queryKeys';
import { productsApi, inventoryApi, shopOrdersApi } from '../services/shop.service';

/* ---------------- Products ---------------- */
export const useProducts = (filters = {}) =>
  useQuery({
    queryKey: qk.products.list(filters),
    queryFn: () => productsApi.list(filters),
    select: (data) => toCollection(data, 'products').items,
  });

export const useProduct = (id) =>
  useQuery({ queryKey: qk.products.detail(id), queryFn: () => productsApi.get(id), enabled: !!id });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.products.all }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => productsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.products.all }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.products.all }),
  });
};

/* ---------------- Inventory ---------------- */
export const useInventoryLogs = () =>
  useQuery({ queryKey: qk.inventory.logs, queryFn: inventoryApi.logs, select: (d) => toCollection(d, 'logs').items });

export const useLowStock = () =>
  useQuery({ queryKey: qk.inventory.lowStock, queryFn: inventoryApi.lowStock, select: (d) => toCollection(d, 'products').items });

export const useStockIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.stockIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.products.all });
      qc.invalidateQueries({ queryKey: qk.inventory.logs });
      qc.invalidateQueries({ queryKey: qk.inventory.lowStock });
    },
  });
};

/* ---------------- Shop orders ---------------- */
export const useShopOrders = (filters = {}) =>
  useQuery({
    queryKey: qk.shopOrders.list(filters),
    queryFn: () => shopOrdersApi.list(filters),
    select: (data) => toCollection(data, 'orders'),
    keepPreviousData: true,
  });

export const useShopOrder = (id) =>
  useQuery({ queryKey: qk.shopOrders.detail(id), queryFn: () => shopOrdersApi.get(id), enabled: !!id });

export const useCreateShopOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: shopOrdersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.shopOrders.all });
      qc.invalidateQueries({ queryKey: qk.products.all }); // stock changed
    },
  });
};

export const useUpdateShopOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => shopOrdersApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.shopOrders.all }),
  });
};
