import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { Loader2, CheckCircle2, AlertCircle, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [form, setForm] = useState({
    token: tokenParam,
    email: emailParam,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        token: form.token || undefined,
        otp: form.otp || undefined,
        email: form.email || undefined,
        newPassword: form.newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to reset password. The link or code may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-9 space-y-6 relative overflow-hidden">
        
        {/* Top Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex flex-col items-center gap-1.5 group">
            <img
              src="/bookmycourt_logo.jpg"
              alt="Book My Court"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <div className="space-y-0.5 pt-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Reset Password
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Create a new, strong password for your Champions Club account
            </p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Password Reset Successful!</h2>
              <p className="text-xs text-slate-500">
                Your password has been updated. Redirecting you to the login screen...
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition-all"
              >
                Go to Sign In Now &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!form.token && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. member@championsclub.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    6-Digit Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={form.otp}
                    onChange={(e) => setForm((prev) => ({ ...prev, otp: e.target.value.trim() }))}
                    placeholder="e.g. 123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm tracking-widest text-center font-mono font-bold text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.newPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <KeyRound className="w-4 h-4" />
              <span>Update Password</span>
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
