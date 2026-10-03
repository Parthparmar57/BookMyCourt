import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../context/AuthContext';
import { roleHomePath } from '../../../shared/utils/roles';
import { registerSchema, applyServerErrors } from '../../../shared/validation/schemas';
import { CheckCircle2, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', phone: '', password: '' } });

  const onSubmit = async (values) => {
    try {
      const user = await registerUser(values);
      navigate(roleHomePath(user.role), { replace: true }); // MEMBER -> /member
    } catch (err) {
      applyServerErrors(err, setError);
    }
  };

  return (
    <div className="py-16 px-4 max-w-md mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-600">Join as a member — book courts, shop and more.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 space-y-4" noValidate>
        {errors.root && (
          <div className="flex items-start gap-2 bg-rose-50 text-rose-700 text-sm rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <Field label="Full Name" placeholder="Rohan Gupta" error={errors.name} {...register('name')} autoComplete="name" />
        <Field label="Email" type="email" placeholder="you@example.com" error={errors.email} {...register('email')} autoComplete="email" />
        <Field label="Mobile Number" placeholder="9876543210" error={errors.phone} {...register('phone')} autoComplete="tel" />
        <Field label="Password" type="password" placeholder="At least 8 characters" error={errors.password} {...register('password')} autoComplete="new-password" />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

// forwardRef so react-hook-form's register() ref attaches to the input.
const Field = React.forwardRef(({ label, type = 'text', placeholder, error, autoComplete, ...rest }, ref) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-600">{label}</label>
    <input
      ref={ref}
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      {...rest}
      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
        error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
      }`}
    />
    {error && <p className="text-[11px] text-rose-600">{error.message}</p>}
  </div>
));
Field.displayName = 'Field';
