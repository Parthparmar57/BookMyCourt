import React from 'react';
import { Outlet } from 'react-router-dom';

export const KitchenLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Outlet />
    </div>
  );
};

