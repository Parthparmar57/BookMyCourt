import React, { useState, useMemo } from 'react';
import { useMenu, useBarTables, useCreateBarOrder } from '../../../hooks/useBar';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Send, Loader2, CheckCircle2, X } from 'lucide-react';

export const BarPage = () => {
  const { data: tables = [] } = useBarTables();
  const { data: menu = [] } = useMenu();
  const createBarOrder = useCreateBarOrder();

  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(menu.map((m) => m.category)))],
    [menu]
  );
  const available = menu.filter((m) => m.isAvailable);
  const filteredMenu = activeCategory === 'All' ? available : available.filter((m) => m.category === activeCategory);
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  const addToCart = (item) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === item.id);
      if (exist) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const sendOrder = async () => {
    if (!cart.length) return;
    setFeedback(null);
    try {
      await createBarOrder.mutateAsync({
        barTableId: selectedTable?.id || null,
        items: cart.map((i) => ({ menuItemId: i.id, quantity: i.qty })),
      });
      setCart([]);
      setFeedback({ type: 'success', msg: 'Order placed and sent to the kitchen display.' });
    } catch (err) {
      setFeedback({ type: 'error', msg: err?.message || 'Could not place the order.' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: tables + menu */}
      <div className="lg:col-span-8 space-y-6">
        <div className="border-b pb-3 border-slate-200">
          <h1 className="text-2xl font-extrabold text-slate-900">Bar & Cafeteria Touch POS</h1>
          <p className="text-xs text-slate-500">Touchscreen table management, item steppers, instant kitchen dispatch.</p>
        </div>

        {feedback && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            <span className="flex items-center gap-2">
              {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4" />} {feedback.msg}
            </span>
            <button onClick={() => setFeedback(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Table selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tables.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTable(selectedTable?.id === t.id ? null : t)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedTable?.id === t.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : t.status === 'OCCUPIED'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span>Table {t.number}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  t.status === 'OCCUPIED' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {t.status}
                </span>
              </div>
              <p className="text-[11px] mt-2 font-medium opacity-80">Seats {t.capacity}</p>
            </button>
          ))}
          {!tables.length && <p className="text-xs text-slate-400 col-span-full">No tables configured.</p>}
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 border-b pb-2 border-slate-200 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredMenu.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
                <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="font-black text-slate-900 text-base">{formatCurrency(Number(item.price))}</span>
                <button onClick={() => addToCart(item)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                  + Add
                </button>
              </div>
            </div>
          ))}
          {!filteredMenu.length && <p className="text-xs text-slate-400 col-span-full">No menu items.</p>}
        </div>
      </div>

      {/* Right: order summary */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-lg flex flex-col justify-between h-[600px]">
        <div className="space-y-4">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Current Order</h3>
            <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-full">
              {selectedTable ? `Table ${selectedTable.number}` : 'No Table'}
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
                    <span className="text-[10px] text-slate-500 font-normal">{formatCurrency(Number(i.price))} x {i.qty}</span>
                  </div>
                  <span className="font-black text-slate-900">{formatCurrency(Number(i.price) * i.qty)}</span>
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
            disabled={cart.length === 0 || createBarOrder.isPending}
            onClick={sendOrder}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {createBarOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-400" />}
            <span>Send Order to KDS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
