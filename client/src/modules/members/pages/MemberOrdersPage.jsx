import React, { useState, useMemo } from 'react';
import { useShopOrders } from '../../../hooks/useShop';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import {
  ShoppingBag,
  Package,
  Store,
  Truck,
  Clock,
  CheckCircle2,
  Loader2,
  Calendar,
  Eye,
  Download,
  Printer,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  MemberOrderReceiptModal,
  printOrderReceipt
} from '../../../components/member/MemberOrderReceiptModal';
import { OrderTrackJourney } from '../../../components/member/OrderTrackJourney';

export const MemberOrdersPage = () => {
  const shopOrdersQuery = useShopOrders();
  const rawOrders = shopOrdersQuery.data?.items || shopOrdersQuery.data?.orders || [];

  // Strictly only show Gear Shop / Pro Shop orders (exclude Bar, Food, and Cafeteria orders)
  const allOrders = useMemo(() => {
    return rawOrders.filter(
      (order) => order.channel !== 'BAR' && (!order.orderNo || !order.orderNo.startsWith('BAR-'))
    );
  }, [rawOrders]);

  // UI States
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const orderNo = (order.orderNo || `#${order.id}`).toLowerCase();
      const itemNames = (order.items || []).map((i) => (i.product?.name || '').toLowerCase()).join(' ');

      const matchesSearch = !q || orderNo.includes(q) || itemNames.includes(q);

      const isCompleted =
        order.status === 'COMPLETED' || order.status === 'DELIVERED';

      if (filterTab === 'ACTIVE') {
        return matchesSearch && !isCompleted && order.status !== 'CANCELLED';
      }
      if (filterTab === 'COMPLETED') {
        return matchesSearch && isCompleted;
      }
      return matchesSearch;
    });
  }, [allOrders, filterTab, searchQuery]);

  // Summary counts
  const activeCount = allOrders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  ).length;
  const completedCount = allOrders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'DELIVERED'
  ).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="text-xs font-mono font-black tracking-widest uppercase text-[#4A812F] flex items-center gap-2 mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>MEMBER PORTAL</span>
            <span>•</span>
            <span>PRO SHOP ORDERS & TRACKING</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Gear Shop <span className="text-[#4A812F]">Orders & Tracking</span>
          </h1>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">
            Track your order journey in real-time, view digital receipts, and download tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/member/shop"
            className="bg-[#4A812F] hover:bg-[#3d6b27] text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Pro Shop</span>
          </Link>
        </div>
      </div>

      {/* Orders Management Container */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
        {/* Controls Bar: Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Orders ({allOrders.length})
            </button>
            <button
              onClick={() => setFilterTab('ACTIVE')}
              className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'ACTIVE'
                  ? 'bg-white text-[#4A812F] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>In Progress ({activeCount})</span>
            </button>
            <button
              onClick={() => setFilterTab('COMPLETED')}
              className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterTab === 'COMPLETED'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Delivered ({completedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order # or item…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 text-xs rounded-xl focus:outline-none focus:border-[#4A812F] text-slate-900"
            />
          </div>
        </div>

        <QueryState
          query={shopOrdersQuery}
          loading={
            <div className="text-center py-12 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#4A812F] mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading your shop orders & tracking…</p>
            </div>
          }
          empty={
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-sm text-slate-800">No orders placed yet.</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Visit the member shop to order rackets, balls, apparel, and club gear with member discounts!
              </p>
              <Link
                to="/member/shop"
                className="inline-block bg-[#4A812F] hover:bg-[#3d6b27] text-white text-xs font-extrabold px-4 py-2 rounded-xl"
              >
                Go to Member Shop
              </Link>
            </div>
          }
          emptyWhen={(d) => !allOrders.length}
        >
          {() => (
            <div className="space-y-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">
                    No orders match your filter criteria.
                  </p>
                  <button
                    onClick={() => {
                      setFilterTab('ALL');
                      setSearchQuery('');
                    }}
                    className="text-xs font-extrabold text-[#4A812F] hover:underline mt-2 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isCompleted =
                    order.status === 'COMPLETED' || order.status === 'DELIVERED';
                  const isReady =
                    order.status === 'READY' || order.status === 'SHIPPED';
                  const isDelivery = order.fulfilment === 'DELIVERY';

                  const badgeText = isCompleted
                    ? 'COMPLETED / DELIVERED'
                    : isReady
                    ? isDelivery
                      ? 'OUT FOR DELIVERY'
                      : 'READY FOR PICKUP'
                    : 'PREPARING / PENDING';

                  const badgeStyle = isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : isReady
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-900';

                  const orderNumber = order.orderNo || `#${order.id.slice(-6)}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-emerald-500 transition-all shadow-2xs"
                    >
                      {/* ─── TWO OPTIONS ABOVE EACH ORDER: VIEW RECEIPT & DOWNLOAD RECEIPT ─── */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-black text-slate-900 text-sm">
                            {orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${badgeStyle}`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600" />
                            )}
                            {badgeText}
                          </span>
                        </div>

                        {/* The Two Dedicated Actions: View Receipt & Download Receipt */}
                        <div className="flex items-center gap-2">
                          {/* Option 1: View Receipt */}
                          <button
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
                            title="View official digital receipt modal"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#4A812F]" />
                            <span>View Receipt</span>
                          </button>

                          {/* Option 2: Download Receipt */}
                          <button
                            onClick={() => printOrderReceipt(order)}
                            className="bg-[#4A812F] hover:bg-[#3d6b27] text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                            title="Download and print PDF invoice"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Receipt</span>
                          </button>
                        </div>
                      </div>

                      {/* ─── ORDER TRACK JOURNEY COMPONENT ─── */}
                      <OrderTrackJourney order={order} />

                      {/* Order Details Grid */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </div>
                          <div className="font-black text-slate-900 text-sm">
                            Total: {formatCurrency(Number(order.total || order.totalAmount || 0))}
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {order.items?.map((i, idx) => (
                            <div
                              key={i.id || idx}
                              className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {i.product?.name || 'Pro Shop Item'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  SKU: {i.product?.sku || 'PRO-GEAR'}
                                </span>
                              </div>
                              <span className="text-slate-600 font-bold">
                                {formatCurrency(Number(i.unitPrice))} × {i.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Fulfillment and Payment Mode Line */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1 text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            {isDelivery ? (
                              <Truck className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Store className="w-4 h-4 text-[#4A812F]" />
                            )}
                            <span>
                              {isDelivery
                                ? `Delivery to: ${order.deliveryAddress || 'Registered Member Address'} ${
                                    order.pinCode ? `(PIN: ${order.pinCode})` : ''
                                  }`
                                : 'Click & Collect: Available at Club Front Desk Counter'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase border border-emerald-200">
                              {order.paymentMode || 'PAID (ONLINE)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </QueryState>
      </div>

      {/* ─── DEDICATED DIGITAL RECEIPT MODAL ─── */}
      <MemberOrderReceiptModal
        order={selectedReceiptOrder}
        isOpen={Boolean(selectedReceiptOrder)}
        onClose={() => setSelectedReceiptOrder(null)}
      />
    </div>
  );
};
