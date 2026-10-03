import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMembers, usePlans, useCreateMember } from '../../../hooks/useMembership';
import { formatCurrency, formatPhone } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { memberSchema, applyServerErrors } from '../../../shared/validation/schemas';
import { Search, UserPlus, AlertCircle, X, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Normalize a server member (fields live on the user/plan relations) into a flat
// view model for the table and card.
const toView = (m) => ({
  id: m.id,
  memberNo: m.memberNo,
  name: m.user?.name || '—',
  phone: m.user?.phone || '',
  email: m.user?.email || '',
  planName: m.plan?.name || '—',
  status: m.status,
  qrCode: m.qrCode,
  tabBalance: m.activeTabBalance ?? 0,
  avatar: `https://ui-avatars.com/api/?background=10b981&color=fff&name=${encodeURIComponent(m.user?.name || 'M')}`,
});

export const MembersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const membersQuery = useMembers(searchQuery.trim() ? { q: searchQuery.trim() } : {});
  const { data: plans = [] } = usePlans();
  const createMember = useCreateMember();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: '', phone: '', email: '', dob: '', planId: '', startDate: new Date().toISOString().split('T')[0] },
  });

  const planId = watch('planId');

  // Default the plan dropdown to the first plan once plans load.
  useEffect(() => {
    if (plans.length && !planId) setValue('planId', plans[0].id);
  }, [plans, planId, setValue]);

  const onSubmit = async (values) => {
    // Client-side age gate for age-limited plans (server also enforces BR6).
    const plan = plans.find((p) => p.id === values.planId);
    if (plan?.maxAge && values.dob) {
      const age = Math.floor((Date.now() - new Date(values.dob).getTime()) / (365.25 * 24 * 3600 * 1000));
      if (age >= plan.maxAge) {
        setError('planId', { type: 'business', message: `${plan.name} is restricted to members under ${plan.maxAge}.` });
        return;
      }
    }
    try {
      const created = await createMember.mutateAsync(values);
      setShowAddModal(false);
      reset();
      setSelectedMember(toView(created));
    } catch (err) {
      applyServerErrors(err, setError);
    }
  };

  const fieldErr = (name) => errors[name]?.message;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Member Directory & Profiles</h1>
          <p className="text-xs text-slate-500">Fast search by Name, Phone, Member No. or QR code scan.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Member</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone, member no. (e.g. Rohan, 9876543210, MEM-001001)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none shadow-xs"
        />
      </div>

      {/* Member Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                <th className="p-4">Member No.</th>
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Plan Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4">Bar Tab Balance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <QueryState
                query={membersQuery}
                loading={<tr><td colSpan={7} className="p-6 text-center text-slate-400"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading members…</td></tr>}
                empty={<tr><td colSpan={7} className="p-6 text-center text-slate-400">No members found.</td></tr>}
                emptyWhen={(d) => !d?.items?.length}
              >
                {(data) => data.items.map(toView).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{m.memberNo}</td>
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                      <span>{m.name}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{formatPhone(m.phone)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        /gold/i.test(m.planName) ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {m.planName}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">{m.status}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-900">{formatCurrency(m.tabBalance || 0)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSelectedMember(m)} className="text-xs font-bold text-emerald-600 hover:text-emerald-800">
                        View 360° Profile →
                      </button>
                    </td>
                  </tr>
                ))}
              </QueryState>
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Register New Member</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {errors.root && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs font-semibold text-slate-700" noValidate>
              <Field label="Full Name *" placeholder="e.g. Vikramaditya Singh" error={fieldErr('name')} {...register('name')} />
              <Field label="Phone Number (10 Digits) *" placeholder="9820123456" error={fieldErr('phone')} {...register('phone')} />
              <Field label="Email Address *" type="email" placeholder="user@example.com" error={fieldErr('email')} {...register('email')} />
              <Field label="Date of Birth *" type="date" error={fieldErr('dob')} {...register('dob')} />

              <div>
                <label className="block mb-1">Membership Plan Tier</label>
                <select {...register('planId')} className={selectCls(fieldErr('planId'))}>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)}/{p.durationMonths}mo{p.maxAge ? ` (Age < ${p.maxAge})` : ''}
                    </option>
                  ))}
                </select>
                {fieldErr('planId') && <p className="text-[11px] text-rose-600 mt-1">{fieldErr('planId')}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Member & Issue Digital Card
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Member 360° Profile & Digital QR Card Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Member 360° Digital Card</h3>
              <button onClick={() => setSelectedMember(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-emerald-400">BOOKMYCOURT DIGITAL PASS</span>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded">{selectedMember.planName}</span>
              </div>
              <div className="flex items-center gap-4">
                <img src={selectedMember.avatar} alt={selectedMember.name} className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-lg">{selectedMember.name}</h3>
                  <p className="text-xs font-mono text-slate-400">ID: {selectedMember.memberNo}</p>
                  <p className="text-[11px] text-slate-300">{formatPhone(selectedMember.phone)}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl w-32 mx-auto flex flex-col items-center gap-1 shadow-md">
                <QRCodeSVG value={selectedMember.qrCode || selectedMember.memberNo || selectedMember.id} size={90} />
                <span className="text-[8px] font-mono text-slate-800 font-bold">SCAN AT DESK / POS</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const selectCls = (error) =>
  `w-full border rounded-xl px-3 py-2 text-xs focus:outline-none bg-white ${
    error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
  }`;

const Field = React.forwardRef(({ label, type = 'text', placeholder, error, ...rest }, ref) => (
  <div>
    <label className="block mb-1">{label}</label>
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      {...rest}
      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${
        error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
      }`}
    />
    {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
  </div>
));
Field.displayName = 'Field';
