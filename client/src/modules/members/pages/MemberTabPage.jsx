import React, { useState, useMemo } from 'react';
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
} from '../../../hooks/useBar';
import { useBarOrderRealtime } from '../../../hooks/useRealtime';
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
  Percent,
  Eye,
  Download,
  Printer,
  X,
  FileText,
  CreditCard,
  Smartphone,
  Banknote,
  Calendar
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
  const settleTab = useSettleTab();

  // Live sync: refresh orders the moment the kitchen advances a ticket's status
  // (e.g. CHEF PREPARING → READY / SERVED) without a manual page refresh.
  useBarOrderRealtime();

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
  const [selectedSlipTab, setSelectedSlipTab] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settlePaymentMode, setSettlePaymentMode] = useState('UPI'); // 'UPI' | 'CARD' | 'CASH'

  const allTabs = Array.isArray(tabsData) ? tabsData : (tabsData?.items || []);
  const activeTab = allTabs.find((t) => t.status === 'OPEN');
  const pastTabs = allTabs.filter((t) => t.status === 'SETTLED');

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Group past tabs day-wise
  const pastTabsGroupedByDay = useMemo(() => {
    if (!pastTabs || pastTabs.length === 0) return [];

    const map = new Map();

    for (const tab of pastTabs) {
      const rawDate = tab.settledAt || tab.updatedAt || tab.openedAt;
      const d = new Date(rawDate);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const today = new Date();
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();

      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const isYesterday =
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();

      const displayLabel = isToday
        ? `Today • ${formatDate(rawDate)}`
        : isYesterday
        ? `Yesterday • ${formatDate(rawDate)}`
        : formatDate(rawDate);

      if (!map.has(dateKey)) {
        map.set(dateKey, {
          dateKey,
          displayLabel,
          tabs: [],
          totalAmount: 0
        });
      }

      const group = map.get(dateKey);
      group.tabs.push(tab);
      group.totalAmount += Number(tab.totalAmount || 0);
    }

    return Array.from(map.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [pastTabs]);

  // Extract items from a tab's orders
  const getTabItems = (tab) => {
    if (!tab) return [];
    const items = [];
    if (Array.isArray(tab.orders)) {
      for (const order of tab.orders) {
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            items.push({
              name: item.menuItem?.name || item.name || 'Cafeteria Item',
              category: item.menuItem?.category || '',
              quantity: Number(item.quantity || 1),
              unitPrice: Number(item.unitPrice || 0),
              totalPrice: Number(item.totalPrice || (Number(item.unitPrice || 0) * Number(item.quantity || 1)))
            });
          }
        }
      }
    }
    if (items.length === 0 && Number(tab.totalAmount || 0) > 0) {
      items.push({
        name: 'Cafeteria & Lounge Tab Settlement',
        category: 'TAB',
        quantity: 1,
        unitPrice: Number(tab.totalAmount || 0),
        totalPrice: Number(tab.totalAmount || 0)
      });
    }
    return items;
  };

  // Calculate detailed financial breakdown
  const calculateSlipBreakdown = (tab, items) => {
    const itemsTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = Number(tab.totalAmount || itemsTotal || 0);

    let subtotal = 0;
    let discount = 0;
    let tax = 0;

    if (Array.isArray(tab.orders) && tab.orders.length > 0) {
      for (const ord of tab.orders) {
        subtotal += Number(ord.subtotal || 0);
        discount += Number(ord.discount || 0);
        tax += Number(ord.tax || 0);
      }
    }

    if (subtotal === 0) {
      // 15% standard member discount and 5% GST backwards calculation
      subtotal = totalAmount / 0.8925;
      discount = subtotal * 0.15;
      tax = (subtotal - discount) * 0.05;
    }

    return {
      subtotal: subtotal || totalAmount,
      discount: discount || 0,
      tax: tax || 0,
      total: totalAmount
    };
  };

  // Trigger high-fidelity PDF print
  const handlePrintSlip = (tab) => {
    if (!tab) return;
    const items = getTabItems(tab);
    const breakdown = calculateSlipBreakdown(tab, items);
    const memberName = tab.member?.user?.name || user?.name || 'Rohan Gupta';
    const memberNo = tab.member?.memberNo || user?.memberNo || 'MEM-001001';
    const planName = tab.member?.plan?.name || user?.membershipTier || 'Gold Member';
    const receiptNo = `REC-TAB-${tab.id.slice(0, 8).toUpperCase()}`;
    const settledDate = formatDate(tab.settledAt || tab.updatedAt || tab.openedAt);
    const settledTime = formatTime(tab.settledAt || tab.updatedAt || tab.openedAt);
    const paymentMode = tab.orders?.[0]?.paymentMode || tab.paymentMode || 'UPI';

    const printWindow = window.open('', '_blank', 'width=750,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const itemsRows = items
      .map(
        (item, idx) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 8px; font-size: 13px; color: #64748b; text-align: center;">${idx + 1}</td>
          <td style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: #0f172a;">${item.name}</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align: center; color: #334155;">${item.quantity}</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align: right; color: #334155;">₹${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align: right; font-weight: 700; color: #0f172a;">₹${item.totalPrice.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const discountRow = breakdown.discount > 0
      ? `<div class="totals-row" style="color: #15803d; font-weight: 600;"><span>Member Privilege Discount (15%)</span><span>-₹${breakdown.discount.toFixed(2)}</span></div>`
      : '';
    const taxRow = breakdown.tax > 0
      ? `<div class="totals-row"><span>GST (Goods & Services Tax 5%)</span><span>+₹${breakdown.tax.toFixed(2)}</span></div>`
      : '';

    printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Receipt_${receiptNo}</title>
    <style>
      @page { size: A4 portrait; margin: 12mm; }
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #0f172a;
        background: #ffffff;
        margin: 0;
        padding: 20px;
        display: flex;
        justify-content: center;
      }
      .slip-card {
        width: 100%;
        max-width: 580px;
        border: 1.5px solid #0f172a;
        border-radius: 16px;
        padding: 28px;
        background: #ffffff;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      }
      .header-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #2e7d32;
        padding-bottom: 16px;
        margin-bottom: 20px;
      }
      .brand-name {
        font-size: 20px;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -0.5px;
      }
      .brand-sub {
        font-size: 11px;
        font-weight: 600;
        color: #2e7d32;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .badge-paid {
        background: #dcfce7;
        color: #15803d;
        font-size: 11px;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 9999px;
        border: 1px solid #86efac;
        text-transform: uppercase;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 14px;
        margin-bottom: 20px;
        font-size: 12px;
      }
      .info-label {
        font-size: 10px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
      }
      .info-val {
        font-weight: 700;
        color: #0f172a;
        margin-top: 2px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th {
        background: #f1f5f9;
        padding: 8px;
        font-size: 11px;
        font-weight: 800;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .totals-table {
        width: 100%;
        margin-top: 10px;
        font-size: 13px;
      }
      .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        color: #475569;
      }
      .totals-row.grand {
        border-top: 2px solid #0f172a;
        margin-top: 8px;
        padding-top: 10px;
        font-size: 16px;
        font-weight: 900;
        color: #0f172a;
      }
      .grand-val {
        color: #2e7d32;
      }
      .footer-note {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px dashed #cbd5e1;
        text-align: center;
        font-size: 11px;
        color: #64748b;
        line-height: 1.5;
      }
      @media print {
        body { padding: 0; }
        .slip-card {
          border: none;
          box-shadow: none;
          max-width: 100%;
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="slip-card">
      <div class="header-bar">
        <div>
          <div class="brand-name">BookMyCourt</div>
          <div class="brand-sub">Cafeteria & Lounge • Official Settlement Slip</div>
        </div>
        <div>
          <span class="badge-paid">✓ Settled & Paid</span>
        </div>
      </div>

      <div class="info-grid">
        <div>
          <div class="info-label">Receipt Reference</div>
          <div class="info-val">${receiptNo}</div>
        </div>
        <div>
          <div class="info-label">Date & Time</div>
          <div class="info-val">${settledDate}${settledTime ? ' at ' + settledTime : ''}</div>
        </div>
        <div>
          <div class="info-label">Billed To (Member)</div>
          <div class="info-val">${memberName} (${memberNo})</div>
        </div>
        <div>
          <div class="info-label">Membership Tier</div>
          <div class="info-val">${planName} (15% Cafeteria Privilege)</div>
        </div>
        <div>
          <div class="info-label">Payment Mode</div>
          <div class="info-val" style="color: #15803d; font-weight: 800;">${paymentMode} • PAID & SETTLED</div>
        </div>
        <div>
          <div class="info-label">Status</div>
          <div class="info-val" style="color: #2e7d32;">COMPLETED / ZERO DUE</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px; text-align: center;">#</th>
            <th style="text-align: left;">Item Description</th>
            <th style="width: 50px; text-align: center;">Qty</th>
            <th style="width: 80px; text-align: right;">Unit Rate</th>
            <th style="width: 90px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="totals-table">
        <div class="totals-row">
          <span>Subtotal (Gross)</span>
          <span>₹${breakdown.subtotal.toFixed(2)}</span>
        </div>
        ${discountRow}
        ${taxRow}
        <div class="totals-row grand">
          <span>TOTAL SETTLED AMOUNT</span>
          <span class="grand-val">₹${breakdown.total.toFixed(2)}</span>
        </div>
      </div>

      <div class="footer-note">
        <strong>BookMyCourt Sports Infrastructure • Cafeteria Operations</strong><br/>
        This is a computer-generated tax invoice & settlement slip.<br/>
        Thank you for visiting! For queries contact support@bookmycourt.com
      </div>
    </div>

    <script>
      window.onload = function() {
        setTimeout(function() {
          window.focus();
          window.print();
        }, 250);
      };
    </script>
  </body>
</html>`);
    printWindow.document.close();
  };

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
        message: 'Order placed successfully! Chef Anthony in the kitchen has received your ticket.'
      });
      setTimeout(() => {
        setActiveView('orders');
        setOrderFeedback(null);
      }, 1400);
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

        {/* Tab Balance Quick Pill */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              Active Tab Balance
            </span>
            <div className="text-xl font-black text-slate-900">
              {activeTab ? `₹${Number(activeTab.totalAmount || 0).toFixed(2)}` : '₹0.00'}
            </div>
            <span className="text-[10px] font-bold text-[#2e7d32]">
              15% Member Discount Applied
            </span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveView('menu')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeView === 'menu'
              ? 'bg-[#2e7d32] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Order Food & Drinks</span>
        </button>

        <button
          onClick={() => setActiveView('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeView === 'orders'
              ? 'bg-[#2e7d32] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Kitchen Orders</span>
          {myOrders.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeView === 'orders' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-[#2e7d32]'
            }`}>
              {myOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('tab')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeView === 'tab'
              ? 'bg-[#2e7d32] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>My Tab & Settlements</span>
        </button>
      </div>

      {/* Global Feedback message */}
      {orderFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${
            orderFeedback.type === 'success'
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
      )}

      {/* VIEW 1: MENU & ORDERING */}
      {activeView === 'menu' && (
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
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    deliveryType === 'DINE_IN'
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
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    deliveryType === 'COURT_DELIVERY'
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
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    deliveryType === 'COUNTER_PICKUP'
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
                          onClick={() => setSelectedTableId(t.id)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSel
                              ? 'border-[#2e7d32] bg-[#2e7d32] text-white font-black shadow-xs'
                              : isAvail
                              ? 'border-emerald-200 bg-emerald-50/60 text-slate-800 hover:border-emerald-400 font-bold'
                              : 'border-gray-200 bg-slate-100 text-slate-400 opacity-60'
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
                      ? 'Specify Court number (e.g., Deliver to Tennis Court 2)'
                      : 'Special requests (e.g., Extra hot, Less sugar, Ice on side)'
                  }
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32]"
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#2e7d32] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-slate-600 hover:bg-slate-50'
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
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32]"
                />
              </div>
            </div>

            {/* Menu Grid */}
            {isMenuLoading ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                Loading cafeteria menu items...
              </div>
            ) : filteredMenu.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-gray-200">
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
                      className="bg-white border border-gray-200 hover:border-emerald-300 rounded-3xl p-5 shadow-xs transition-all hover:shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#2e7d32] bg-emerald-50 px-2 py-0.5 rounded-md">
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
                              <Utensils className="w-5 h-5 text-[#2e7d32]" />
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
                          <span className="text-[10px] font-black text-[#2e7d32] bg-emerald-50 px-1.5 py-0.5 rounded">
                            -15% Member
                          </span>
                        </div>
                      </div>

                      {/* Add button / Quantity Stepper */}
                      <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-end">
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white text-[#2e7d32] hover:bg-emerald-100 flex items-center justify-center font-bold cursor-pointer transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center font-black text-xs text-[#2e7d32]">
                              {inCart.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-[#2e7d32] text-white hover:bg-[#236327] flex items-center justify-center font-bold cursor-pointer transition-colors"
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
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentChoice === 'TAB'
                            ? 'border-[#2e7d32] bg-emerald-50 text-[#2e7d32] ring-2 ring-[#2e7d32]/20 font-black'
                            : 'border-gray-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Member Tab
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentChoice('UPI')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentChoice === 'UPI'
                            ? 'border-[#2e7d32] bg-emerald-50 text-[#2e7d32] ring-2 ring-[#2e7d32]/20 font-black'
                            : 'border-gray-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        UPI
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentChoice('CARD')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentChoice === 'CARD'
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
      )}

      {/* VIEW 2: ACTIVE KITCHEN ORDERS */}
      {activeView === 'orders' && (
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
                const isPlaced = ord.status === 'PLACED';

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
      )}

      {/* VIEW 3: MY TAB & BILL SETTLEMENTS */}
      {activeView === 'tab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Tab Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Current Running Bill</h3>
                    <p className="text-[11px] text-slate-400">BookMyCourt Cafeteria</p>
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
                <p className="text-xs text-[#2e7d32] font-semibold pt-1">
                  Includes 15% Member Discount Applied Automatically
                </p>
              </div>

              {/* Settle Running Bill Action */}
              {activeTab && Number(activeTab.totalAmount || 0) > 0 && (
                <div className="pt-1">
                  <button
                    disabled={settleTab.isPending}
                    onClick={() => setShowSettleModal(true)}
                    className="w-full py-3.5 rounded-2xl bg-[#2e7d32] hover:bg-[#236327] text-white font-extrabold text-xs shadow-md shadow-[#2e7d32]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Settle Running Bill (₹{Number(activeTab.totalAmount).toFixed(2)})</span>
                  </button>
                </div>
              )}

              {/* Action when no tab open */}
              {!activeTab && (
                <div className="text-center py-3 space-y-2.5">
                  <p className="text-xs text-slate-500">
                    No active tab running. A tab will automatically open as soon as you order from the cafeteria.
                  </p>
                  <button
                    onClick={() => setActiveView('menu')}
                    className="px-5 py-2.5 rounded-xl bg-[#2e7d32] hover:bg-[#236327] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Browse Menu & Order</span>
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
                        className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between text-xs"
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

          {/* Right: Past Settled Receipts (Day-Wise Splitting) */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900">Past Tab Receipts</h3>
                <p className="text-xs text-slate-400">Day-wise settled cafeteria bills & slips</p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                {pastTabs.length} {pastTabs.length === 1 ? 'Receipt' : 'Receipts'}
              </span>
            </div>

            {pastTabsGroupedByDay.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No past settled tabs found.
              </div>
            ) : (
              <div className="space-y-6">
                {pastTabsGroupedByDay.map((group) => (
                  <div key={group.dateKey} className="space-y-3">
                    {/* Day Group Header */}
                    <div className="flex items-center justify-between px-1 border-b border-dashed border-slate-200 pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-[#2e7d32]" />
                        <span>{group.displayLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-medium">
                          {group.tabs.length} {group.tabs.length === 1 ? 'slip' : 'slips'}
                        </span>
                        <span className="font-extrabold text-[#2e7d32] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ₹{group.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Receipts for this day */}
                    <div className="space-y-3">
                      {group.tabs.map((tab) => {
                        const items = getTabItems(tab);
                        const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
                        const timeStr = formatTime(tab.settledAt || tab.updatedAt || tab.openedAt);
                        const paymentMode = tab.orders?.[0]?.paymentMode || 'UPI';

                        return (
                          <div
                            key={tab.id}
                            className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 bg-slate-50/70 hover:bg-white transition-all space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900 text-xs font-mono">
                                    #REC-TAB-{tab.id.slice(0, 8).toUpperCase()}
                                  </span>
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                                    {paymentMode} • PAID
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {timeStr ? `${timeStr} • ` : ''}{itemCount} {itemCount === 1 ? 'item' : 'items'}
                                </p>
                              </div>
                              <span className="font-black text-sm text-[#2e7d32]">
                                ₹{Number(tab.totalAmount || 0).toFixed(2)}
                              </span>
                            </div>

                            {/* Items preview */}
                            <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                              <span className="truncate max-w-[200px]">
                                {items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                                {paymentMode}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setSelectedSlipTab(tab)}
                                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-gray-200 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Slip</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePrintSlip(tab)}
                                className="flex-1 bg-[#2e7d32] hover:bg-[#256829] text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SETTLE TAB PAYMENT POPUP */}
      {showSettleModal && activeTab && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden font-sans relative my-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2e7d32] text-white flex items-center justify-center font-black text-base shadow-sm">
                  ₹
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight text-white">Settle Cafeteria Running Tab</h3>
                  <p className="text-[11px] text-emerald-400 font-semibold">Select payment method & clear bill</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettleModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Total Due Banner */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200 rounded-2xl p-5 text-center space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                  Total Outstanding Balance
                </span>
                <div className="text-3xl font-black text-[#2e7d32]">
                  ₹{Number(activeTab.totalAmount || 0).toFixed(2)}
                </div>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  {activeTab.orders?.length || 1} Orders • 15% Member Discount Applied
                </p>
              </div>

              {/* Payment Type Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  Choose Payment Method
                </label>

                {/* Option 1: UPI */}
                <div
                  onClick={() => setSettlePaymentMode('UPI')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                    settlePaymentMode === 'UPI'
                      ? 'border-[#2e7d32] bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      settlePaymentMode === 'UPI' ? 'bg-[#2e7d32] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">UPI / QR Code</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">Google Pay, PhonePe, Paytm, or BHIM</p>
                  </div>
                  <input
                    type="radio"
                    checked={settlePaymentMode === 'UPI'}
                    onChange={() => setSettlePaymentMode('UPI')}
                    className="accent-[#2e7d32] w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* UPI dynamic QR snippet if UPI selected */}
                {settlePaymentMode === 'UPI' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3.5 animate-in fade-in duration-150">
                    <div className="p-1.5 bg-white border border-slate-200 rounded-xl shrink-0">
                      <QRCodeSVG
                        value={`upi://pay?pa=bookmycourt@icici&pn=BookMyCourtCafeteria&am=${Number(activeTab.totalAmount).toFixed(2)}&cu=INR`}
                        size={56}
                      />
                    </div>
                    <div className="text-[11px] text-slate-600 min-w-0">
                      <p className="font-bold text-slate-800">Scan to Pay via any UPI App</p>
                      <p className="text-slate-500 font-mono text-[10px] truncate">VPA: bookmycourt@icici</p>
                      <p className="text-[10px] text-emerald-700 font-medium">Click button below after paying to finalize slip</p>
                    </div>
                  </div>
                )}

                {/* Option 2: Card */}
                <div
                  onClick={() => setSettlePaymentMode('CARD')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                    settlePaymentMode === 'CARD'
                      ? 'border-[#2e7d32] bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      settlePaymentMode === 'CARD' ? 'bg-[#2e7d32] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-extrabold text-xs text-slate-900 block">Credit / Debit Card</span>
                    <p className="text-[11px] text-slate-500">Tap / Swipe at cafeteria counter POS</p>
                  </div>
                  <input
                    type="radio"
                    checked={settlePaymentMode === 'CARD'}
                    onChange={() => setSettlePaymentMode('CARD')}
                    className="accent-[#2e7d32] w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* Option 3: Cash */}
                <div
                  onClick={() => setSettlePaymentMode('CASH')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                    settlePaymentMode === 'CASH'
                      ? 'border-[#2e7d32] bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      settlePaymentMode === 'CASH' ? 'bg-[#2e7d32] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-extrabold text-xs text-slate-900 block">Cash at Counter</span>
                    <p className="text-[11px] text-slate-500">Physical cash settlement with cashier</p>
                  </div>
                  <input
                    type="radio"
                    checked={settlePaymentMode === 'CASH'}
                    onChange={() => setSettlePaymentMode('CASH')}
                    className="accent-[#2e7d32] w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={settleTab.isPending}
                  onClick={async () => {
                    try {
                      const res = await settleTab.mutateAsync({
                        id: activeTab.id,
                        paymentMode: settlePaymentMode
                      });
                      setShowSettleModal(false);
                      setOrderFeedback({
                        type: 'success',
                        message: `Tab settled successfully via ${settlePaymentMode}! Digital receipt created.`
                      });
                      // Open receipt slip directly
                      const settledData = res?.data || res || {
                        ...activeTab,
                        status: 'SETTLED',
                        settledAt: new Date().toISOString(),
                        paymentMode: settlePaymentMode,
                        totalAmount: activeTab.totalAmount
                      };
                      setSelectedSlipTab(settledData);
                    } catch (err) {
                      alert(err.response?.data?.message || err.message || 'Failed to settle tab');
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#2e7d32] hover:bg-[#236327] text-white font-extrabold text-xs shadow-md shadow-[#2e7d32]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {settleTab.isPending
                      ? 'Processing Settlement...'
                      : `Confirm & Settle ₹${Number(activeTab.totalAmount || 0).toFixed(2)} via ${settlePaymentMode}`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettleModal(false)}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW TAB SLIP */}
      {selectedSlipTab && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden font-sans relative my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2e7d32] text-white flex items-center justify-center font-black text-base shadow-sm">
                  B
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight text-white">BookMyCourt Cafeteria</h3>
                  <p className="text-[11px] text-emerald-400 font-semibold">Official Settlement Slip / Tax Invoice</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlipTab(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Receipt Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt No</span>
                  <span className="font-extrabold text-slate-900 font-mono text-xs">
                    #REC-TAB-{selectedSlipTab.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date & Time</span>
                  <span className="font-bold text-slate-800">
                    {formatDate(selectedSlipTab.settledAt || selectedSlipTab.updatedAt || selectedSlipTab.openedAt)}
                    {formatTime(selectedSlipTab.settledAt || selectedSlipTab.updatedAt || selectedSlipTab.openedAt) ? ` • ${formatTime(selectedSlipTab.settledAt || selectedSlipTab.updatedAt || selectedSlipTab.openedAt)}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billed To</span>
                  <span className="font-bold text-slate-800">
                    {selectedSlipTab.member?.user?.name || user?.name || 'Rohan Gupta'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {selectedSlipTab.member?.memberNo || user?.memberNo || 'MEM-001001'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Mode</span>
                  <span className="font-extrabold text-slate-900 uppercase">
                    {selectedSlipTab.orders?.[0]?.paymentMode || selectedSlipTab.paymentMode || 'UPI'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> SETTLED & PAID
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Itemized Order Details
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-left">Item</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getTabItems(selectedSlipTab).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                          <td className="py-2.5 px-3 text-center text-slate-600 font-bold">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">₹{item.unitPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{item.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation */}
              {(() => {
                const items = getTabItems(selectedSlipTab);
                const breakdown = calculateSlipBreakdown(selectedSlipTab, items);

                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal (Gross)</span>
                      <span className="font-semibold">₹{breakdown.subtotal.toFixed(2)}</span>
                    </div>
                    {breakdown.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Member Discount (15%)</span>
                        <span>-₹{breakdown.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {breakdown.tax > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>GST (5%)</span>
                        <span className="font-semibold">+₹{breakdown.tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Paid</span>
                      <span className="text-[#2e7d32]">₹{breakdown.total.toFixed(2)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 text-right uppercase pt-0.5">
                      Payment Mode: {selectedSlipTab.orders?.[0]?.paymentMode || 'CARD / UPI'}
                    </div>
                  </div>
                );
              })()}

              {/* Verification & QR Code */}
              <div className="flex items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="p-1 bg-white rounded-xl border border-emerald-200 shrink-0">
                  <QRCodeSVG
                    value={JSON.stringify({
                      receipt: `REC-TAB-${selectedSlipTab.id.slice(0, 8).toUpperCase()}`,
                      amount: selectedSlipTab.totalAmount,
                      member: selectedSlipTab.member?.memberNo || user?.memberNo,
                      status: 'SETTLED'
                    })}
                    size={52}
                  />
                </div>
                <div className="text-[11px] text-emerald-900 leading-snug">
                  <strong className="block font-bold">Digitally Verified Club Receipt</strong>
                  Official record settled at BookMyCourt POS counter. Valid for accounting and personal reimbursement.
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => handlePrintSlip(selectedSlipTab)}
                className="flex-1 bg-[#2e7d32] hover:bg-[#256829] text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Download / Print PDF Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSlipTab(null)}
                className="px-5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-xs py-3 rounded-2xl cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberTabPage;
