import React, { useState } from 'react';
import {
  useAvailability,
  useCreateBooking,
  useCancelBooking,
  useBookings,
  useCourts,
  useUpdateCourt
} from '../../../hooks/useCourts';
import { useBookingRealtime } from '../../../hooks/useRealtime';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import {
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Calendar,
  ShieldAlert,
  Trophy,
  Clock,
  Flame,
  Info,
  Layers,
  ChevronLeft,
  ChevronRight,
  Activity,
  DollarSign,
  TrendingUp,
  Settings,
  Search,
  Trash2,
  Filter,
  Check
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { addDays, subDays, format, parseISO } from 'date-fns';

const today = () => new Date().toISOString().split('T')[0];

export const BookingsPage = () => {
  const { role } = useAuth();
  const isOwner = role === 'OWNER';
  const isFrontDesk = role === 'FRONT_DESK';

  const [activeMainTab, setActiveMainTab] = useState('schedule'); // 'schedule' | 'history' | 'rules'
  const [date, setDate] = useState(today());
  const [selectedSport, setSelectedSport] = useState('ALL'); // 'ALL' | 'Tennis' | 'Badminton' | 'Padel' | 'Cricket'
  const [selectedSlot, setSelectedSlot] = useState(null); // { courtId, courtName, slotTime, walkInRate }
  const [inspectedBooking, setInspectedBooking] = useState(null); // Slot object for viewing details & cancellation
  const [managerAction, setManagerAction] = useState('maintenance'); // 'maintenance' | 'event'

  // Manager Block/Event Form states
  const [sessionTitle, setSessionTitle] = useState('Club Invitational Tournament');
  const [maintenanceReason, setMaintenanceReason] = useState('Routine Surface Rolling & Net Inspection');
  const [cancelReason, setCancelReason] = useState('Administrative court schedule adjustment');
  const [editingCourt, setEditingCourt] = useState(null);
  const [updatedRate, setUpdatedRate] = useState('');

  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useBookingRealtime();
  const availabilityQuery = useAvailability({ date });
  const bookingsQuery = useBookings();
  const courtsQuery = useCourts();
  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();
  const updateCourt = useUpdateCourt();

  const allCourts = availabilityQuery.data || [];
  const rawBookings = bookingsQuery.data?.items || [];
  const rawCourtsList = courtsQuery.data || [];

  const displayedCourts =
    selectedSport === 'ALL'
      ? allCourts
      : allCourts.filter((c) => c.sport.toLowerCase() === selectedSport.toLowerCase());

  const columns = (allCourts[0]?.slots || [])
    .filter((s) => s.slotTime.endsWith(':00'))
    .map((s) => s.slotTime);

  // Executive Metric Calculations
  let totalSlotsCount = 0;
  let bookedSlotsCount = 0;
  let todayRevenue = 0;

  allCourts.forEach((c) => {
    (c.slots || []).forEach((s) => {
      if (s.slotTime.endsWith(':00')) {
        totalSlotsCount++;
        if (!s.isAvailable) {
          bookedSlotsCount++;
          if (s.bookingPrice) todayRevenue += Number(s.bookingPrice);
        }
      }
    });
  });

  const occupancyPct = totalSlotsCount > 0 ? Math.round((bookedSlotsCount / totalSlotsCount) * 100) : 0;

  // Date Navigation
  const handlePrevDay = () => {
    try {
      const current = parseISO(date);
      setDate(format(subDays(current, 1), 'yyyy-MM-dd'));
    } catch {
      setDate(today());
    }
  };

  const handleNextDay = () => {
    try {
      const current = parseISO(date);
      setDate(format(addDays(current, 1), 'yyyy-MM-dd'));
    } catch {
      setDate(today());
    }
  };

  const handleToday = () => {
    setDate(today());
  };

  // Slot click handling
  const handleSlotClick = (court, slot) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!slot?.isAvailable) {
      setInspectedBooking({
        ...slot,
        courtName: court.courtName,
        sport: court.sport,
        walkInRate: court.walkInRate,
      });
      return;
    }

    // Available slot -> Open Manager Block/Event Modal
    setManagerAction('maintenance');
    setSelectedSlot({
      courtId: court.courtId,
      courtName: court.courtName,
      sport: court.sport,
      slotTime: slot.slotTime,
      walkInRate: Number(court.walkInRate),
    });
  };

  // Submit Manager Court Block / Event Slot
  const handleConfirmManagerAction = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setErrorMsg('');

    const payload = {
      courtId: selectedSlot.courtId,
      date,
      startTime: selectedSlot.slotTime,
      type: managerAction === 'event' ? 'SOCIAL' : 'NORMAL',
      paymentMode: 'ONLINE',
    };

    if (managerAction === 'maintenance') {
      payload.walkIn = { name: `[MAINTENANCE] ${maintenanceReason}`, phone: '9999999999' };
    } else {
      payload.walkIn = { name: `[EVENT] ${sessionTitle}`, phone: '9876543210' };
    }

    try {
      await createBooking.mutateAsync(payload);
      setSuccessMsg(
        managerAction === 'maintenance'
          ? `Court ${selectedSlot.courtName} locked for maintenance at ${selectedSlot.slotTime}.`
          : `Club event slot scheduled on ${selectedSlot.courtName} at ${selectedSlot.slotTime}.`
      );
      setSelectedSlot(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Could not execute manager court action.');
    }
  };

  // Executive Booking Cancellation / Release Slot
  const handleCancelBooking = async () => {
    if (!inspectedBooking?.bookingId) {
      setErrorMsg('No valid booking ID found for this session.');
      return;
    }
    setErrorMsg('');

    try {
      await cancelBooking.mutateAsync({
        id: inspectedBooking.bookingId,
        reason: cancelReason.trim() || 'Manager Administrative Release',
      });
      setSuccessMsg(`Session cancelled. Slot on ${inspectedBooking.courtName} (${inspectedBooking.slotTime}) is now released.`);
      setInspectedBooking(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to cancel booking.');
    }
  };

  // Save updated court pricing rate
  const handleSaveCourtRate = async (courtId) => {
    const rate = Number(updatedRate);
    if (isNaN(rate) || rate < 0) {
      setErrorMsg('Enter a valid hourly rate.');
      return;
    }

    try {
      await updateCourt.mutateAsync({ id: courtId, walkInRate: rate });
      setSuccessMsg('Facility pricing rate updated successfully.');
      setEditingCourt(null);
      setUpdatedRate('');
    } catch (err) {
      setErrorMsg(err?.message || 'Could not update court pricing.');
    }
  };

  const sportTabs = [
    { key: 'ALL', label: 'All Courts', count: allCourts.length },
    { key: 'Tennis', label: 'Tennis', count: allCourts.filter((c) => c.sport.toLowerCase() === 'tennis').length },
    { key: 'Badminton', label: 'Badminton', count: allCourts.filter((c) => c.sport.toLowerCase() === 'badminton').length },
    { key: 'Padel', label: 'Padel', count: allCourts.filter((c) => c.sport.toLowerCase() === 'padel').length },
    { key: 'Cricket', label: 'Cricket Net', count: allCourts.filter((c) => c.sport.toLowerCase() === 'cricket').length },
  ];

  // Filter history logs
  const filteredHistory = rawBookings.filter((b) => {
    const matchesSearch =
      !historySearch ||
      b.court?.name?.toLowerCase().includes(historySearch.toLowerCase()) ||
      b.member?.user?.name?.toLowerCase().includes(historySearch.toLowerCase()) ||
      b.walkInName?.toLowerCase().includes(historySearch.toLowerCase());

    const matchesStatus =
      historyStatusFilter === 'ALL' || b.status === historyStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 font-sans max-w-full">
      {/* ─── TOP HEADER & EXECUTIVE NAVIGATION TABS ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Court Management & Schedules</h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Manager oversight of facility occupancy, booking history, maintenance blocks, and pricing rules.
          </p>
        </div>

        {/* View Switching Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveMainTab('schedule')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'schedule'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>Master Schedule</span>
          </button>
          <button
            onClick={() => setActiveMainTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'history'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
            <span>Revenue & Logs</span>
          </button>
          <button
            onClick={() => setActiveMainTab('rules')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'rules'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-purple-600" />
            <span>Pricing & Rules</span>
          </button>
        </div>
      </div>

      {/* ─── EXECUTIVE METRICS CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Occupancy Rate</span>
            <span className="text-lg font-semibold text-slate-800 mt-0.5 block">{occupancyPct}%</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2e7d32] flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Booked Sessions</span>
            <span className="text-lg font-semibold text-slate-800 mt-0.5 block">{bookedSlotsCount} Slots</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Available Capacity</span>
            <span className="text-lg font-semibold text-[#2e7d32] mt-0.5 block">{totalSlotsCount - bookedSlotsCount} Slots</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2e7d32] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Active Facilities</span>
            <span className="text-lg font-semibold text-slate-800 mt-0.5 block">{allCourts.length} Courts</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[#2e7d32] text-xs font-medium flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4 cursor-pointer" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4 cursor-pointer" /></button>
        </div>
      )}

      {/* ─── TAB 1: MASTER SCHEDULE MATRIX VIEW ─── */}
      {activeMainTab === 'schedule' && (
        <div className="space-y-3">
          {/* Filter Bar & Date Picker */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            {/* Sport Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
              {sportTabs.map((tab) => {
                const isSelected = selectedSport === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedSport(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Date Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-2xs text-xs font-medium text-slate-600 overflow-hidden">
                <button
                  onClick={handleToday}
                  className="px-3 py-1.5 hover:bg-slate-50 border-r border-gray-200 transition-colors cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={handlePrevDay}
                  title="Previous Day"
                  className="px-2 py-1.5 hover:bg-slate-50 border-r border-gray-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextDay}
                  title="Next Day"
                  className="px-2 py-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
                <Calendar className="w-4 h-4 text-[#2e7d32]" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-[calc(100vh-310px)] overflow-y-auto">
              <QueryState
                query={availabilityQuery}
                emptyWhen={(d) => !d?.length}
                empty={<div className="p-8 text-center text-slate-400 text-xs font-medium">No courts found for this date.</div>}
              >
                {() => (
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead className="sticky top-0 z-20 bg-slate-50 border-b border-gray-200 shadow-2xs">
                      <tr>
                        <th className="p-3 w-20 sm:w-24 font-medium text-slate-500 text-[11px] uppercase tracking-wider sticky left-0 bg-slate-100 z-30 border-r border-gray-200">
                          Time
                        </th>
                        {displayedCourts.map((court) => (
                          <th key={court.courtId} className="p-3 text-center border-l border-gray-200">
                            <span className="font-medium text-xs text-slate-800 block truncate">{court.courtName}</span>
                            <span className="text-[10px] font-medium text-[#2e7d32] block uppercase tracking-wider mt-0.5">
                              {court.sport} · {formatCurrency(court.walkInRate)}/hr
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {columns.map((time) => (
                        <tr key={time} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-normal text-slate-500 font-mono text-[11px] whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-100 shadow-2xs">
                            {time}
                          </td>

                          {displayedCourts.map((court) => {
                            const slot = court.slots.find((s) => s.slotTime === time);
                            if (!slot) return <td key={court.courtId} className="p-2 border-l border-gray-100" />;

                            // 1. Social Play Session
                            if (!slot.isAvailable && slot.bookingType === 'SOCIAL') {
                              return (
                                <td key={court.courtId} className="p-1.5 border-l border-gray-100">
                                  <button
                                    onClick={() => handleSlotClick(court, slot)}
                                    className="w-full p-2.5 rounded-xl bg-sky-50/90 hover:bg-sky-100 text-sky-950 font-normal border border-sky-200 text-center shadow-2xs hover:shadow-xs transition-all cursor-pointer block"
                                  >
                                    <div className="flex items-center justify-center gap-1 text-sky-900">
                                      <Trophy className="w-3 h-3 text-sky-700" />
                                      <span className="block text-[11px] truncate font-medium text-sky-900">{slot.memberName || 'Club Event'}</span>
                                    </div>
                                    <span className="text-[9px] text-sky-700 font-normal block mt-0.5">Event Session · Click to manage</span>
                                  </button>
                                </td>
                              );
                            }

                            // 2. Booked Match or Maintenance Block
                            if (!slot.isAvailable) {
                              const isMaintenance = slot.memberName?.includes('[MAINTENANCE]');
                              const isVIP = slot.memberName?.includes('[VIP]');
                              const isGold = slot.planName === 'Gold' || isVIP;
                              const isJunior = slot.planName === 'Junior';

                              if (isMaintenance) {
                                return (
                                  <td key={court.courtId} className="p-1.5 border-l border-gray-100">
                                    <button
                                      onClick={() => handleSlotClick(court, slot)}
                                      className="w-full p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-normal text-center shadow-2xs hover:shadow-xs transition-all cursor-pointer block"
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        <ShieldAlert className="w-3 h-3 text-amber-700" />
                                        <span className="block text-[11px] truncate font-medium text-amber-900">Maintenance</span>
                                      </div>
                                      <span className="text-[9px] text-amber-700 block truncate mt-0.5 font-normal">Blocked · Click to unblock</span>
                                    </button>
                                  </td>
                                );
                              }

                              return (
                                <td key={court.courtId} className="p-1.5 border-l border-gray-100">
                                  <button
                                    onClick={() => handleSlotClick(court, slot)}
                                    className={`w-full p-2.5 rounded-xl font-normal text-center shadow-2xs hover:shadow-xs transition-all cursor-pointer block border ${
                                      isGold
                                        ? 'bg-emerald-50/90 hover:bg-emerald-100/90 border-emerald-300 text-emerald-950'
                                        : isJunior
                                        ? 'bg-teal-50/90 hover:bg-teal-100/90 border-teal-200 text-teal-950'
                                        : 'bg-[#f4fbf7] hover:bg-[#e6f7ee] border-emerald-200 text-slate-900'
                                    }`}
                                  >
                                    <div className="text-center">
                                      <span className="block text-[11px] truncate font-medium text-slate-800">
                                        {slot.memberName || 'Reserved Match'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                      <span
                                        className={`text-[8px] px-1.5 py-0.2 rounded font-medium uppercase tracking-wider ${
                                          isGold
                                            ? 'bg-amber-100 text-amber-900 border border-amber-300/80'
                                            : isJunior
                                            ? 'bg-teal-100 text-teal-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                        }`}
                                      >
                                        {isVIP ? 'VIP' : slot.planName || 'Standard'}
                                      </span>
                                      <span className="text-[9px] text-slate-500 font-normal">Active Match</span>
                                    </div>
                                  </button>
                                </td>
                              );
                            }

                            // 3. Available Empty Slot (Click to Block or Publish Event)
                            return (
                              <td key={court.courtId} className="p-1.5 border-l border-gray-100 text-center">
                                <button
                                  onClick={() => handleSlotClick(court, slot)}
                                  className="group w-full py-2 px-2 rounded-xl border border-dashed border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/60 text-slate-400 hover:text-[#2e7d32] font-normal text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                                  title="Available slot. Click to block for maintenance or host an event."
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                                  <span className="text-[10px] font-medium">Available</span>
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </QueryState>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: BOOKING HISTORY & REVENUE LOGS ─── */}
      {activeMainTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm text-slate-800">Booking History & Ledger</h3>
              <p className="text-xs text-slate-400">Search all historical matches, player contact logs, and revenue generation.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search Filter */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search player, court, phone..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none cursor-pointer font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider">
                  <th className="p-3">Reference</th>
                  <th className="p-3">Player / Member</th>
                  <th className="p-3">Court & Sport</th>
                  <th className="p-3">Schedule Date & Time</th>
                  <th className="p-3">Revenue (₹)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map((b) => {
                  const playerName = b.member?.user?.name || b.walkInName || 'Guest Match';
                  const phone = b.member?.user?.phone || b.walkInPhone || '—';
                  const isCancelled = b.status === 'CANCELLED';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-slate-500">{b.id.slice(-8).toUpperCase()}</td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800 block">{playerName}</span>
                        <span className="text-[10px] text-slate-400 block">{phone}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-slate-700 block">{b.court?.name || 'Court'}</span>
                        <span className="text-[10px] text-emerald-700 font-medium block">{b.court?.sport}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-600">
                        {format(new Date(b.startTime), 'dd MMM yyyy')} · {format(new Date(b.startTime), 'HH:mm')}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {formatCurrency(b.price)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                            isCancelled
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {!isCancelled && (
                          <button
                            onClick={() => {
                              setInspectedBooking({
                                bookingId: b.id,
                                memberName: playerName,
                                memberPhone: phone,
                                courtName: b.court?.name,
                                sport: b.court?.sport,
                                slotTime: format(new Date(b.startTime), 'HH:mm'),
                                bookingPrice: b.price,
                                bookingStatus: b.status,
                                planName: b.member?.plan?.name || 'Standard',
                              });
                            }}
                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-lg font-medium text-[11px] transition-colors cursor-pointer"
                          >
                            Manage
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs font-medium">
                      No booking records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: FACILITY RATES & PRICING RULES ─── */}
      {activeMainTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-slate-800">Facility Hourly Rates & Operating Policies</h3>
            <p className="text-xs text-slate-400">Configure canonical walk-in tariffs, active sports, and court availability status.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {rawCourtsList.map((c) => (
              <div key={c.id} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800">{c.name}</h4>
                    <span className="text-[11px] text-[#2e7d32] font-medium block uppercase tracking-wider">{c.sport}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                      c.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {c.isOpen ? 'Operational' : 'Closed'}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-slate-600 border-t border-slate-200/80 pt-2.5">
                  <div className="flex justify-between">
                    <span>Operating Hours:</span>
                    <span className="font-medium text-slate-800">{c.openTime || '06:00'} – {c.closeTime || '22:00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Standard Hourly Rate:</span>
                    {editingCourt === c.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={updatedRate}
                          onChange={(e) => setUpdatedRate(e.target.value)}
                          className="w-20 px-2 py-0.5 bg-white border border-emerald-500 rounded text-xs font-semibold focus:outline-none"
                          placeholder={c.walkInRate}
                        />
                        <button
                          onClick={() => handleSaveCourtRate(c.id)}
                          className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingCourt(null)}
                          className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{formatCurrency(c.walkInRate)}</span>
                        <button
                          onClick={() => {
                            setEditingCourt(c.id);
                            setUpdatedRate(c.walkInRate);
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium cursor-pointer underline"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MODAL 1: MANAGER COURT BLOCK / EVENT ACTION DRAWER ─── */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 space-y-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <div>
                  <h3 className="font-semibold text-base text-slate-800">
                    Court Manager Action
                  </h3>
                  <p className="text-xs text-slate-400">{selectedSlot.courtName} · {date} ({selectedSlot.slotTime})</p>
                </div>
                <button onClick={() => setSelectedSlot(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Selection Tabs */}
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setManagerAction('maintenance')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    managerAction === 'maintenance'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Block Maintenance</span>
                </button>
                <button
                  type="button"
                  onClick={() => setManagerAction('event')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    managerAction === 'event'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-sky-600" />
                  <span>Club Event Slot</span>
                </button>
              </div>

              {/* Slot Summary Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-medium text-slate-800">
                  <span>Court & Sport:</span>
                  <span>{selectedSlot.courtName} ({selectedSlot.sport})</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Time Slot:</span>
                  <span className="font-medium">{date} · {selectedSlot.slotTime} (60 min)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tariff Baseline:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(selectedSlot.walkInRate)}/hr</span>
                </div>
              </div>

              {/* Maintenance Block Form */}
              {managerAction === 'maintenance' && (
                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="text-slate-700 block mb-1">Maintenance Reason</label>
                    <input
                      value={maintenanceReason}
                      onChange={(e) => setMaintenanceReason(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-amber-500 focus:outline-none font-medium text-xs"
                      placeholder="e.g. Clay Rolling, Net Replacement, Floodlight Repair"
                    />
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed font-normal">
                    This court slot will be blocked on the master matrix and marked unavailable for member self-booking.
                  </div>
                </div>
              )}

              {/* Event / Clinic Form */}
              {managerAction === 'event' && (
                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="text-slate-700 block mb-1">Event / Tournament Title</label>
                    <input
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-sky-500 focus:outline-none font-medium text-xs"
                      placeholder="e.g. Weekend Club Open Championship"
                    />
                  </div>
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-[11px] leading-relaxed font-normal">
                    This slot will be designated as a club social play / tournament session on the schedule.
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleConfirmManagerAction}
              disabled={createBooking.isPending}
              className={`w-full text-white font-medium text-xs py-3 rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                managerAction === 'maintenance'
                  ? 'bg-amber-700 hover:bg-amber-800'
                  : 'bg-sky-700 hover:bg-sky-800'
              }`}
            >
              {createBooking.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {managerAction === 'maintenance' ? 'Lock Court for Maintenance' : 'Schedule Club Event Slot'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: EXECUTIVE SESSION INSPECTION & CANCELLATION ─── */}
      {inspectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#2e7d32]" />
                <h3 className="font-semibold text-base text-slate-800">Executive Session Inspection</h3>
              </div>
              <button onClick={() => setInspectedBooking(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between font-medium text-slate-800 text-sm">
                  <span>Player / Organizer:</span>
                  <span className="text-[#1b4332] font-semibold">{inspectedBooking.memberName || 'Court Reservation'}</span>
                </div>
                {inspectedBooking.memberPhone && (
                  <div className="flex justify-between text-slate-600">
                    <span>Contact Phone:</span>
                    <span className="font-mono font-medium">{inspectedBooking.memberPhone}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Plan Tier / Type:</span>
                  <span className="font-medium text-emerald-800">{inspectedBooking.planName || 'Standard'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Facility:</span>
                  <span className="font-medium">{inspectedBooking.courtName} ({inspectedBooking.sport})</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Time Slot:</span>
                  <span className="font-mono font-medium">{date} · {inspectedBooking.slotTime}</span>
                </div>
                {inspectedBooking.bookingPrice != null && (
                  <div className="flex justify-between text-slate-600">
                    <span>Revenue Collected:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(inspectedBooking.bookingPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Booking Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                      inspectedBooking.bookingStatus === 'CANCELLED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {inspectedBooking.bookingStatus || 'CONFIRMED'}
                  </span>
                </div>
              </div>

              {/* Cancellation Reason input if not already cancelled */}
              {inspectedBooking.bookingStatus !== 'CANCELLED' && inspectedBooking.bookingId && (
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-medium text-slate-600 block">Cancellation / Release Reason</label>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Schedule adjustment, weather block"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setInspectedBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              {inspectedBooking.bookingStatus !== 'CANCELLED' && inspectedBooking.bookingId && (
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelBooking.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {cancelBooking.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Cancel Booking</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
