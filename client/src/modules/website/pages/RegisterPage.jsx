import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../context/AuthContext';
import { roleHomePath } from '../../../shared/utils/roles';
import { registerSchema, applyServerErrors } from '../../../shared/validation/schemas';
import { AlertCircle, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '' }
  });

  const onSubmit = async (values) => {
    try {
      const user = await registerUser(values);
      navigate(roleHomePath(user.role), { replace: true });
    } catch (err) {
      applyServerErrors(err, setError);
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-xs text-slate-500 font-medium">
              Join as a club member — book courts, shop gear & track your tab
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {errors.root && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errors.root.message}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Full Name
            </label>
            <input
              type="text"
              autoComplete="name"
              placeholder="e.g. Aryan Malhotra"
              {...register('name')}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${errors.name
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
            />
            {errors.name && <p className="text-[11px] text-rose-600 font-medium">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="e.g. aryan@example.com"
              {...register('email')}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${errors.email
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
            />
            {errors.email && <p className="text-[11px] text-rose-600 font-medium">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Mobile Number (10 digits)
            </label>
            <input
              type="tel"
              autoComplete="tel"
              placeholder="9876543210"
              {...register('phone')}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${errors.phone
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
            />
            {errors.phone && <p className="text-[11px] text-rose-600 font-medium">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Password (min. 8 characters)
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${errors.password
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
            />
            {errors.password && <p className="text-[11px] text-rose-600 font-medium">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account…</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
