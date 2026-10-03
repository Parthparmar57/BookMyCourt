import React from 'react';
import {
  Package,
  Truck,
  Store,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin
} from 'lucide-react';

export const OrderTrackJourney = ({ order }) => {
  if (!order) return null;

  const isDelivery = order.fulfilment === 'DELIVERY';
  const status = (order.status || 'PLACED').toUpperCase();

  // Cancelled handling
  if (status === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-rose-900">Order Cancelled</h4>
          <p className="text-xs text-rose-700 mt-0.5">
            This order has been cancelled. Any pre-authorized payment or wallet debits have been reversed to your account.
          </p>
        </div>
      </div>
    );
  }

  // Stages definition based on fulfilment type
  const deliveryStages = [
    {
      key: 'PLACED',
      label: 'Order Placed',
      sub: 'Payment confirmed',
      icon: Clock,
      detail: 'Order recorded in club system & inventory allocated.',
    },
    {
      key: 'PREPARING',
      label: 'Packed & Sealed',
      sub: 'Quality checked',
      icon: Package,
      detail: 'Equipment packed in protective packaging with order invoice.',
    },
    {
      key: 'SHIPPED',
      label: 'Out for Delivery',
      sub: 'In transit',
      icon: Truck,
      detail: 'Dispatched with Club Express partner for doorstep delivery.',
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      sub: 'Received',
      icon: CheckCircle2,
      detail: 'Package safely delivered to member address.',
    },
  ];

  const pickupStages = [
    {
      key: 'PLACED',
      label: 'Order Placed',
      sub: 'Payment confirmed',
      icon: Clock,
      detail: 'Order received at Pro Shop counter POS.',
    },
    {
      key: 'PREPARING',
      label: 'Preparing Gear',
      sub: 'Packed & tagged',
      icon: Package,
      detail: 'Staff picked gear from pro-shop stock and tagged with member ID.',
    },
    {
      key: 'READY',
      label: 'Ready for Pickup',
      sub: 'At Club Desk',
      icon: Store,
      detail: 'Ready for collection at main reception / pro shop desk.',
    },
    {
      key: 'COMPLETED',
      label: 'Collected',
      sub: 'Handover complete',
      icon: CheckCircle2,
      detail: 'Order collected and verified at the counter.',
    },
  ];

  const stages = isDelivery ? deliveryStages : pickupStages;

  // Determine active stage index (0 to 3)
  const getStageIndex = () => {
    if (status === 'COMPLETED' || status === 'DELIVERED') return 3;
    if (status === 'SHIPPED' || status === 'READY') return 2;
    if (status === 'PREPARING' || status === 'PACKED') return 1;
    return 0; // PLACED or PENDING
  };

  const currentStageIndex = getStageIndex();
  const currentStage = stages[currentStageIndex];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
      {/* Top Track Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-black uppercase text-slate-800 tracking-wider">
            Order Tracking Journey
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-bold text-slate-500">
            {isDelivery ? 'Doorstep Delivery' : 'Click & Collect Pickup'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            Stage {currentStageIndex + 1} of 4: <strong className="text-slate-900">{currentStage.label}</strong>
          </span>
        </div>
      </div>

      {/* ─── ONLY HORIZONTAL TRACKING STEPPER ─── */}
      <div className="py-2">
        <div className="grid grid-cols-4 relative">
          {/* Connecting Progress Line */}
          <div className="absolute top-4.5 left-[12.5%] right-[12.5%] h-1 bg-slate-200 -z-0">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#4A812F] transition-all duration-500"
              style={{
                width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
              }}
            />
          </div>

          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="flex flex-col items-center text-center relative z-10 px-1">
                {/* Circle Icon */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-[#4A812F] text-white shadow-md ring-4 ring-emerald-100 animate-pulse scale-105'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Stage Labels */}
                <div className="mt-2 space-y-0.5">
                  <div
                    className={`text-xs font-black tracking-tight leading-tight ${
                      isCurrent
                        ? 'text-slate-950 font-black'
                        : isCompleted
                        ? 'text-emerald-800 font-bold'
                        : 'text-slate-400 font-semibold'
                    }`}
                  >
                    {stage.label}
                  </div>
                  <div className="text-[10px] text-slate-500 hidden sm:block leading-tight font-medium">
                    {stage.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Stage Status Summary */}
      <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-bold text-slate-800">{currentStage.detail}</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium shrink-0">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isDelivery
              ? `${order.deliveryAddress || 'Registered Address'} ${order.pinCode ? `(${order.pinCode})` : ''}`
              : 'Club Front Desk Counter'}
          </span>
        </div>
      </div>
    </div>
  );
};
