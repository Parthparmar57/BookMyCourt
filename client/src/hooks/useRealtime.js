import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';
import { qk } from '../lib/queryKeys';

/**
 * Live court bookings — when any booking changes anywhere, refresh bookings +
 * availability (staff grid and the public live grid).
 */
export const useBookingRealtime = () => {
  const qc = useQueryClient();
  useEffect(() => {
    const socket = getSocket();
    const onChange = () => {
      qc.invalidateQueries({ queryKey: qk.bookings.all });
      qc.invalidateQueries({ queryKey: ['availability'] });
      qc.invalidateQueries({ queryKey: ['public', 'availability'] });
    };
    socket.on('booking_changed', onChange);
    return () => socket.off('booking_changed', onChange);
  }, [qc]);
};

/**
 * Live kitchen queue — join the "kitchen" room and refresh the queue whenever a
 * new order lands or a status changes.
 */
export const useKitchenRealtime = () => {
  const qc = useQueryClient();
  useEffect(() => {
    const socket = getSocket();
    const invalidate = () => qc.invalidateQueries({ queryKey: qk.kitchen.queue });

    const join = () => socket.emit('join_room', 'kitchen');
    join();
    socket.on('connect', join); // re-join after a reconnect
    socket.on('new_kitchen_order', invalidate);
    socket.on('kitchen_status_changed', invalidate);

    return () => {
      socket.emit('leave_room', 'kitchen');
      socket.off('connect', join);
      socket.off('new_kitchen_order', invalidate);
      socket.off('kitchen_status_changed', invalidate);
    };
  }, [qc]);
};

/**
 * Live HR & Staff Leave tracking — when a leave is requested or its status is updated (Approved/Rejected),
 * automatically invalidate leave queries and refresh employee details in real-time.
 */
export const useLeaveRealtime = (onStatusChange) => {
  const qc = useQueryClient();
  useEffect(() => {
    const socket = getSocket();
    const handleLeaveChange = (data) => {
      qc.invalidateQueries({ queryKey: qk.leave.all });
      qc.invalidateQueries({ queryKey: qk.employees.all });
      if (onStatusChange) {
        onStatusChange(data);
      }
    };

    socket.on('leave_requested', handleLeaveChange);
    socket.on('leave_status_updated', handleLeaveChange);

    return () => {
      socket.off('leave_requested', handleLeaveChange);
      socket.off('leave_status_updated', handleLeaveChange);
    };
  }, [qc, onStatusChange]);
};

