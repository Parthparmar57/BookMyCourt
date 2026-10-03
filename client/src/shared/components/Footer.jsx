import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Heart, Shield, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                BOOK<span className="text-emerald-500">MY</span>COURT
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              The all-in-one digital operating system built for tennis, pickleball, badminton, and padel clubs. Powering court reservations, point-of-sale, cafeteria, and memberships.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> ISO 27001 Certified</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> GST Compliant</div>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courts" className="hover:text-white transition-colors">Court Booking Grid</Link></li>
              <li><Link to="/membership" className="hover:text-white transition-colors">Membership Management</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Gear Shop POS</Link></li>
              <li><Link to="/availability" className="hover:text-white transition-colors">Live 7-Day Matrix</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Roles & Access</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/admin" className="hover:text-emerald-400 transition-colors">Owner Executive Suite</Link></li>
              <li><Link to="/staff/frontdesk" className="hover:text-emerald-400 transition-colors">Front Desk Portal</Link></li>
              <li><Link to="/staff/bar" className="hover:text-emerald-400 transition-colors">Bar & Cafe POS</Link></li>
              <li><Link to="/staff/kitchen" className="hover:text-emerald-400 transition-colors">Kitchen Display (KDS)</Link></li>
              <li><Link to="/member" className="hover:text-emerald-400 transition-colors">Member Self-Serve</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Contact Us</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /> +91 (022) 4900 8800</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" /> sales@bookmycourt.com</div>
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Sports Complex Hub, Bandra West, Mumbai, Maharashtra 400050</div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BookMyCourt Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
