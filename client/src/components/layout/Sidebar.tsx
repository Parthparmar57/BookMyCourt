import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Utensils,
  ShoppingBag,
  Target,
  FileText,
  Briefcase,
  Settings,
  QrCode,
  CreditCard,
  Package,
  Clock,
  Sparkles,
  Trophy,
  Globe
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const role = currentUser.role;

  // Role Navigation Mapping according to FRONTEND_PRD.md Section 4 & 7
  const getNavItems = () => {
    switch (role) {
      case 'owner':
        return [
          { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard },
          { label: 'Member Directory', path: '/admin/members', icon: Users },
          { label: 'Court Reservations', path: '/admin/bookings', icon: Calendar },
          { label: 'Bar & Cafeteria POS', path: '/admin/bar', icon: Utensils },
          { label: 'Gear Shop Retail', path: '/admin/shop', icon: ShoppingBag },
          { label: 'Warehouse Inventory', path: '/admin/inventory', icon: Package },
          { label: 'CRM Sales Pipeline', path: '/admin/crm', icon: Target },
          { label: 'Accounting Ledger', path: '/admin/accounting', icon: CreditCard },
          { label: 'HR & Staff Payroll', path: '/admin/hr', icon: Briefcase },
          { label: 'Reports & Analytics', path: '/admin/reports', icon: FileText },
          { label: 'System Settings', path: '/admin/settings', icon: Settings }
        ];

      case 'frontdesk':
        return [
          { label: 'Front Desk Overview', path: '/staff/frontdesk', icon: LayoutDashboard },
          { label: 'Member Directory', path: '/staff/frontdesk/members', icon: Users },
          { label: 'Court Booking Grid', path: '/staff/frontdesk/bookings', icon: Calendar },
          { label: 'CRM & Lead Follow-ups', path: '/staff/frontdesk/crm', icon: Target }
        ];

      case 'bar':
        return [
          { label: 'Table Layout Grid', path: '/staff/bar/tables', icon: Utensils },
          { label: 'Active Bar Orders', path: '/staff/bar/orders', icon: FileText },
          { label: 'Open Member Tabs', path: '/staff/bar/tabs', icon: CreditCard },
          { label: 'Kitchen Screen Feed', path: '/staff/kitchen', icon: Clock },
          { label: 'Shift Summary', path: '/staff/bar/shift', icon: LayoutDashboard }
        ];

      case 'kitchen':
        return [
          { label: 'Kitchen Display (KDS)', path: '/staff/kitchen', icon: Clock }
        ];

      case 'shop':
        return [
          { label: 'Counter Retail POS', path: '/staff/shop/pos', icon: ShoppingBag },
          { label: 'Stock Inventory', path: '/staff/shop/inventory', icon: Package },
          { label: 'Online Shop Orders', path: '/staff/shop/orders', icon: FileText }
        ];

      case 'member':
        return [
          { label: 'Member Portal Home', path: '/member', icon: LayoutDashboard },
          { label: 'Book a Court', path: '/member/book', icon: Calendar },
          { label: 'My Reservations', path: '/member/bookings', icon: Clock },
          { label: 'Gear Shop', path: '/member/shop', icon: ShoppingBag },
          { label: 'My Shop Orders', path: '/member/orders', icon: Package },
          { label: 'Membership Plan', path: '/member/membership', icon: Sparkles },
          { label: 'Active Bar Tab', path: '/member/tab', icon: Utensils },
          { label: 'Digital Member Card', path: '/member/card', icon: QrCode }
        ];

      default: // Visitor
        return [
          { label: 'Public Portal', path: '/', icon: Globe },
          { label: 'Explore Courts', path: '/courts', icon: Calendar },
          { label: 'Live Availability', path: '/availability', icon: Clock },
          { label: 'Membership Plans', path: '/membership', icon: Sparkles },
          { label: 'Public Shop', path: '/shop', icon: ShoppingBag }
        ];
    }
  };

  const rawNavItems = getNavItems();
  const navItems = rawNavItems.filter((item, index, self) =>
    index === self.findIndex((t) => t.path === item.path || t.label.toLowerCase() === item.label.toLowerCase())
  );

  return (
    <aside className="w-64 bg-surface text-foreground border-r border-border flex flex-col h-screen sticky top-0 shrink-0 select-none z-20 overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 border-b border-border flex items-center justify-between bg-white shrink-0">
        <img
          src="/bookmycourt_logo.jpg"
          alt="BookMyCourt"
          className="h-14 sm:h-16 w-auto object-contain max-w-[200px]"
        />
      </div>

      {/* Role Access Scope Badge */}
      <div className="p-4 border-b border-border/60 bg-surface-muted/50 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Access Level</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {role.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-hidden p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/member' || item.path === '/staff/frontdesk'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-muted'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-border bg-white text-xs text-text-muted shrink-0">
        <div className="flex items-center justify-between">
          <span>Version 1.0.0</span>
          <span className="font-mono text-[10px] bg-surface-muted px-1.5 py-0.5 rounded">PERN Stack</span>
        </div>
      </div>
    </aside>
  );
};
