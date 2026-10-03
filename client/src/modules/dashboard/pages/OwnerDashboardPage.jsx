import React from 'react';
import { useDashboardSummary, useDashboardUtilisation } from '../../../hooks/useDashboard';
import { useLowStock } from '../../../hooks/useShop';
import { useTabs } from '../../../hooks/useBar';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { TrendingUp, Users, AlertTriangle, ShoppingBag, Calendar, Coffee, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const SOURCE_META = {
  COURT: { name: 'Courts', color: '#4A812F' },
  SHOP: { name: 'Shop', color: '#0284c7' },
  BAR: { name: 'Bar & Cafe', color: '#d97706' },
  MEMBERSHIP: { name: 'Memberships', color: '#16a34a' },
  OTHER: { name: 'Other', color: '#64748b' },
};

export const OwnerDashboardPage = () => {
  const summaryQuery = useDashboardSummary();
  const { data: utilisation = [] } = useDashboardUtilisation();
  const { data: lowStock = [] } = useLowStock();
  const { data: openTabs = [] } = useTabs();

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner matching Website White & Green Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="text-xs font-mono font-black tracking-widest uppercase text-[#4A812F] flex items-center gap-2">
            <span>EXECUTIVE SUITE</span>
            <span>•</span>
            <span>LIVE INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Owner Executive <span className="text-[#4A812F]">Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time revenue intelligence, court utilization, and operational alerts across the BookMyCourt network.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="bg-emerald-50 text-[#4A812F] border border-emerald-200 text-xs font-extrabold px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4A812F] animate-pulse"></span>
            LIVE SYNC ACTIVE
          </span>
        </div>
      </div>

      <QueryState query={summaryQuery}>
        {(summary) => {
          const k = summary.kpis;
          const revenueData = (summary.revenueBySource || [])
            .map((s) => ({ name: SOURCE_META[s.source]?.name || s.source, value: Number(s.amount), color: SOURCE_META[s.source]?.color || '#64748b' }))
            .filter((d) => d.value > 0);
          const utilData = utilisation.map((c) => ({ name: c.courtName, util: c.utilisationPct }));

          return (
            <>
              {/* KPI cards in crisp white & green */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard label="TOTAL REVENUE TODAY" value={formatCurrency(Number(k.todayRevenue))} icon={<TrendingUp className="w-5 h-5" />} tone="emerald" sub={`${formatCurrency(Number(k.monthRevenue))} this month`} />
                <KpiCard label="COURT BOOKINGS TODAY" value={k.todayBookings} icon={<Calendar className="w-5 h-5" />} tone="emerald" sub={`${k.activeKitchenOrders} active kitchen orders`} />
                <KpiCard label="RECEIVABLES" value={formatCurrency(Number(k.receivables))} icon={<ShoppingBag className="w-5 h-5" />} tone="blue" sub={`${formatCurrency(Number(k.payables))} payables`} />
                <KpiCard label="ACTIVE MEMBERS" value={k.activeMembers} icon={<Users className="w-5 h-5" />} tone="green" sub={`${k.expiringMembersSoon} expiring soon`} subTone="amber" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Revenue pie */}
                <div className="lg:col-span-6 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                    <h3 className="font-extrabold text-slate-900 text-base">Revenue by Channel (This Month)</h3>
                    <span className="text-[10px] font-mono font-black uppercase bg-emerald-50 text-[#4A812F] border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      GST BREAKDOWN
                    </span>
                  </div>

                  {revenueData.length ? (
                    <>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={revenueData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                              {revenueData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold pt-2">
                        {revenueData.map((item) => (
                          <div key={item.name} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-200">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span className="text-slate-700">{item.name}: <strong className="text-slate-900">{formatCurrency(item.value)}</strong></span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-16 font-semibold">No revenue recorded this month yet.</p>
                  )}
                </div>

                {/* Operational alerts */}
                <div className="lg:col-span-6 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span>Operational Action Required</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {lowStock.slice(0, 3).map((p) => (
                      <Alert key={p.id} tone="amber" icon={<ShoppingBag className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                        title={`Low stock: ${p.name}`}
                        body={`Only ${p.stock} units left (reorder at ${p.reorderLevel}).`} />
                    ))}
                    {k.expiringMembersSoon > 0 && (
                      <Alert tone="rose" icon={<Users className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
                        title={`${k.expiringMembersSoon} expiring memberships`}
                        body="Memberships expiring within 15 days need renewal follow-up." />
                    )}
                    {openTabs.length > 0 && (
                      <Alert tone="blue" icon={<Coffee className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />}
                        title={`${openTabs.length} unsettled bar tab${openTabs.length > 1 ? 's' : ''}`}
                        body={`Total open balance ${formatCurrency(openTabs.reduce((s, t) => s + Number(t.totalAmount || 0), 0))}.`} />
                    )}
                    {!lowStock.length && !k.expiringMembersSoon && !openTabs.length && (
                      <div className="p-8 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[#4A812F] mx-auto" />
                        <p className="text-xs font-bold text-slate-700">All Systems Operational</p>
                        <p className="text-[11px] text-slate-400">No low stock or pending account alerts.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Court utilisation */}
              {utilData.length > 0 && (
                <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                    <h3 className="font-extrabold text-slate-900 text-base">Court Utilisation Today (%)</h3>
                    <span className="text-xs font-bold text-[#4A812F] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      OPTIMIZED OCCUPANCY
                    </span>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={utilData}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Bar dataKey="util" fill="#4A812F" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          );
        }}
      </QueryState>
    </div>
  );
};

const TONES = {
  emerald: 'bg-emerald-50 text-[#4A812F] border-emerald-200',
  green: 'bg-emerald-50 text-[#4A812F] border-emerald-200',
  blue: 'bg-sky-50 text-sky-700 border-sky-200',
  purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const KpiCard = ({ label, value, icon, tone = 'emerald', sub, subTone }) => (
  <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-2 hover:border-[#4A812F]/40 transition-all">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider">{label}</span>
      <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${TONES[tone]}`}>{icon}</div>
    </div>
    <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
    {sub && <p className={`text-xs font-extrabold ${subTone === 'amber' ? 'text-amber-600' : 'text-slate-500'}`}>{sub}</p>}
  </div>
);

const ALERT_TONES = {
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  rose: 'bg-rose-50 border-rose-200 text-rose-900',
  blue: 'bg-sky-50 border-sky-200 text-sky-900',
};

const Alert = ({ tone, icon, title, body }) => (
  <div className={`p-4 border rounded-2xl flex items-start gap-3.5 ${ALERT_TONES[tone]}`}>
    {icon}
    <div>
      <h4 className="font-extrabold text-xs">{title}</h4>
      <p className="text-xs opacity-85 leading-relaxed">{body}</p>
    </div>
  </div>
);

