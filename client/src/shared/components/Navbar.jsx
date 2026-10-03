import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CaretRight, 
  User as UserIcon 
} from '@phosphor-icons/react';
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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-2xs relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-3.5 flex items-center justify-between">
        {/* Main Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/bookmycourt_logo.jpg"
            alt="BookMyCourt Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>

        {/* Clean Component Route Navigation Links (Strictly existing sections on Landing Page) */}
        <nav className="hidden lg:flex items-center gap-6 text-[15px] font-bold text-[#1f2125]">
          <a href="#about" className="hover:text-[#4A812F] transition-colors px-2 py-1.5">
            About
          </a>
          <a href="#plans" className="hover:text-[#4A812F] transition-colors px-2 py-1.5">
            Plans
          </a>
          <a href="#availability" className="hover:text-[#4A812F] transition-colors px-2 py-1.5">
            Availability
          </a>
          <a href="#shop" className="hover:text-[#4A812F] transition-colors px-2 py-1.5">
            Shop
          </a>
          <a href="#contact" className="hover:text-[#4A812F] transition-colors px-2 py-1.5">
            Contact
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to={roleHomePath(role)}
                className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#4A812F]"
              >
                <span className="hidden sm:block text-right leading-tight">
                  <span className="block font-extrabold text-gray-900">{currentUser?.name}</span>
                  <span className="block text-[10px] text-gray-400 uppercase tracking-wide">{role}</span>
                </span>
                <div className="w-8 h-8 bg-[#4A812F]/10 text-[#4A812F] flex items-center justify-center font-bold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-rose-600 font-bold px-2 py-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm font-extrabold text-gray-800 hover:text-[#4A812F] transition-colors px-2 py-1"
            >
              <UserIcon weight="fill" className="w-4.5 h-4.5 text-gray-800" />
              <span>Login</span>
            </Link>
          )}

          <a
            href="#trial"
            className="px-6 py-2.5 bg-[#1f2125] hover:bg-black text-white text-sm font-extrabold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>Book a Trial</span>
            <CaretRight weight="bold" className="w-4 h-4 text-emerald-400" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
