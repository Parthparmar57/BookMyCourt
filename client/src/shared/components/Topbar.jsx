import React, { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, Menu, X, CheckCircle2, XCircle, Clock, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useNotifications } from '../../context/NotificationContext';
import { ApplyLeaveModal } from './ApplyLeaveModal';

// Turn a stored timestamp into a short relative label ("Just now", "5m ago", …).
const formatRelativeTime = (time) => {
  if (!time) return '';
  const then = typeof time === 'number' ? time : new Date(time).getTime();
  if (Number.isNaN(then)) return typeof time === 'string' ? time : '';
  const diff = Date.now() - then;
  if (diff < 60_000) return 'Just now';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(then).toLocaleDateString();
};

export const Topbar = () => {
  const { currentRole, currentUser } = useAuth();
  const { isOpen, toggleSidebar } = useSidebar();
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleTitle =
    currentRole === 'OWNER'
      ? 'Owner / Admin'
      : currentRole === 'FRONT_DESK'
        ? 'Front Desk'
        : currentRole === 'BAR_STAFF'
          ? 'Bar Staff'
          : currentRole === 'SHOP_STAFF'
            ? 'Shop Staff'
            : currentRole === 'KITCHEN'
              ? 'Kitchen Staff'
              : 'Member';

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = currentUser?.name?.trim()?.split(' ')[0] || 'User';
  const greeting = getGreeting();

  // Staff roles can apply for leave — explicitly excluded for OWNER/Admin
  const isStaff = currentRole !== 'OWNER' && ['FRONT_DESK', 'BAR_STAFF', 'SHOP_STAFF', 'KITCHEN'].includes(currentRole);

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3.5 flex items-center justify-between font-sans sticky top-0 z-20 shadow-2xs">
      {/* Left Area: Responsive Hamburger / Cross Toggle Button */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Toggle Button at fixed place: Switches between Hamburger (☰) and Cross (✕) */}
        <button
          onClick={toggleSidebar}
          title={isOpen ? 'Hide / Collapse Sidebar' : 'Show / Expand Sidebar'}
          aria-label="Toggle Navigation Sidebar"
          className="p-2.5 rounded-2xl text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all shadow-2xs shrink-0 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {isOpen ? (
            <X className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:rotate-90" />
          ) : (
            <Menu className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:scale-110" />
          )}
        </button>
      </div>

      {/* Right Actions: Apply Leave (for staff) + Bell Notifications + Initial Avatar + Name */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs shrink-0 ml-3">
        {isStaff && (
          <button
            onClick={() => setShowLeaveModal(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs text-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Apply Leave</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="View Notifications"
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl p-3.5 z-50 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-slate-400 hover:text-slate-700 font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-[10px] text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl transition-all border ${n.read ? 'bg-white border-slate-100 text-slate-600' : 'bg-slate-50/80 border-slate-200/80 text-slate-900'
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                      {n.type === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                      {n.type === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />}
                      {n.type === 'info' && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />}

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[11px] block">{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-normal">{formatRelativeTime(n.time)}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-tight">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="py-6 text-center text-slate-400 text-xs font-normal">
                    No notifications at this time.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {currentUser && (
          <div className="flex items-center gap-3">
            {/* Profile Avatar / Logo with First Name Initial */}
            <div
              title={currentUser.name}
              className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-600 via-emerald-700 to-[#1b4332] text-white flex items-center justify-center font-medium text-xs shadow-xs border border-emerald-400/40 select-none shrink-0"
            >
              {currentUser.initial || (currentUser.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <span className="font-medium text-slate-800 block text-xs">{currentUser.name}</span>
              <span className="text-[11px] text-slate-500 font-normal block">{roleTitle}</span>
            </div>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showLeaveModal && <ApplyLeaveModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} />}
    </header>
  );
};
