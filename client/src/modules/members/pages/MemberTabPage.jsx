import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTabs } from '../../../hooks/useBar';
import { Coffee, CheckCircle2, Clock, AlertCircle, ArrowLeft, Receipt, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

export const MemberTabPage = () => {
  const { user } = useAuth();
  const { data: tabsData, isLoading } = useTabs();

  const allTabs = tabsData?.items || [];
  // Server scopes member tabs to their own record
  const activeTab = allTabs.find(t => t.status === 'OPEN');
  const pastTabs = allTabs.filter(t => t.status === 'SETTLED');

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Bar & Cafeteria Tab</h1>
        <p className="text-xs text-slate-500">View running food and beverage charges and past settlements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Tab Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Current Running Bill</h3>
                  <p className="text-[11px] text-slate-400">The Champions Club Cafeteria</p>
                </div>
              </div>

              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${activeTab ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {activeTab ? 'TAB OPEN' : 'NO ACTIVE TAB'}
              </span>
            </div>

            {/* Total Balance */}
            <div className="bg-slate-50 rounded-2xl p-6 text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Tab Balance</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                {activeTab ? `₹${Number(activeTab.totalAmount || 0).toFixed(2)}` : '₹0.00'}
              </h2>
              <p className="text-xs text-emerald-600 font-semibold pt-1">
                Includes 15% Member Discount Applied Automatically
              </p>
            </div>

            {/* Orders inside Tab */}
            {activeTab && activeTab.orders?.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Items on Tab</h4>
                <div className="space-y-2">
                  {activeTab.orders.map((order, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">Order #{idx + 1}</span>
                        <p className="text-[10px] text-slate-400">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className="font-bold text-slate-900">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">
                No unpaid items on tab. You can open a tab anytime when ordering at the club cafeteria.
              </p>
            )}

            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Receipt className="w-4 h-4" />
                How to settle your tab?
              </p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                You can settle your bar tab at the cafeteria counter or front desk using <strong>Cash, Card, or UPI</strong> before leaving the club.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Past Settled Receipts */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="font-black text-sm text-slate-900">Past Tab Receipts</h3>
            <p className="text-xs text-slate-400">Settled cafeteria bills</p>
          </div>

          {pastTabs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No past settled tabs found.
            </div>
          ) : (
            <div className="space-y-3">
              {pastTabs.map((tab) => (
                <div key={tab.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">Tab #{tab.id.slice(0, 8)}</span>
                    <p className="text-[10px] text-slate-400">{formatDate(tab.updatedAt)} • Paid</p>
                  </div>
                  <span className="font-bold text-emerald-700">₹{Number(tab.totalAmount || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MemberTabPage;
