import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  ChevronRight
} from 'lucide-react';

const InstagramIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const Footer = () => {
  return (
    <footer className="bg-[#141518] text-gray-400 pt-16 pb-12 border-t border-gray-800 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
        {/* 1. TOP 5 NAVIGATION COLUMNS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-8 border-b border-gray-800/80">
          {/* Column 1: TOP FEATURES */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono">
              TOP FEATURES
            </h4>
            <ul className="space-y-1.5 text-[13px] font-medium text-gray-400">
              <li><Link to="/availability" className="hover:text-white transition-colors">Public Booking</Link></li>
              <li><Link to="/courts" className="hover:text-white transition-colors">Court Reservations</Link></li>
              <li><Link to="/membership" className="hover:text-white transition-colors">Memberships</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Lessons & Programming</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Mobile App</Link></li>
              <li><Link to="/trial" className="hover:text-emerald-400 font-bold transition-colors">All Features →</Link></li>
            </ul>
          </div>

          {/* Column 2: SOLUTIONS */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono">
              SOLUTIONS
            </h4>
            <ul className="space-y-1.5 text-[13px] font-medium text-gray-400">
              <li><Link to="/admin" className="hover:text-white transition-colors">Club Owners</Link></li>
              <li><Link to="/staff/frontdesk" className="hover:text-white transition-colors">Front Desk & Staff</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Instructors & Pros</Link></li>
              <li><Link to="/member" className="hover:text-white transition-colors">Players</Link></li>
              <li><Link to="/courts" className="hover:text-white transition-colors">Tennis, Pickleball & Padel</Link></li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono">
              COMPANY
            </h4>
            <ul className="space-y-1.5 text-[13px] font-medium text-gray-400">
              <li><Link to="/trial" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Events & Shows</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">BookMyCourt Academy</Link></li>
              <li><Link to="/trial" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: RESOURCES */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono">
              RESOURCES
            </h4>
            <ul className="space-y-1.5 text-[13px] font-medium text-gray-400">
              <li><Link to="/availability" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Blog & Ebooks</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">State of the Industry</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Case Studies</Link></li>
            </ul>
          </div>

          {/* Column 5: FREE TOOLS */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono">
              FREE TOOLS
            </h4>
            <ul className="space-y-1.5 text-[13px] font-medium text-gray-400">
              <li><Link to="/trial" className="hover:text-white transition-colors">Free Tools Hub</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Revenue Estimator</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Pricing Calculator</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Utilization Planner</Link></li>
              <li><Link to="/trial" className="hover:text-white transition-colors">Facility Scorecard</Link></li>
            </ul>
          </div>
        </div>

        {/* 2. MIDDLE CONTACT & SOCIAL STRIP */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-10 border-b border-gray-800/80">
          {/* Email & Phone */}
          <div className="flex flex-wrap items-center gap-8 text-sm font-bold text-white">
            <a href="mailto:info@bookmycourt.com" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
              <Mail className="w-4.5 h-4.5 text-emerald-400" />
              <span>info@bookmycourt.com</span>
            </a>
            <a href="tel:+18444073737" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
              <Phone className="w-4.5 h-4.5 text-emerald-400" />
              <span>+1 (844) 407-3737</span>
            </a>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-4 text-xs font-bold text-gray-300">
            <span>Follow BookMyCourt</span>
            <div className="flex items-center gap-2.5">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#4A812F] text-white flex items-center justify-center transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#4A812F] text-white flex items-center justify-center transition-colors">
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#4A812F] text-white flex items-center justify-center transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#4A812F] text-white flex items-center justify-center transition-colors">
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM BRANDING & STORE DOWNLOADS */}
        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Logo & Sports Partner Badges */}
            <div className="flex flex-wrap items-center gap-8">
              <Link to="/">
                <img
                  src="/bookmycourt_logo.jpg"
                  alt="BookMyCourt Logo"
                  className="h-10 sm:h-12 w-auto object-contain rounded bg-white p-1"
                />
              </Link>

              {/* Partner Badges */}
              <div className="flex flex-wrap items-center gap-6 opacity-60 text-[11px] font-black tracking-widest text-gray-300 uppercase font-mono">
                <span>USTA</span>
                <span>IAPPF</span>
                <span>USA PICKLEBALL</span>
                <span>RSPA</span>
                <span>PPR</span>
              </div>
            </div>

            {/* App Store Download Badges */}
            <div className="flex items-center gap-4">
              <a href="#appstore" className="hover:scale-105 transition-transform">
                <img
                  src="/Frame-44-1-300x116.webp"
                  alt="Download on App Store"
                  className="h-10 w-auto object-contain rounded-lg shadow-sm"
                />
              </a>
              <a href="#playstore" className="hover:scale-105 transition-transform">
                <img
                  src="/Frame-43-2-300x116.webp"
                  alt="Get it on Google Play"
                  className="h-10 w-auto object-contain rounded-lg shadow-sm"
                />
              </a>
            </div>
          </div>

          {/* Privacy & Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-medium border-t border-gray-800/80 pt-6 gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <a href="#" className="hover:text-gray-300 transition-colors">App Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-gray-300 transition-colors">Website Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-gray-300 transition-colors">Acceptable Use Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms of Use</a>
              <span>|</span>
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Requests</a>
            </div>

            <div className="text-right">
              <p>© 2016–2026 BookMyCourt.com</p>
              <p className="text-[10px] text-gray-600 mt-0.5">100 Island Cottage Way, St. Augustine, FL 32080</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

