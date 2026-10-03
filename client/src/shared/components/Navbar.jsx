import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { currentRole, currentUser, loginAsRole, logout } = useAuth();
  const navigate = useNavigate();

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

        {/* Right Action & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Role Switcher */}
          <select
            value={currentRole}
            onChange={(e) => {
              const role = e.target.value;
              loginAsRole(role);
              if (role === 'OWNER') navigate('/admin');
              else if (role === 'FRONT_DESK') navigate('/staff/frontdesk');
              else if (role === 'BAR_STAFF') navigate('/staff/bar');
              else if (role === 'KITCHEN') navigate('/staff/kitchen');
              else if (role === 'SHOP_STAFF') navigate('/staff/shop');
              else if (role === 'MEMBER') navigate('/member');
              else navigate('/');
            }}
            className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="VISITOR">Visitor (Public)</option>
            <option value="MEMBER">Member Portal</option>
            <option value="FRONT_DESK">Front Desk Staff</option>
            <option value="BAR_STAFF">Bar Staff POS</option>
            <option value="KITCHEN">Kitchen KDS</option>
            <option value="SHOP_STAFF">Shop Staff POS</option>
            <option value="OWNER">Owner / Admin</option>
          </select>

          {currentUser ? (
            <button
              onClick={logout}
              className="text-xs text-slate-500 hover:text-rose-600 font-bold px-3 py-2"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-2xs"
            >
              Member Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
