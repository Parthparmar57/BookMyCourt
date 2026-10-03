import React, { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, Menu, X, CheckCircle2, XCircle, Clock, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useLeaveRealtime } from '../../hooks/useRealtime';
import { ApplyLeaveModal } from './ApplyLeaveModal';

export const Topbar = () => {
  const { currentRole, currentUser } = useAuth();
  const { isOpen, toggleSidebar } = useSidebar();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 'welcome-notif',
      title: 'System Online',
      message: 'Real-time sync connected and active.',
      time: 'Just now',
      read: false,
      type: 'info',
    },
  ]);

  // Handle incoming real-time socket events for leaves
  useLeaveRealtime((data) => {
    if (!data) return;

    // 1. If staff's leave status was updated by Admin
    if (data.status && (data.employee?.userId === currentUser?.id || data.employeeId === currentUser?.employee?.id)) {
      const isApproved = data.status === 'APPROVED';
      const newNotif = {
        id: `leave-status-${Date.now()}`,
        title: isApproved ? 'Leave Request Approved' : 'Leave Request Rejected',
        message: `Your ${data.type || ''} leave for ${data.days || 1} day(s) was ${data.status.toLowerCase()} by Admin.`,
        time: 'Just now',
        read: false,
        type: isApproved ? 'success' : 'error',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
    // 2. If an Admin receives a new staff leave request
    else if (currentRole === 'OWNER' && data.status === 'PENDING') {
      const applicantName = data.employee?.user?.name || 'Staff Member';
      const newNotif = {
        id: `leave-req-${Date.now()}`,
        title: 'New Leave Request',
        message: `${applicantName} submitted a ${data.type || ''} leave request for ${data.days || 1} day(s).`,
        time: 'Just now',
        read: false,
        type: 'pending',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  });

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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
      {/* Left Area: Responsive Hamburger / Cross Toggle Button + Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
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

        {/* Global Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search members, bookings, courts..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-xs font-medium focus:bg-white focus:border-[#2e7d32] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
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
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-slate-400 hover:text-slate-700 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
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
                          <span className="text-[9px] text-slate-400 font-normal">{n.time}</span>
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
    </header>
  );
};
