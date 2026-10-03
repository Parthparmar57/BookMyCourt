import React, { useState } from 'react';
import { useProducts, useStockIn } from '../../../hooks/useShop';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { ShoppingBag, AlertTriangle, Plus, Loader2, X } from 'lucide-react';

export const ShopInventoryPage = () => {
  const productsQuery = useProducts();
  const stockIn = useStockIn();
  const [stockTarget, setStockTarget] = useState(null); // product being restocked
  const [form, setForm] = useState({ quantity: 10, cost: '', supplier: '' });
  const [error, setError] = useState('');

  const openStockIn = (p) => {
    setError('');
    setForm({ quantity: 10, cost: '', supplier: '' });
    setStockTarget(p);
  };

  const submitStockIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await stockIn.mutateAsync({
        productId: stockTarget.id,
        quantity: Number(form.quantity),
        ...(form.cost ? { cost: Number(form.cost) } : {}),
        ...(form.supplier ? { supplier: form.supplier } : {}),
      });
      setStockTarget(null);
    } catch (err) {
      setError(err?.message || 'Could not record stock.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Retail Shop & Shared Inventory Pool</h1>
          <p className="text-xs text-slate-500">Omnichannel stock pool synchronized live between counter POS and online member shop.</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4" />
          Omnichannel Shared Pool Active
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                <th className="p-4">SKU</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Reorder Level</th>
                <th className="p-4 text-center">Stock In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              <QueryState
                query={productsQuery}
                loading={<tr><td colSpan={7} className="p-6 text-center text-slate-400"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading inventory…</td></tr>}
                empty={<tr><td colSpan={7} className="p-6 text-center text-slate-400">No products yet.</td></tr>}
                emptyWhen={(d) => !d?.length}
              >
                {(products) => products.map((p) => {
                  const isLowStock = p.stock <= p.reorderLevel;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">{p.sku}</td>
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />}
                        <span>{p.name}</span>
                      </td>
                      <td className="p-4 text-slate-600">{p.category}</td>
                      <td className="p-4 font-bold text-slate-900">{formatCurrency(Number(p.price))}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                          isLowStock ? 'bg-amber-100 text-amber-900 flex items-center gap-1 w-fit' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                          {p.stock} Units
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{p.reorderLevel} Units</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => openStockIn(p)}
                            className="px-3 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 text-[11px]"
                          >
                            <Plus className="w-3.5 h-3.5" /> Stock In
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </QueryState>
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In modal */}
      {stockTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Stock In — {stockTarget.name}</h3>
              <button onClick={() => setStockTarget(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {error && <div className="p-2 bg-rose-50 text-rose-700 text-xs rounded-xl">{error}</div>}
            <form onSubmit={submitStockIn} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Quantity *</label>
                <input type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block mb-1">Unit Cost (optional)</label>
                <input type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none" placeholder="₹" />
              </div>
              <div>
                <label className="block mb-1">Supplier (optional)</label>
                <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none" placeholder="Supplier name" />
              </div>
              <button type="submit" disabled={stockIn.isPending} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2">
                {stockIn.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Record Stock In
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
