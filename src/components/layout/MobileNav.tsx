import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, ShoppingBag, QrCode, Globe } from 'lucide-react';
import { cn } from '../../utils/cn';

export const MobileNav: React.FC = () => {
  const { currentUser } = useAuth();

  // Mobile navigation targets
  const links = currentUser.role === 'member' ? [
    { label: 'Home', path: '/member', icon: LayoutDashboard },
    { label: 'Book', path: '/member/book', icon: Calendar },
    { label: 'Shop', path: '/member/shop', icon: ShoppingBag },
    { label: 'Card', path: '/member/card', icon: QrCode },
  ] : [
    { label: 'Home', path: '/', icon: Globe },
    { label: 'Book', path: '/availability', icon: Calendar },
    { label: 'Shop', path: '/shop', icon: ShoppingBag },
    { label: 'Plans', path: '/membership', icon: QrCode },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-border z-40 flex items-center justify-around px-2 shadow-lg">
      {links.map(link => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/member' || link.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-md text-[11px] font-semibold transition-colors',
                isActive ? 'text-primary' : 'text-text-muted hover:text-foreground'
              )
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
