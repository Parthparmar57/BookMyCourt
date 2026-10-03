import React from 'react';
import { HomePage } from '../../modules/website/pages/HomePage';
import { Navbar } from '../../shared/components/Navbar';
import { Footer } from '../../shared/components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <HomePage />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
