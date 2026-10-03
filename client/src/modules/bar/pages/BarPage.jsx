import React, { useState, useEffect } from 'react';
import { barApi } from '../../../services/apiServices';
import { MOCK_MENU_ITEMS } from '../../../data/mockData';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Coffee, Send, Plus, Minus, CheckCircle2 } from 'lucide-react';

export const BarPage = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    barApi.getTables().then(setTables);
  }, []);

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === item.id);
      if (exist) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const categories = ['All', 'Beverages', 'Proteins', 'Meals', 'Snacks'];
  const filteredMenu = activeCategory === 'All' ? MOCK_MENU_ITEMS : MOCK_MENU_ITEMS.filter(m => m.category === activeCategory);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 8 Cols: Table Selection & Menu Grid */}
      <div className="lg:col-span-8 space-y-6">
        <div className="border-b pb-3 border-slate-200">
          <h1 className="text-2xl font-extrabold text-slate-900">Bar & Cafeteria Touch POS</h1>
          <p className="text-xs text-slate-500">Touchscreen table management, item steppers, instant kitchen dispatch.</p>
        </div>

        {/* Table selector cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tables.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTable(t)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedTable?.id === t.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : t.status === 'OCCUPIED'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span>{t.tableNumber}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  t.status === 'OCCUPIED' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {t.status}
                </span>
              </div>
              <p className="text-[11px] mt-2 font-medium opacity-80">{t.activeMember || 'Empty Table'}</p>
            </button>
          ))}
        </div>

        {/* Menu category tabs */}
        <div className="flex items-center gap-2 border-b pb-2 border-slate-200 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredMenu.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
                <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="font-black text-slate-900 text-base">{formatCurrency(item.price)}</span>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right 4 Cols: Order Summary Sidebar */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-lg flex flex-col justify-between h-[600px]">
        <div className="space-y-4">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Current Order</h3>
            <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-full">
              {selectedTable ? selectedTable.tableNumber : 'Select Table'}
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8 font-medium">No items added to order yet.</p>
            ) : (
              cart.map((i) => (
                <div key={i.id} className="flex items-center justify-between text-xs font-bold text-slate-800 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <div>{i.name}</div>
                    <span className="text-[10px] text-slate-500 font-normal">{formatCurrency(i.price)} x {i.qty}</span>
                  </div>
                  <span className="font-black text-slate-900">{formatCurrency(i.price * i.qty)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex justify-between font-black text-lg text-slate-900">
            <span>Total:</span>
            <span className="text-emerald-600">{formatCurrency(cartTotal)}</span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => {
              alert('Order dispatched live to Kitchen Display Screen (KDS)!');
              setCart([]);
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span>Send Order to KDS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
