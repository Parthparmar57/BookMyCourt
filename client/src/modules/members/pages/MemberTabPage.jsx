import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  useMenu,
  useBarTables,
  useBarOrders,
  useCreateBarOrder,
  useTabs,
  useOpenTab
} from '../../../hooks/useBar';
import {
  Coffee,
  Utensils,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  Search,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Flame,
  ChefHat,
  MapPin,
  Check,
  Percent
} from 'lucide-react';
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

  const allTabs = tabsData?.items || [];
  const activeTab = allTabs.find((t) => t.status === 'OPEN');
  const pastTabs = allTabs.filter((t) => t.status === 'SETTLED');

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
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
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

  // Price Calculations (15% Member Discount, 5% GST)
  const cartSubtotal = cart.reduce(
    (sum, ci) => sum + Number(ci.price) * ci.quantity,
    0
  );
  const memberDiscount = cartSubtotal * 0.15; // 15% standard member discount
  const discountedBase = Math.max(0, cartSubtotal - memberDiscount);
  const tax = discountedBase * 0.05; // 5% GST
  const grandTotal = discountedBase + tax;

  // Handle Order Submit
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
      setCart([]);
      setOrderNotes('');
      setSelectedTableId('');
      setOrderFeedback({
        type: 'success',
        message: 'Order placed successfully! Chef Anthony in the kitchen has received your order.'
      });
      // Switch view to orders after 1.2s
      setTimeout(() => {
        setActiveView('orders');
        setOrderFeedback(null);
      }, 1500);
    } catch (err) {
      setOrderFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to place order'
      });
    }
  };

  // Recent/Active Member Orders
  const myOrders = useMemo(() => {
    return Array.isArray(orders) ? orders : [];
  }, [orders]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Champions Club Cafeteria & Lounge</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Food & Beverage Service
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
              Order fresh shakes, chef specials, snacks, and healthy post-match meals. Enjoy table booking, direct court delivery, or add straight to your member running tab.
            </p>
          </div>

          {/* Quick Tab Stats Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-5 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-900/40">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-emerald-200 block uppercase tracking-wider">
                Active Tab Balance
              </span>
              <div className="text-2xl font-black text-white">
                {activeTab ? `₹${Number(activeTab.totalAmount || 0).toFixed(2)}` : '₹0.00'}
              </div>
              <span className="text-[10px] text-emerald-300 font-medium">
                15% Member Discount Applied
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveView('menu')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeView === 'menu'
                ? 'bg-white text-slate-900 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Order Food & Drinks</span>
          </button>

          <button
            onClick={() => setActiveView('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer relative ${
              activeView === 'orders'
                ? 'bg-white text-slate-900 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Orders</span>
            {myOrders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {myOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('tab')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeView === 'tab'
                ? 'bg-white text-slate-900 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>My Tab & Settlements</span>
          </button>
        </div>
      </div>

      {/* Global Feedback message */}
      {orderFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${
            orderFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {orderFeedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span>{orderFeedback.message}</span>
        </div>
      )}

      {/* VIEW 1: MENU & ORDERING */}
      {activeView === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Menu Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Dining & Seating Location Selector */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
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
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    deliveryType === 'DINE_IN'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                  }`}
                >
                  <Utensils className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  Cafeteria Table
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('COURT_DELIVERY')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    deliveryType === 'COURT_DELIVERY'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                  }`}
                >
                  <MapPin className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  Court Delivery
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('COUNTER_PICKUP')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    deliveryType === 'COUNTER_PICKUP'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                  }`}
                >
                  <Coffee className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  Takeaway / Counter
                </button>
              </div>

              {/* Table Selector (If Dine In) */}
              {deliveryType === 'DINE_IN' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
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
                          onClick={() => setSelectedTableId(t.id)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSel
                              ? 'border-emerald-600 bg-emerald-600 text-white font-black shadow-md'
                              : isAvail
                              ? 'border-emerald-200 bg-emerald-50/50 text-slate-800 hover:border-emerald-400 font-bold'
                              : 'border-slate-200 bg-slate-100 text-slate-400 opacity-60'
                          }`}
                        >
                          <div className="text-xs">{t.number}</div>
                          <div className="text-[9px] opacity-75">{t.capacity}p</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Note / Court specification */}
              <div className="pt-2">
                <input
                  type="text"
                  placeholder={
                    deliveryType === 'COURT_DELIVERY'
                      ? 'Specify Court number (e.g., Deliver to Tennis Court 2 bench)'
                      : 'Special requests (e.g., Extra hot, Less sugar, Ice on side)'
                  }
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search cafeteria menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Menu Grid */}
            {isMenuLoading ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                Loading cafeteria menu items...
              </div>
            ) : filteredMenu.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
                No menu items found in this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMenu.map((item) => {
                  const originalPrice = Number(item.price);
                  const memberPrice = originalPrice * 0.85; // 15% Member discount
                  const inCart = cart.find((ci) => ci.id === item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 hover:border-emerald-300 rounded-3xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {item.category?.replace(/_/g, ' ') || 'CAFETERIA'}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                              {item.name}
                            </h4>
                          </div>

                          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            {item.category === 'HEALTH_DRINKS' ? (
                              <Flame className="w-5 h-5 text-amber-500" />
                            ) : item.category === 'BEVERAGES' ? (
                              <Coffee className="w-5 h-5 text-teal-500" />
                            ) : (
                              <Utensils className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="pt-2 flex items-baseline gap-2">
                          <span className="text-base font-black text-slate-900">
                            ₹{memberPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{originalPrice.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            -15% Member Price
                          </span>
                        </div>
                      </div>

                      {/* Add button / Quantity Stepper */}
                      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-end">
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white text-emerald-700 hover:bg-emerald-100 flex items-center justify-center font-bold cursor-pointer transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center font-black text-xs text-emerald-900">
                              {inCart.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
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
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
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
                    className="text-[11px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Coffee className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                  <p className="text-xs">Your order tray is empty.</p>
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
                              className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Payment Preference */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700 block">
                      Billing / Payment Method:
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setPaymentChoice('TAB')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentChoice === 'TAB'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-black'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Member Tab
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentChoice('UPI')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentChoice === 'UPI'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-black'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        UPI
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentChoice('CARD')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentChoice === 'CARD'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-black'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
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
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Menu Subtotal</span>
                      <span>₹{cartSubtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-emerald-600 font-semibold">
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

                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                      <span>Grand Total</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <button
                    type="button"
                    disabled={createBarOrder.isPending}
                    onClick={handlePlaceOrder}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
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
      )}

      {/* VIEW 2: ACTIVE KITCHEN ORDERS */}
      {activeView === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-emerald-600" />
                Live Kitchen & Cafeteria Orders
              </h3>
              <p className="text-xs text-slate-400">
                Track preparation progress in real-time from Chef Anthony's kitchen display
              </p>
            </div>

            <button
              onClick={() => setActiveView('menu')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
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
                className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myOrders.map((ord) => {
                const isPreparing = ord.status === 'PREPARING';
                const isServed = ord.status === 'SERVED' || ord.status === 'COMPLETED';
                const isPlaced = ord.status === 'PLACED';

                return (
                  <div
                    key={ord.id}
                    className="border border-slate-200 rounded-3xl p-5 space-y-4 hover:border-slate-300 transition-all bg-slate-50/50"
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
                        className={`text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 ${
                          isServed
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
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
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
                      <div className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700">Location / Notes: </span>
                        {ord.notes}
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
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
      )}

      {/* VIEW 3: MY TAB & BILL SETTLEMENTS */}
      {activeView === 'tab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Active Tab Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Current Running Bill</h3>
                    <p className="text-[11px] text-slate-400">The Champions Club Cafeteria</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                    activeTab ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {activeTab ? 'TAB OPEN' : 'NO ACTIVE TAB'}
                </span>
              </div>

              {/* Total Balance */}
              <div className="bg-slate-50 rounded-2xl p-6 text-center space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Total Tab Balance
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                  {activeTab ? `₹${Number(activeTab.totalAmount || 0).toFixed(2)}` : '₹0.00'}
                </h2>
                <p className="text-xs text-emerald-600 font-semibold pt-1">
                  Includes 15% Member Discount Applied Automatically
                </p>
              </div>

              {/* Action: Open Tab if not open */}
              {!activeTab && (
                <div className="text-center py-2">
                  <button
                    onClick={async () => {
                      try {
                        await openTab.mutateAsync({});
                      } catch (err) {
                        alert(err.response?.data?.message || 'Failed to open tab');
                      }
                    }}
                    disabled={openTab.isPending}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    {openTab.isPending ? 'Opening...' : 'Start a Running Tab'}
                  </button>
                </div>
              )}

              {/* Orders inside Tab */}
              {activeTab && activeTab.orders?.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Items on Tab
                  </h4>
                  <div className="space-y-2">
                    {activeTab.orders.map((order, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">Order #{idx + 1}</span>
                          <p className="text-[10px] text-slate-400">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className="font-bold text-slate-900">
                          ₹{Number(order.totalAmount || order.total || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">
                  No unpaid items on tab. You can charge food and beverages directly when ordering.
                </p>
              )}

              <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Receipt className="w-4 h-4" />
                  How to settle your tab?
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  You can settle your bar tab at the cafeteria counter or front desk using{' '}
                  <strong>Cash, Card, or UPI</strong> before leaving the club.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Past Settled Receipts */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="font-black text-sm text-slate-900">Past Tab Receipts</h3>
              <p className="text-xs text-slate-400">Settled cafeteria bills</p>
            </div>

            {pastTabs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No past settled tabs found.
              </div>
            ) : (
              <div className="space-y-3">
                {pastTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">
                        Tab #{tab.id.slice(0, 8)}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(tab.updatedAt)} • Paid
                      </p>
                    </div>
                    <span className="font-bold text-emerald-700">
                      ₹{Number(tab.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberTabPage;
