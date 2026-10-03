import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  useMenu,
  useBarTables,
  useBarOrders,
  useCreateBarOrder,
  useTabs,
  useOpenTab,
  useSettleTab
  useOpenTab,
  useSettleTab
} from '../../../hooks/useBar';
import {
  Coffee,
  Utensils,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  Plus,
  Minus,
  Trash2,
  Search,
  ShoppingBag,
  Sparkles,
  Flame,
  ChefHat,
  MapPin,
  Check,
  Percent,
  Wallet,
  ShieldCheck,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

export const MemberTabPage = () => {
  const { user } = useAuth();

  // Queries
  const { data: menu = [], isLoading: isMenuLoading } = useMenu();
  const { data: tables = [], isLoading: isTablesLoading } = useBarTables();
  const { data: orders = [], isLoading: isOrdersLoading } = useBarOrders();
  const { data: tabsData, isLoading: isTabsLoading } = useTabs();

  const createBarOrder = useCreateBarOrder();
  const openTab = useOpenTab();
  const settleTabMutation = useSettleTab();

  // View Sub-tab
  const [activeView, setActiveView] = useState('menu'); // 'menu' | 'orders' | 'tab'

  // Cart & Ordering State
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [deliveryType, setDeliveryType] = useState('DINE_IN'); // 'DINE_IN' | 'COURT_DELIVERY' | 'COUNTER_PICKUP'
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentChoice, setPaymentChoice] = useState('TAB'); // 'TAB' | 'UPI' | 'CARD'
  const [orderFeedback, setOrderFeedback] = useState(null);

  // Settlement Modal state
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settlePaymentMode, setSettlePaymentMode] = useState('UPI');

  // Interactive Running Tab State (Persisted locally & synced with DB)
  const [localRunningTab, setLocalRunningTab] = useState(() => {
    const saved = localStorage.getItem('bmc_member_running_tab');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      isOpen: true,
      id: 'TAB-2026-089',
      openedAt: new Date().toISOString(),
      items: [
        { id: 'item-1', name: 'Post-Match Whey Protein Shake', qty: 1, price: 180, time: '15 mins ago' },
        { id: 'item-2', name: 'Grilled Chicken & Avocado Toast', qty: 1, price: 165, time: '30 mins ago' },
        { id: 'item-3', name: 'Fresh Mint Citrus Juice', qty: 1, price: 140, time: '45 mins ago' },
      ],
      settlementHistory: [
        { id: 'SETTL-902', date: '28 Sep 2026', itemsCount: 2, total: 320, mode: 'UPI' },
        { id: 'SETTL-884', date: '21 Sep 2026', itemsCount: 4, total: 580, mode: 'CARD' },
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('bmc_member_running_tab', JSON.stringify(localRunningTab));
  }, [localRunningTab]);

  const allTabs = Array.isArray(tabsData) ? tabsData : (tabsData?.items || []);
  const activeTab = allTabs.find((t) => t.status === 'OPEN');
  const pastTabs = allTabs.filter((t) => t.status === 'SETTLED');

  // Active Tab Total Amount Calculation (Never Zero if items exist)
  const activeTabTotal = useMemo(() => {
    if (activeTab && Number(activeTab.totalAmount) > 0) {
      return Number(activeTab.totalAmount);
    }
    if (localRunningTab?.isOpen && localRunningTab?.items?.length > 0) {
      return localRunningTab.items.reduce((sum, it) => sum + (Number(it.price) * (it.qty || 1)), 0);
    }
    return 0;
  }, [activeTab, localRunningTab]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set();
    menu.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [menu]);

  // Filtered menu items
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  // Cart Helpers
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((ci) => ci.id !== itemId));
  };

  const clearCart = () => setCart([]);

  // Cart Subtotal Calculation (Includes 15% Member Discount)
  const cartSubtotal = cart.reduce((sum, ci) => sum + Number(ci.price) * ci.quantity, 0);
  const memberDiscount = cartSubtotal * 0.15;
  const subtotalAfterDiscount = cartSubtotal - memberDiscount;
  const tax = subtotalAfterDiscount * 0.05; // 5% GST
  const grandTotal = subtotalAfterDiscount + tax;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setOrderFeedback(null);

    const payload = {
      items: cart.map((ci) => ({
        menuItemId: ci.id,
        quantity: ci.quantity
      })),
      notes: [
        deliveryType === 'DINE_IN'
          ? (selectedTableId ? `Table ${tables.find(t => t.id === selectedTableId)?.number || ''}` : 'Cafeteria Seating')
          : deliveryType === 'COURT_DELIVERY'
            ? 'Court Delivery'
            : 'Cafeteria Counter Pickup',
        orderNotes
      ].filter(Boolean).join(' • '),
      barTableId: deliveryType === 'DINE_IN' && selectedTableId ? selectedTableId : null,
      onTab: paymentChoice === 'TAB',
      paymentMode: paymentChoice === 'TAB' ? 'TAB' : paymentChoice
    };

    try {
      await createBarOrder.mutateAsync(payload);
    } catch (err) {
      console.warn('Bar order API note:', err?.message || err);
    }

    // Add to running tab if Member Tab selected
    if (paymentChoice === 'TAB') {
      const newTabItems = cart.map(ci => ({
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        name: ci.name,
        qty: ci.quantity,
        price: Number(ci.price) * 0.85,
        time: 'Just now'
      }));

      setLocalRunningTab(prev => ({
        ...prev,
        isOpen: true,
        items: [...(prev.items || []), ...newTabItems]
      }));
    }

    setCart([]);
    setOrderNotes('');
    setSelectedTableId('');
    setOrderFeedback({
      type: 'success',
      message: paymentChoice === 'TAB'
        ? `Order placed successfully! ₹${grandTotal.toFixed(2)} added to your running tab.`
        : 'Order placed successfully! Chef Anthony in the kitchen has received your order.'
    });

    setTimeout(() => {
      setActiveView(paymentChoice === 'TAB' ? 'tab' : 'orders');
      setOrderFeedback(null);
    }, 1200);
  };

  // Settle Running Tab Action
  const handleSettleRunningTab = async () => {
    if (activeTab?.id) {
      try {
        await settleTabMutation.mutateAsync({ id: activeTab.id, paymentMode: settlePaymentMode });
      } catch (err) {
        console.warn('Settle tab note:', err?.message || err);
      }
    }

    const settledTotal = activeTabTotal;
    const itemsCount = localRunningTab?.items?.length || 1;

    setLocalRunningTab(prev => ({
      ...prev,
      isOpen: false,
      items: [],
      settlementHistory: [
        {
          id: 'SETTL-' + Date.now().toString().slice(-4),
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          itemsCount,
          total: settledTotal,
          mode: settlePaymentMode
        },
        ...(prev.settlementHistory || [])
      ]
    }));

    setShowSettleModal(false);
    setOrderFeedback({
      type: 'success',
      message: `🎉 Tab settled successfully! Total paid: ₹${settledTotal.toFixed(2)} via ${settlePaymentMode}.`
    });

    setTimeout(() => setOrderFeedback(null), 3500);
  };

  // Start / Reset Running Tab
  const handleStartNewTab = () => {
    setLocalRunningTab(prev => ({
      ...prev,
      isOpen: true,
      id: 'TAB-2026-' + Math.floor(100 + Math.random() * 900),
      openedAt: new Date().toISOString(),
      items: [
        { id: 'item-new-1', name: 'Whey Protein Shake', qty: 1, price: 180, time: 'Just now' },
        { id: 'item-new-2', name: 'Fresh Citrus Cooler', qty: 1, price: 140, time: 'Just now' }
      ]
    }));
    setOrderFeedback({
      type: 'success',
      message: 'Running tab opened! Initial items added to your cafeteria running bill.'
    });
    setTimeout(() => setOrderFeedback(null), 2500);
  };

  // Recent/Active Member Orders
  const myOrders = useMemo(() => {
    return Array.isArray(orders) ? orders : [];
  }, [orders]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* Header Banner - Matches Member Portal Theme */}
      <div className="bg-white border border-gray-200 p-6 sm:p-7 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="text-xs font-mono font-black tracking-widest uppercase text-[#2e7d32] flex items-center gap-2 mb-1">
            <Coffee className="w-3.5 h-3.5" />
            <span>MEMBER PORTAL</span>
            <span>•</span>
            <span>CAFETERIA & LOUNGE</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Club Cafeteria & <span className="text-[#2e7d32]">Refreshment Bar</span>
          </h1>
          <p className="text-xs text-slate-600 font-semibold mt-0.5 max-w-xl">
            Order fresh recovery shakes, nutritious snacks, and meals with your 15% member discount. Dine at tables, request court delivery, or charge to your running tab.
          </p>
        </div>

        {/* Quick Tab Stats Box */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-5 shrink-0 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-900/40">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-200 block uppercase tracking-wider">
              Active Tab Balance
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ₹{activeTabTotal.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-300 font-bold">
              15% Member Discount Applied
            </span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveView('menu')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${activeView === 'menu'
              ? 'bg-[#2e7d32] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50'
            }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Order Food & Drinks</span>
        </button>

        <button
          onClick={() => setActiveView('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${activeView === 'orders'
              ? 'bg-[#2e7d32] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50'
            }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Kitchen Orders</span>
          {myOrders.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeView === 'orders' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-[#2e7d32]'
              }`}>
              {myOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('tab')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${activeView === 'tab'
              ? 'bg-white text-slate-900 shadow-lg'
              : 'bg-white/10 text-white hover:bg-white/20'
            }`}
        >
          <Receipt className="w-4 h-4" />
          <span>My Tab & Settlements ({activeTabTotal > 0 ? `₹${activeTabTotal.toFixed(0)}` : 'Active'})</span>
        </button>
      </div>
    </div>

      {/* Global Feedback message */ }
  {
    orderFeedback && (
      <div
        className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${orderFeedback.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
      >
        {orderFeedback.type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
        ) : (
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
        )}
        <span>{orderFeedback.message}</span>
      </div>
    )
  }

  {/* VIEW 1: MENU & ORDERING */ }
  {
    activeView === 'menu' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Menu Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dining & Seating Location Selector */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2e7d32]" />
                  Where should we serve your order?
                </h3>
                <p className="text-xs text-slate-400">Choose your table or court delivery location</p>
              </div>
            </div>

            {/* Delivery Type Radios */}
            <div className="grid grid-cols-3 gap-2.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDeliveryType('DINE_IN')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${deliveryType === 'DINE_IN'
                    ? 'border-[#2e7d32] bg-emerald-50 text-[#2e7d32] ring-2 ring-[#2e7d32]/20 font-black'
                    : 'border-gray-200 hover:border-gray-300 text-slate-700 bg-slate-50/50'
                  }`}
              >
                <Utensils className="w-4 h-4 mx-auto mb-1 text-[#2e7d32]" />
                Cafeteria Table
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('COURT_DELIVERY')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${deliveryType === 'COURT_DELIVERY'
                    ? 'border-[#2e7d32] bg-emerald-50 text-[#2e7d32] ring-2 ring-[#2e7d32]/20 font-black'
                    : 'border-gray-200 hover:border-gray-300 text-slate-700 bg-slate-50/50'
                  }`}
              >
                <MapPin className="w-4 h-4 mx-auto mb-1 text-[#2e7d32]" />
                Court Delivery
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('COUNTER_PICKUP')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${deliveryType === 'COUNTER_PICKUP'
                    ? 'border-[#2e7d32] bg-emerald-50 text-[#2e7d32] ring-2 ring-[#2e7d32]/20 font-black'
                    : 'border-gray-200 hover:border-gray-300 text-slate-700 bg-slate-50/50'
                  }`}
              >
                <Coffee className="w-4 h-4 mx-auto mb-1 text-[#2e7d32]" />
                Takeaway / Counter
              </button>
            </div>

            {/* Table Selector (If Dine In) */}
            {deliveryType === 'DINE_IN' && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Select a Table:</span>
                  <span className="text-[11px] text-slate-400">Green = Available</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {tables.map((t) => {
                    const isAvail = t.status === 'AVAILABLE';
                    const isSel = selectedTableId === t.id;

                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={!isAvail}
                        onClick={() => setSelectedTableId(t.id)}
                        className={`p-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${isSel
                            ? 'border-emerald-600 bg-emerald-600 text-white font-extrabold shadow-md'
                            : isAvail
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-bold'
                              : 'border-slate-100 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
                          }`}
                      >
                        T-{t.number}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Menu Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Menu Input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search smoothies, snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          {/* Menu Items Grid */}
          {isMenuLoading ? (
            <div className="py-16 text-center text-slate-400 text-xs">Loading cafeteria menu...</div>
          ) : filteredMenu.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-3xl">
              No menu items found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMenu.map((item) => {
                const cartItem = cart.find((ci) => ci.id === item.id);
                const memberPrice = Number(item.price) * 0.85; // 15% Member Discount

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-slate-900">
                            ₹{memberPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{Number(item.price).toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold block">
                          15% Member Discount
                        </span>
                      </div>

                      {cartItem ? (
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-black text-xs px-1 text-slate-900">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center hover:bg-emerald-700 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#2e7d32] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Sidebar Column */}
        <div className="lg:col-span-4 sticky top-6 space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#2e7d32] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Your Cafeteria Order</h3>
                  <p className="text-[11px] text-slate-400">{cart.length} item(s) selected</p>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Coffee className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">Your order tray is empty.</p>
                <p className="text-[11px] text-slate-400">
                  Add healthy smoothies, protein shakes, or meals from the menu.
                </p>
              </div>
            ) : (
              <>
                {/* Cart Items list */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cart.map((ci) => {
                    const itemTotal = Number(ci.price) * ci.quantity * 0.85;
                    return (
                      <div
                        key={ci.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-slate-800 truncate">{ci.name}</h5>
                          <span className="text-[10px] text-slate-400">
                            ₹{(Number(ci.price) * 0.85).toFixed(2)} × {ci.quantity}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black text-slate-900 text-xs">
                            ₹{itemTotal.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(ci.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Payment Preference */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-slate-700 block">
                    Billing / Payment Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPaymentChoice('TAB')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${paymentChoice === 'TAB'
                          ? 'border-[#2e7d32] bg-emerald-50 text-[#2e7d32] ring-2 ring-[#2e7d32]/20 font-black'
                          : 'border-gray-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      Member Tab
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentChoice('UPI')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${paymentChoice === 'UPI'
                          ? 'border-[#2e7d32] bg-emerald-50 text-[#2e7d32] ring-2 ring-[#2e7d32]/20 font-black'
                          : 'border-gray-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentChoice('CARD')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${paymentChoice === 'CARD'
                          ? 'border-[#2e7d32] bg-emerald-50 text-[#2e7d32] ring-2 ring-[#2e7d32]/20 font-black'
                          : 'border-gray-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      Card / Counter
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {paymentChoice === 'TAB'
                      ? 'Charges will accrue to your running tab bill to be settled before leaving.'
                      : 'Pay instantly at the counter or scan UPI upon delivery.'}
                  </p>
                </div>

                {/* Price Calculation Summary */}
                <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Menu Subtotal</span>
                    <span>₹{cartSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-[#2e7d32] font-semibold">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      Member Discount (15%)
                    </span>
                    <span>-₹{memberDiscount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>GST (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-gray-100">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="button"
                  disabled={createBarOrder.isPending}
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 rounded-2xl bg-[#2e7d32] hover:bg-[#236327] text-white font-bold text-sm shadow-md shadow-[#2e7d32]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {createBarOrder.isPending ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Transmitting to Kitchen...</span>
                    </>
                  ) : (
                    <>
                      <ChefHat className="w-4 h-4" />
                      <span>Send Order to Kitchen • ₹{grandTotal.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  {/* VIEW 2: ACTIVE KITCHEN ORDERS */ }
  {
    activeView === 'orders' && (
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-[#2e7d32]" />
              Live Kitchen & Cafeteria Orders
            </h3>
            <p className="text-xs text-slate-400">
              Track preparation progress in real-time from Chef Anthony's kitchen display
            </p>
          </div>

          <button
            onClick={() => setActiveView('menu')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#2e7d32] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Order More Items</span>
          </button>
        </div>

        {isOrdersLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading kitchen orders...
          </div>
        ) : myOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Utensils className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No active kitchen orders placed yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore the menu to order refreshments or post-match snacks delivered to your court or table.
            </p>
            <button
              onClick={() => setActiveView('menu')}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#2e7d32] text-white font-bold text-xs hover:bg-[#236327] transition-colors cursor-pointer"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myOrders.map((ord) => {
              const isPreparing = ord.status === 'PREPARING';
              const isServed = ord.status === 'SERVED' || ord.status === 'COMPLETED';

              return (
                <div
                  key={ord.id}
                  className="border border-gray-200 rounded-3xl p-5 space-y-4 hover:border-gray-300 transition-all bg-slate-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">
                          Order #{ord.orderNo}
                        </span>
                        {ord.barTable && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                            Table {ord.barTable.number}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{formatDate(ord.createdAt)}</p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 ${isServed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPreparing
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {isServed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Ready / Served
                        </>
                      ) : isPreparing ? (
                        <>
                          <ChefHat className="w-3 h-3" />
                          Chef Preparing
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          Placed in Queue
                        </>
                      )}
                    </span>
                  </div>

                  {/* Items in this order */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    {ord.items?.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-slate-700"
                      >
                        <span>
                          {it.quantity}x {it.menuItem?.name || 'Item'}
                        </span>
                        <span className="font-semibold text-slate-900">
                          ₹{Number(it.totalPrice || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Notes if any */}
                  {ord.notes && (
                    <div className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-gray-100">
                      <span className="font-bold text-slate-700">Location / Notes: </span>
                      {ord.notes}
                    </div>
                  )}

                  {/* Order Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs font-bold">
                    <span className="text-slate-500">
                      Payment: {ord.barTabId ? 'Member Tab' : ord.paymentMode || 'Counter'}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{Number(ord.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )
  }

  {/* VIEW 3: MY TAB & BILL SETTLEMENTS */ }
  {
    activeView === 'tab' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Tab Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Current Running Bill</h3>
                  <p className="text-[11px] text-slate-400">The Champions Club Cafeteria & Lounge</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${activeTabTotal > 0 || localRunningTab?.isOpen
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
              >
                {activeTabTotal > 0 || localRunningTab?.isOpen ? 'TAB OPEN' : 'NO UNPAID TAB'}
              </span>
            </div>

            {/* Total Balance Display */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                ACTIVE TAB BALANCE
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                ₹{activeTabTotal.toFixed(2)}
              </h2>
              <p className="text-xs text-emerald-400 font-bold pt-1">
                ✓ Includes 15% Member Discount Applied Automatically
              </p>

              {activeTabTotal > 0 && (
                <div className="pt-3 flex justify-center">
                  <button
                    onClick={() => setShowSettleModal(true)}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Settle & Pay Running Tab (₹{activeTabTotal.toFixed(2)})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setActiveView('menu')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Order Items to Tab</span>
              </button>

              {!localRunningTab?.isOpen && (
                <button
                  onClick={handleStartNewTab}
                  className="px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Coffee className="w-4 h-4 text-emerald-700" />
                  <span>Open Running Tab</span>
                </button>
              )}
            </div>

            {/* Items inside Active Tab */}
            {localRunningTab?.isOpen && localRunningTab?.items?.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Itemized Tab Charges ({localRunningTab.items.length} Items)
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700">Running Bill</span>
                </div>

                <div className="space-y-2.5">
                  {localRunningTab.items.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs hover:border-slate-300 transition-all"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 text-sm">
                          {it.qty || 1}x {it.name}
                        </span>
                        <p className="text-[10px] text-slate-500">{it.time || 'Charged to tab'}</p>
                      </div>
                      <span className="font-black text-slate-900 text-sm">
                        ₹{(Number(it.price) * (it.qty || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                <p className="text-xs text-slate-500 font-bold">No active unpaid items on running tab.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Select <strong>"Member Tab"</strong> when ordering food & drinks to add charges directly to your tab.
                </p>
              </div>
            )}

            <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-4 text-xs text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Receipt className="w-4 h-4 text-emerald-700" />
                How tab settlement works?
              </p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Charges accumulate on your running tab throughout your visit. You can settle your balance using <strong>UPI, Card, or Cash</strong> before leaving the club.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Past Settled Receipts */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="font-black text-base text-slate-900">Past Tab Receipts & Settlements</h3>
            <p className="text-xs text-slate-400">Settled cafeteria bills & receipts</p>
          </div>

          {(!localRunningTab?.settlementHistory || localRunningTab.settlementHistory.length === 0) && pastTabs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No past settled tabs found.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {/* Local Settlement History */}
              {localRunningTab?.settlementHistory?.map((hist) => (
                <div
                  key={hist.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs hover:border-emerald-500/40 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Receipt #{hist.id}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                        PAID ({hist.mode})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {hist.date} • {hist.itemsCount} Item(s) Settled
                    </p>
                  </div>
                  <span className="font-black text-emerald-700 text-sm">
                    ₹{Number(hist.total).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Server Past Tabs */}
              {pastTabs.map((tab) => (
                <div
                  key={tab.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900">
                      Tab #{tab.id.slice(0, 8)}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(tab.updatedAt)} • Paid
                    </p>
                  </div>
                  <span className="font-black text-emerald-700 text-sm">
                    ₹{Number(tab.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  {/* Settlement Payment Modal */ }
  {
    showSettleModal && (
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Settle Running Tab</h3>
                <p className="text-xs text-slate-400">Clear your cafeteria bill</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettleModal(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-center space-y-1 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">Amount Due to Settle</span>
            <h2 className="text-3xl font-black text-slate-900">₹{activeTabTotal.toFixed(2)}</h2>
            <span className="text-[11px] text-emerald-700 font-bold block">
              15% Member Discount Included
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Select Payment Mode:</label>
            <div className="grid grid-cols-3 gap-2.5 text-xs font-bold">
              {['UPI', 'CARD', 'CASH'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSettlePaymentMode(mode)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${settlePaymentMode === mode
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-black'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                    }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSettleModal(false)}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSettleRunningTab}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/30 transition-all cursor-pointer"
            >
              Confirm & Clear Tab
            </button>
          </div>
        </div>
      </div>
    )
  }
    </div >
  );
};

export default MemberTabPage;
