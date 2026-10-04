import React from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Crown,
  Calendar,
  Sparkles,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const UserProfileModal = ({ isOpen, onClose, user, roleTitle }) => {
  if (!isOpen || !user) return null;

  const member = user.member;
  const plan = member?.plan;
  const rawPlanName = plan?.name || user.plan || user.membershipTier || 'Gold';
  const isGold = /gold/i.test(rawPlanName);
  const isJunior = /junior|youth|child/i.test(rawPlanName);
  const planTierName = isGold ? 'Gold' : isJunior ? 'Junior' : 'Silver';

  const courtBenefit = isGold
    ? '100% Free Court Access'
    : isJunior
    ? '₹100.00 / hr (Junior Rate)'
    : '₹200.00 / hr (Silver Rate)';

  const shopDiscount = plan?.shopDiscountPct ?? (isGold ? 20 : isJunior ? 15 : 10);
  const barDiscount = plan?.barDiscountPct ?? (isGold ? 15 : isJunior ? 10 : 5);

  const initial = user.initial || (user.name ? user.name.trim().charAt(0).toUpperCase() : 'U');
  const validUntilStr = member?.endDate
    ? new Date(member.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Active Annual';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Top Emerald Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">User Profile Details</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Avatar Card */}
        <div className="bg-gradient-to-b from-slate-50 to-emerald-50/40 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-[#1b4332] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-emerald-400/40 shrink-0">
            {initial}
          </div>
          <div className="space-y-1 min-w-0">
            <h4 className="font-extrabold text-base text-slate-900 truncate">{user.name}</h4>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{roleTitle || 'Club Member'}</span>
              </span>

              {user.role === 'MEMBER' && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  isGold
                    ? 'bg-amber-100 text-amber-950 border-amber-400'
                    : isJunior
                    ? 'bg-sky-100 text-sky-950 border-sky-400'
                    : 'bg-slate-200 text-slate-900 border-slate-400'
                }`}>
                  <span>{isGold ? '🥇' : isJunior ? '🎽' : '🥈'}</span>
                  <span>{planTierName} Tier</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact & Account Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-500" /> Email Address
            </span>
            <p className="font-bold text-slate-900 truncate">{user.email || 'N/A'}</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-500" /> Mobile Phone
            </span>
            <p className="font-bold text-slate-900">{user.phone || 'N/A'}</p>
          </div>
        </div>

        {/* Membership Details Card (if Member) */}
        {user.role === 'MEMBER' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" /> Membership Plan Privileges
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {member?.memberNo || 'MEM-ACTIVE'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-emerald-50/70 border border-emerald-200/80 p-2.5 rounded-xl space-y-0.5">
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase block">Court Access</span>
                <span className="font-black text-emerald-950 text-[11px] block">{courtBenefit}</span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 p-2.5 rounded-xl space-y-0.5">
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase block">Shop Discount</span>
                <span className="font-black text-emerald-950 text-[11px] block">{shopDiscount}% Off</span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 p-2.5 rounded-xl space-y-0.5">
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase block">Bar Discount</span>
                <span className="font-black text-emerald-950 text-[11px] block">{barDiscount}% Off</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              <span className="font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Expiration Date:
              </span>
              <span className="font-extrabold text-slate-800">{validUntilStr}</span>
            </div>
          </div>
        )}

        {/* Read-Only Notice & Action Button */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Close View</span>
          </button>
        </div>

      </div>
    </div>
  );
};
