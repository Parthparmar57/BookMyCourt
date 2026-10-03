import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = () => {
  const { currentRole, currentUser } = useAuth();

  const roleTitle = currentRole === 'OWNER' ? 'Owner / Admin' : currentRole === 'FRONT_DESK' ? 'Front Desk' : currentRole === 'BAR_STAFF' ? 'Bar Staff' : currentRole === 'SHOP_STAFF' ? 'Shop Staff' : 'Member';

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center justify-between font-sans">
      {/* Search Input matching screenshot */}
      <div className="relative w-96">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search members, bookings, courts..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-xs font-medium focus:bg-white focus:border-[#2e7d32] focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right User Info matching screenshot (Bell + Avatar + Name & Title) */}
      <div className="flex items-center gap-5 text-xs">
        <button className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4 text-slate-600" />
        </button>

        {currentUser && (
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <div className="text-left leading-tight">
              <span className="font-extrabold text-slate-900 block text-xs">{currentUser.name}</span>
              <span className="text-[11px] text-slate-500 font-semibold block">{roleTitle}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

