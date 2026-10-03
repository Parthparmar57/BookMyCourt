import React, { useState } from 'react';
import { Bell, Calendar, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { ApplyLeaveModal } from './ApplyLeaveModal';

export const Topbar = () => {
  const { currentRole, currentUser } = useAuth();
  const { isOpen, toggleSidebar } = useSidebar();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

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

  // Any staff role or user with employee record can apply for leave
  const isStaff = ['FRONT_DESK', 'BAR_STAFF', 'SHOP_STAFF', 'KITCHEN'].includes(currentRole) || !!currentUser?.employee;

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3.5 flex items-center justify-between font-sans sticky top-0 z-20 shadow-2xs">
        {/* Left Area: Responsive Hamburger / Cross Toggle Button + Dynamic Greeting */}
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

          {/* Dynamic Personalized Greeting */}
          {currentUser && (
            <div className="flex items-center gap-2 select-none">
              <span className="text-xs sm:text-sm font-medium text-slate-700">
                {greeting},{' '}
                <span className="font-semibold text-slate-900">{firstName}</span>
              </span>
              <span className="hidden sm:inline text-xs text-slate-300 font-normal">·</span>
              <span className="hidden md:inline text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                {roleTitle}
              </span>
            </div>
          )}
        </div>

        {/* Right Actions: Apply Leave (for staff) + Bell + Initial Avatar + Name */}
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

          <button className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
            <Bell className="w-4 h-4 text-slate-600" />
          </button>

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

      {/* Staff Leave Application Modal */}
      <ApplyLeaveModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} />
    </>
  );
};
