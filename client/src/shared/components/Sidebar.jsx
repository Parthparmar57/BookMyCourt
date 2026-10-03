import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Coffee, 
  ShoppingBag, 
  Kanban, 
  Receipt, 
  UserCheck, 
  FileText, 
  Settings, 
  LogOut,
  QrCode,
  Utensils
} from 'lucide-react';

export const Sidebar = () => {
  const { currentRole, currentUser, logout } = useAuth();
  const location = useLocation();

  const getNavLinks = () => {
    switch (currentRole) {
      case 'OWNER':
        return [
          { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard },
          { label: 'Member Database', path: '/admin/members', icon: Users },
          { label: 'Court Reservations', path: '/admin/bookings', icon: Calendar },
          { label: 'Bar & Cafe Sales', path: '/admin/bar', icon: Coffee },
          { label: 'Retail Shop', path: '/admin/shop', icon: ShoppingBag },
          { label: 'CRM Leads', path: '/admin/crm', icon: Kanban },
          { label: 'Financial Ledger', path: '/admin/accounting', icon: Receipt },
          { label: 'HR & Staff Roster', path: '/admin/hr', icon: UserCheck }
        ];
      case 'FRONT_DESK':
        return [
          { label: 'Front Desk Overview', path: '/staff/frontdesk', icon: LayoutDashboard },
          { label: 'Member Directory', path: '/staff/frontdesk/members', icon: Users },
          { label: 'Master Desk Grid', path: '/staff/frontdesk/bookings', icon: Calendar },
          { label: 'Lead Capture', path: '/staff/frontdesk/crm', icon: Kanban }
        ];
      case 'BAR_STAFF':
        return [
          { label: 'Table Layout POS', path: '/staff/bar', icon: Coffee },
          { label: 'Kitchen Feed', path: '/staff/kitchen', icon: Utensils }
        ];
      case 'SHOP_STAFF':
        return [
          { label: 'Retail Counter POS', path: '/staff/shop', icon: ShoppingBag },
          { label: 'Stock Audit', path: '/staff/shop/inventory', icon: FileText }
        ];
      case 'MEMBER':
        return [
          { label: 'Member Home', path: '/member', icon: LayoutDashboard },
          { label: 'Book a Court', path: '/member/book', icon: Calendar },
          { label: 'My Bookings', path: '/member/bookings', icon: Calendar },
          { label: 'Member Shop', path: '/member/shop', icon: ShoppingBag },
          { label: 'Active Bar Tab', path: '/member/tab', icon: Coffee },
          { label: 'Digital Member Card', path: '/member/card', icon: QrCode }
        ];
      default:
        return [{ label: 'Public Home', path: '/', icon: CheckCircle2 }];
    }
  };

  const links = getNavLinks();

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 min-h-screen">
      <div className="p-5 space-y-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base text-white tracking-tight block leading-none">
              BOOK<span className="text-emerald-500">MY</span>COURT
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              {currentRole} OS
            </span>
          </div>
        </Link>

        {/* User Card */}
        {currentUser && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-emerald-500"
            />
            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4>
              <p className="text-[10px] text-slate-400 font-medium truncate">{currentUser.email}</p>
            </div>
          </div>
        )}

        {/* Nav list */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-900">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
};
