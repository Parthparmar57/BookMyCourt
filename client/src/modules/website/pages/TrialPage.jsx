import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Send, AlertCircle, Loader2 } from 'lucide-react';
import { useBookTrial } from '../../../hooks/useCrm';
import { trialSchema, applyServerErrors } from '../../../shared/validation/schemas';
import { CustomSelect } from '../../../shared/components/CustomSelect';

const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => `${String(6 + i).padStart(2, '0')}:00`);

export const TrialPage = () => {
  const bookTrial = useBookTrial();
  const [submittedPhone, setSubmittedPhone] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(trialSchema),
    defaultValues: { name: '', phone: '', email: '', sport: 'Tennis', preferredDate: '', preferredTime: '07:00' },
  });

  const onSubmit = async (values) => {
    try {
      await bookTrial.mutateAsync({
        name: values.name,
        phone: values.phone,
        sport: values.sport,
        preferredDate: values.preferredDate,
        preferredTime: values.preferredTime,
        ...(values.email ? { email: values.email } : {}),
      });
      setSubmittedPhone(values.phone);
    } catch (err) {
      applyServerErrors(err, setError);
    }
  };

  const err = (name) => errors[name]?.message;

  return (
    <div className="py-16 px-4 max-w-xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
            FREE TRIAL SESSION
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">Book a Trial Court Session</h1>
          <p className="text-xs text-slate-600">Experience BookMyCourt facilities and software demo first-hand.</p>
        </div>

        {isSubmitSuccessful ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Trial Request Submitted!</h3>
            <p className="text-xs text-slate-600">Our club concierge will contact you on <strong>{submittedPhone}</strong> to confirm your trial slot.</p>
            <button onClick={() => reset()} className="text-xs font-bold text-emerald-700 underline pt-2">Submit another request</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-medium text-slate-700" noValidate>
            {errors.root && (
              <div className="flex items-start gap-2 bg-rose-50 text-rose-700 text-xs rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            <div>
              <label className="block mb-1 font-bold text-slate-900">Full Name *</label>
              <input {...register('name')} placeholder="e.g. Rahul Sharma" className={inputCls(err('name'))} />
              {err('name') && <p className="text-[11px] text-rose-600 mt-1">{err('name')}</p>}
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Phone Number (10 Digits) *</label>
              <input {...register('phone')} placeholder="9820123456" className={inputCls(err('phone'))} />
              {err('phone') && <p className="text-[11px] text-rose-600 mt-1">{err('phone')}</p>}
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Email Address *</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className={inputCls(err('email'))} />
              {err('email') && <p className="text-[11px] text-rose-600 mt-1">{err('email')}</p>}
            </div>


            <div>
              <label className="block mb-1 font-bold text-slate-900">Preferred Sport</label>
              <CustomSelect
                value={watch('sport') || 'Tennis'}
                onChange={(e) => setValue('sport', e.target.value)}
                options={[
                  { value: 'Tennis', label: 'Tennis' },
                  { value: 'Badminton', label: 'Badminton' },
                  { value: 'Padel', label: 'Padel' },
                  { value: 'Cricket', label: 'Cricket' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-bold text-slate-900">Preferred Date *</label>
                <input {...register('preferredDate')} type="date" className={inputCls(err('preferredDate'))} />
                {err('preferredDate') && <p className="text-[11px] text-rose-600 mt-1">{err('preferredDate')}</p>}
              </div>
              <div>
                <label className="block mb-1 font-bold text-slate-900">Preferred Time *</label>
                <CustomSelect
                  value={watch('preferredTime') || TIME_SLOTS[0]}
                  onChange={(e) => setValue('preferredTime', e.target.value)}
                  options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-400" />}
              <span>Submit Trial Request</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const inputCls = (error) =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${
    error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
  }`;
