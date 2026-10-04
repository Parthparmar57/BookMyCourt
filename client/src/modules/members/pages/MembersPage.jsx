import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMembers, usePlans, useCreateMember, useUpdateMember, useDeactivateMember } from '../../../hooks/useMembership';
import { membersApi } from '../../../services/membership.service';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { formatCurrency, formatPhone } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { memberSchema, applyServerErrors } from '../../../shared/validation/schemas';
import { Search, UserPlus, AlertCircle, X, Loader2, QrCode, Phone, Mail, ShieldCheck, Sparkles, CheckCircle2, Clock, Edit3, UserX } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { QRScannerModal } from '../../../components/member/QRScannerModal';
import { CustomSelect } from '../../../shared/components/CustomSelect';
import { toast, confirmToast } from '../../../shared/utils/toast';

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
  emergencyContact: m.emergencyContact || '',
  planName: m.plan?.name || m.planName || '—',
  status: m.status || 'ACTIVE',
  qrCode: m.qrCode,
  tabBalance: m.activeTabBalance ?? 0,
});

export const MembersPage = () => {
  const location = useLocation();
  const { currentRole } = useAuth();
  const isFrontDesk = location.pathname.startsWith('/staff/frontdesk') || currentRole === 'FRONT_DESK' || currentRole === 'OWNER';

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 350);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [syncVersion, setSyncVersion] = useState(0);

  // Sync upgrade requests and approvals
  useEffect(() => {
    const handleSync = () => setSyncVersion((v) => v + 1);
    window.addEventListener('bmc_upgrade_change', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('bmc_upgrade_change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const pendingUpgradeRequests = JSON.parse(localStorage.getItem('bmc_membership_upgrade_requests') || '[]');

  const handleApproveUpgrade = async (req) => {
    const targetPlanName = req.requestedPlan || 'Gold';
    const targetPlan = plans.find(p => p.name.toLowerCase().includes(targetPlanName.toLowerCase())) || plans[0];

    const rawItems = membersQuery?.data?.items || [];
    const match = rawItems.find(m =>
      m.memberNo === req.memberNo ||
      (m.user?.email && req.email && m.user.email.toLowerCase() === req.email.toLowerCase()) ||
      (m.user?.phone && req.phone && m.user.phone === req.phone)
    );

    const targetMemberId = req.memberId || req.id || match?.id;

    if (targetMemberId && targetPlan?.id) {
      try {
        await membersApi.renew(targetMemberId, { planId: targetPlan.id, paymentMode: 'UPI' });
      } catch (err) {
        console.warn('Backend DB renew note:', err?.message || err);
      }
    }

    const approved = JSON.parse(localStorage.getItem('bmc_approved_upgrades') || '{}');
    const targetTier = req.requestedPlan || 'Gold VIP Annual Pass';

    if (req.email) {
      approved[req.email] = targetTier;
      approved[req.email.toLowerCase()] = targetTier;
    }
    if (req.phone) approved[req.phone] = targetTier;
    if (req.memberNo) approved[req.memberNo] = targetTier;
    if (req.name) approved[req.name] = targetTier;
    approved['GLOBAL_ACTIVE_MEMBER'] = targetTier;

    localStorage.setItem('bmc_approved_upgrades', JSON.stringify(approved));

    const remaining = pendingUpgradeRequests.filter(
      (r) =>
        r.id !== req.id &&
        r.memberNo !== req.memberNo &&
        (!req.email || !r.email || r.email.toLowerCase() !== req.email.toLowerCase()) &&
        (!req.name || !r.name || r.name !== req.name)
    );
    localStorage.setItem('bmc_membership_upgrade_requests', JSON.stringify(remaining));

    membersQuery.refetch();
    window.dispatchEvent(new Event('bmc_upgrade_change'));
  };

  const handleRejectUpgrade = (req) => {
    const remaining = pendingUpgradeRequests.filter((r) => r.id !== req.id);
    localStorage.setItem('bmc_membership_upgrade_requests', JSON.stringify(remaining));
    window.dispatchEvent(new Event('bmc_upgrade_change'));
  };

  const handleDirectUpgradeMember = async (member) => {
    const approved = JSON.parse(localStorage.getItem('bmc_approved_upgrades') || '{}');
    const currentTier = approved[member.email] || approved[member.phone] || approved[member.memberNo] || member.planName;
    const isCurrentlyGold = /gold/i.test(currentTier);
    const targetTierName = isCurrentlyGold ? 'Silver' : 'Gold';
    const targetTier = isCurrentlyGold ? 'Silver' : 'Gold VIP Annual Pass';
    const targetPlan = plans.find(p => p.name.toLowerCase().includes(targetTierName.toLowerCase())) || plans[0];

    if (member.id && targetPlan?.id) {
      try {
        await membersApi.renew(member.id, { planId: targetPlan.id, paymentMode: 'UPI' });
      } catch (err) {
        console.warn('Backend DB renew note:', err?.message || err);
      }
    }

    if (member.email) {
      approved[member.email] = targetTier;
      approved[member.email.toLowerCase()] = targetTier;
    }
    if (member.phone) approved[member.phone] = targetTier;
    if (member.memberNo) approved[member.memberNo] = targetTier;
    if (member.name) approved[member.name] = targetTier;

    localStorage.setItem('bmc_approved_upgrades', JSON.stringify(approved));

    const remaining = pendingUpgradeRequests.filter(
      (r) =>
        r.memberNo !== member.memberNo &&
        (!member.email || !r.email || r.email.toLowerCase() !== member.email.toLowerCase()) &&
        (!member.name || !r.name || r.name !== member.name)
    );
    localStorage.setItem('bmc_membership_upgrade_requests', JSON.stringify(remaining));

    membersQuery.refetch();
    window.dispatchEvent(new Event('bmc_upgrade_change'));
  };

  const membersQuery = useMembers(debouncedQuery.trim() ? { q: debouncedQuery.trim() } : {});
  const { data: plans = [] } = usePlans();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deactivateMember = useDeactivateMember();

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

  const [editFormData, setEditFormData] = useState({ name: '', phone: '', email: '', emergencyContact: '', status: 'ACTIVE' });
  const [editError, setEditError] = useState('');

  const handleOpenEdit = (m) => {
    setSelectedMember(null);
    setEditingMember(m);
    setEditFormData({
      name: m.name || '',
      phone: m.phone || '',
      email: m.email || '',
      emergencyContact: m.emergencyContact || '',
      status: m.status || 'ACTIVE',
    });
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      const updated = await updateMember.mutateAsync({
        id: editingMember.id,
        ...editFormData,
      });
      setEditingMember(null);
      if (selectedMember?.id === editingMember.id) {
        setSelectedMember(toView(updated));
      }
    } catch (err) {
      setEditError(err.response?.data?.error?.message || err.message || 'Failed to update member');
    }
  };

  const handleDeactivate = async (memberId) => {
    const confirmed = await confirmToast({
      title: 'Deactivate member',
      message: 'Are you sure you want to deactivate/suspend this member account?',
      confirmLabel: 'Deactivate',
      danger: true,
    });
    if (confirmed) {
      try {
        const updated = await deactivateMember.mutateAsync(memberId);
        if (selectedMember?.id === memberId) {
          setSelectedMember(toView(updated));
        }
        toast.success('Member deactivated.');
      } catch (err) {
        toast.error(err.response?.data?.error?.message || err.message || 'Failed to deactivate member');
      }
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
              className="bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs px-4 py-2.5 rounded-xl border-2 border-emerald-600/30 shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-700" />
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

      {/* Pending Membership Upgrade Requests Banner for Front Desk */}
      {pendingUpgradeRequests.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
              <Sparkles className="w-5 h-5 text-amber-600 animate-bounce" />
              <span>Pending Membership Upgrade Requests ({pendingUpgradeRequests.length} Pending)</span>
            </div>
            <span className="text-xs font-extrabold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
              Front Desk Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingUpgradeRequests.map((req) => (
              <div key={req.id} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-extrabold text-slate-900">{req.name} <span className="font-mono text-emerald-800">({req.memberNo})</span></div>
                  <div className="text-slate-600 mt-0.5">
                    Phone: <strong>{req.phone}</strong> • Upgrade: <span className="text-amber-900 font-black">{req.currentPlan} → {req.requestedPlan}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveUpgrade(req)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Approve Upgrade</span>
                  </button>
                  <button
                    onClick={() => handleRejectUpgrade(req)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <tr className="bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider">
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
                {(data) => data.items.map(toView).map((m) => {
                  const approved = JSON.parse(localStorage.getItem('bmc_approved_upgrades') || '{}');
                  const currentTier = approved[m.email] || approved[m.phone] || approved[m.memberNo] || m.planName;
                  const isGold = /gold/i.test(currentTier);
                  const isJunior = /junior|youth|child/i.test(currentTier);

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="hover:bg-emerald-50/60 transition-all cursor-pointer group select-none"
                    >
                      <td className="p-4 font-mono font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">{m.memberNo}</td>
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs shrink-0 border border-emerald-300 shadow-2xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="group-hover:text-emerald-950 transition-colors">{m.name}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">{formatPhone(m.phone)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border shadow-2xs ${isGold
                          ? 'bg-amber-100 text-amber-950 border-amber-400'
                          : isJunior
                            ? 'bg-sky-100 text-sky-950 border-sky-400'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                          {isGold ? 'Gold VIP' : currentTier}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full uppercase">
                          {m.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">{formatCurrency(m.tabBalance || 0)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectUpgradeMember(m);
                          }}
                          className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${isGold
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                            }`}
                        >
                          {isGold ? 'Set Silver' : 'Upgrade Gold'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMember(m);
                          }}
                          className="text-xs font-bold text-[#2e7d32] hover:underline cursor-pointer"
                        >
                          View Profile →
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
                <CustomSelect
                  name="planId"
                  value={watch('planId') || plans[0]?.id || ''}
                  onChange={(e) => {
                    const val = e.target?.value || e?.value || e;
                    setValue('planId', val, { shouldValidate: true });
                  }}
                  options={plans.map((p) => ({
                    value: p.id,
                    label: `${p.name} — ${formatCurrency(p.price)}/${p.durationMonths}mo${p.maxAge ? ` (Age < ${p.maxAge})` : ''}`,
                  }))}
                />
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

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Edit Member Details</span>
              </h3>
              <button onClick={() => setEditingMember(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-700 font-bold">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2e7d32]"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-700 font-bold">Phone Number</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2e7d32]"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-700 font-bold">Email Address</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2e7d32]"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-700 font-bold">Emergency Contact</label>
                <input
                  type="text"
                  value={editFormData.emergencyContact}
                  onChange={(e) => setEditFormData({ ...editFormData, emergencyContact: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2e7d32]"
                  placeholder="e.g. Guardian / Relative phone"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-700 font-bold">Account Status</label>
                <CustomSelect
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  options={[
                    { value: 'ACTIVE', label: 'ACTIVE' },
                    { value: 'EXPIRED', label: 'EXPIRED' },
                    { value: 'SUSPENDED', label: 'SUSPENDED' },
                    { value: 'CANCELLED', label: 'CANCELLED' },
                  ]}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMember.isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#2e7d32] hover:bg-[#236327] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {updateMember.isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
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
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shadow-2xs ${/active/i.test(selectedMember.status || 'ACTIVE')
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
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(selectedMember)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Profile</span>
                </button>
                {selectedMember.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleDeactivate(selectedMember.id)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Deactivate</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md transition-all cursor-pointer"
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
  `w-full border rounded-xl px-3 py-2 text-xs focus:outline-none bg-white ${error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#2e7d32]'
  }`;

const Field = React.forwardRef(({ label, type = 'text', placeholder, error, ...rest }, ref) => (
  <div>
    <label className="block mb-1">{label}</label>
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      {...rest}
      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#2e7d32]'
        }`}
    />
    {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
  </div>
));
Field.displayName = 'Field';
