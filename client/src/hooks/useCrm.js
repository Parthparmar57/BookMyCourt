import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk, toCollection } from '../lib/queryKeys';
import { publicApi, enquiriesApi, leadsApi } from '../services/crm.service';

/* ---------------- Public website (no auth) ---------------- */
export const usePublicPlans = () =>
  useQuery({ queryKey: qk.publicData.plans, queryFn: publicApi.plans, select: (d) => toCollection(d, 'plans').items });

export const usePublicAvailability = (filters = {}) =>
  useQuery({ queryKey: qk.publicData.availability(filters), queryFn: () => publicApi.availability(filters) });

export const usePublicShop = () =>
  useQuery({ queryKey: qk.publicData.shop, queryFn: publicApi.shop, select: (d) => toCollection(d, 'products').items });

export const useSubmitEnquiry = () => useMutation({ mutationFn: publicApi.submitEnquiry });
export const useBookTrial = () => useMutation({ mutationFn: publicApi.bookTrial });

/* ---------------- Enquiries (staff) ---------------- */
export const useEnquiries = () =>
  useQuery({ queryKey: qk.enquiries.list(), queryFn: enquiriesApi.list, select: (d) => toCollection(d, 'enquiries').items });

export const useUpdateEnquiryStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => enquiriesApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.enquiries.all }),
  });
};

/* ---------------- Leads pipeline ---------------- */
export const useLeads = (filters = {}) =>
  useQuery({ queryKey: qk.leads.list(filters), queryFn: () => leadsApi.list(filters), select: (d) => toCollection(d, 'leads') });

export const useLead = (id) =>
  useQuery({ queryKey: qk.leads.detail(id), queryFn: () => leadsApi.get(id), enabled: !!id });

export const useCreateLead = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: leadsApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: qk.leads.all }) });
};

export const useUpdateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => leadsApi.update(id, payload),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: qk.leads.all });
      qc.invalidateQueries({ queryKey: qk.leads.detail(id) });
    },
  });
};

export const useAddFollowUp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => leadsApi.addFollowUp(id, payload),
    onSuccess: (_d, { id }) => qc.invalidateQueries({ queryKey: qk.leads.detail(id) }),
  });
};

export const useCreateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => leadsApi.createQuotation(id, payload),
    onSuccess: (_d, { id }) => qc.invalidateQueries({ queryKey: qk.leads.detail(id) }),
  });
};

export const useSendQuote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => leadsApi.sendQuote(id, payload),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: qk.leads.all });
      qc.invalidateQueries({ queryKey: qk.leads.detail(id) });
    },
  });
};

export const useUpdateQuotationStatus = () => {

  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quotationId, status }) => leadsApi.updateQuotationStatus(quotationId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.leads.all }),
  });
};

export const useConvertLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => leadsApi.convert(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.leads.all });
      qc.invalidateQueries({ queryKey: qk.members.all });
    },
  });
};
