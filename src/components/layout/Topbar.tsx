import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CommandPalette } from './CommandPalette';
import { NotificationCenter } from './NotificationCenter';
import { Search, ChevronDown, Plus, User as UserIcon, ShieldCheck, LogOut } from 'lucide-react';
import { UserRole } from '../../types';
import { useNavigate } from 'react-router-dom';

export const Topbar: React.FC<{ pageTitle?: string }> = ({ pageTitle = 'Dashboard' }) => {
  const { currentUser, switchRole, allRoleUsers } = useAuth();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    owner: { label: 'Owner / Admin', badge: 'bg-purple-100 text-purple-700' },
    frontdesk: { label: 'Front Desk Staff', badge: 'bg-primary/10 text-primary' },
    bar: { label: 'Bar & Cafeteria POS', badge: 'bg-amber-100 text-amber-800' },
    kitchen: { label: 'Kitchen Screen', badge: 'bg-orange-100 text-orange-800' },
    shop: { label: 'Gear Shop Staff', badge: 'bg-blue-100 text-blue-800' },
    member: { label: 'Club Member', badge: 'bg-emerald-100 text-emerald-800' },
    visitor: { label: 'Public Visitor', badge: 'bg-gray-100 text-gray-700' }
  };

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setIsRoleDropdownOpen(false);
    // Redirect to primary role route
    switch (role) {
      case 'owner': navigate('/admin'); break;
      case 'frontdesk': navigate('/staff/frontdesk'); break;
      case 'bar': navigate('/staff/bar'); break;
      case 'kitchen': navigate('/staff/kitchen'); break;
      case 'shop': navigate('/staff/shop'); break;
      case 'member': navigate('/member'); break;
      case 'visitor': navigate('/'); break;
    }
  };

  return (
    <header className="h-16 border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Left: Title & Quick Search */}
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-bold text-foreground tracking-tight hidden sm:block">
          {pageTitle}
        </h1>

        {/* Global Cmd+K Search Launcher */}
        <button
          onClick={() => setIsPaletteOpen(true)}
          className="flex items-center gap-3 px-3.5 py-1.5 bg-surface text-text-muted hover:text-foreground border border-border rounded-md text-xs font-medium transition-all w-64 sm:w-80 shadow-2xs"
        >
          <Search className="w-4 h-4 text-primary shrink-0" />
          <span className="flex-1 text-left truncate">Search member, phone, QR...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-white border rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Role Switcher & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Booking Action */}
        {(currentUser.role === 'owner' || currentUser.role === 'frontdesk' || currentUser.role === 'member') && (
          <button
            onClick={() => navigate(currentUser.role === 'member' ? '/member/book' : '/staff/frontdesk/bookings')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Book Court</span>
          </button>
        )}

        <NotificationCenter />

        {/* FAST DEMO ROLE SWITCHER DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-surface border border-transparent hover:border-border transition-all"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-foreground leading-none">{currentUser.name}</div>
              <div className="text-[10px] font-medium text-text-muted mt-0.5 flex items-center gap-1">
                <span>{roleLabels[currentUser.role]?.label}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </button>

          {isRoleDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white text-foreground rounded-lg border border-border shadow-[0_12px_30px_rgba(33,36,36,0.15)] z-50 p-2 space-y-1">
                <div className="px-3 py-2 border-b border-border/60">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">1-Click Role Switcher (Demo)</p>
                  <p className="text-xs text-text-secondary mt-0.5">Switch active user role instantly:</p>
                </div>

                <div className="space-y-0.5 max-h-64 overflow-y-auto">
                  {allRoleUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleRoleSelect(user.role)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-colors ${
                        currentUser.role === user.role
                          ? 'bg-primary/10 font-bold text-primary'
                          : 'hover:bg-surface text-foreground'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-[10px] text-text-muted">{user.role.toUpperCase()}</div>
                      </div>
                      {currentUser.role === user.role && <ShieldCheck className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </header>
  );
};
