import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk, toCollection } from '../lib/queryKeys';
import { employeesApi, leaveApi, payrollApi } from '../services/hr.service';

/* ---------------- Employees ---------------- */
export const useEmployees = () =>
  useQuery({ queryKey: qk.employees.list(), queryFn: employeesApi.list, select: (d) => toCollection(d, 'employees').items });

export const useEmployee = (id) =>
  useQuery({ queryKey: qk.employees.detail(id), queryFn: () => employeesApi.get(id), enabled: !!id });

export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: employeesApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: qk.employees.all }) });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => employeesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employees.all }),
  });
};

/* ---------------- Leave ---------------- */
export const useLeaves = () =>
  useQuery({ queryKey: qk.leave.list(), queryFn: leaveApi.list, select: (d) => toCollection(d, 'leaves').items });

export const useRequestLeave = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: leaveApi.request, onSuccess: () => qc.invalidateQueries({ queryKey: qk.leave.all }) });
};

export const useUpdateLeaveStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => leaveApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.leave.all }),
  });
};

/* ---------------- Payroll ---------------- */
export const usePayrolls = () =>
  useQuery({ queryKey: qk.payroll.list(), queryFn: payrollApi.list, select: (d) => toCollection(d, 'payrolls').items });

export const useRunPayroll = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: payrollApi.run, onSuccess: () => qc.invalidateQueries({ queryKey: qk.payroll.all }) });
};

export const useUpdatePayrollStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => payrollApi.updateStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.payroll.all }),
  });
};
