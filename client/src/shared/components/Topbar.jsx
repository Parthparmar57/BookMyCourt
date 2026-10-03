import React from 'react';
import { Search, Bell, Calendar as CalendarIcon, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = () => {
  const { currentRole, currentUser } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-2xs">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Fast search member, court, phone (Cmd+K)..."
          className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
        />
      </div>

      {/* Right User Info & Date */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        </div>

        <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>

        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="font-bold text-slate-900">{currentUser.name}</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {currentRole}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
