import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { roleHomePath } from '../../../shared/utils/roles';
import { CheckCircle2, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

// Mirrors the backend registerUserSchema so we fail fast before the request.
const PHONE_RE = /^[6-9]\d{9}$/;

const validate = ({ name, email, phone, password }) => {
  if (!name || name.trim().length < 2) return 'Name must be at least 2 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  if (!PHONE_RE.test(phone)) return 'Enter a valid 10-digit mobile number (starts 6-9).';
  if (!password || password.length < 8) return 'Password must be at least 8 characters.';
  return '';
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors(null);

    const clientError = validate(form);
    if (clientError) {
      setError(clientError);
      return;
    }

    setSubmitting(true);
    try {
      const user = await register(form);
      navigate(roleHomePath(user.role), { replace: true }); // MEMBER -> /member
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
      if (err?.errors) setFieldErrors(err.errors);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (key) => fieldErrors?.[key]?.[0];

  return (
    <div className="py-16 px-4 max-w-md mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-600">Join as a member — book courts, shop and more.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 space-y-4">
        {error && (
          <div className="flex items-start gap-2 bg-rose-50 text-rose-700 text-sm rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Field label="Full Name" value={form.name} onChange={update('name')} placeholder="Rohan Gupta" error={fieldError('name')} autoComplete="name" />
        <Field label="Email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" error={fieldError('email')} autoComplete="email" />
        <Field label="Mobile Number" value={form.phone} onChange={update('phone')} placeholder="9876543210" error={fieldError('phone')} autoComplete="tel" />
        <Field label="Password" type="password" value={form.password} onChange={update('password')} placeholder="At least 8 characters" error={fieldError('password')} autoComplete="new-password" />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

const Field = ({ label, type = 'text', value, onChange, placeholder, error, autoComplete }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-600">{label}</label>
    <input
      type={type}
      required
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
        error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
      }`}
    />
    {error && <p className="text-[11px] text-rose-600">{error}</p>}
  </div>
);
