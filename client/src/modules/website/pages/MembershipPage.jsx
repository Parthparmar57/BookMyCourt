import React from 'react';
import { MOCK_PLANS } from '../../../data/mockData';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Check, Star, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MembershipPage = () => {
  return (
    <div className="py-16 px-4 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
          TRANSPARENT PRICING
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Membership Plans & Tiers
        </h1>
        <p className="text-base text-slate-600">
          Unlock 100% free court bookings, gear shop discounts, priority reservations, and cafeteria privileges with BookMyCourt membership plans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {MOCK_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
              plan.popular
                ? 'bg-slate-900 text-white shadow-2xl border-2 border-emerald-500 scale-105'
                : 'bg-white text-slate-900 shadow-xl border border-slate-200 hover:border-slate-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 right-8 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-white" /> MOST POPULAR
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black">{formatCurrency(plan.price)}</span>
                  <span className={`text-xs ${plan.popular ? 'text-slate-300' : 'text-slate-500'}`}>/ month</span>
                </div>
              </div>

              <ul className="space-y-3 text-sm">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      plan.popular ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link
                to="/trial"
                className={`w-full block text-center font-bold text-sm py-3.5 rounded-xl transition-colors ${
                  plan.popular
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                Join {plan.name}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
