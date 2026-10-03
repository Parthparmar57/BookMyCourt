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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-slate-50/60 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
          <p className="text-xs text-slate-500">
            Enter your credentials to access your club account
          </p>
        </div>

        {/* 1. Main Sign In Form (Email, Password & Submit) */}
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all placeholder:text-slate-400"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            {submitting && !activeRole && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Sign In</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center pt-1">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider absolute">
            or quick demo access
          </span>
        </div>

        {/* 2. Demo Roles Under Email & Password */}
        <div className="space-y-2 pt-1">
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
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40'
                  } disabled:opacity-60`}
                >
                  {isSelected ? 'Signing in…' : acc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
              Register as Member
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
