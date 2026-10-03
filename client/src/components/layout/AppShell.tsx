import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../context/AuthContext';

export interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  isPublic?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, pageTitle, isPublic = false }) => {
  const { currentUser } = useAuth();

  if (isPublic || currentUser.role === 'visitor') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {children}
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0">
        <Topbar pageTitle={pageTitle} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
