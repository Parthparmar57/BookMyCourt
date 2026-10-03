import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMembers, usePlans, useCreateMember } from '../../../hooks/useMembership';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { formatCurrency, formatPhone } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { memberSchema, applyServerErrors } from '../../../shared/validation/schemas';
import { Search, UserPlus, AlertCircle, X, Loader2, QrCode, Phone, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { QRScannerModal } from '../../../components/member/QRScannerModal';

// Light-Theme First Letter Avatar Fallback Component
const MemberAvatar = ({ name, photoUrl, size = "w-16 h-16 text-2xl" }) => {
  const [imgErr, setImgErr] = useState(false);
  const initial = (name || 'M').charAt(0).toUpperCase();

  if (photoUrl && !imgErr && !photoUrl.includes('ui-avatars.com')) {
    return (
      <img
        src={photoUrl}
        alt={name}
        onError={() => setImgErr(true)}
        className={`${size} rounded-2xl object-cover border-2 border-[#2e7d32] shadow-sm shrink-0`}
      />
    );
  }

  return (
    <div className={`${size} rounded-2xl bg-[#e8f5e9] text-[#2e7d32] border-2 border-[#2e7d32]/40 flex items-center justify-center font-black shadow-2xs shrink-0 uppercase select-none`}>
      {initial}
    </div>
  );
};

// Safe QR Display Helper (Prevents RangeError: Data too long on base64 QR strings)
const SafeQRCodeDisplay = ({ member }) => {
  const qrCodeStr = member?.qrCode || '';
  
  if (typeof qrCodeStr === 'string' && (qrCodeStr.startsWith('data:') || qrCodeStr.startsWith('http'))) {
    return (
      <img
        src={qrCodeStr}
        alt="Member QR Code"
        className="w-28 h-28 object-contain rounded-lg shadow-2xs"
      />
    );
  }

  const safeVal = String(member?.memberNo || member?.id || 'MEM-000000').substring(0, 100);

  return (
    <QRCodeSVG
      value={safeVal}
      size={110}
      level="M"
    />
  );
};

// Normalize a server member (fields live on the user/plan relations) into a flat
// view model for the table and card.
const toView = (m) => ({
  id: m.id,
  memberNo: m.memberNo,
  name: m.user?.name || m.name || '—',
  phone: m.user?.phone || m.phone || '',
  email: m.user?.email || m.email || '',
  planName: m.plan?.name || m.planName || '—',
  status: m.status || 'active',
  qrCode: m.qrCode,
  tabBalance: m.activeTabBalance ?? 0,
});

export const MembersPage = () => {
  const location = useLocation();
  const { currentRole } = useAuth();
  const isFrontDesk = location.pathname.startsWith('/staff/frontdesk') || currentRole === 'FRONT_DESK';

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 350);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const membersQuery = useMembers(debouncedQuery.trim() ? { q: debouncedQuery.trim() } : {});
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
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Member Directory & Profiles</h1>
          <p className="text-xs text-slate-500">Fast search by Name, Phone, Member No. or QR code scan.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isFrontDesk && (
            <button
              onClick={() => setShowQRScanner(true)}
              className="bg-[#1f2125] hover:bg-black text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scan Member QR Code</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#2e7d32] hover:bg-[#236327] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Member</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone, member no. (e.g. Rohan, 9876543210, MEM-001001)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#2e7d32] focus:outline-none shadow-2xs font-semibold text-slate-900"
        />
      </div>

      {/* Member Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
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
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#e8f5e9] text-[#2e7d32] font-black flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
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
                      <button onClick={() => setSelectedMember(m)} className="text-xs font-bold text-[#2e7d32] hover:underline cursor-pointer">
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
                className="w-full bg-[#2e7d32] hover:bg-[#236327] disabled:opacity-60 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Member & Issue Digital Card
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Member 360° Profile & Digital QR Card Modal (Light Executive Theme) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#e8f5e9] text-[#2e7d32] border border-emerald-200 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#2e7d32]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Member 360° Digital Pass</h3>
                  <p className="text-[11px] text-slate-500">Account Privileges & Live QR Verification</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Executive Pass Theme Card (White, Black & Emerald Green) */}
            <div className="bg-white border-2 border-[#2e7d32] rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-5">
              
              {/* Card Top Bar */}
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs text-[#2e7d32] uppercase tracking-wider">BOOKMYCOURT PASS</span>
                  <span className="text-[10px] font-extrabold text-[#2e7d32] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                    {selectedMember.planName} TIER
                  </span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shadow-2xs ${
                  /active/i.test(selectedMember.status || 'ACTIVE')
                    ? 'bg-[#e8f5e9] text-[#2e7d32] border-emerald-300'
                    : /suspended/i.test(selectedMember.status)
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {selectedMember.status || 'ACTIVE'}
                </span>
              </div>

              {/* Member Primary Details with First-Letter Avatar */}
              <div className="flex items-center gap-4">
                <MemberAvatar name={selectedMember.name} photoUrl={selectedMember.avatar || selectedMember.photoUrl} />
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-black text-xl text-slate-900 tracking-tight leading-tight truncate">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xs font-mono font-bold text-[#2e7d32]">
                    ID: {selectedMember.memberNo}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5 font-semibold">
                    {selectedMember.phone && (
                      <span className="flex items-center gap-1 truncate">
                        <Phone className="w-3.5 h-3.5 text-[#2e7d32] shrink-0" />
                        {formatPhone(selectedMember.phone)}
                      </span>
                    )}
                    {selectedMember.email && (
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#2e7d32] shrink-0" />
                        {selectedMember.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Metrics & Privileges Summary */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Bar Tab</span>
                  <strong className="text-slate-900 font-extrabold">{formatCurrency(selectedMember.tabBalance || 0)}</strong>
                </div>
                <div className="space-y-0.5 border-x border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Court Rate</span>
                  <strong className="text-[#2e7d32] font-extrabold">
                    {/gold/i.test(selectedMember.planName) ? '100% Free' : '50% Off'}
                  </strong>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Shop Discount</span>
                  <strong className="text-[#2e7d32] font-extrabold">15% Off</strong>
                </div>
              </div>

              {/* Scannable Digital QR Code Display Box (Safe Fallback) */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-2xs">
                <SafeQRCodeDisplay member={selectedMember} />
                <span className="text-[9px] font-mono font-bold text-slate-500 tracking-widest uppercase">
                  SCAN AT DESK / POS VERIFICATION
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="w-full bg-[#1f2125] hover:bg-black text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal for Front Desk Verification */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onRegisterMember={(prefill) => {
          if (prefill?.email) setValue('email', prefill.email);
          if (prefill?.phone) setValue('phone', prefill.phone);
          setShowAddModal(true);
        }}
      />
    </div>
  );
};

const selectCls = (error) =>
  `w-full border rounded-xl px-3 py-2 text-xs focus:outline-none bg-white ${
    error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#2e7d32]'
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
        error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#2e7d32]'
      }`}
    />
    {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
  </div>
));
Field.displayName = 'Field';
