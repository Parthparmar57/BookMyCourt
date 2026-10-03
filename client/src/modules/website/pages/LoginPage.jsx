import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { roleHomePath } from '../../../shared/utils/roles';
import { Loader2, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'OWNER', label: 'Owner / Admin', login: 'owner@championsclub.com' },
  { role: 'FRONT_DESK', label: 'Front Desk', login: 'frontdesk@championsclub.com' },
  { role: 'BAR_STAFF', label: 'Bar Staff', login: 'bar@championsclub.com' },
  { role: 'KITCHEN', label: 'Kitchen', login: 'kitchen@championsclub.com' },
  { role: 'SHOP_STAFF', label: 'Shop Staff', login: 'shop@championsclub.com' },
  { role: 'MEMBER', label: 'Member', login: 'member@championsclub.com' },
];

const DEMO_PASSWORD = 'Password@123';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeRole, setActiveRole] = useState(null);

  const redirectAfter = (user) => {
    const from = location.state?.from;
    navigate(from && from !== '/login' ? from : roleHomePath(user.role), { replace: true });
  };

  const doLogin = async (credentials, roleTag = null) => {
    setError('');
    setSubmitting(true);
    if (roleTag) setActiveRole(roleTag);
    try {
      const user = await login(credentials.login, credentials.password);
      redirectAfter(user);
    } catch (err) {
      setError(err?.message || 'Invalid credentials. Please verify your email and password.');
      setActiveRole(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.login.trim() || !form.password.trim()) {
      setError('Please enter both your email/phone and password');
      return;
    }
    doLogin(form);
  };

  const handleRoleSelect = (acc) => {
    setForm({ login: acc.login, password: DEMO_PASSWORD });
    doLogin({ login: acc.login, password: DEMO_PASSWORD }, acc.role);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-9 space-y-6 relative overflow-hidden">
        
        {/* Top Emerald Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        {/* Brand Header with Book My Court Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex flex-col items-center gap-1.5 group">
            <img
              src="/bookmycourt_logo.jpg"
              alt="Book My Court"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            
          </Link>
          <div className="space-y-0.5 pt-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In</h1>
            <p className="text-xs text-slate-500 font-medium">
              Enter your credentials to access your club account
            </p>
          </div>
        </div>

        {/* Main Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Email or Phone
            </label>
            <input
              type="text"
              autoComplete="username"
              required
              value={form.login}
              onChange={(e) => setForm((prev) => ({ ...prev, login: e.target.value }))}
              placeholder="e.g. owner@championsclub.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
            </div>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {submitting && !activeRole && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Sign In</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center pt-1">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold absolute">
            or quick demo access
          </span>
        </div>

        {/* Demo Roles Under Email & Password */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Demo Roles (1-Click Login)</span>
            <span className="text-slate-400 font-normal">Password: {DEMO_PASSWORD}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = activeRole === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRoleSelect(acc)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50'
                  } disabled:opacity-60`}
                >
                  {isSelected ? 'Signing in…' : acc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Register as Member
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
