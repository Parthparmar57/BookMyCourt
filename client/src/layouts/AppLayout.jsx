import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../shared/components/Sidebar';
import { Topbar } from '../shared/components/Topbar';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';

const LayoutContent = () => {
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-slate-50 font-sans text-slate-900 relative">
      {/* Mobile Backdrop Overlay when Sidebar is Open on small screens */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-2xs lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Responsive Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AppLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};
