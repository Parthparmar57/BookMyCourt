import React, { useState } from 'react';
import { Search, Bell, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApplyLeaveModal } from './ApplyLeaveModal';

export const Topbar = () => {
  const { currentRole, currentUser } = useAuth();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const roleTitle = currentRole === 'OWNER' ? 'Owner / Admin' : currentRole === 'FRONT_DESK' ? 'Front Desk' : currentRole === 'BAR_STAFF' ? 'Bar Staff' : currentRole === 'SHOP_STAFF' ? 'Shop Staff' : currentRole === 'KITCHEN' ? 'Kitchen Staff' : 'Member';

  // Any staff role or user with employee record can apply for leave
  const isStaff = ['FRONT_DESK', 'BAR_STAFF', 'SHOP_STAFF', 'KITCHEN'].includes(currentRole) || !!currentUser?.employee;

  return (
    <>
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

        {/* Right Actions: Apply Leave (for staff) + Bell + Avatar */}
        <div className="flex items-center gap-4 text-xs">
          {isStaff && (
            <button
              onClick={() => setShowLeaveModal(true)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Apply Leave</span>
            </button>
          )}

          <button className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
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

      {/* Staff Leave Application Modal */}
      <ApplyLeaveModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} />
    </>
  );
};
