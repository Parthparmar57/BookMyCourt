import React from 'react';
import { useKitchenQueue, useUpdateKitchenStatus } from '../../../hooks/useBar';
import { useKitchenRealtime } from '../../../hooks/useRealtime';
import { Utensils, Clock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

const minsAgo = (iso) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return mins < 1 ? 'just now' : `${mins}m ago`;
};

const toTicket = (o) => ({
  id: o.id,
  status: o.status, // PLACED | PREPARING
  tableNumber: o.barTable?.number ? `Table ${o.barTable.number}` : (o.member?.user?.name || 'Counter'),
  items: (o.items || []).map((i) => `${i.quantity}× ${i.menuItem?.name || 'Item'}`),
  notes: o.notes,
  timeElapsed: minsAgo(o.createdAt),
});

export const KitchenPage = () => {
  useKitchenRealtime(); // push updates; the 30s poll below is just a fallback
  const queueQuery = useKitchenQueue({ refetchInterval: 30000 });
  const updateStatus = useUpdateKitchenStatus();

  const tickets = (queueQuery.data || []).map(toTicket);
  const newTickets = tickets.filter((t) => t.status === 'PLACED');
  const prepTickets = tickets.filter((t) => t.status === 'PREPARING');

  const advance = (id, next) => updateStatus.mutate({ id, status: next });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b pb-4 border-gray-200 bg-white p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4A812F] text-white flex items-center justify-center font-bold shadow-md shadow-[#4A812F]/20">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kitchen Display System (KDS)</h1>
            <p className="text-xs text-slate-500 font-semibold">Live order queue — auto-refreshes every 10s.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {queueQuery.isFetching ? (
            <Loader2 className="w-4 h-4 text-[#4A812F] animate-spin" />
          ) : (
            <span className="w-3 h-3 rounded-full bg-[#4A812F] animate-ping"></span>
          )}
          <span className="text-xs font-extrabold text-[#4A812F] uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            LIVE KITCHEN FEED
          </span>
        </div>
      </div>

      {queueQuery.isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl p-4">
          Failed to load the kitchen queue. {queueQuery.error?.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: NEW (PLACED) */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h3 className="font-extrabold text-xs text-rose-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> NEW ORDERS
            </h3>
            <span className="text-xs bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-200">{newTickets.length}</span>
          </div>
          <div className="space-y-4">
            {newTickets.map((t) => (
              <div key={t.id} className="bg-slate-50 border border-gray-200 p-5 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                  <span className="text-rose-600 font-black text-base">{t.tableNumber}</span>
                  <span className="text-slate-500 font-mono flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> {t.timeElapsed}</span>
                </div>
                <div className="text-xs text-slate-800 font-semibold space-y-1">
                  {t.items.map((i, idx) => <div key={idx} className="bg-white border border-gray-200 p-2 rounded-xl text-slate-900 font-extrabold">{i}</div>)}
                </div>
                {t.notes && <p className="text-[11px] text-amber-800 italic bg-amber-50 p-2 rounded-xl border border-amber-200">Note: {t.notes}</p>}
                <button onClick={() => advance(t.id, 'PREPARING')} className="w-full bg-[#4A812F] hover:bg-[#3b6725] text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4A812F]/20 transition-colors">
                  <span>START PREPARATION</span><ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!newTickets.length && <p className="text-xs text-slate-400 text-center py-6 font-semibold">No new orders.</p>}
          </div>
        </div>

        {/* Col 2: IN PREPARATION */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h3 className="font-extrabold text-xs text-amber-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span> IN PREPARATION
            </h3>
            <span className="text-xs bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full border border-amber-200">{prepTickets.length}</span>
          </div>
          <div className="space-y-4">
            {prepTickets.map((t) => (
              <div key={t.id} className="bg-slate-50 border border-gray-200 p-5 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                  <span className="text-amber-600 font-black text-base">{t.tableNumber}</span>
                  <span className="text-slate-500 font-mono flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> {t.timeElapsed}</span>
                </div>
                <div className="text-xs text-slate-800 font-semibold space-y-1">
                  {t.items.map((i, idx) => <div key={idx} className="bg-white border border-gray-200 p-2 rounded-xl text-slate-900 font-extrabold">{i}</div>)}
                </div>
                {t.notes && <p className="text-[11px] text-amber-800 italic bg-amber-50 p-2 rounded-xl border border-amber-200">Note: {t.notes}</p>}
                <button onClick={() => advance(t.id, 'SERVED')} className="w-full bg-[#4A812F] hover:bg-[#3b6725] text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4A812F]/20 transition-colors">
                  <span>MARK SERVED</span><CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!prepTickets.length && <p className="text-xs text-slate-400 text-center py-6 font-semibold">Nothing in preparation.</p>}
          </div>
        </div>

        {/* Col 3: SERVED */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h3 className="font-extrabold text-xs text-[#4A812F] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4A812F]"></span> SERVED ARCHIVE
            </h3>
          </div>
          <p className="text-xs text-slate-500 text-center py-6 leading-relaxed font-semibold">
            Orders marked served leave the live queue and move to billing/settlement automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
