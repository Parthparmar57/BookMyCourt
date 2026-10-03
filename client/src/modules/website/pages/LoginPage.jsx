import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { roleHomePath } from '../../../shared/utils/roles';
import { authService } from '../../../services/auth.service';
import { Loader2, AlertCircle, Mail, X, CheckCircle2 } from 'lucide-react';

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

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(null);

  const redirectAfter = (user) => {
    navigate(roleHomePath(user.role), { replace: true });
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess(null);
    setForgotLoading(true);

    try {
      const result = await authService.forgotPassword({ login: forgotEmail.trim() });
      setForgotSuccess(result);
    } catch (err) {
      setForgotError(
        err?.response?.data?.message || err?.message || 'Failed to send password reset email.'
      );
    } finally {
      setForgotLoading(false);
    }
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
              src="/bookmycourt_logo.png"
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
              <button
                type="button"
                onClick={() => {
                  setForgotError('');
                  setForgotSuccess(null);
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${isSelected
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3 border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Forgot Password</h3>
                <p className="text-xs text-slate-500">We'll send you a password reset email & code</p>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Reset Email Dispatched!</span>
                  </div>
                  <p className="leading-relaxed">
                    A secure password reset link and verification code have been sent to{' '}
                    <strong>{forgotSuccess.emailMasked || forgotEmail}</strong>.
                  </p>
                  {forgotSuccess.otpCode && (
                    <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700">Verification Code (OTP):</span>
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                        {forgotSuccess.otpCode}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/reset-password?email=${encodeURIComponent(forgotEmail)}&token=${forgotSuccess.resetToken || ''}`}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl text-center shadow-md transition-all cursor-pointer"
                  >
                    Proceed to Reset Password &rarr;
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Registered Email or Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. member@championsclub.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {forgotLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Reset Email</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
