import React, { useState, useEffect } from 'react';
import { useKitchenQueue, useUpdateKitchenStatus } from '../../../hooks/useBar';
import { useKitchenRealtime } from '../../../hooks/useRealtime';
import { useAuth } from '../../../context/AuthContext';
import { 
  Utensils, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Flame,
  Check,
  ChefHat,
  Sparkles
} from 'lucide-react';
import { formatDate } from '../../../shared/utils/formatters';

const minsAgo = (iso) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return mins < 1 ? 'just now' : `${mins}m ago`;
};

const toTicket = (o) => ({
  id: o.id,
  orderNo: o.orderNo,
  status: o.status, // PLACED | PREPARING | SERVED | COMPLETED
  tableNumber: o.barTable?.number ? `Table ${o.barTable.number}` : (o.member?.user?.name || 'Takeaway / Court'),
  items: (o.items || []).map((i) => `${i.quantity}× ${i.menuItem?.name || 'Item'}`),
  notes: o.notes,
  timeElapsed: minsAgo(o.createdAt),
  createdAt: o.createdAt,
  updatedAt: o.updatedAt,
});

export const KitchenPage = () => {
  const { user } = useAuth();
  useKitchenRealtime(); // live push updates via websocket

  const queueQuery = useKitchenQueue({ refetchInterval: 10000 });
  const updateStatus = useUpdateKitchenStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Ticking Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const rawTickets = (queueQuery.data || []).map(toTicket);

  // Filtered tickets
  const filteredTickets = rawTickets.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchesTable = t.tableNumber.toLowerCase().includes(q);
    const matchesOrderNo = t.orderNo && t.orderNo.toLowerCase().includes(q);
    const matchesItem = t.items.some((item) => item.toLowerCase().includes(q));
    const matchesNotes = t.notes && t.notes.toLowerCase().includes(q);
    return matchesTable || matchesOrderNo || matchesItem || matchesNotes;
  });

  const newTickets = filteredTickets.filter((t) => t.status === 'PLACED');
  const prepTickets = filteredTickets.filter((t) => t.status === 'PREPARING');
  const servedTickets = filteredTickets.filter((t) => t.status === 'SERVED' || t.status === 'COMPLETED');
  const activeQueueCount = newTickets.length + prepTickets.length;

  const advance = (id, next) => updateStatus.mutate({ id, status: next });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#2e7d32] text-white flex items-center justify-center font-bold shadow-md shadow-[#2e7d32]/20 shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kitchen Display System (KDS)</h1>
              <span className="text-[10px] font-black tracking-widest text-[#2e7d32] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
                STATION ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Live order queue & food preparation tickets for club kitchen staff.
            </p>
          </div>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-emerald-400 font-mono text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-2 border border-slate-800 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards & Search Filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: New Orders */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">NEW ORDERS</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{newTickets.length}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* KPI 2: In Prep */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">IN PREPARATION</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{prepTickets.length}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Served Today */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-[#2e7d32] tracking-wider">SERVED TODAY</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{servedTickets.length}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#2e7d32] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Active Kitchen Queue */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">ACTIVE QUEUE</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{activeQueueCount}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Ticket Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Filter orders by table, order #, member name, or menu item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* 3 Interactive Queue Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Col 1: NEW ORDERS */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h3 className="font-extrabold text-xs text-rose-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span> NEW ORDERS
            </h3>
            <span className="text-xs bg-rose-50 text-rose-700 font-black px-3 py-1 rounded-full border border-rose-200">
              {newTickets.length}
            </span>
          </div>

          <div className="space-y-4">
            {newTickets.map((t) => (
              <div key={t.id} className="bg-slate-50 border border-gray-200 p-5 rounded-2xl space-y-3 shadow-xs hover:border-rose-300 transition-all">
                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                  <span className="text-rose-600 font-black text-base">{t.tableNumber}</span>
                  <span className="text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" /> {t.timeElapsed}
                  </span>
                </div>

                <div className="text-xs text-slate-800 font-semibold space-y-1">
                  {t.items.map((i, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 p-2 rounded-xl text-slate-900 font-extrabold">
                      {i}
                    </div>
                  ))}
                </div>

                {t.notes && (
                  <p className="text-[11px] text-amber-800 italic bg-amber-50 p-2 rounded-xl border border-amber-200">
                    Note: {t.notes}
                  </p>
                )}

                <button 
                  onClick={() => advance(t.id, 'PREPARING')} 
                  disabled={updateStatus.isPending}
                  className="w-full bg-[#2e7d32] hover:bg-[#236327] text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#2e7d32]/20 transition-colors cursor-pointer"
                >
                  <span>START PREPARATION</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!newTickets.length && (
              <p className="text-xs text-slate-400 text-center py-10 font-semibold">
                No new incoming orders in queue.
              </p>
            )}
          </div>
        </div>

        {/* Col 2: IN PREPARATION */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h3 className="font-extrabold text-xs text-amber-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span> IN PREPARATION
            </h3>
            <span className="text-xs bg-amber-50 text-amber-700 font-black px-3 py-1 rounded-full border border-amber-200">
              {prepTickets.length}
            </span>
          </div>

          <div className="space-y-4">
            {prepTickets.map((t) => (
              <div key={t.id} className="bg-slate-50 border border-gray-200 p-5 rounded-2xl space-y-3 shadow-xs hover:border-amber-300 transition-all">
                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                  <span className="text-amber-600 font-black text-base">{t.tableNumber}</span>
                  <span className="text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> {t.timeElapsed}
                  </span>
                </div>

                <div className="text-xs text-slate-800 font-semibold space-y-1">
                  {t.items.map((i, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 p-2 rounded-xl text-slate-900 font-extrabold">
                      {i}
                    </div>
                  ))}
                </div>

                {t.notes && (
                  <p className="text-[11px] text-amber-800 italic bg-amber-50 p-2 rounded-xl border border-amber-200">
                    Note: {t.notes}
                  </p>
                )}

                <button 
                  onClick={() => advance(t.id, 'SERVED')} 
                  disabled={updateStatus.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
                >
                  <span>MARK SERVED & READY</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!prepTickets.length && (
              <p className="text-xs text-slate-400 text-center py-10 font-semibold">
                Nothing currently cooking in kitchen.
              </p>
            )}
          </div>
        </div>

        {/* Col 3: SERVED ARCHIVE (DYNAMIC) */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h3 className="font-extrabold text-xs text-[#2e7d32] uppercase tracking-wider flex items-center gap-2">
              <Check className="w-4 h-4 text-[#2e7d32]" /> SERVED ARCHIVE
            </h3>
            <span className="text-xs bg-emerald-50 text-[#2e7d32] font-black px-3 py-1 rounded-full border border-emerald-200">
              {servedTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {servedTickets.map((t) => (
              <div key={t.id} className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2 opacity-90">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-800">{t.tableNumber}</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Served
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-0.5">
                  {t.items.map((i, idx) => (
                    <div key={idx} className="truncate">• {i}</div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>{t.orderNo || `#${t.id.slice(-6)}`}</span>
                  <span>{formatDate(t.updatedAt || t.createdAt)}</span>
                </div>
              </div>
            ))}

            {!servedTickets.length && (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-black text-sm text-slate-700">No Tickets Served Yet</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Orders marked as served will automatically appear in this archive with completion timestamps.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default KitchenPage;
