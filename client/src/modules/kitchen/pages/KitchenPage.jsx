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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4 border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">Kitchen Display System (KDS)</h1>
            <p className="text-xs text-slate-400">Live order queue — auto-refreshes every 10s.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {queueQuery.isFetching ? (
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
          ) : (
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          )}
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">LIVE FEED ACTIVE</span>
        </div>
      </div>

      {queueQuery.isError && (
        <div className="bg-rose-950/50 border border-rose-800 text-rose-300 text-sm rounded-2xl p-4">
          Failed to load the kitchen queue. {queueQuery.error?.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: NEW (PLACED) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-800">
            <h3 className="font-extrabold text-sm text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span> NEW ORDERS
            </h3>
            <span className="text-xs bg-rose-950 text-rose-300 font-bold px-2.5 py-0.5 rounded-full border border-rose-800">{newTickets.length}</span>
          </div>
          <div className="space-y-4">
            {newTickets.map((t) => (
              <div key={t.id} className="bg-slate-950 border-2 border-rose-500/50 p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs font-extrabold text-white">
                  <span className="text-rose-400 text-base">{t.tableNumber}</span>
                  <span className="text-slate-400 font-mono flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> {t.timeElapsed}</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold space-y-1">
                  {t.items.map((i, idx) => <div key={idx} className="bg-slate-900 p-2 rounded-lg">{i}</div>)}
                </div>
                {t.notes && <p className="text-[11px] text-amber-300 italic bg-amber-950/40 p-2 rounded-lg border border-amber-900">Note: {t.notes}</p>}
                <button onClick={() => advance(t.id, 'PREPARING')} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors">
                  <span>START PREPARATION</span><ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!newTickets.length && <p className="text-xs text-slate-600 text-center py-6">No new orders.</p>}
          </div>
        </div>

        {/* Col 2: IN PREPARATION */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-800">
            <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span> IN PREPARATION
            </h3>
            <span className="text-xs bg-amber-950 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-800">{prepTickets.length}</span>
          </div>
          <div className="space-y-4">
            {prepTickets.map((t) => (
              <div key={t.id} className="bg-slate-950 border-2 border-amber-500/50 p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs font-extrabold text-white">
                  <span className="text-amber-400 text-base">{t.tableNumber}</span>
                  <span className="text-slate-400 font-mono flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> {t.timeElapsed}</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold space-y-1">
                  {t.items.map((i, idx) => <div key={idx} className="bg-slate-900 p-2 rounded-lg">{i}</div>)}
                </div>
                {t.notes && <p className="text-[11px] text-amber-300 italic bg-amber-950/40 p-2 rounded-lg border border-amber-900">Note: {t.notes}</p>}
                <button onClick={() => advance(t.id, 'SERVED')} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors">
                  <span>MARK SERVED</span><CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!prepTickets.length && <p className="text-xs text-slate-600 text-center py-6">Nothing in preparation.</p>}
          </div>
        </div>

        {/* Col 3: SERVED (leaves the live board) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-800">
            <h3 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> SERVED
            </h3>
          </div>
          <p className="text-xs text-slate-600 text-center py-6">
            Orders marked served leave the live queue and move to billing/settlement.
          </p>
        </div>
      </div>
    </div>
  );
};
