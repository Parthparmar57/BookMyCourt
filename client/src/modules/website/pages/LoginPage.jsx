import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Shield, UserCheck, Coffee, Utensils, ShoppingBag, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { loginAsRole } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = (role, path) => {
    loginAsRole(role);
    navigate(path);
  };

  return (
    <div className="py-16 px-4 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Unified Multi-Role Login</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Select any role below to launch the role-specific workspace instantly (Senior Frontend PERN Demo).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Owner */}
        <div
          onClick={() => handleSelectRole('OWNER', '/admin')}
          className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition-all cursor-pointer border border-slate-800 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Owner / Admin</h3>
          <p className="text-xs text-slate-400">Executive dashboard, revenue split charts, staff HR, full club config & reports.</p>
          <button className="text-xs font-bold text-emerald-400">Login as Owner →</button>
        </div>

        {/* Front Desk */}
        <div
          onClick={() => handleSelectRole('FRONT_DESK', '/staff/frontdesk')}
          className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 hover:border-emerald-500 hover:scale-105 transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Front Desk Staff</h3>
          <p className="text-xs text-slate-500">Fast member search (&lt; 1s), court booking grid, member 360° profile & renewal.</p>
          <button className="text-xs font-bold text-blue-600">Login as Front Desk →</button>
        </div>

        {/* Bar Staff */}
        <div
          onClick={() => handleSelectRole('BAR_STAFF', '/staff/bar')}
          className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 hover:border-emerald-500 hover:scale-105 transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Coffee className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Bar Staff POS</h3>
          <p className="text-xs text-slate-500">Touchscreen table layout, running member tabs, split UPI payments.</p>
          <button className="text-xs font-bold text-amber-600">Login as Bar Staff →</button>
        </div>

        {/* Kitchen */}
        <div
          onClick={() => handleSelectRole('KITCHEN', '/staff/kitchen')}
          className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 hover:border-emerald-500 hover:scale-105 transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Kitchen Display (KDS)</h3>
          <p className="text-xs text-slate-500">High-contrast 3-column ticket screen (NEW ➔ PREPARING ➔ SERVED).</p>
          <button className="text-xs font-bold text-rose-600">Open Kitchen Feed →</button>
        </div>

        {/* Shop Staff */}
        <div
          onClick={() => handleSelectRole('SHOP_STAFF', '/staff/shop')}
          className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 hover:border-emerald-500 hover:scale-105 transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Shop Staff POS</h3>
          <p className="text-xs text-slate-500">Omnichannel stock management, low-stock warnings, counter retail sales.</p>
          <button className="text-xs font-bold text-purple-600">Login as Shop Staff →</button>
        </div>

        {/* Member */}
        <div
          onClick={() => handleSelectRole('MEMBER', '/member')}
          className="bg-emerald-900 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition-all cursor-pointer border border-emerald-800 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold">
            QR
          </div>
          <h3 className="font-bold text-lg">Member Portal</h3>
          <p className="text-xs text-slate-300">Self-serve court booking with plan discounts, active bar tab, digital QR ID card.</p>
          <button className="text-xs font-bold text-emerald-300">Login as Member →</button>
        </div>
      </div>
    </div>
  );
};
