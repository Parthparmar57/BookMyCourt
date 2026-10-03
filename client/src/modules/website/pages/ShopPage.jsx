import React from 'react';
import { MOCK_PRODUCTS } from '../../../data/mockData';
import { formatCurrency } from '../../../shared/utils/formatters';
import { ShoppingBag, Tag, CheckCircle2 } from 'lucide-react';

export const ShopPage = () => {
  return (
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
          OMNICHANNEL STORE
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Pro Gear & Equipment Shop
        </h1>
        <p className="text-sm text-slate-600">
          Shared stock pool synchronized live between counter retail POS and online member store.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {MOCK_PRODUCTS.map((prod) => (
          <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="relative aspect-square bg-slate-100 overflow-hidden">
              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {prod.category}
              </span>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400">SKU: {prod.sku}</span>
                <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{prod.name}</h4>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-slate-900">{formatCurrency(prod.price)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    prod.stock > prod.reorderLevel ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {prod.stock > 0 ? `${prod.stock} In Stock` : 'Out of Stock'}
                  </span>
                </div>
                <button
                  disabled={prod.stock === 0}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{prod.stock > 0 ? 'Buy Item' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
