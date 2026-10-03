import React, { useState, useMemo } from 'react';
import {
  useMenu,
  useBarTables,
  useCreateBarOrder,
  useBarOrders,
  useUpdateBarOrderStatus,
  useVoidBarOrder,
  useTabs,
  useSettleTab,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useActiveShift,
  useShiftReport,
  useOpenShift,
  useCloseShift
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
  Sparkles,
  Wallet,
  LogOut,
  Ban,
  Printer,
  Search
} from 'lucide-react';
import { useMembers } from '../../../hooks/useMembership';
import { useAuth } from '../../../context/AuthContext';

export const BarPage = () => {
  const { currentRole } = useAuth();
  const { data: tables = [] } = useBarTables();
  const { data: menu = [] } = useMenu();
  const { data: orders = [] } = useBarOrders();
  const { data: tabs = [] } = useTabs();
  const { data: membersData } = useMembers();
  const members = membersData?.items || [];

  const createBarOrder = useCreateBarOrder();
  const updateBarOrderStatus = useUpdateBarOrderStatus();
  const voidBarOrder = useVoidBarOrder();
  const settleTab = useSettleTab();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  // Cash shift (open / live report / close & reconcile)
  const activeShiftQuery = useActiveShift();
  const activeShift = activeShiftQuery.data || null;
  const shiftReportQuery = useShiftReport(activeShift?.id);
  const openShift = useOpenShift();
  const closeShift = useCloseShift();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'orders' | 'tabs' | 'menu' | 'shift'

  // POS State
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'card' | 'upi' | 'tab'
  const [feedback, setFeedback] = useState(null);

  // Receipt & Void Modal States
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [voidTargetOrder, setVoidTargetOrder] = useState(null);
  const [voidReason, setVoidReason] = useState('');

  // Filtered members for POS dropdown search
  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery) return members;
    const q = memberSearchQuery.toLowerCase().trim();
    return members.filter(
      (m) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.user?.phone || m.phone || '').toLowerCase().includes(q) ||
        (m.memberNo || '').toLowerCase().includes(q)
    );
  }, [members, memberSearchQuery]);

  // Top selling menu items calculation
  const topSellingItems = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const name = item.menuItem?.name || 'Item';
        counts[name] = (counts[name] || 0) + (item.quantity || 1);
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  // Menu Modal State
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState({ name: '', category: 'BEVERAGES', price: '', description: '', isAvailable: true });

  // Settle Tab Modal State
  const [settleTabTarget, setSettleTabTarget] = useState(null);
  const [tabPaymentMode, setTabPaymentMode] = useState('CARD');

  // Shift state
  const [openShiftForm, setOpenShiftForm] = useState({ openingCash: '', notes: '' });
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [closeForm, setCloseForm] = useState({ closingCash: '', notes: '' });
  const [closedShift, setClosedShift] = useState(null); // closed shift record for reconciliation
  const [shiftError, setShiftError] = useState('');

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

  // Open a new cash shift with a starting float.
  const handleOpenShift = async (e) => {
    e.preventDefault();
    setShiftError('');
    try {
      await openShift.mutateAsync({
        openingCash: Number(openShiftForm.openingCash || 0),
        ...(openShiftForm.notes ? { notes: openShiftForm.notes } : {}),
      });
      setOpenShiftForm({ openingCash: '', notes: '' });
      setClosedShift(null);
    } catch (err) {
      setShiftError(err?.message || 'Could not open shift.');
    }
  };

  // Close the active shift with the counted cash; keep the result for reconciliation.
  const handleCloseShift = async (e) => {
    e.preventDefault();
    setShiftError('');
    if (!activeShift) return;
    try {
      const result = await closeShift.mutateAsync({
        id: activeShift.id,
        closingCash: Number(closeForm.closingCash || 0),
        ...(closeForm.notes ? { notes: closeForm.notes } : {}),
      });
      setClosedShift(result);
      setShowCloseShift(false);
      setCloseForm({ closingCash: '', notes: '' });
    } catch (err) {
      setShiftError(err?.message || 'Could not close shift.');
    }
  };

  // Live shift report summary + derived expected cash (opening float + cash sales).
  const shiftSummary = shiftReportQuery.data?.summary || null;
  const cashSales = shiftSummary?.paymentBreakdown?.CASH || 0;
  const expectedCash = activeShift ? Number(activeShift.openingCash || 0) + Number(cashSales) : 0;

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
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${activeTab === 'pos'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <Coffee className="w-4 h-4" /> Touch POS
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${activeTab === 'orders'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <Receipt className="w-4 h-4" /> Live Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('tabs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${activeTab === 'tabs'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <Users className="w-4 h-4" /> Member Tabs ({tabs.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${activeTab === 'menu'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <Utensils className="w-4 h-4" /> Menu Catalog
          </button>
          <button
            onClick={() => setActiveTab('shift')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${activeTab === 'shift'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <Wallet className="w-4 h-4" /> Cash Shift {activeShift ? '• OPEN' : ''}
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
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
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
                  className={`p-3 rounded-2xl border text-left transition-all ${selectedTable === null
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
                    className={`p-3 rounded-2xl border text-left transition-all ${selectedTable?.id === t.id
                        ? 'bg-[#2e7d32] text-white border-[#2e7d32] shadow-sm font-bold'
                        : t.status === 'OCCUPIED'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-500'
                      }`}
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span>Table {t.number}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${t.status === 'OCCUPIED' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${activeCategory === cat
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
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700">
                  <span>Identify Member (Auto Discount)</span>
                  {memberDiscountPct > 0 && (
                    <span className="text-[10px] font-bold text-[#2e7d32] bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {memberDiscountPct}% Plan Discount
                    </span>
                  )}
                </div>

                {/* Search Box */}
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, phone, member ID..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:border-[#2e7d32]"
                  />
                </div>

                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl text-xs font-semibold px-2.5 py-2 text-slate-800 focus:outline-none focus:border-[#2e7d32]"
                >
                  <option value="">Walk-in Guest / Non-Member</option>
                  {filteredMembers.map((m) => (
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
                    className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${paymentMode === mode
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
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">#{o.id.slice(-6)}</td>
                    <td className="p-3.5 text-slate-800">
                      {o.table ? `Table ${o.table.number}` : (o.barTable ? `Table ${o.barTable.number}` : 'Direct POS')}
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
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-md ${o.status === 'SERVED' || o.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          o.status === 'PREPARING' ? 'bg-amber-100 text-amber-900' :
                            o.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-900'
                        }`}>
                        {o.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      {/* Receipt Button */}
                      <button
                        onClick={() => setReceiptOrder(o)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all"
                        title="Print / View Receipt"
                      >
                        Receipt
                      </button>

                      {/* Mark Served Button */}
                      {o.status !== 'SERVED' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && (
                        <button
                          onClick={() => updateBarOrderStatus.mutate({ id: o.id, status: 'SERVED' })}
                          className="px-2.5 py-1 rounded-lg bg-[#2e7d32] hover:bg-[#236327] text-white text-[11px] font-bold transition-all"
                        >
                          Mark Served
                        </button>
                      )}

                      {/* Void Button (Owner Only) */}
                      {o.status !== 'CANCELLED' && (
                        currentRole === 'OWNER' ? (
                          <button
                            onClick={() => { setVoidTargetOrder(o); setVoidReason(''); }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-all"
                            title="Void Order (Owner Permission)"
                          >
                            Void
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic px-1" title="Only Owner can void orders">
                            (Owner Void Only)
                          </span>
                        )
                      )}
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">No live bar orders yet today.</td>
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
                    {/* Remove this item from the menu (with confirmation). */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove "${item.name}" from the menu?`)) {
                          deleteMenuItem.mutate(item.id);
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CASH SHIFT (open / live report / close & reconcile) */}
      {activeTab === 'shift' && (
        <div className="space-y-6">
          {shiftError && (
            <div className="p-4 rounded-2xl text-xs font-bold bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" /> {shiftError}
            </div>
          )}

          {/* No open shift → Open Shift form */}
          {!activeShift ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs max-w-md">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
                <Wallet className="w-5 h-5 text-[#2e7d32]" />
                <div>
                  <h3 className="font-black text-base text-slate-900">Start a Cash Shift</h3>
                  <p className="text-xs text-slate-500 font-medium">Count the opening float before taking orders.</p>
                </div>
              </div>

              {/* Reconciliation summary of the shift just closed */}
              {closedShift && (
                <div className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" /> Previous shift closed
                  </div>
                  <div className="flex justify-between text-slate-600"><span>Expected cash</span><span className="font-bold">{formatCurrency(Number(closedShift.expectedCash || 0))}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Counted cash</span><span className="font-bold">{formatCurrency(Number(closedShift.actualCash || closedShift.closingCash || 0))}</span></div>
                  <div className={`flex justify-between font-black ${Number(closedShift.actualCash || 0) - Number(closedShift.expectedCash || 0) < 0 ? 'text-rose-600' : 'text-[#2e7d32]'}`}>
                    <span>Difference</span>
                    <span>{formatCurrency(Number(closedShift.actualCash || 0) - Number(closedShift.expectedCash || 0))}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleOpenShift} className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1">Opening Cash Float (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={openShiftForm.openingCash}
                    onChange={(e) => setOpenShiftForm({ ...openShiftForm, openingCash: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#2e7d32] focus:outline-none"
                    placeholder="e.g. 2000"
                  />
                </div>
                <div>
                  <label className="block mb-1">Notes (optional)</label>
                  <input
                    value={openShiftForm.notes}
                    onChange={(e) => setOpenShiftForm({ ...openShiftForm, notes: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#2e7d32] focus:outline-none"
                    placeholder="e.g. Evening shift"
                  />
                </div>
                <button
                  type="submit"
                  disabled={openShift.isPending}
                  className="w-full bg-[#2e7d32] hover:bg-[#236327] disabled:opacity-60 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {openShift.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Wallet className="w-4 h-4" /> Open Shift
                </button>
              </form>
            </div>
          ) : (
            /* Active shift → summary + live report + close */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Shift summary */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#2e7d32]" /> Active Shift
                  </h3>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">OPEN</span>
                </div>
                <div className="text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between"><span>Cashier</span><span className="font-bold text-slate-900">{activeShift.employee?.user?.name || '—'}</span></div>
                  <div className="flex justify-between"><span>Opened</span><span className="font-bold text-slate-900">{activeShift.startTime ? new Date(activeShift.startTime).toLocaleString() : '—'}</span></div>
                  <div className="flex justify-between"><span>Opening float</span><span className="font-bold text-slate-900">{formatCurrency(Number(activeShift.openingCash || 0))}</span></div>
                </div>
                <button
                  onClick={() => { setShiftError(''); setShowCloseShift(true); }}
                  className="w-full mt-2 bg-slate-900 hover:bg-black text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Close Shift & Reconcile
                </button>
              </div>

              {/* Live report */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#2e7d32]" /> Shift Sales Report
                  </h3>
                  {shiftReportQuery.isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Sales</div>
                    <div className="text-lg font-black text-slate-900">{formatCurrency(Number(shiftSummary?.totalSales || 0))}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Paid Orders</div>
                    <div className="text-lg font-black text-slate-900">{shiftSummary?.paidOrders ?? 0} / {shiftSummary?.totalOrders ?? 0}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Cash Sales</div>
                    <div className="text-lg font-black text-slate-900">{formatCurrency(Number(cashSales))}</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                    <div className="text-[10px] font-mono uppercase text-[#2e7d32] font-bold">Expected Cash</div>
                    <div className="text-lg font-black text-[#2e7d32]">{formatCurrency(expectedCash)}</div>
                  </div>
                </div>

                {/* Payment-mode breakdown */}
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2">Sales by Payment Mode</div>
                  <div className="space-y-1.5">
                    {shiftSummary && Object.keys(shiftSummary.paymentBreakdown || {}).length > 0 ? (
                      Object.entries(shiftSummary.paymentBreakdown).map(([mode, amt]) => (
                        <div key={mode} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                          <span className="font-bold text-slate-700">{mode}</span>
                          <span className="font-black text-slate-900">{formatCurrency(Number(amt))}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">No paid sales in this shift yet.</p>
                    )}
                  </div>
                </div>

                {/* Top Selling Items */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2">Top Selling Bar & Kitchen Items</div>
                  {topSellingItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {topSellingItems.map((item) => (
                        <div key={item.name} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate">{item.name}</span>
                          <span className="font-black text-[#2e7d32] bg-emerald-100 px-2 py-0.5 rounded-md text-[10px] shrink-0 ml-1">
                            {item.count} sold
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">No top items recorded yet today.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CLOSE SHIFT */}
      {showCloseShift && activeShift && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Close Shift & Reconcile</h3>
              <button onClick={() => setShowCloseShift(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {/* Open Tabs Warning Alert */}
            {tabs.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Open Member Tabs Alert!
                </div>
                <p className="text-[11px] text-amber-700 leading-tight">
                  There are currently <strong>{tabs.length} open member tab(s)</strong> totaling <strong>{formatCurrency(totalTabsOwed)}</strong>. Ensure all open tabs are verified before completing shift handover.
                </p>
              </div>
            )}

            <div className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between"><span>Opening float</span><span className="font-bold">{formatCurrency(Number(activeShift.openingCash || 0))}</span></div>
              <div className="flex justify-between"><span>Cash sales</span><span className="font-bold">{formatCurrency(Number(cashSales))}</span></div>
              <div className="flex justify-between font-black text-[#2e7d32]"><span>Expected in drawer</span><span>{formatCurrency(expectedCash)}</span></div>
            </div>
            <form onSubmit={handleCloseShift} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Counted Closing Cash (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={closeForm.closingCash}
                  onChange={(e) => setCloseForm({ ...closeForm, closingCash: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#2e7d32] focus:outline-none"
                  placeholder="Counted cash in the drawer"
                />
              </div>
              <div>
                <label className="block mb-1">Notes (optional)</label>
                <input
                  value={closeForm.notes}
                  onChange={(e) => setCloseForm({ ...closeForm, notes: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#2e7d32] focus:outline-none"
                  placeholder="e.g. ₹50 short — noted"
                />
              </div>
              <button
                type="submit"
                disabled={closeShift.isPending}
                className="w-full bg-slate-900 hover:bg-black disabled:opacity-60 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {closeShift.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm & Close Shift
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VOID ORDER (OWNER ONLY) */}
      {voidTargetOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-rose-700 flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" /> Void & Refund Bar Order
              </h3>
              <button onClick={() => setVoidTargetOrder(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
              <div>Order ID: <strong className="text-slate-900">#{voidTargetOrder.id.slice(-6)}</strong></div>
              <div>Total Amount: <strong className="text-slate-900">{formatCurrency(Number(voidTargetOrder.totalAmount || voidTargetOrder.total || 0))}</strong></div>
              <p className="text-[11px] text-rose-600 font-bold pt-1">
                Owner Authorization Required: Voiding will cancel the order and refund ledger entries.
              </p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!voidReason.trim()) return alert('Please specify a valid reason to void this order.');
                try {
                  await voidBarOrder.mutateAsync({ id: voidTargetOrder.id, reason: voidReason });
                  setVoidTargetOrder(null);
                  setVoidReason('');
                } catch (err) {
                  alert(err?.message || 'Could not void order');
                }
              }}
              className="space-y-3 text-xs font-semibold"
            >
              <div>
                <label className="block mb-1 text-slate-800">Cancellation / Refund Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:border-rose-500 focus:outline-none text-xs"
                  placeholder="e.g. Customer returned dish, billing error..."
                />
              </div>
              <button
                type="submit"
                disabled={voidBarOrder.isPending}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {voidBarOrder.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Void & Refund Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL RECEIPT */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <img src="/bookmycourt_logo.png" alt="Logo" className="h-6 w-auto rounded object-contain" />
                <span className="font-black text-sm text-slate-900 font-sans">CHAMPIONS CLUB CAFETERIA</span>
              </div>
              <button onClick={() => setReceiptOrder(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {/* Receipt Body */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs text-slate-800">
              <div className="text-center border-b border-dashed border-slate-300 pb-2 space-y-0.5">
                <div className="font-black text-slate-900 text-sm">BAR RECEIPT</div>
                <div className="text-[10px] text-slate-500">Order #{receiptOrder.id.slice(-6)} • {new Date(receiptOrder.createdAt || Date.now()).toLocaleString()}</div>
                <div className="text-[10px] text-slate-600 font-bold uppercase">{receiptOrder.barTable ? `Table ${receiptOrder.barTable.number}` : 'Takeaway POS'}</div>
              </div>

              {/* Items List */}
              <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
                {receiptOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span>{item.quantity}× {item.menuItem?.name || 'Item'}</span>
                    <span className="font-bold">{formatCurrency(Number(item.unitPrice || item.price || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Pricing Totals */}
              <div className="space-y-1 text-xs pt-1">
                {receiptOrder.subtotal && (
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(Number(receiptOrder.subtotal))}</span>
                  </div>
                )}
                {Number(receiptOrder.discount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Member Discount</span>
                    <span>-{formatCurrency(Number(receiptOrder.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL PAID</span>
                  <span className="text-[#2e7d32]">{formatCurrency(Number(receiptOrder.totalAmount || receiptOrder.total || 0))}</span>
                </div>
                <div className="text-[10px] text-slate-500 text-right uppercase pt-0.5">
                  Payment Mode: {receiptOrder.paymentMode || 'PAID'}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-black text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <Printer className="w-4 h-4" /> Print Digital Receipt
              </button>
              <button
                onClick={() => setReceiptOrder(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 rounded-xl cursor-pointer font-sans"
              >
                Close
              </button>
            </div>
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
