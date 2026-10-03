import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSocket } from '../lib/socket';
import { useAuth } from './AuthContext';

/**
 * Central notification feed.
 *
 * There is no dedicated notifications table on the backend — activity is
 * published over Socket.IO (booking / leave / kitchen events). This provider
 * subscribes to every relevant broadcast, turns each event into a human
 * readable notification tailored to the current user's role, and keeps the
 * running feed in localStorage so the bell survives navigation and refreshes.
 */

const STORAGE_KEY = 'bmc_notifications';
const MAX_NOTIFICATIONS = 50;

const WELCOME_NOTIFICATION = {
  id: 'welcome-notif',
  title: 'System Online',
  message: 'Real-time sync connected and active.',
  time: Date.now(),
  read: false,
  type: 'info',
  category: 'system',
};

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  push: () => {},
  markAllRead: () => {},
  markRead: () => {},
  clearAll: () => {},
});

const loadInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return [WELCOME_NOTIFICATION];
};

export const NotificationProvider = ({ children }) => {
  const { currentUser, currentRole } = useAuth();
  const [notifications, setNotifications] = useState(loadInitial);

  // Persist the latest feed (capped) so notifications are not lost on refresh.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
    } catch {
      /* storage may be unavailable (private mode / quota) — feed stays in memory */
    }
  }, [notifications]);

  const push = useCallback((notif) => {
    setNotifications((prev) =>
      [
        {
          id: notif.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          time: Date.now(),
          read: false,
          type: 'info',
          category: 'system',
          ...notif,
        },
        ...prev,
      ].slice(0, MAX_NOTIFICATIONS)
    );
  }, []);

  // Subscribe to realtime events once the user is known.
  useEffect(() => {
    if (!currentUser) return undefined;

    const socket = getSocket();
    const userId = currentUser.id;
    const employeeId = currentUser.employee?.id;
    const isOwner = currentRole === 'OWNER';
    const isStaff = ['OWNER', 'FRONT_DESK', 'BAR_STAFF', 'SHOP_STAFF', 'KITCHEN'].includes(currentRole);

    // --- Court bookings (broadcast to everyone) ---
    const onBooking = (b) => {
      if (!isStaff) return; // members should not see the whole facility's bookings
      const court = b?.court?.name || 'a court';
      const who = b?.member?.user?.name || b?.walkInName || 'Walk-in guest';
      const status = b?.status;
      let title = 'Booking Updated';
      let type = 'info';
      if (status === 'CANCELLED') {
        title = 'Booking Cancelled';
        type = 'error';
      } else if (status === 'CONFIRMED' || status === 'BOOKED') {
        title = 'New Court Booking';
        type = 'success';
      }
      push({ title, message: `${who} — ${court}.`, type, category: 'booking' });
    };

    // --- Leave requested (owner/admin approves these) ---
    const onLeaveRequested = (l) => {
      if (!isOwner) return;
      const name = l?.employee?.user?.name || 'A staff member';
      push({
        title: 'New Leave Request',
        message: `${name} requested ${l?.type || ''} leave for ${l?.days || 1} day(s).`,
        type: 'pending',
        category: 'leave',
      });
    };

    // --- Leave status changed (the applicant, and admins, want to know) ---
    const onLeaveStatus = (l) => {
      const isMine = l?.employee?.userId === userId || l?.employeeId === employeeId;
      const approved = l?.status === 'APPROVED';
      if (isMine) {
        push({
          title: approved ? 'Leave Request Approved' : 'Leave Request Rejected',
          message: `Your ${l?.type || ''} leave for ${l?.days || 1} day(s) was ${String(l?.status || '').toLowerCase()}.`,
          type: approved ? 'success' : 'error',
          category: 'leave',
        });
      } else if (isOwner) {
        const name = l?.employee?.user?.name || 'A staff member';
        push({
          title: `Leave ${approved ? 'Approved' : 'Rejected'}`,
          message: `${name}'s ${l?.type || ''} leave was ${String(l?.status || '').toLowerCase()}.`,
          type: approved ? 'success' : 'error',
          category: 'leave',
        });
      }
    };

    socket.on('booking_changed', onBooking);
    socket.on('leave_requested', onLeaveRequested);
    socket.on('leave_status_updated', onLeaveStatus);

    // --- Kitchen orders are room-scoped: join only for kitchen staff ---
    let kitchen = null;
    if (currentRole === 'KITCHEN') {
      const joinKitchen = () => socket.emit('join_room', 'kitchen');
      const onNewOrder = (o) =>
        push({
          title: 'New Kitchen Order',
          message: `Order ${o?.orderNo || o?.id || ''} received.`.trim(),
          type: 'info',
          category: 'kitchen',
        });
      const onKitchenStatus = (o) =>
        push({
          title: 'Kitchen Order Updated',
          message: `Order ${o?.orderNo || o?.id || ''} is now ${o?.status || 'updated'}.`,
          type: 'info',
          category: 'kitchen',
        });
      joinKitchen();
      socket.on('connect', joinKitchen); // re-join after reconnect
      socket.on('new_kitchen_order', onNewOrder);
      socket.on('kitchen_status_changed', onKitchenStatus);
      kitchen = { joinKitchen, onNewOrder, onKitchenStatus };
    }

    return () => {
      socket.off('booking_changed', onBooking);
      socket.off('leave_requested', onLeaveRequested);
      socket.off('leave_status_updated', onLeaveStatus);
      if (kitchen) {
        socket.off('connect', kitchen.joinKitchen);
        socket.off('new_kitchen_order', kitchen.onNewOrder);
        socket.off('kitchen_status_changed', kitchen.onKitchenStatus);
      }
    };
  }, [currentUser, currentRole, push]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, push, markAllRead, markRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
