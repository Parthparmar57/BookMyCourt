import React, { useState, useMemo } from 'react';
import { useShopOrders, useUpdateShopOrderStatus } from '../../../hooks/useShop';
import { formatCurrency, formatPhone } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { CustomSelect } from '../../../shared/components/CustomSelect';
import { 
  ShoppingBag, 
  Store, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Search, 
  X, 
  MapPin, 
  Phone, 
  User, 
  PackageCheck, 
  AlertCircle,
  Filter
} from 'lucide-react';

export const ShopOrdersPage = () => {
  const shopOrdersQuery = useShopOrders();
  const updateOrderStatus = useUpdateShopOrderStatus();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 350);
  const [fulfillmentFilter, setFulfillmentFilter] = useState('ALL'); // 'ALL' | 'PICKUP' | 'DELIVERY' | 'COUNTER'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'READY' | 'COMPLETED'
  const [actionSuccess, setActionSuccess] = useState('');

  const rawOrders = shopOrdersQuery.data?.items || shopOrdersQuery.data?.orders || shopOrdersQuery.data || [];

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return rawOrders.filter((order) => {
      const q = debouncedQuery.toLowerCase().trim();
      const orderNo = (order.orderNo || `#${order.id}`).toLowerCase();
      const customerName = (order.member?.user?.name || order.member?.name || order.customerName || '').toLowerCase();
      const phone = (order.member?.user?.phone || order.member?.phone || '').toLowerCase();

      const matchesQuery = !q || orderNo.includes(q) || customerName.includes(q) || phone.includes(q);

      const matchesFulfillment =
        fulfillmentFilter === 'ALL' ||
        (fulfillmentFilter === 'PICKUP' && (order.fulfilment === 'PICKUP' || order.fulfilment === 'STORE_PICKUP')) ||
        (fulfillmentFilter === 'DELIVERY' && order.fulfilment === 'DELIVERY') ||
        (fulfillmentFilter === 'COUNTER' && (order.fulfilment === 'COUNTER_POS' || order.channel === 'COUNTER'));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PENDING' && (order.status === 'PLACED' || order.status === 'PENDING' || order.status === 'PREPARING')) ||
        (statusFilter === 'READY' && (order.status === 'READY' || order.status === 'SHIPPED')) ||
        (statusFilter === 'COMPLETED' && (order.status === 'COMPLETED' || order.status === 'DELIVERED' || order.status === 'FULFILLED'));

      return matchesQuery && matchesFulfillment && matchesStatus;
    });
  }, [rawOrders, debouncedQuery, fulfillmentFilter, statusFilter]);

  // Calculated Stats
  const totalOrders = rawOrders.length;
  const pendingPickup = rawOrders.filter(
    (o) => (o.fulfilment === 'PICKUP' || o.fulfilment === 'STORE_PICKUP') && o.status !== 'COMPLETED' && o.status !== 'DELIVERED' && o.status !== 'FULFILLED'
  ).length;
  const pendingDelivery = rawOrders.filter(
    (o) => o.fulfilment === 'DELIVERY' && o.status !== 'COMPLETED' && o.status !== 'DELIVERED' && o.status !== 'FULFILLED'
  ).length;
  const fulfilledCount = rawOrders.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED' || o.status === 'FULFILLED').length;

  const handleUpdateStatus = async (orderId, newStatus, label) => {
    setActionSuccess('');
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus });
      setActionSuccess(`Order updated to ${label} successfully!`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err?.message || 'Could not update order status.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="text-xs font-mono font-black tracking-widest uppercase text-[#4A812F] flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>STORE STAFF PORTAL</span>
            <span>•</span>
            <span>FULFILLMENT & MEMBER ORDERS</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Member Shop Orders & <span className="text-[#4A812F]">Fulfillment Operations</span>
          </h1>
          <p className="text-xs text-slate-600 font-semibold">
            Manage Click & Collect store pickups, home delivery dispatch, and counter order status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 text-[#4A812F] border border-emerald-200 text-xs font-extrabold px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xs">
            <PackageCheck className="w-4 h-4" />
            LIVE ORDER QUEUE ACTIVE
          </span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>TOTAL SHOP ORDERS</span>
            <ShoppingBag className="w-4 h-4 text-[#4A812F]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalOrders}</p>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            All member transactions
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>STORE PICKUP PENDING</span>
            <Store className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingPickup}</p>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            Click & Collect at desk
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>HOME DELIVERY PENDING</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingDelivery}</p>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
            Pending courier dispatch
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>FULFILLED / COMPLETED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{fulfilledCount}</p>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            Orders delivered / picked up
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-extrabold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Order No, Member Name, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#4A812F] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Fulfillment & Status Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <CustomSelect
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Fulfilments' },
                { value: 'PICKUP', label: 'Store Pickup (Click & Collect)' },
                { value: 'DELIVERY', label: 'Home Delivery' },
                { value: 'COUNTER', label: 'Counter POS' },
              ]}
            />

            <CustomSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending (Placed / Preparing)' },
                { value: 'READY', label: 'Ready / Out for Delivery' },
                { value: 'COMPLETED', label: 'Completed / Delivered' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#4A812F]" />
            Order Queue ({filteredOrders.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Click buttons below to update order status</span>
        </div>

        <QueryState
          query={shopOrdersQuery}
          loading={
            <div className="text-center py-12 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#4A812F] mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading member shop orders…</p>
            </div>
          }
          empty={
            <div className="text-center py-12 space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-sm text-slate-800">No shop orders found.</div>
              <p className="text-xs text-slate-500">Orders placed by members in the store will appear here.</p>
            </div>
          }
          emptyWhen={() => !filteredOrders.length}
        >
          {() => (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => {
                const memberName = order.member?.user?.name || order.member?.name || order.customerName || 'Walk-in Member';
                const memberPhone = order.member?.user?.phone || order.member?.phone || '';
                const isCompleted = order.status === 'COMPLETED' || order.status === 'DELIVERED';
                const isReady = order.status === 'READY' || order.status === 'SHIPPED';
                const isDelivery = order.fulfilment === 'DELIVERY';

                const statusBadgeText = isCompleted
                  ? '✓ COMPLETED'
                  : isReady
                  ? (isDelivery ? '🚚 OUT FOR DELIVERY' : '📦 READY FOR PICKUP')
                  : '⏳ PENDING FULFILLMENT';

                const statusBadgeStyle = isCompleted
                  ? 'bg-emerald-100 text-emerald-800'
                  : isReady
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-900';

                return (
                  <div
                    key={order.id}
                    className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-4 hover:border-[#4A812F] transition-all shadow-2xs"
                  >
                    {/* Top Row: Order info & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          {order.orderNo || `#${order.id.slice(-6)}`}
                        </span>

                        <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase ${
                          isDelivery ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {isDelivery ? <Truck className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                          {isDelivery ? 'Home Delivery' : 'Store Pickup (Click & Collect)'}
                        </span>

                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${statusBadgeStyle}`}>
                          {statusBadgeText}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-semibold flex items-center gap-3">
                        <span>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="font-black text-slate-900 text-base">{formatCurrency(Number(order.total || order.totalAmount || 0))}</span>
                      </div>
                    </div>

                    {/* Middle Row: Customer Details & Items */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Customer Info */}
                      <div className="md:col-span-4 bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="font-extrabold text-slate-900 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#4A812F]" />
                          {memberName}
                        </div>
                        {memberPhone && (
                          <div className="text-slate-600 font-mono text-[11px] flex items-center gap-2">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {formatPhone(memberPhone)}
                          </div>
                        )}
                        {isDelivery && (
                          <div className="text-slate-700 text-[11px] flex items-start gap-2 pt-1 border-t border-slate-100">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold">{order.deliveryAddress || 'Address specified'}</div>
                              {order.pinCode && <div className="text-slate-400 font-mono">PIN: {order.pinCode}</div>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Items Purchased */}
                      <div className="md:col-span-8 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Items</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {order.items?.map((item, idx) => (
                            <div key={item.id || idx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                              <span className="font-bold text-slate-900 truncate">{item.product?.name || 'Shop Product'}</span>
                              <span className="text-slate-600 font-semibold shrink-0 ml-2">
                                {formatCurrency(Number(item.unitPrice))} × {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Staff Action Buttons to update order status */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                      <div className="text-xs text-slate-500 font-medium">
                        Payment: <strong className="text-slate-900 uppercase font-mono">{order.paymentMode || 'PAID'}</strong> ({order.paymentStatus || 'PAID'})
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        {isCompleted ? (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Order Completed & Handed Over
                          </span>
                        ) : isDelivery ? (
                          order.status === 'SHIPPED' ? (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'DELIVERED', 'Delivered')}
                              disabled={updateOrderStatus.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Delivered
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'SHIPPED', 'Out for Delivery')}
                              disabled={updateOrderStatus.isPending}
                              className="bg-[#4A812F] hover:bg-[#3b6725] text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                            >
                              <Truck className="w-4 h-4" />
                              Mark Out for Delivery
                            </button>
                          )
                        ) : (
                          order.status === 'READY' ? (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'COMPLETED', 'Completed')}
                              disabled={updateOrderStatus.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Collected / Completed
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'READY', 'Ready for Pickup')}
                              disabled={updateOrderStatus.isPending}
                              className="bg-[#4A812F] hover:bg-[#3b6725] text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                            >
                              <PackageCheck className="w-4 h-4" />
                              Mark Ready for Pickup
                            </button>
                          )
                        )}
                      </div>
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

