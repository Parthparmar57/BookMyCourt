import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { roleHomePath } from '../../../shared/utils/roles';
import { CheckCircle2, LogIn, AlertCircle, Loader2 } from 'lucide-react';

// Seeded demo accounts (backend seed) — all share the same password.
const DEMO_ACCOUNTS = [
  { label: 'Owner / Admin', login: 'owner@championsclub.com' },
  { label: 'Front Desk', login: 'frontdesk@championsclub.com' },
  { label: 'Bar Staff', login: 'bar@championsclub.com' },
  { label: 'Kitchen', login: 'kitchen@championsclub.com' },
  { label: 'Shop Staff', login: 'shop@championsclub.com' },
  { label: 'Member', login: 'member@championsclub.com' },
];
const DEMO_PASSWORD = 'Password@123';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectAfter = (user) => {
    const from = location.state?.from;
    navigate(from && from !== '/login' ? from : roleHomePath(user.role), { replace: true });
  };

  const doLogin = async (credentials) => {
    setError('');
    setSubmitting(true);
    try {
      const user = await login(credentials.login, credentials.password);
      redirectAfter(user);
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin(form);
  };

  return (
    <div className="py-16 px-4 max-w-md mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Sign in to BookMyCourt</h1>
        <p className="text-sm text-slate-600">Email or phone and your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 space-y-4">
        {error && (
          <div className="flex items-start gap-2 bg-rose-50 text-rose-700 text-sm rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600">Email or Phone</label>
          <input
            type="text"
            autoComplete="username"
            required
            value={form.login}
            onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-center text-xs text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Create a member account
          </Link>
        </p>
      </form>

      {/* Demo quick-login — uses the real auth flow with seeded accounts. */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-wide">
          Demo accounts (password: {DEMO_PASSWORD})
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.login}
              type="button"
              disabled={submitting}
              onClick={() => doLogin({ login: acc.login, password: DEMO_PASSWORD })}
              className="text-xs font-semibold text-slate-700 bg-white hover:border-emerald-500 border border-slate-200 rounded-xl px-3 py-2 transition-colors disabled:opacity-60"
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
