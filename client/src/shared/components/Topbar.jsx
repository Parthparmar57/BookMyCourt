import React from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';

export const Topbar = () => {
  const { currentRole, currentUser } = useAuth();
  const { isOpen, toggleSidebar } = useSidebar();

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

      {/* Right Actions: Bell + Initial Avatar + Name */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs shrink-0 ml-3">
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
  );
};
