import React from 'react';
import { Outlet } from 'react-router-dom';

export const KitchenLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased">
      <Outlet />
    </div>
  );
};
