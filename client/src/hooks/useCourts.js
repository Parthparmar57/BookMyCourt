import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk, toCollection } from '../lib/queryKeys';
import { courtsApi, bookingsApi, socialPlayApi } from '../services/courts.service';

/* ---------------- Courts ---------------- */
export const useCourts = () =>
  useQuery({
    queryKey: qk.courts.list(),
    queryFn: courtsApi.list,
    select: (data) => toCollection(data, 'courts').items,
  });

export const useCourt = (id) =>
  useQuery({ queryKey: qk.courts.detail(id), queryFn: () => courtsApi.get(id), enabled: !!id });

export const useCreateCourt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courtsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.courts.all }),
  });
};

export const useUpdateCourt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => courtsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.courts.all }),
  });
};

export const useDeleteCourt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courtsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.courts.all }),
  });
};

/* ---------------- Bookings ---------------- */
export const useBookings = (filters = {}) =>
  useQuery({
    queryKey: qk.bookings.list(filters),
    queryFn: () => bookingsApi.list(filters),
    select: (data) => toCollection(data, 'bookings'),
    keepPreviousData: true,
  });

export const useAvailability = (filters = {}, options = {}) =>
  useQuery({
    queryKey: qk.bookings.availability(filters),
    queryFn: () => bookingsApi.availability(filters),
    enabled: options.enabled ?? !!filters.date,
    ...options,
  });

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.bookings.all });
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => bookingsApi.cancel(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.bookings.all });
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
  });
};

/* ---------------- Social play ---------------- */
export const useSocialSessions = () =>
  useQuery({
    queryKey: qk.socialPlay.list(),
    queryFn: socialPlayApi.list,
    select: (data) => toCollection(data, 'sessions').items,
  });

export const useCreateSocialSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: socialPlayApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.socialPlay.all }),
  });
};

export const useJoinSocial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => socialPlayApi.join(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.socialPlay.all }),
  });
};

export const useLeaveSocial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, participantId }) => socialPlayApi.leave(id, participantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.socialPlay.all }),
  });
};
