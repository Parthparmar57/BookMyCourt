import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKitchenQueue, useUpdateKitchenStatus } from '../../../hooks/useBar';
import { useKitchenRealtime } from '../../../hooks/useRealtime';
import { useAuth } from '../../../context/AuthContext';
import { ApplyLeaveModal } from '../../../shared/components/ApplyLeaveModal';
import { 
  Utensils, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  LogOut, 
  Calendar, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Search, 
  User, 
  Flame,
  Check
} from 'lucide-react';

const minsAgo = (iso) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return mins < 1 ? 'just now' : `${mins}m ago`;
};

const toTicket = (o) => ({
  id: o.id,
  status: o.status, // PLACED | PREPARING
  tableNumber: o.barTable?.number ? `Table ${o.barTable.number}` : (o.member?.user?.name || 'Counter Order'),
  items: (o.items || []).map((i) => `${i.quantity}× ${i.menuItem?.name || 'Item'}`),
  notes: o.notes,
  timeElapsed: minsAgo(o.createdAt),
});

export const KitchenPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  useKitchenRealtime(); // push updates; the 30s poll below is just a fallback

  const queueQuery = useKitchenQueue({ refetchInterval: 30000 });
  const updateStatus = useUpdateKitchenStatus();

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Ticking Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const rawTickets = (queueQuery.data || []).map(toTicket);

  // Filtered tickets
  const filteredTickets = rawTickets.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchesTable = t.tableNumber.toLowerCase().includes(q);
    const matchesItem = t.items.some((item) => item.toLowerCase().includes(q));
    const matchesNotes = t.notes && t.notes.toLowerCase().includes(q);
    return matchesTable || matchesItem || matchesNotes;
  });

  const newTickets = filteredTickets.filter((t) => t.status === 'PLACED');
  const prepTickets = filteredTickets.filter((t) => t.status === 'PREPARING');

  const advance = (id, next) => updateStatus.mutate({ id, status: next });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
        {/* Brand & KDS Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#4A812F] text-white flex items-center justify-center font-bold shadow-md shadow-[#4A812F]/20 shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kitchen Display System (KDS)</h1>
              <span className="text-[10px] font-black tracking-widest text-[#4A812F] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
                STATION ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Live order queue & food preparation tickets for club kitchen staff.
            </p>
          </div>
        </div>

        {/* Live Clock & Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Station Clock */}
          <div className="bg-slate-900 text-emerald-400 font-mono text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-2 border border-slate-800 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{currentTime}</span>
          </div>

          {/* Sound Alert Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Mute Sound Alerts' : 'Enable Sound Alerts'}
            className={`px-3 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Audio ON' : 'Audio OFF'}</span>
          </button>

          {/* Manual Refetch */}
          <button
            onClick={() => queueQuery.refetch()}
            disabled={queueQuery.isFetching}
            title="Refresh Kitchen Queue"
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${queueQuery.isFetching ? 'animate-spin text-[#4A812F]' : ''}`} />
          </button>

          {/* Apply Leave Button */}
          <button
            onClick={() => setShowLeaveModal(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold px-3.5 py-2 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Apply Leave</span>
          </button>

          {/* User Profile Badge */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800">
              <User className="w-3.5 h-3.5 text-[#4A812F]" />
              <span>{currentUser.name || 'Kitchen Staff'}</span>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log out of Kitchen Station"
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold px-3.5 py-2 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* KPI Stats & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* KPI 1: New Orders */}
        <div className="md:col-span-3 bg-white border border-gray-200 rounded-3xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">NEW ORDERS</span>
            <p className="text-2xl font-black text-slate-900">{newTickets.length}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* KPI 2: In Prep */}
        <div className="md:col-span-3 bg-white border border-gray-200 rounded-3xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">IN PREPARATION</span>
            <p className="text-2xl font-black text-slate-900">{prepTickets.length}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Total Active Queue */}
        <div className="md:col-span-3 bg-white border border-gray-200 rounded-3xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-[#4A812F] tracking-wider">ACTIVE KITCHEN QUEUE</span>
            <p className="text-2xl font-black text-slate-900">{rawTickets.length}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#4A812F] flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
        </div>

        {/* Search Input Filter */}
        <div className="md:col-span-3 bg-white border border-gray-200 rounded-3xl p-3.5 shadow-2xs flex items-center">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table, item, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4A812F] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Leave Request Modal */}
      <ApplyLeaveModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} />

      {queueQuery.isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl p-4">
          Failed to load the kitchen queue. {queueQuery.error?.message}
        </div>
      )}

      {/* Ticket Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: NEW (PLACED) */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h3 className="font-extrabold text-xs text-rose-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> NEW ORDERS
            </h3>
            <span className="text-xs bg-rose-50 text-rose-700 font-black px-3 py-1 rounded-full border border-rose-200">{newTickets.length}</span>
          </div>
          <div className="space-y-4">
            {newTickets.map((t) => (
              <div key={t.id} className="bg-slate-50 border border-gray-200 p-5 rounded-2xl space-y-3 shadow-xs hover:border-rose-300 transition-all">
                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                  <span className="text-rose-600 font-black text-base">{t.tableNumber}</span>
                  <span className="text-slate-500 font-mono flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> {t.timeElapsed}</span>
                </div>
                <div className="text-xs text-slate-800 font-semibold space-y-1">
                  {t.items.map((i, idx) => <div key={idx} className="bg-white border border-gray-200 p-2 rounded-xl text-slate-900 font-extrabold">{i}</div>)}
                </div>
                {t.notes && <p className="text-[11px] text-amber-800 italic bg-amber-50 p-2 rounded-xl border border-amber-200">Note: {t.notes}</p>}
                <button 
                  onClick={() => advance(t.id, 'PREPARING')} 
                  disabled={updateStatus.isPending}
                  className="w-full bg-[#4A812F] hover:bg-[#3b6725] text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4A812F]/20 transition-colors cursor-pointer"
                >
                  <span>START PREPARATION</span><ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!newTickets.length && <p className="text-xs text-slate-400 text-center py-8 font-semibold">No new incoming orders.</p>}
          </div>
        </div>

        {/* Col 2: IN PREPARATION */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h3 className="font-extrabold text-xs text-amber-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span> IN PREPARATION
            </h3>
            <span className="text-xs bg-amber-50 text-amber-700 font-black px-3 py-1 rounded-full border border-amber-200">{prepTickets.length}</span>
          </div>
          <div className="space-y-4">
            {prepTickets.map((t) => (
              <div key={t.id} className="bg-slate-50 border border-gray-200 p-5 rounded-2xl space-y-3 shadow-xs hover:border-amber-300 transition-all">
                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                  <span className="text-amber-600 font-black text-base">{t.tableNumber}</span>
                  <span className="text-slate-500 font-mono flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> {t.timeElapsed}</span>
                </div>
                <div className="text-xs text-slate-800 font-semibold space-y-1">
                  {t.items.map((i, idx) => <div key={idx} className="bg-white border border-gray-200 p-2 rounded-xl text-slate-900 font-extrabold">{i}</div>)}
                </div>
                {t.notes && <p className="text-[11px] text-amber-800 italic bg-amber-50 p-2 rounded-xl border border-amber-200">Note: {t.notes}</p>}
                <button 
                  onClick={() => advance(t.id, 'SERVED')} 
                  disabled={updateStatus.isPending}
                  className="w-full bg-[#4A812F] hover:bg-[#3b6725] text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4A812F]/20 transition-colors cursor-pointer"
                >
                  <span>MARK SERVED</span><CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!prepTickets.length && <p className="text-xs text-slate-400 text-center py-8 font-semibold">Nothing currently in preparation.</p>}
          </div>
        </div>

        {/* Col 3: SERVED ARCHIVE */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h3 className="font-extrabold text-xs text-[#4A812F] uppercase tracking-wider flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4A812F]" /> SERVED ARCHIVE
            </h3>
          </div>
          <div className="text-center py-10 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#4A812F] mx-auto opacity-75" />
            <h4 className="font-black text-sm text-slate-800">Auto-Archived Tickets</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-xs mx-auto">
              Orders marked served leave the live queue and move directly to customer billing and table settlement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
