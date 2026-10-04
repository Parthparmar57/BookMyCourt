import React, { useState } from 'react';
import { usePublicPlans } from '../../../hooks/useCrm';
import { useRazorpayCheckout } from '../../../hooks/usePayment';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { Check, Star, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Build human-readable perk bullets from the plan's numeric fields.
const planFeatures = (p) => {
  const f = [];
  f.push(Number(p.courtRate) === 0 ? '100% free court bookings' : `Court rate ${formatCurrency(Number(p.courtRate))}/session`);
  if (p.freeSessions) f.push(`${p.freeSessions} free sessions included`);
  if (p.shopDiscountPct) f.push(`${p.shopDiscountPct}% off the gear shop`);
  if (p.barDiscountPct) f.push(`${p.barDiscountPct}% off bar & cafe`);
  if (p.maxBookingsDay) f.push(`Up to ${p.maxBookingsDay} bookings per day`);
  if (p.maxAge) f.push(`For members under ${p.maxAge} years`);
  return f;
};

export const MembershipPage = () => {
  const plansQuery = usePublicPlans();
  const { isAuthenticated, role, user } = useAuth();
  const { checkout, isProcessing } = useRazorpayCheckout();
  const [payingId, setPayingId] = useState(null);
  const [banner, setBanner] = useState(null); // { type, msg }

  const isMember = isAuthenticated && role === 'MEMBER';

  const handlePay = async (plan) => {
    setBanner(null);
    setPayingId(plan.id);
    try {
      await checkout({
        planId: plan.id,
        description: `${plan.name} membership`,
        source: 'MEMBERSHIP',
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
      });
      setBanner({ type: 'success', msg: `Payment successful for ${plan.name}. Our team will activate your plan shortly.` });
    } catch (err) {
      if (!err?.cancelled) setBanner({ type: 'error', msg: err?.message || 'Payment could not be completed.' });
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="py-16 px-4 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
          TRANSPARENT PRICING
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">Membership Plans & Tiers</h1>
        <p className="text-base text-slate-600">
          Unlock free court bookings, gear shop discounts, priority reservations, and cafeteria privileges with BookMyCourt membership.
        </p>
      </div>

      {banner && (
        <div className={`max-w-xl mx-auto p-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
          banner.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <span>{banner.msg}</span>
          <button onClick={() => setBanner(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <QueryState query={plansQuery} emptyWhen={(d) => !d?.length} empty={<p className="text-center text-slate-400 text-sm">No plans available right now.</p>}>
        {(plans) => {
          // Highlight the most premium (highest-priced) plan.
          const popularId = [...plans].sort((a, b) => Number(b.price) - Number(a.price))[0]?.id;
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => {
                const popular = plan.id === popularId;
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                      popular
                        ? 'bg-slate-900 text-white shadow-2xl border-2 border-emerald-500 md:scale-105'
                        : 'bg-white text-slate-900 shadow-xl border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {popular && (
                      <div className="absolute -top-4 right-8 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-white" /> MOST POPULAR
                      </div>
                    )}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-4xl font-black">{formatCurrency(Number(plan.price))}</span>
                          <span className={`text-xs ${popular ? 'text-slate-300' : 'text-slate-500'}`}>/ {plan.durationMonths} mo</span>
                        </div>
                      </div>
                      <ul className="space-y-3 text-sm">
                        {planFeatures(plan).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${popular ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-8">
                      {isMember ? (
                        <button
                          onClick={() => handlePay(plan)}
                          disabled={isProcessing}
                          className={`w-full flex items-center justify-center gap-2 text-center font-bold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-60 ${
                            popular ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {payingId === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                          Pay & Join {plan.name}
                        </button>
                      ) : (
                        <Link
                          to={isAuthenticated ? '/trial' : '/login'}
                          className={`w-full block text-center font-bold text-sm py-3.5 rounded-xl transition-colors ${
                            popular ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          Join {plan.name}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }}
      </QueryState>
    </div>
  );
};
