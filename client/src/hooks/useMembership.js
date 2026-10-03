import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk, toCollection } from '../lib/queryKeys';
import { plansApi, membersApi } from '../services/membership.service';

/* ---------------- Plans ---------------- */
export const usePlans = () =>
  useQuery({
    queryKey: qk.plans.list(),
    queryFn: plansApi.list,
    select: (data) => toCollection(data, 'plans').items,
  });

export const usePlan = (id) =>
  useQuery({ queryKey: qk.plans.detail(id), queryFn: () => plansApi.get(id), enabled: !!id });

export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plansApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.plans.all }),
  });
};

export const useUpdatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => plansApi.update(id, payload),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: qk.plans.all });
      qc.invalidateQueries({ queryKey: qk.plans.detail(id) });
    },
  });
};

export const useDeletePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plansApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.plans.all }),
  });
};

/* ---------------- Members ---------------- */
export const useMembers = (filters = {}) =>
  useQuery({
    queryKey: qk.members.list(filters),
    queryFn: () => membersApi.list(filters),
    select: (data) => toCollection(data, 'members'),
    keepPreviousData: true,
  });

export const useMember = (id) =>
  useQuery({ queryKey: qk.members.detail(id), queryFn: () => membersApi.get(id), enabled: !!id });

export const useCreateMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: membersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members.all }),
  });
};

export const useRenewMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => membersApi.renew(id, payload),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: qk.members.all });
      qc.invalidateQueries({ queryKey: qk.members.detail(id) });
    },
  });
};
