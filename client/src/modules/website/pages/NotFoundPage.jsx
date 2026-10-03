import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  ArrowLeft,
  Compass,
  Calendar,
  ShoppingBag,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { roleHomePath } from '../../../shared/utils/roles';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const portalPath = isAuthenticated && role ? roleHomePath(role) : '/login';

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between selection:bg-[#4A812F] selection:text-white font-sans relative overflow-hidden">
      {/* Light Gradient Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-50/80 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Light Grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"
      />

      {/* Header Logo Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between border-b border-gray-100">
        <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
          <img
            src="/bookmycourt_logo.png"
            alt="BookMyCourt Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>

        <Link
          to="/"
          className="text-xs font-extrabold text-slate-700 hover:text-[#4A812F] bg-slate-100/80 hover:bg-emerald-50 border border-slate-200 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
        >
          <Home className="w-3.5 h-3.5 text-[#4A812F]" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main 404 Content */}
      <main className="relative z-10 max-w-3xl w-full mx-auto px-6 py-12 text-center my-auto space-y-8">
        {/* Out of Bounds Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#4A812F] text-xs font-mono font-black tracking-widest uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#4A812F] animate-pulse" />
          <span>ERR_404 • OUT OF BOUNDS</span>
        </div>

        {/* Big 404 Text */}
        <div className="relative">
          <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-slate-500 drop-shadow-sm">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <span className="text-9xl font-black text-[#4A812F] blur-xs">404</span>
          </div>
        </div>

        {/* Headings & Descriptions */}
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Looks like this shot went <span className="text-[#4A812F]">Out of Bounds!</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed">
            The page or court route you are trying to reach doesn't exist, has been relocated, or is currently unavailable.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-extrabold text-xs tracking-wide border border-slate-200 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#4A812F] hover:bg-[#3b6725] text-white font-extrabold text-xs tracking-wide shadow-md shadow-[#4A812F]/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          {isAuthenticated && (
            <Link
              to={portalPath}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs tracking-wide border border-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#4A812F]" />
              <span>My Portal</span>
            </Link>
          )}
        </div>

        {/* Quick Navigation Cards */}
        <div className="pt-8 border-t border-gray-100 max-w-lg mx-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Popular Club Destinations
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <Link
              to="/courts"
              className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 rounded-2xl text-slate-800 font-bold flex items-center gap-2 transition-all shadow-2xs"
            >
              <Calendar className="w-4 h-4 text-[#4A812F]" />
              <span>Court Booking</span>
            </Link>

            <Link
              to="/shop"
              className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 rounded-2xl text-slate-800 font-bold flex items-center gap-2 transition-all shadow-2xs"
            >
              <ShoppingBag className="w-4 h-4 text-[#4A812F]" />
              <span>Pro Shop</span>
            </Link>

            <Link
              to="/membership"
              className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 rounded-2xl text-slate-800 font-bold flex items-center gap-2 transition-all shadow-2xs col-span-2 sm:col-span-1"
            >
              <HelpCircle className="w-4 h-4 text-[#4A812F]" />
              <span>Memberships</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 text-center text-xs text-slate-500 font-semibold border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2">
          <img src="/bookmycourt_logo.png" alt="Logo" className="h-5 w-auto rounded object-contain" />
          <span>© {new Date().getFullYear()} BookMyCourt. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-600">
          <Link to="/" className="hover:text-[#4A812F] transition-colors">Home</Link>
          <span>•</span>
          <Link to="/courts" className="hover:text-[#4A812F] transition-colors">Courts</Link>
          <span>•</span>
          <Link to="/membership" className="hover:text-[#4A812F] transition-colors">Membership</Link>
        </div>
      </footer>
    </div>
  );
};
