import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../shared/components/Navbar';
import { Footer } from '../shared/components/Footer';
import { FloatingChatWidget } from '../shared/components/FloatingChatWidget';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingChatWidget />
    </div>
  );
};
