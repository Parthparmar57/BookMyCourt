import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../../services/apiServices';
import { formatCurrency } from '../../../shared/utils/formatters';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  ShoppingBag, 
  Calendar, 
  Coffee, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

export const OwnerDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    dashboardApi.getMetrics().then(setMetrics);
  }, []);

  if (!metrics) return <div className="p-8 text-slate-500 font-medium text-center">Loading Executive Dashboard...</div>;

  const revenueData = [
    { name: 'Courts', value: metrics.courtRevenue, color: '#22c55e' },
    { name: 'Shop', value: metrics.shopRevenue, color: '#3b82f6' },
    { name: 'Bar & Cafe', value: metrics.barRevenue, color: '#f59e0b' },
    { name: 'Memberships', value: metrics.membershipRevenue, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
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

      {/* Top 4 KPI Cards matching Screenshot / PRD spec */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">TOTAL REVENUE TODAY</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(metrics.totalRevenueToday)}</div>
          <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            ▲ +14% vs last week
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">COURT BOOKINGS</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(metrics.courtRevenue)}</div>
          <p className="text-[11px] text-slate-500">41.7% of total revenue</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">RETAIL GEAR SHOP</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(metrics.shopRevenue)}</div>
          <p className="text-[11px] text-slate-500">25.9% of total revenue</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ACTIVE MEMBERS</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.activeMembers}</div>
          <p className="text-[11px] text-amber-600 font-bold">{metrics.expiringMembers} expiring soon</p>
        </div>
      </div>

      {/* Revenue Charts & Operational Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Pie Chart */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Revenue Distribution by Channel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
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
        </div>

        {/* Action Required Panel */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>ACTION REQUIRED (Operational Alerts)</span>
            </h3>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">3 Alerts</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <ShoppingBag className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-amber-900">Low Stock Alert (Babolat Pure Drive)</h4>
                <p className="text-xs text-amber-700">Only 2 units remaining (reorder threshold is 5 units).</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <Users className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-rose-900">28 Expiring Memberships</h4>
                <p className="text-xs text-rose-700">Memberships expiring within 7 days needing renewal follow-up.</p>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <Coffee className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-blue-900">Unsettled Bar Tabs</h4>
                <p className="text-xs text-blue-700">Table 1 (Rajesh Patel) has an active tab balance of ₹450.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
