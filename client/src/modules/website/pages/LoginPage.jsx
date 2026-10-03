import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { roleHomePath } from '../../../shared/utils/roles';
import { 
  CheckCircle2, 
  LogIn, 
  AlertCircle, 
  Loader2, 
  Shield, 
  UserCheck, 
  Coffee, 
  UtensilsCrossed, 
  ShoppingBag, 
  User, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

// Seeded demo accounts (backend seed) — all share the same password.
const DEMO_ACCOUNTS = [
  { 
    role: 'OWNER', 
    label: 'Owner / Admin', 
    desc: 'Full Club Oversight, Finance, HR & Reports', 
    login: 'owner@championsclub.com',
    icon: Shield,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  { 
    role: 'FRONT_DESK', 
    label: 'Front Desk Staff', 
    desc: 'Member Check-in, Desk Bookings, CRM Leads', 
    login: 'frontdesk@championsclub.com',
    icon: UserCheck,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  { 
    role: 'BAR_STAFF', 
    label: 'Bar / Cafe Staff', 
    desc: 'Table POS, Food Orders, Member Tabs', 
    login: 'bar@championsclub.com',
    icon: Coffee,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  { 
    role: 'KITCHEN', 
    label: 'Kitchen Chef', 
    desc: 'Kitchen Display Screen (KDS) Live Queue', 
    login: 'kitchen@championsclub.com',
    icon: UtensilsCrossed,
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  { 
    role: 'SHOP_STAFF', 
    label: 'Gear Shop Staff', 
    desc: 'Retail POS, Shared Inventory, Stock-In', 
    login: 'shop@championsclub.com',
    icon: ShoppingBag,
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  },
  { 
    role: 'MEMBER', 
    label: 'Club Member', 
    desc: 'Court Booking, QR Digital Pass, Bar Tab', 
    login: 'member@championsclub.com',
    icon: User,
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200'
  },
];

const DEMO_PASSWORD = 'Password@123';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeQuickRole, setActiveQuickRole] = useState(null);

  const redirectAfter = (user) => {
    const from = location.state?.from;
    navigate(from && from !== '/login' ? from : roleHomePath(user.role), { replace: true });
  };

  const doLogin = async (credentials, roleTag = null) => {
    setError('');
    setSubmitting(true);
    if (roleTag) setActiveQuickRole(roleTag);
    try {
      const user = await login(credentials.login, credentials.password);
      redirectAfter(user);
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials or ensure the database is running.');
      setActiveQuickRole(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.login.trim() || !form.password.trim()) {
      setError('Please enter both login identifier and password');
      return;
    }
    doLogin(form);
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-10 font-sans">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Sign In to <span className="text-emerald-600">The Champions Club</span>
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Access your member workspace, front desk terminal, POS registers, or administrative suite.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Custom Sign In Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-sm">Direct Sign In</h3>
            <span className="text-[11px] font-bold text-slate-400">JWT Authenticated</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl p-3.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Email or Phone</label>
              <input
                type="text"
                autoComplete="username"
                required
                value={form.login}
                onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm transition-all"
                placeholder="e.g. owner@championsclub.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
            >
              {submitting && !activeQuickRole ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Need a membership?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:underline">
                Register as Member
              </Link>
            </p>
          </div>
        </div>

        {/* Right: 1-Click Role Switcher for Hackathon Live Demo */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="font-extrabold text-sm text-white tracking-tight uppercase">
                Hackathon 1-Click Role Switcher
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full">
              Instant JWT Auth
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Click any role to test with seeded credentials. The client automatically signs in, receives real JWT tokens, and opens the respective workspace.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isSelected = activeQuickRole === acc.role;
              return (
                <button
                  key={acc.login}
                  type="button"
                  disabled={submitting}
                  onClick={() => doLogin({ login: acc.login, password: DEMO_PASSWORD }, acc.role)}
                  className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 group relative overflow-hidden ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/80'
                  } disabled:opacity-60`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 group-hover:text-emerald-400 group-hover:bg-slate-700 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${acc.badgeColor}`}>
                      {acc.role}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                      {acc.label}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                      {acc.desc}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Switching to {acc.label}…</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
