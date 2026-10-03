import React, { useState, useEffect } from 'react';
import { barApi } from '../../../services/apiServices';
import { Utensils, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export const KitchenPage = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    barApi.getKitchenTickets().then(setTickets);
  }, []);

  const handleAdvance = async (id) => {
    await barApi.advanceKitchenTicket(id);
    const updated = await barApi.getKitchenTickets();
    setTickets(updated);
  };

  const newTickets = tickets.filter((t) => t.status === 'NEW');
  const prepTickets = tickets.filter((t) => t.status === 'IN_PREPARATION');
  const readyTickets = tickets.filter((t) => t.status === 'READY_TO_SERVE');

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4 border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">Kitchen Display System (KDS)</h1>
            <p className="text-xs text-slate-400">Zero-distraction high-contrast live order queue for kitchen staff.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">LIVE FEED ACTIVE</span>
        </div>
      </div>

      {/* 3 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: NEW */}
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
                  <span className="text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {t.timeElapsed}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-semibold space-y-1">
                  {t.items.map((i, idx) => (
                    <div key={idx} className="bg-slate-900 p-2 rounded-lg">{i}</div>
                  ))}
                </div>

                {t.notes && <p className="text-[11px] text-amber-300 italic bg-amber-950/40 p-2 rounded-lg border border-amber-900">Note: {t.notes}</p>}

                <button
                  onClick={() => handleAdvance(t.id)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <span>START PREPARATION</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
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
                  <span className="text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {t.timeElapsed}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-semibold space-y-1">
                  {t.items.map((i, idx) => (
                    <div key={idx} className="bg-slate-900 p-2 rounded-lg">{i}</div>
                  ))}
                </div>

                {t.notes && <p className="text-[11px] text-amber-300 italic bg-amber-950/40 p-2 rounded-lg border border-amber-900">Note: {t.notes}</p>}

                <button
                  onClick={() => handleAdvance(t.id)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <span>MARK READY TO SERVE</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: READY TO SERVE */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-800">
            <h3 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> READY TO SERVE
            </h3>
            <span className="text-xs bg-emerald-950 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-800">{readyTickets.length}</span>
          </div>

          <div className="space-y-4">
            {readyTickets.map((t) => (
              <div key={t.id} className="bg-slate-950 border border-emerald-500/30 p-5 rounded-2xl space-y-3 opacity-80">
                <div className="flex items-center justify-between text-xs font-extrabold text-emerald-400">
                  <span>{t.tableNumber}</span>
                  <span className="text-xs font-bold bg-emerald-950 px-2 py-0.5 rounded">SERVED</span>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {t.items.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
