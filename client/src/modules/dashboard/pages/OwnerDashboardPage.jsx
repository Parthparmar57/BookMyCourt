import React from 'react';
import { useDashboardSummary, useDashboardUtilisation } from '../../../hooks/useDashboard';
import { useLowStock } from '../../../hooks/useShop';
import { useTabs } from '../../../hooks/useBar';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { TrendingUp, Users, AlertTriangle, ShoppingBag, Calendar, Coffee } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const SOURCE_META = {
  COURT: { name: 'Courts', color: '#22c55e' },
  SHOP: { name: 'Shop', color: '#3b82f6' },
  BAR: { name: 'Bar & Cafe', color: '#f59e0b' },
  MEMBERSHIP: { name: 'Memberships', color: '#8b5cf6' },
  OTHER: { name: 'Other', color: '#94a3b8' },
};

export const OwnerDashboardPage = () => {
  const summaryQuery = useDashboardSummary();
  const { data: utilisation = [] } = useDashboardUtilisation();
  const { data: lowStock = [] } = useLowStock();
  const { data: openTabs = [] } = useTabs();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Owner Executive Dashboard</h1>
          <p className="text-xs text-slate-500">Real-time revenue intelligence, court utilization, and operational alerts.</p>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Sync Active
        </span>
      </div>

      <QueryState query={summaryQuery}>
        {(summary) => {
          const k = summary.kpis;
          const revenueData = (summary.revenueBySource || [])
            .map((s) => ({ name: SOURCE_META[s.source]?.name || s.source, value: Number(s.amount), color: SOURCE_META[s.source]?.color || '#94a3b8' }))
            .filter((d) => d.value > 0);
          const utilData = utilisation.map((c) => ({ name: c.courtName, util: c.utilisationPct }));

          return (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard label="TOTAL REVENUE TODAY" value={formatCurrency(Number(k.todayRevenue))} icon={<TrendingUp className="w-4 h-4" />} tone="emerald" sub={`${formatCurrency(Number(k.monthRevenue))} this month`} />
                <KpiCard label="COURT BOOKINGS TODAY" value={k.todayBookings} icon={<Calendar className="w-4 h-4" />} tone="emerald" sub={`${k.activeKitchenOrders} active kitchen orders`} />
                <KpiCard label="RECEIVABLES" value={formatCurrency(Number(k.receivables))} icon={<ShoppingBag className="w-4 h-4" />} tone="blue" sub={`${formatCurrency(Number(k.payables))} payables`} />
                <KpiCard label="ACTIVE MEMBERS" value={k.activeMembers} icon={<Users className="w-4 h-4" />} tone="purple" sub={`${k.expiringMembersSoon} expiring soon`} subTone="amber" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Revenue pie */}
                <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-base">Revenue by Channel (This Month)</h3>
                  {revenueData.length ? (
                    <>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={revenueData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {revenueData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
                        {revenueData.map((item) => (
                          <div key={item.name} className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span>{item.name}: <strong>{formatCurrency(item.value)}</strong></span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-16">No revenue recorded this month yet.</p>
                  )}
                </div>

                {/* Operational alerts (dynamic) */}
                <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span>Action Required</span>
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
                      <Alert tone="blue" icon={<Coffee className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
                        title={`${openTabs.length} unsettled bar tab${openTabs.length > 1 ? 's' : ''}`}
                        body={`Total open balance ${formatCurrency(openTabs.reduce((s, t) => s + Number(t.totalAmount || 0), 0))}.`} />
                    )}
                    {!lowStock.length && !k.expiringMembersSoon && !openTabs.length && (
                      <p className="text-xs text-slate-400 text-center py-8">All clear — no operational alerts.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Court utilisation */}
              {utilData.length > 0 && (
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-base">Court Utilisation Today (%)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={utilData}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Bar dataKey="util" fill="#22c55e" radius={[6, 6, 0, 0]} />
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
  emerald: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
};

const KpiCard = ({ label, value, icon, tone = 'emerald', sub, subTone }) => (
  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${TONES[tone]}`}>{icon}</div>
    </div>
    <div className="text-2xl font-black text-slate-900">{value}</div>
    {sub && <p className={`text-[11px] font-bold ${subTone === 'amber' ? 'text-amber-600' : 'text-slate-500'}`}>{sub}</p>}
  </div>
);

const ALERT_TONES = {
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  rose: 'bg-rose-50 border-rose-200 text-rose-900',
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
};

const Alert = ({ tone, icon, title, body }) => (
  <div className={`p-3.5 border rounded-xl flex items-start gap-3 ${ALERT_TONES[tone]}`}>
    {icon}
    <div>
      <h4 className="font-bold text-xs">{title}</h4>
      <p className="text-xs opacity-80">{body}</p>
    </div>
  </div>
);
