import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../shared/components/Sidebar';
import { Topbar } from '../shared/components/Topbar';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
