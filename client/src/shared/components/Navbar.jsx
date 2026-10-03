import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp,
  ChevronRight, 
  User as UserIcon,
  Banknote,
  Globe,
  Calendar,
  Smartphone,
  BarChart3,
  Layers,
  GraduationCap,
  ShoppingBag,
  CreditCard,
  Receipt,
  Lock,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { roleHomePath } from '../utils/roles';

export const Navbar = () => {
  const { currentUser, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSegment, setActiveSegment] = useState('clubs');
  const [activeDropdown, setActiveDropdown] = useState(null); // 'product' | 'solutions' | 'resources' | null
  const timeoutRef = useRef(null);

  const handleMouseEnter = (menu) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const productFeatures = [
    { name: 'Court Reservations', icon: Banknote, link: '/courts' },
    { name: 'Public Booking', icon: Globe, link: '/availability' },
    { name: 'Events & Programming', icon: Calendar, link: '#trial' },
    { name: 'Branded Mobile App', icon: Smartphone, link: '#trial' },
    { name: 'Leagues & Ladders', icon: BarChart3, link: '#trial' },
    { name: 'Integrations', icon: Layers, link: '#trial' },
    { name: 'Lessons', icon: GraduationCap, link: '#trial' },
    { name: 'Pro Shop & POS', icon: ShoppingBag, link: '/shop' },
    { name: 'Memberships', icon: CreditCard, link: '/membership' },
    { name: 'Invoicing & Batch Billing', icon: Receipt, link: '/admin' },
    { name: 'Access Control', icon: Lock, link: '/admin' },
    { name: 'Reporting', icon: TrendingUp, link: '/admin' },
  ];

  return (
    <header 
      className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-2xs relative"
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. TOP BLACK SEGMENTED SWITCHER HEADER */}
      <div className="bg-[#121212] text-white text-xs px-4 sm:px-8 lg:px-16 flex items-center h-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveSegment('clubs')}
              className={`px-5 py-2 rounded-t-lg font-bold text-xs transition-all ${
                activeSegment === 'clubs' ? 'bg-white text-[#121212] shadow-sm' : 'text-gray-300 hover:text-white bg-transparent'
              }`}
            >
              For Clubs
            </button>
            <button
              onClick={() => setActiveSegment('players')}
              className={`px-5 py-2 rounded-t-lg font-bold text-xs transition-all ${
                activeSegment === 'players' ? 'bg-white text-[#121212] shadow-sm' : 'text-gray-300 hover:text-white bg-transparent'
              }`}
            >
              For Players
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-[11px] text-gray-300 font-medium">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#4A812F]" /> +91 98200 11223</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#4A812F]" /> sales@bookmycourt.in</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR WITH LOGO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-3.5 flex items-center justify-between">
        {/* Main Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setActiveDropdown(null)}>
          <img
            src="/bookmycourt_logo.jpg"
            alt="BookMyCourt Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>

        {/* Navigation Links with Dropdown Indicators & Direct Section Links */}
        <nav className="hidden lg:flex items-center gap-5 text-[15px] font-medium text-[#4a4d52]">
          {/* PRODUCT DROPDOWN TRIGGER */}
          <div 
            className="relative py-2"
            onMouseEnter={() => handleMouseEnter('product')}
          >
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'product' ? null : 'product')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                activeDropdown === 'product' 
                  ? 'bg-[#EBF7E7] text-[#2d6215] font-extrabold shadow-2xs' 
                  : 'hover:text-[#4A812F]'
              }`}
            >
              <span>Product</span>
              {activeDropdown === 'product' ? (
                <ChevronUp className="w-4 h-4 text-[#2d6215]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* ABOUT CLUB LINK */}
          <a 
            href="#about" 
            className="hover:text-[#4A812F] transition-colors px-2 py-1.5"
            onMouseEnter={() => handleMouseEnter(null)}
          >
            About
          </a>

          {/* PLANS & PRICING LINK */}
          <a 
            href="#plans" 
            className="hover:text-[#4A812F] transition-colors px-2 py-1.5"
            onMouseEnter={() => handleMouseEnter(null)}
          >
            Plans
          </a>

          {/* COURT AVAILABILITY LINK */}
          <a 
            href="#availability" 
            className="hover:text-[#4A812F] transition-colors px-2 py-1.5"
            onMouseEnter={() => handleMouseEnter(null)}
          >
            Availability
          </a>

          {/* PRO SHOP LINK */}
          <a 
            href="#shop" 
            className="hover:text-[#4A812F] transition-colors px-2 py-1.5"
            onMouseEnter={() => handleMouseEnter(null)}
          >
            Shop
          </a>

          {/* CONTACT / ENQUIRY LINK */}
          <a 
            href="#contact" 
            className="hover:text-[#4A812F] transition-colors px-2 py-1.5"
            onMouseEnter={() => handleMouseEnter(null)}
          >
            Contact
          </a>

          {/* SOLUTIONS DROPDOWN TRIGGER */}
          <div 
            className="relative py-2"
            onMouseEnter={() => handleMouseEnter('solutions')}
          >
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'solutions' ? null : 'solutions')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                activeDropdown === 'solutions' 
                  ? 'bg-[#EBF7E7] text-[#2d6215] font-extrabold shadow-2xs' 
                  : 'hover:text-[#4A812F]'
              }`}
            >
              <span>Solutions</span>
              {activeDropdown === 'solutions' ? (
                <ChevronUp className="w-4 h-4 text-[#2d6215]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
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
                <div className="w-8 h-8 rounded-full bg-[#4A812F]/10 text-[#4A812F] flex items-center justify-center font-bold">
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
              <UserIcon className="w-4.5 h-4.5 text-gray-800" />
              <span>Login</span>
            </Link>
          )}

          <a
            href="#trial"
            className="px-5 py-2.5 bg-[#4A812F] hover:bg-[#3d6b27] text-white text-sm font-extrabold rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>Book a Trial</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MEGA DROPDOWN PANELS */}
      {/* ========================================================================= */}

      {/* A. PRODUCT MEGA DROPDOWN (Matches Screenshot 1 Exactly) */}
      {activeDropdown === 'product' && (
        <div 
          className="absolute top-full left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150"
          onMouseEnter={() => handleMouseEnter('product')}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-12 overflow-hidden border-t border-gray-100">
            {/* Left White Area (All Features - 2 Columns) */}
            <div className="col-span-12 lg:col-span-8 p-8 lg:p-10 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <Link 
                  to="/trial" 
                  onClick={() => setActiveDropdown(null)}
                  className="font-black text-base text-[#121212] hover:text-[#4A812F] flex items-center gap-1 tracking-tight"
                >
                  <span>All Features</span>
                  <ChevronRight className="w-4 h-4 text-[#4A812F]" />
                </Link>
              </div>

              {/* 12 Core Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {productFeatures.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <Link
                      key={idx}
                      to={feat.link}
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0 group-hover:bg-[#4A812F] transition-colors shadow-2xs">
                        <Icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <span className="text-[15px] font-extrabold text-[#212424] group-hover:text-[#4A812F] transition-colors">
                        {feat.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Dark Side (Release Highlights) */}
            <div className="col-span-12 lg:col-span-4 bg-[#181818] text-white p-8 lg:p-10 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-gray-800">
                  <h4 className="font-extrabold text-base text-white">Release Highlights</h4>
                  <Link 
                    to="/trial" 
                    onClick={() => setActiveDropdown(null)}
                    className="text-xs font-bold text-gray-300 hover:text-white underline underline-offset-4 flex items-center gap-1"
                  >
                    <span>All Release Notes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-4 pt-6">
                  {/* Highlight Item 1 */}
                  <Link 
                    to="/admin" 
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-800/80 transition-colors group"
                  >
                    <div className="w-16 h-14 rounded-lg overflow-hidden border border-gray-700 shrink-0 bg-gray-900">
                      <img 
                        src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200" 
                        alt="'Pulse' Reporting Dashboard" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      'Pulse' Reporting Dashboard
                    </span>
                  </Link>

                  {/* Highlight Item 2 */}
                  <Link 
                    to="/availability" 
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-800/80 transition-colors group"
                  >
                    <div className="w-16 h-14 rounded-lg overflow-hidden border border-gray-700 shrink-0 bg-gray-900">
                      <img 
                        src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=200" 
                        alt="Public Booking" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      Public Booking
                    </span>
                  </Link>

                  {/* Highlight Item 3 */}
                  <Link 
                    to="/trial" 
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-800/80 transition-colors group"
                  >
                    <div className="w-16 h-14 rounded-lg overflow-hidden border border-gray-700 shrink-0 bg-gray-900">
                      <img 
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=200" 
                        alt="Free Club Growth Tools" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      Free Club Growth Tools
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B. RESOURCES MEGA DROPDOWN (Matches Screenshot 2 Exactly) */}
      {activeDropdown === 'resources' && (
        <div 
          className="absolute top-full left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150"
          onMouseEnter={() => handleMouseEnter('resources')}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-12 overflow-hidden border-t border-gray-100">
            {/* Left White Area (3 Columns) */}
            <div className="col-span-12 lg:col-span-8 p-8 lg:p-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Column 1: LEARN */}
              <div className="space-y-4">
                <span className="text-xs font-black text-gray-400 tracking-wider font-mono uppercase block">
                  LEARN
                </span>
                <ul className="space-y-3 text-[15px] font-bold text-gray-800">
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Blog</Link></li>
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Ebooks</Link></li>
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Webinars</Link></li>
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Case Studies</Link></li>
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Club Growth Flywheel</Link></li>
                </ul>
              </div>

              {/* Column 2: COMPANY */}
              <div className="space-y-4">
                <span className="text-xs font-black text-gray-400 tracking-wider font-mono uppercase block">
                  COMPANY
                </span>
                <ul className="space-y-3 text-[15px] font-bold text-gray-800">
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">About</Link></li>
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Events & Shows</Link></li>
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Catalyst Tour 2026</Link></li>
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">State of the Industry</Link></li>
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">BookMyCourt Academy</Link></li>
                </ul>
              </div>

              {/* Column 3: GET STARTED */}
              <div className="space-y-4">
                <span className="text-xs font-black text-gray-400 tracking-wider font-mono uppercase block">
                  GET STARTED
                </span>
                <ul className="space-y-3 text-[15px] font-bold text-gray-800">
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Grade Your Club</Link></li>
                  <li><Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Contact Sales</Link></li>
                  <li>
                    <Link to="/trial" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors flex items-center gap-1">
                      <span>Help Center</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Dark Side (State of the Industry Card) */}
            <div className="col-span-12 lg:col-span-4 bg-[#181818] text-white p-8 lg:p-10 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-base text-white pb-4 border-b border-gray-800">
                  State of the Industry
                </h4>

                <div className="pt-6">
                  <Link 
                    to="/trial"
                    onClick={() => setActiveDropdown(null)}
                    className="block rounded-2xl overflow-hidden border border-gray-700 bg-gradient-to-r from-gray-900 to-[#2d6215] p-5 shadow-xl hover:scale-[1.02] transition-transform group"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-300 font-bold mb-3">
                      <span>IAPPF x BookMyCourt</span>
                      <span className="px-2 py-0.5 rounded bg-white text-gray-900 text-[10px] font-black">2026</span>
                    </div>

                    <h5 className="text-xl font-black text-white leading-tight mb-4 group-hover:text-emerald-300 transition-colors">
                      State of the Industry <br />
                      <span className="text-emerald-400 font-bold text-base">Racquet & Paddle Sports Facilities</span>
                    </h5>

                    <div className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-black/40 px-3 py-1.5 rounded-lg border border-white/20">
                      <span>Learn More</span>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* C. SOLUTIONS MEGA DROPDOWN */}
      {activeDropdown === 'solutions' && (
        <div 
          className="absolute top-full left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150"
          onMouseEnter={() => handleMouseEnter('solutions')}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-12 overflow-hidden border-t border-gray-100">
            {/* Left White Area (2 Columns) */}
            <div className="col-span-12 lg:col-span-8 p-8 lg:p-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Column 1: BY FACILITY TYPE */}
              <div className="space-y-4">
                <span className="text-xs font-black text-gray-400 tracking-wider font-mono uppercase block">
                  BY FACILITY TYPE
                </span>
                <ul className="space-y-3.5 text-[15px] font-bold text-gray-800">
                  <li><Link to="/courts" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Tennis Clubs</Link></li>
                  <li><Link to="/courts" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Padel Arenas</Link></li>
                  <li><Link to="/courts" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Pickleball Hubs</Link></li>
                  <li><Link to="/courts" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Badminton Facilities</Link></li>
                  <li><Link to="/courts" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Squash Centers</Link></li>
                </ul>
              </div>

              {/* Column 2: BY ROLE */}
              <div className="space-y-4">
                <span className="text-xs font-black text-gray-400 tracking-wider font-mono uppercase block">
                  BY ROLE & ORGANIZATION
                </span>
                <ul className="space-y-3.5 text-[15px] font-bold text-gray-800">
                  <li><Link to="/admin" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Owner Executive Suite</Link></li>
                  <li><Link to="/staff/frontdesk" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Front Desk Operations</Link></li>
                  <li><Link to="/staff/shop" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Pro Shop & Inventory</Link></li>
                  <li><Link to="/staff/bar" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Bar & Cafeteria POS</Link></li>
                  <li><Link to="/member" onClick={() => setActiveDropdown(null)} className="hover:text-[#4A812F] transition-colors">Member Self-Serve Portal</Link></li>
                </ul>
              </div>
            </div>

            {/* Right Dark Side */}
            <div className="col-span-12 lg:col-span-4 bg-[#181818] text-white p-8 lg:p-10 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-base text-white pb-4 border-b border-gray-800">
                  Club ROI & Demo
                </h4>

                <div className="pt-6 space-y-4">
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">ROI CALCULATOR</span>
                    <h5 className="text-sm font-extrabold text-white">Calculate your club's revenue potential</h5>
                    <p className="text-xs text-gray-400">Estimate labor savings and increased court utilization in seconds.</p>
                  </div>
                  <Link 
                    to="/trial"
                    onClick={() => setActiveDropdown(null)}
                    className="block text-center py-3 bg-[#4A812F] hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md"
                  >
                    Schedule Live Demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


