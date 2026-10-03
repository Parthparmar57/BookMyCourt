import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { roleHomePath } from '../utils/roles';

export const Navbar = () => {
  const { currentUser, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Brand Logo matching new screenshot */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md group-hover:bg-emerald-600 transition-colors">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">
              BOOK<span className="text-emerald-600">MY</span>COURT
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">
              DIGITAL CLUB OS
            </span>
          </div>
        </Link>

        {/* Center Links matching new screenshot */}
        <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-semibold text-slate-700">
          <Link to="/courts" className="hover:text-slate-900 transition-colors">Sports & Courts</Link>
          <Link to="/availability" className="hover:text-slate-900 transition-colors">Live Availability</Link>
          <Link to="/membership" className="hover:text-slate-900 transition-colors">Membership Tiers</Link>
          <Link to="/shop" className="hover:text-slate-900 transition-colors">Gear Shop</Link>
          <Link to="/trial" className="hover:text-slate-900 transition-colors">Club Experience</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to={roleHomePath(role)}
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                <span className="hidden sm:block text-right leading-tight">
                  <span className="block font-bold text-slate-900">{currentUser?.name}</span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wide">{role}</span>
                </span>
                {currentUser?.avatar && (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-rose-600 font-bold px-3 py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-2xs"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-2xs"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
