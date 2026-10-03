import React from 'react';
import { useShopOrders } from '../../../hooks/useShop';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { ShoppingBag, Package, Store, Truck, Clock, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MemberOrdersPage = () => {
  const shopOrdersQuery = useShopOrders();
  const rawOrders = shopOrdersQuery.data?.items || shopOrdersQuery.data?.orders || [];
  // Strictly only show Gear Shop / Pro Shop orders (exclude Bar, Food, and Cafeteria orders)
  const orders = rawOrders.filter(
    (order) => order.channel !== 'BAR' && (!order.orderNo || !order.orderNo.startsWith('BAR-'))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="text-xs font-mono font-black tracking-widest uppercase text-[#2e7d32] flex items-center gap-2 mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>MEMBER PORTAL</span>
            <span>•</span>
            <span>PRO SHOP ORDERS</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Gear Shop <span className="text-[#2e7d32]">Orders & Purchases</span>
          </h1>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">
            Track your Click & Collect pickup orders, gear deliveries, and counter receipts.
          </p>
        </div>

        <Link
          to="/member/shop"
          className="bg-[#2e7d32] hover:bg-[#236327] text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Pro Shop</span>
        </Link>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#2e7d32]" />
            Order History ({orders.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Real-time status updates from club counter</span>
        </div>

        <QueryState
          query={shopOrdersQuery}
          loading={
            <div className="text-center py-12 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#2e7d32] mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading your shop orders…</p>
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
                className="inline-block bg-[#2e7d32] hover:bg-[#236327] text-white text-xs font-extrabold px-4 py-2 rounded-xl"
              >
                Go to Member Shop
              </Link>
            </div>
          }
          emptyWhen={(d) => !orders.length}
        >
          {() => (
            <div className="space-y-4">
              {orders.map((order) => {
                const isCompleted = order.status === 'COMPLETED' || order.status === 'DELIVERED';
                const isReady = order.status === 'READY' || order.status === 'SHIPPED';
                const isDelivery = order.fulfilment === 'DELIVERY';

                const badgeText = isCompleted
                  ? 'COMPLETED / DELIVERED'
                  : isReady
                  ? (isDelivery ? 'OUT FOR DELIVERY' : 'READY FOR PICKUP')
                  : 'PREPARING / PENDING';

                const badgeStyle = isCompleted
                  ? 'bg-emerald-100 text-emerald-800'
                  : isReady
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-900';

                return (
                  <div key={order.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 hover:border-emerald-500 transition-colors">
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-slate-900 text-sm">{order.orderNo || `#${order.id.slice(-6)}`}</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${badgeStyle}`}>
                          {isCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                          {badgeText}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-black text-slate-900 text-sm">
                          {formatCurrency(Number(order.total || order.totalAmount || 0))}
                        </span>
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {order.items?.map((i, idx) => (
                        <div key={i.id || idx} className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                          <span className="font-bold text-slate-900">{i.product?.name || 'Pro Shop Item'}</span>
                          <span className="text-slate-500 font-medium">{formatCurrency(Number(i.unitPrice))} × {i.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Fulfillment info */}
                    <div className="flex items-center justify-between text-xs pt-1 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        {isDelivery ? <Truck className="w-4 h-4 text-blue-500" /> : <Store className="w-4 h-4 text-[#2e7d32]" />}
                        <span>
                          {isDelivery
                            ? `Delivery to: ${order.deliveryAddress || 'Registered Member Address'}`
                            : 'Click & Collect: Pick up at Club Front Desk'}
                        </span>
                      </div>
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                        {order.paymentMode || 'PAID'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </QueryState>
      </div>
    </div>
  );
};
