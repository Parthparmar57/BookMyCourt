import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useShopOrders, useLowStock, useInventoryLogs } from '../../../hooks/useShop';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Layers,
  Wallet,
  CheckCircle2,
  ArrowUpRight,
  Receipt,
  ArrowRight,
  RefreshCw,
  Tag,
  Boxes,
  Sparkles
} from 'lucide-react';

export const ShopDashboardPage = () => {
  const productsQuery = useProducts();
  const ordersQuery = useShopOrders();
  const lowStockQuery = useLowStock();
  const logsQuery = useInventoryLogs();

  const products = productsQuery.data || [];
  const orders = ordersQuery.data || [];
  const lowStockItems = lowStockQuery.data || [];
  const logs = logsQuery.data || [];

  // --- Data Analysis & Visual Metrics ---
  const totalStockCount = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const totalInventoryValuation = products.reduce(
    (acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0),
    0
  );

  const outOfStockCount = products.filter((p) => (Number(p.stock) || 0) === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= (p.reorderLevel || 5)).length;

  // Category Breakdown Analysis
  const categoryStats = React.useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const cat = p.category || 'General';
      if (!map[cat]) {
        map[cat] = { count: 0, stock: 0, valuation: 0 };
      }
      map[cat].count += 1;
      map[cat].stock += Number(p.stock) || 0;
      map[cat].valuation += (Number(p.price) || 0) * (Number(p.stock) || 0);
    });

    const categories = Object.keys(map).map((cat) => ({
      name: cat,
      ...map[cat],
      percentValuation: totalInventoryValuation > 0
        ? Math.round((map[cat].valuation / totalInventoryValuation) * 100)
        : 0
    }));

    return categories.sort((a, b) => b.valuation - a.valuation);
  }, [products, totalInventoryValuation]);

  // Color mapping for categories
  const getCategoryColor = (idx) => {
    const palette = [
      { bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      { bg: 'bg-blue-500', lightBg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      { bg: 'bg-purple-500', lightBg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      { bg: 'bg-amber-500', lightBg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      { bg: 'bg-rose-500', lightBg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
    ];
    return palette[idx % palette.length];
  };

  // Top valued products
  const topValuedProducts = [...products]
    .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
    .slice(0, 4);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pro Shop Sales & <span className="text-[#4A812F]">Inventory Intelligence</span>
          </h1>
          <p className="text-xs text-slate-600 font-semibold max-w-2xl">
            Live omnichannel retail performance, visual category distribution, valuation analysis, and instant stock diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/staff/shop/inventory"
            className="bg-[#4A812F] hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all shadow-xs"
          >
            <Boxes className="w-4 h-4" />
            Manage Inventory Audit
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Inventory Valuation */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-3 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Stock Valuation</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(totalInventoryValuation)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{products.length} Active SKUs Cataloged</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* KPI 2: Total Units in Stock */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-3 relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Total Physical Units</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {totalStockCount.toLocaleString()} <span className="text-xs font-bold text-slate-400 font-mono">Units</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 mt-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Omnichannel Pool Synchronized</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* KPI 3: Stock Health Alert */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-3 relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Stock Reorder Alerts</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {lowStockCount + outOfStockCount} <span className="text-xs font-bold text-amber-600 font-mono">Items Need Action</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold mt-1">
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-bold">
                {lowStockCount} Low
              </span>
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-bold">
                {outOfStockCount} Out
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, ((lowStockCount + outOfStockCount) / Math.max(1, products.length)) * 100)}%` }}></div>
          </div>
        </div>

        {/* KPI 4: POS Sales Activity */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-3 relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Completed Sales</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {orders.length} <span className="text-xs font-bold text-slate-400 font-mono">Receipts</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Counter POS & Online Orders</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '90%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown & Valuation Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                Category Valuation & Stock Share
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Visual breakdown of inventory asset value across store product lines
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {categoryStats.length} Categories
            </span>
          </div>

          {/* Visual Progress Stacked Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Inventory Asset Distribution</span>
              <span>100% Total Share</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-xl overflow-hidden flex shadow-inner">
              {categoryStats.map((cat, idx) => {
                const color = getCategoryColor(idx);
                return (
                  <div
                    key={cat.name}
                    style={{ width: `${Math.max(4, cat.percentValuation)}%` }}
                    className={`${color.bg} transition-all duration-500 relative group cursor-pointer hover:opacity-90`}
                    title={`${cat.name}: ${cat.percentValuation}% (${formatCurrency(cat.valuation)})`}
                  />
                );
              })}
            </div>
          </div>

          {/* Category Detail Rows */}
          <div className="space-y-3 pt-2">
            {categoryStats.map((cat, idx) => {
              const color = getCategoryColor(idx);
              return (
                <div
                  key={cat.name}
                  className={`p-3.5 rounded-2xl border ${color.border} ${color.lightBg} flex items-center justify-between gap-4 transition-all hover:shadow-xs`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full ${color.bg} shrink-0`} />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{cat.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {cat.count} SKUs • {cat.stock} Total Units
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-sm text-slate-900">
                      {formatCurrency(cat.valuation)}
                    </div>
                    <div className={`text-[11px] font-bold ${color.text}`}>
                      {cat.percentValuation}% Share
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Asset Products & Velocity Widget */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  Top Inventory Assets
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Highest capital investment products
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {topValuedProducts.map((p, idx) => {
                const itemValuation = p.price * p.stock;
                return (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="truncate">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{p.name}</h5>
                        <p className="text-[10px] font-mono text-slate-500">
                          SKU: {p.sku} • Stock: {p.stock}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-xs text-emerald-700">
                        {formatCurrency(itemValuation)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {formatCurrency(Number(p.price))} / unit
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stock Action Box */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase">Fast Action</span>
              <Boxes className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Need to record new inventory shipment or adjust reorder thresholds?
            </p>
            <Link
              to="/staff/shop/inventory"
              className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-colors mt-1"
            >
              Open Stock Audit Terminal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Low Stock Urgent Audit Table */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-amber-950">Critical Low Stock Diagnostics</h3>
                <p className="text-xs text-amber-800 font-medium">
                  {lowStockItems.length} products have reached or dropped below their minimum reorder point.
                </p>
              </div>
            </div>

            <Link
              to="/staff/shop/inventory"
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs shrink-0"
            >
              Restock All Now
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockItems.map((item) => (
              <div key={item.id} className="bg-white border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 truncate max-w-[180px]">{item.name}</h4>
                  <span className="text-[10px] font-mono text-slate-500">Reorder Level: {item.reorderLevel} units</span>
                </div>
                <div className="text-right">
                  <span className="bg-rose-100 text-rose-800 font-black text-xs px-2.5 py-1 rounded-lg inline-block">
                    {item.stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
