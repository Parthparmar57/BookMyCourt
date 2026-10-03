import React, { useState, useEffect } from 'react';
import { shopApi } from '../../../services/apiServices';
import { formatCurrency } from '../../../shared/utils/formatters';
import { ShoppingBag, AlertTriangle, Plus, Minus, CheckCircle2 } from 'lucide-react';

export const ShopInventoryPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    shopApi.getProducts().then(setProducts);
  }, []);

  const handleStockAdjust = async (id, delta) => {
    await shopApi.updateStock(id, delta);
    const updated = await shopApi.getProducts();
    setProducts(updated);
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
                <th className="p-4 text-center">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {products.map((p) => {
                const isLowStock = p.stock <= p.reorderLevel;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{p.sku}</td>
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                      <span>{p.name}</span>
                    </td>
                    <td className="p-4 text-slate-600">{p.category}</td>
                    <td className="p-4 font-bold text-slate-900">{formatCurrency(p.price)}</td>
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
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStockAdjust(p.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleStockAdjust(p.id, 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
