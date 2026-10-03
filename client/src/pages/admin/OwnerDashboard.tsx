import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Package,
  CreditCard,
  PhoneCall,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const navigate = useNavigate();

  useEffect(() => {
    dashboardApi.getDashboardMetrics().then(res => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const { kpis, revenueBySource, paymentModeSplit, revenueTrend, alerts } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-[#1C1F1D] to-[#2B302D] text-white shadow-lg">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Executive Dashboard</h2>
          <p className="text-xs text-white/70 mt-1">
            Real-time financial rollups, court utilization, and operational intelligence for Champions Club.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg border border-white/10 shrink-0">
          {(['today', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${
                timeRange === range ? 'bg-primary text-white shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-primary">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
            <span>TOTAL REVENUE (TODAY)</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono mt-2">
            ₹{kpis.revenueToday.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-xs text-primary font-bold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs last week</span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
            <span>ACTIVE MEMBERS</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono mt-2">
            {kpis.activeMembers}
          </div>
          <div className="text-xs text-text-muted mt-1 font-medium">
            <span className="text-warning font-bold">{kpis.expiringMemberships}</span> memberships expiring soon
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
            <span>COURT OCCUPANCY</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono mt-2">
            {kpis.courtOccupancy}%
          </div>
          <div className="text-xs text-text-muted mt-1 font-medium">
            Peak hours (06-09 AM & 05-09 PM)
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
            <span>LOW STOCK ALERTS</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono mt-2">
            {kpis.lowStockItems} Items
          </div>
          <div className="text-xs text-amber-700 font-bold mt-1">
            Requires warehouse restock
          </div>
        </Card>
      </div>

      {/* Row 2: Recharts Area Chart & Source Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <Card className="lg:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground">7-Day Revenue Growth Trend</h3>
              <p className="text-xs text-text-muted">Aggregated income across Courts, Shop, Bar, and Memberships</p>
            </div>
            <Badge variant="success">Live Data</Badge>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A812F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4A812F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E7E1" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B716D' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B716D' }} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#212424', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4A812F" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue By Source Donut Chart */}
        <Card className="p-5 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground">Revenue by Source</h3>
            <p className="text-xs text-text-muted">Proportional sales breakdown</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueBySource}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {revenueBySource.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#212424', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-text-muted font-medium">Total Today</span>
              <span className="text-base font-extrabold font-mono text-foreground">₹1,48.5k</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            {revenueBySource.map((src: any) => (
              <div key={src.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }} />
                  <span className="font-semibold text-foreground">{src.name}</span>
                </div>
                <span className="font-mono text-text-secondary">₹{src.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: ACTION REQUIRED Panel (Operational Alerts) */}
      <Card className="p-5 border-2 border-warning/40 bg-warning/5 space-y-4">
        <div className="flex items-center justify-between border-b border-warning/20 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
            <div>
              <h3 className="text-base font-extrabold text-foreground">ACTION REQUIRED — Operational Alerts</h3>
              <p className="text-xs text-text-muted">High-priority items requiring immediate administrative resolution</p>
            </div>
          </div>
          <Badge variant="warning">4 Pending Actions</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {alerts.map((alt: any) => (
            <div
              key={alt.id}
              onClick={() => navigate(alt.actionUrl)}
              className="p-3.5 rounded-lg bg-white border border-border hover:border-warning hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <Badge variant={alt.severity === 'high' ? 'danger' : 'warning'} size="sm">
                  {alt.category}
                </Badge>
                <p className="text-xs font-bold text-foreground mt-2 line-clamp-2">{alt.message}</p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-primary mt-3 pt-2 border-t border-border/60">
                <span>{alt.actionLabel}</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
