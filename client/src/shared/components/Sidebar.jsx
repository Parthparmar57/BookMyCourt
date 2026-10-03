import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApplyLeaveModal } from './ApplyLeaveModal';
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
  LogOut,
  QrCode,
  Utensils
} from 'lucide-react';

export const Sidebar = () => {
  const { currentRole, currentUser, logout } = useAuth();
  const location = useLocation();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const isStaff = ['FRONT_DESK', 'BAR_STAFF', 'SHOP_STAFF', 'KITCHEN'].includes(currentRole) || !!currentUser?.employee;

  const getNavLinks = () => {
    const roleUpper = (currentRole || '').toUpperCase();
    switch (roleUpper) {
      case 'OWNER':
        return [
          { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { label: 'Bookings', path: '/admin/bookings', icon: Calendar },
          { label: 'Members', path: '/admin/members', icon: Users },
          { label: 'Bar & Kitchen', path: '/admin/bar', icon: Coffee },
          { label: 'Shop Inventory', path: '/admin/shop', icon: ShoppingBag },
          { label: 'CRM Leads', path: '/admin/crm', icon: Kanban },
          { label: 'Accounting', path: '/admin/accounting', icon: Receipt },
          { label: 'HR & Staff', path: '/admin/hr', icon: UserCheck }
        ];
      case 'FRONT_DESK':
        return [
          { label: 'Dashboard', path: '/staff/frontdesk', icon: LayoutDashboard },
          { label: 'Bookings', path: '/staff/frontdesk/bookings', icon: Calendar },
          { label: 'Members', path: '/staff/frontdesk/members', icon: Users },
          { label: 'CRM Leads', path: '/staff/frontdesk/crm', icon: Kanban }
        ];
      case 'BAR_STAFF':
        return [
          { label: 'Bar POS', path: '/staff/bar', icon: Coffee },
          { label: 'Kitchen Feed', path: '/staff/kitchen', icon: Utensils }
        ];
      case 'SHOP_STAFF':
        return [
          { label: 'Shop POS', path: '/staff/shop', icon: ShoppingBag },
          { label: 'Inventory Audit', path: '/staff/shop/inventory', icon: FileText }
        ];
      case 'MEMBER':
        return [
          { label: 'Dashboard', path: '/member', icon: LayoutDashboard },
          { label: 'Book a Court', path: '/member/book', icon: Calendar },
          { label: 'My Bookings', path: '/member/bookings', icon: Calendar },
          { label: 'Member Shop', path: '/member/shop', icon: ShoppingBag },
          { label: 'Bar Tab', path: '/member/tab', icon: Coffee },
          { label: 'Digital Card', path: '/member/card', icon: QrCode }
        ];
      default:
        return [{ label: 'Home', path: '/', icon: CheckCircle2 }];
    }
  };

  const rawLinks = getNavLinks();
  // Filter out any duplicate items by path or label
  const links = rawLinks.filter((link, index, self) =>
    index === self.findIndex((t) => t.path === link.path || t.label.toLowerCase() === link.label.toLowerCase())
  );

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col justify-between border-r border-gray-100 h-screen sticky top-0 shrink-0 font-sans shadow-xs overflow-hidden z-30 select-none">
      <div className="p-6 flex flex-col h-full overflow-hidden">
        {/* Zoomed BookMyCourt Logo Image */}
        <Link to="/" className="block py-1 shrink-0 group">
          <img
            src="/bookmycourt_logo.jpg"
            alt="BookMyCourt Logo"
            className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Clean Nav List matching exact admin routes */}
        <nav className="space-y-1.5 pt-4 flex-1 overflow-hidden">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-[#e8f5e9] text-[#2e7d32] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2e7d32]' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 shrink-0 space-y-2">
          {isStaff && (
            <button
              onClick={() => setShowLeaveModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Apply for Leave</span>
            </button>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100 bg-white cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <ApplyLeaveModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} />
    </aside>
  );
};



