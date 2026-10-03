import React, { useState, useMemo } from 'react';
import { 
  useMenu, 
  useBarTables, 
  useCreateBarOrder, 
  useBarOrders, 
  useTabs, 
  useSettleTab, 
  useCreateMenuItem, 
  useUpdateMenuItem,
  useDeleteMenuItem
} from '../../../hooks/useBar';
import { formatCurrency } from '../../../shared/utils/formatters';
import { 
  Coffee, 
  Utensils, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  X, 
  Loader2, 
  Plus, 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  Users, 
  ShoppingBag,
  Download,
  Edit,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useMembers } from '../../../hooks/useMembership';

export const BarPage = () => {
  const { data: tables = [] } = useBarTables();
  const { data: menu = [] } = useMenu();
  const { data: orders = [] } = useBarOrders();
  const { data: tabs = [] } = useTabs();
  const { data: membersData } = useMembers();
  const members = membersData?.items || [];

  const createBarOrder = useCreateBarOrder();
  const settleTab = useSettleTab();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'orders' | 'tabs' | 'menu' | 'reports'

  // POS State
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'card' | 'upi' | 'tab'
  const [feedback, setFeedback] = useState(null);

  // Menu Modal State
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState({ name: '', category: 'BEVERAGES', price: '', description: '', isAvailable: true });

  // Settle Tab Modal State
  const [settleTabTarget, setSettleTabTarget] = useState(null);
  const [tabPaymentMode, setTabPaymentMode] = useState('CARD');

  // Categories
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(menu.map((m) => m.category)))],
    [menu]
  );
  const availableMenu = menu.filter((m) => m.isAvailable);
  const filteredMenu = activeCategory === 'All' ? availableMenu : availableMenu.filter((m) => m.category === activeCategory);

  // Calculated Stats
  const todayEarnings = orders.reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);
  const occupiedTablesCount = tables.filter((t) => t.status === 'OCCUPIED').length;
  const activeTabsCount = tabs.length;
  const totalTabsOwed = tabs.reduce((sum, t) => sum + Number(t.totalUnpaid || t.amount || 0), 0);

  // Member discount calculation
  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const memberDiscountPct = selectedMember?.plan?.barDiscount ? Number(selectedMember.plan.barDiscount) : 0;
  
  const cartSubtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const cartDiscount = (cartSubtotal * memberDiscountPct) / 100;
  const cartTotal = cartSubtotal - cartDiscount;

  const addToCart = (item) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === item.id);
      if (exist) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const handleSendOrder = async () => {
    if (!cart.length) return;
    setFeedback(null);
    try {
      await createBarOrder.mutateAsync({
        barTableId: selectedTable?.id || null,
        memberId: selectedMemberId || null,
        paymentMode: paymentMode.toUpperCase(),
        items: cart.map((i) => ({ menuItemId: i.id, quantity: i.qty })),
      });
      setCart([]);
      setSelectedTable(null);
      setSelectedMemberId('');
      setFeedback({ type: 'success', msg: 'Order placed & dispatched to Kitchen Display Screen (KDS).' });
    } catch (err) {
      setFeedback({ type: 'error', msg: err?.message || 'Could not place the order.' });
    }
  };

  const handleCreateOrUpdateMenu = async (e) => {
    e.preventDefault();
    try {
      if (editingMenuItem) {
        await updateMenuItem.mutateAsync({
          id: editingMenuItem.id,
          name: menuForm.name,
          category: menuForm.category,
          price: Number(menuForm.price),
          description: menuForm.description,
          isAvailable: menuForm.isAvailable,
        });
      } else {
        await createMenuItem.mutateAsync({
          name: menuForm.name,
          category: menuForm.category,
          price: Number(menuForm.price),
          description: menuForm.description,
          isAvailable: menuForm.isAvailable,
        });
      }
      setShowAddMenuModal(false);
      setEditingMenuItem(null);
      setMenuForm({ name: '', category: 'Drinks', price: '', description: '', isAvailable: true });
    } catch (err) {
      alert(err?.message || 'Error saving menu item');
    }
  };

  const handleSettleTabSubmit = async (e) => {
    e.preventDefault();
    if (!settleTabTarget) return;
    try {
      await settleTab.mutateAsync({
        id: settleTabTarget.id,
        paymentMode: tabPaymentMode,
      });
      setSettleTabTarget(null);
    } catch (err) {
      alert(err?.message || 'Could not settle tab.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="text-xs font-mono font-black tracking-widest uppercase text-[#2e7d32] flex items-center gap-2">
            <span>BAR & CAFETERIA MANAGEMENT</span>
            <span>•</span>
            <span>LIVE POS & KITCHEN FEED</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bar Sales & <span className="text-[#2e7d32]">Cafeteria Operations</span>
          </h1>
          <p className="text-xs text-slate-600 font-semibold">
            Real-time table touch POS, member tab settlement, kitchen KDS synchronization, and menu control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'pos'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Coffee className="w-4 h-4" /> Touch POS
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" /> Live Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('tabs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'tabs'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Member Tabs ({tabs.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'menu'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Utensils className="w-4 h-4" /> Menu Catalog
          </button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>TODAY'S BAR REVENUE</span>
            <DollarSign className="w-4 h-4 text-[#2e7d32]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(todayEarnings)}</p>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            Live POS & Tab settled
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>OCCUPIED TABLES</span>
            <Utensils className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{occupiedTablesCount} / {tables.length}</p>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            {tables.length - occupiedTablesCount} tables available
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>ACTIVE MEMBER TABS</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{activeTabsCount}</p>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
            Unpaid: {formatCurrency(totalTabsOwed)}
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>MENU ITEMS</span>
            <Coffee className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{menu.length}</p>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
            {availableMenu.length} active on menu
          </span>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <span className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" /> : <AlertCircle className="w-4 h-4 text-rose-600" />} 
            {feedback.msg}
          </span>
          <button onClick={() => setFeedback(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* TAB 1: TOUCH POS */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tables & Menu */}
          <div className="lg:col-span-8 space-y-6">
            {/* Table Selection */}
            <div className="bg-white border border-gray-200 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#2e7d32]" /> Select Table / Counter
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  {selectedTable ? `Table ${selectedTable.number} Selected` : 'Direct Counter Order'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setSelectedTable(null)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedTable === null
                      ? 'bg-[#2e7d32] text-white border-[#2e7d32] shadow-sm font-bold'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-500 font-semibold'
                  }`}
                >
                  <div className="text-xs font-black">Direct Takeaway</div>
                  <div className="text-[10px] opacity-80 mt-0.5">Counter POS</div>
                </button>
                {tables.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTable(selectedTable?.id === t.id ? null : t)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedTable?.id === t.id
                        ? 'bg-[#2e7d32] text-white border-[#2e7d32] shadow-sm font-bold'
                        : t.status === 'OCCUPIED'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span>Table {t.number}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        t.status === 'OCCUPIED' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="text-[10px] opacity-80 mt-1">Cap: {t.capacity} seats</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category tabs & Menu Grid */}
            <div className="bg-white border border-gray-200 p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Food & Drink Catalog</h3>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                        activeCategory === cat
                          ? 'bg-[#e8f5e9] text-[#2e7d32] border border-emerald-300'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredMenu.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-emerald-500 transition-all group"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                      <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{item.name}</h4>
                      {item.description && <p className="text-[10px] text-slate-500 line-clamp-1">{item.description}</p>}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 mt-2">
                      <span className="font-black text-slate-900 text-xs">{formatCurrency(Number(item.price))}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-[#2e7d32] hover:bg-[#236327] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-2xs group-hover:scale-105"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Cart & Member Discount */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-[680px]">
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Current Order Cart</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {selectedTable ? `Table ${selectedTable.number}` : 'Direct Takeaway POS'}
                  </p>
                </div>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-[10px] font-bold text-rose-600 hover:underline">
                    Clear
                  </button>
                )}
              </div>

              {/* Member Selection for Automatic Discount */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <label className="text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
                  <span>Club Member (Optional)</span>
                  {memberDiscountPct > 0 && (
                    <span className="text-[10px] font-bold text-[#2e7d32] bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {memberDiscountPct}% Bar Discount
                    </span>
                  )}
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl text-xs font-semibold px-2.5 py-2 text-slate-800 focus:outline-none focus:border-[#2e7d32]"
                >
                  <option value="">Walk-in Guest / Non-Member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.plan?.name || 'Standard'} • {m.plan?.barDiscount || 0}% OFF)
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {cart.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <Coffee className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400 font-semibold">No items added to current order.</p>
                  </div>
                ) : (
                  cart.map((i) => (
                    <div key={i.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <div className="font-extrabold text-slate-900">{i.name}</div>
                        <div className="text-[10px] text-slate-500">{formatCurrency(Number(i.price))} each</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-white font-bold">
                          <button onClick={() => updateCartQty(i.id, -1)} className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-l-xl">-</button>
                          <span className="px-2 text-slate-900">{i.qty}</span>
                          <button onClick={() => updateCartQty(i.id, 1)} className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-r-xl">+</button>
                        </div>
                        <span className="font-black text-slate-900 w-14 text-right">
                          {formatCurrency(Number(i.price) * i.qty)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment & Submit Area */}
            <div className="pt-4 border-t border-gray-100 space-y-3 bg-white">
              {/* Payment Mode */}
              <div className="grid grid-cols-4 gap-1.5">
                {['cash', 'card', 'upi', 'tab'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                      paymentMode === mode
                        ? 'bg-[#2e7d32] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(cartSubtotal)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-[#2e7d32] font-bold">
                    <span>Member Discount ({memberDiscountPct}%):</span>
                    <span>-{formatCurrency(cartDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total Payable:</span>
                  <span className="text-[#2e7d32]">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleSendOrder}
                disabled={!cart.length || createBarOrder.isPending}
                className="w-full bg-[#2e7d32] hover:bg-[#236327] disabled:opacity-50 text-white font-extrabold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {createBarOrder.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Utensils className="w-4 h-4" /> Dispatch Order to Kitchen KDS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-black text-base text-slate-900">Live & Recent Bar Orders</h3>
            <span className="text-xs font-bold text-slate-500">Total Orders: {orders.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-mono uppercase">
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Table / Service</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">#{o.id.slice(-6)}</td>
                    <td className="p-3.5 text-slate-800">
                      {o.table ? `Table ${o.table.number}` : 'Direct POS'}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {o.items?.map((i) => `${i.menuItem?.name || 'Item'} (${i.quantity})`).join(', ') || 'Bar Items'}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        {o.paymentMode || 'CASH'}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-slate-900">{formatCurrency(Number(o.totalAmount || o.total || 0))}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-md ${
                        o.status === 'SERVED' ? 'bg-emerald-100 text-emerald-800' :
                        o.status === 'PREPARING' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                      }`}>
                        {o.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">No live bar orders yet today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MEMBER TABS */}
      {activeTab === 'tabs' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Member Running Bar Tabs</h3>
              <p className="text-xs text-slate-500 font-medium">Unpaid running tabs accumulated by club members</p>
            </div>
            <span className="text-xs font-black bg-emerald-50 text-[#2e7d32] border border-emerald-200 px-3 py-1.5 rounded-xl">
              Total Unpaid: {formatCurrency(totalTabsOwed)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabs.map((t) => (
              <div key={t.id} className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{t.member?.name || 'Member Tab'}</span>
                  <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                    OPEN TAB
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  <div>Member ID: #{t.memberId?.slice(-6) || 'MEM'}</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{formatCurrency(Number(t.totalUnpaid || t.amount || 0))}</div>
                </div>
                <button
                  onClick={() => setSettleTabTarget(t)}
                  className="w-full bg-[#2e7d32] hover:bg-[#236327] text-white font-extrabold text-xs py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Settle Tab Bill
                </button>
              </div>
            ))}
            {!tabs.length && (
              <p className="text-xs text-slate-400 col-span-full py-8 text-center font-medium">No active open member tabs.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MENU CATALOG MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Bar & Cafeteria Menu Catalog</h3>
              <p className="text-xs text-slate-500 font-medium">Manage drinks, meals, prices, and availability</p>
            </div>
            <button
              onClick={() => {
                setEditingMenuItem(null);
                setMenuForm({ name: '', category: 'Drinks', price: '', description: '', isAvailable: true });
                setShowAddMenuModal(true);
              }}
              className="bg-[#2e7d32] hover:bg-[#236327] text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Menu Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.map((item) => (
              <div key={item.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{item.category}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold ${item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {item.isAvailable ? 'ACTIVE' : 'OUT OF STOCK'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 mt-3">
                  <span className="font-black text-slate-900 text-sm">{formatCurrency(Number(item.price))}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingMenuItem(item);
                        setMenuForm({
                          name: item.name,
                          category: item.category,
                          price: item.price,
                          description: item.description || '',
                          isAvailable: item.isAvailable,
                        });
                        setShowAddMenuModal(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MENU ITEM */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingMenuItem ? 'Edit Menu Item' : 'Add New Bar / Cafeteria Item'}
              </h3>
              <button onClick={() => setShowAddMenuModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateOrUpdateMenu} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Item Name *</label>
                <input
                  required
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:border-[#2e7d32] focus:outline-none text-slate-900"
                  placeholder="e.g. Protein Smoothie"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Category *</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:border-[#2e7d32] focus:outline-none text-slate-900"
                  >
                    <option value="BEVERAGES">Beverages</option>
                    <option value="HEALTH_DRINKS">Health & Protein Drinks</option>
                    <option value="SNACKS">Snacks & Bowls</option>
                    <option value="MEALS">Meals & Paninis</option>
                    <option value="DESSERTS">Desserts</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:border-[#2e7d32] focus:outline-none text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <input
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:border-[#2e7d32] focus:outline-none text-slate-900"
                  placeholder="Short ingredient / taste note"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="avail"
                  checked={menuForm.isAvailable}
                  onChange={(e) => setMenuForm({ ...menuForm, isAvailable: e.target.checked })}
                  className="rounded text-[#2e7d32] focus:ring-[#2e7d32]"
                />
                <label htmlFor="avail" className="text-xs font-extrabold text-slate-800">Item is available for ordering</label>
              </div>
              <button
                type="submit"
                className="w-full bg-[#2e7d32] hover:bg-[#236327] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm cursor-pointer mt-2"
              >
                Save Menu Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SETTLE TAB */}
      {settleTabTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Settle Member Tab</h3>
              <button onClick={() => setSettleTabTarget(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">{settleTabTarget.member?.name || 'Member'}</div>
              <div className="text-base font-black text-[#2e7d32]">
                Amount Due: {formatCurrency(Number(settleTabTarget.totalUnpaid || settleTabTarget.amount || 0))}
              </div>
            </div>
            <form onSubmit={handleSettleTabSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block mb-1 text-slate-700">Payment Mode</label>
                <select
                  value={tabPaymentMode}
                  onChange={(e) => setTabPaymentMode(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#2e7d32] focus:outline-none"
                >
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="UPI">UPI / QR Payment</option>
                  <option value="CASH">Cash Counter</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#2e7d32] hover:bg-[#236327] text-white font-extrabold text-xs py-3 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Confirm Payment & Close Tab
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
