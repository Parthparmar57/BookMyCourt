import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertTriangle, UserPlus, Package, Calendar } from 'lucide-react';
import { notificationApi } from '../../services/api';
import { NotificationItem } from '../../types';
import { useNavigate } from 'react-router-dom';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    notificationApi.getNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking_confirm': return <Calendar className="w-4 h-4 text-primary" />;
      case 'low_stock': return <Package className="w-4 h-4 text-warning" />;
      case 'new_lead': return <UserPlus className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-secondary hover:text-foreground hover:bg-surface rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-white text-foreground rounded-lg border border-border shadow-[0_8px_24px_rgba(33,36,36,0.12)] z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
                <h4 className="text-xs font-bold uppercase tracking-wider">Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] font-semibold text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setIsOpen(false);
                        if (n.actionUrl) navigate(n.actionUrl);
                      }}
                      className={`p-3 text-xs flex gap-3 hover:bg-surface-muted cursor-pointer transition-colors ${
                        !n.read ? 'bg-primary/5 font-medium' : ''
                      }`}
                    >
                      <div className="p-2 rounded-full bg-surface shrink-0 mt-0.5">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-text-muted font-normal">{n.timestamp}</span>
                        </div>
                        <p className="text-text-muted text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-text-muted">No new notifications</div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
