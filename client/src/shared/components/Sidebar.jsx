import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
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
  Utensils,
  Package,
  X
} from 'lucide-react';

export const Sidebar = () => {
  const { currentRole, currentUser, logout } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();
  const location = useLocation();

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
          { label: 'Bookings', path: '/staff/frontdesk/bookings', icon: Calendar },
          { label: 'Members', path: '/staff/frontdesk', icon: Users },
          { label: 'CRM Leads', path: '/staff/frontdesk/crm', icon: Kanban }
        ];
      case 'BAR_STAFF':
        return [
          { label: 'Bar POS', path: '/staff/bar', icon: Coffee },
          { label: 'Kitchen Feed', path: '/staff/kitchen', icon: Utensils }
        ];
      case 'KITCHEN':
        return [
          { label: 'Kitchen Orders (KDS)', path: '/staff/kitchen', icon: Utensils }
        ];
      case 'SHOP_STAFF':
        return [
          { label: 'Shop POS', path: '/staff/shop', icon: ShoppingBag },
          { label: 'Shop Orders', path: '/staff/shop/orders', icon: Package },
          { label: 'Inventory Audit', path: '/staff/shop/inventory', icon: FileText }
        ];
      case 'MEMBER':
        return [
          { label: 'Dashboard', path: '/member', icon: LayoutDashboard },
          { label: 'Book a Court', path: '/member/book', icon: Calendar },
          { label: 'My Bookings', path: '/member/bookings', icon: Calendar },
          { label: 'Member Shop', path: '/member/shop', icon: ShoppingBag },
          { label: 'My Orders', path: '/member/orders', icon: Package },
          { label: 'Bar & Cafeteria', path: '/member/tab', icon: Coffee },
          { label: 'Digital Card', path: '/member/card', icon: QrCode }
        ];
      default:
        return [{ label: 'Home', path: '/', icon: CheckCircle2 }];
    }
  };

  const rawLinks = getNavLinks();
  const links = rawLinks.filter((link, index, self) =>
    index === self.findIndex((t) => t.path === link.path || t.label.toLowerCase() === link.label.toLowerCase())
  );

  const navContent = (
    <div className="w-64 p-6 flex flex-col h-full overflow-hidden select-none bg-white">
      {/* Header with Logo and Close button for all screens */}
      <div className="flex items-center justify-between gap-2 py-1 shrink-0">
        <Link to="/" className="block group">
          <img
            src="/bookmycourt_logo.png"
            alt="BookMyCourt Logo"
            className="h-12 sm:h-14 max-w-[140px] w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Close button inside sidebar for ALL screens */}
        <button
          onClick={closeSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all shadow-2xs cursor-pointer flex items-center justify-center shrink-0 hover:rotate-90 duration-200"
          aria-label="Close Sidebar"
          title="Close Sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Clean Nav List */}
      <nav className="space-y-1.5 pt-4 flex-1 overflow-y-auto no-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.path === '/staff/frontdesk' && location.pathname === '/staff/frontdesk/members');
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
                if (window.innerWidth < 1024) closeSidebar();
              }}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-medium transition-all ${isActive
                  ? 'bg-[#e8f5e9] text-[#2e7d32] shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#2e7d32]' : 'text-slate-400'}`} />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-gray-100 shrink-0 space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100 bg-white cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── 1. DESKTOP SIDEBAR (Static flex child, smooth width transition, NO negative margins) ─── */}
      <aside
        className={`
          hidden lg:flex flex-col h-screen sticky top-0 shrink-0 border-r border-gray-100 bg-white
          transition-[width,opacity] duration-300 ease-in-out overflow-hidden z-20
          ${isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none border-r-0'}
        `}
      >
        {navContent}
      </aside>

      {/* ─── 2. MOBILE / TABLET DRAWER (Fixed overlay, completely independent from layout grid) ─── */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] bg-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'}
        `}
      >
        {navContent}
      </aside>
    </>
  );
};
