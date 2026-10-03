import React, { useState } from 'react';
import { useAvailability, useCreateBooking } from '../../../hooks/useCourts';
import { useMembers } from '../../../hooks/useMembership';
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
  UserCheck,
  Clock,
  Flame,
  Info,
  Layers,
  ChevronLeft,
  ChevronRight,
  Activity,
  Sparkles,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { addDays, subDays, format, parseISO } from 'date-fns';

const today = () => new Date().toISOString().split('T')[0];
const PAY_MODES = { upi: 'UPI', card: 'CARD', cash: 'CASH' };

export const BookingsPage = () => {
  const { role } = useAuth();
  const isOwner = role === 'OWNER';
  const isFrontDesk = role === 'FRONT_DESK';
  const isAdminOrStaff = isOwner || isFrontDesk || role === 'BAR_STAFF' || role === 'SHOP_STAFF';

  const [date, setDate] = useState(today());
  const [selectedSport, setSelectedSport] = useState('ALL'); // 'ALL' | 'Tennis' | 'Badminton' | 'Padel' | 'Cricket'
  const [selectedSlot, setSelectedSlot] = useState(null); // { courtId, courtName, slotTime, walkInRate }
  const [inspectedBooking, setInspectedBooking] = useState(null); // Slot object for viewing details
  const [actionTab, setActionTab] = useState('member'); // 'member' | 'social' | 'maintenance'

  // Form states
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [walkIn, setWalkIn] = useState({ name: '', phone: '' });
  const [sessionTitle, setSessionTitle] = useState('Adult Tennis Clinic');
  const [maintenanceReason, setMaintenanceReason] = useState('Routine Court Maintenance & Rolling');
  const [paymentMode, setPaymentMode] = useState('upi');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useBookingRealtime();
  const availabilityQuery = useAvailability({ date });
  const { data: membersData } = useMembers();
  const members = membersData?.items || [];
  const createBooking = useCreateBooking();

  const allCourts = availabilityQuery.data || [];
  const displayedCourts =
    selectedSport === 'ALL'
      ? allCourts
      : allCourts.filter((c) => c.sport.toLowerCase() === selectedSport.toLowerCase());

  const columns = (allCourts[0]?.slots || [])
    .filter((s) => s.slotTime.endsWith(':00'))
    .map((s) => s.slotTime);

  // Calculate high-level Executive Metrics
  let totalSlotsCount = 0;
  let bookedSlotsCount = 0;

  allCourts.forEach((c) => {
    (c.slots || []).forEach((s) => {
      if (s.slotTime.endsWith(':00')) {
        totalSlotsCount++;
        if (!s.isAvailable) bookedSlotsCount++;
      }
    });
  });

  const occupancyPct = totalSlotsCount > 0 ? Math.round((bookedSlotsCount / totalSlotsCount) * 100) : 0;

  // Date Navigation handlers
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

  const openDrawer = (court, slot) => {
    if (!slot?.isAvailable) {
      setInspectedBooking({ ...slot, courtName: court.courtName, sport: court.sport });
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedMemberId('');
    setWalkIn({ name: '', phone: '' });
    setActionTab('member');
    setSelectedSlot({
      courtId: court.courtId,
      courtName: court.courtName,
      sport: court.sport,
      slotTime: slot.slotTime,
      walkInRate: Number(court.walkInRate),
    });
  };

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const isFree = selectedMember?.plan?.courtRate != null && Number(selectedMember.plan.courtRate) === 0;

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setErrorMsg('');

    const payload = {
      courtId: selectedSlot.courtId,
      date,
      startTime: selectedSlot.slotTime,
      type: actionTab === 'social' ? 'SOCIAL' : 'NORMAL',
      paymentMode: isOwner ? 'ONLINE' : PAY_MODES[paymentMode],
    };

    if (actionTab === 'maintenance') {
      payload.walkIn = { name: `[MAINTENANCE] ${maintenanceReason}`, phone: '9999999999' };
    } else if (actionTab === 'social') {
      payload.walkIn = { name: `[EVENT] ${sessionTitle}`, phone: '9876543210' };
    } else {
      if (selectedMemberId) {
        payload.memberId = selectedMemberId;
      } else if (isOwner) {
        const vipName = walkIn.name.trim() || 'VIP Club Guest';
        payload.walkIn = { name: `[VIP] ${vipName}`, phone: walkIn.phone.trim() || '9876543210' };
      } else if (isAdminOrStaff) {
        if (!/^[6-9]\d{9}$/.test(walkIn.phone) || walkIn.name.trim().length < 2) {
          setErrorMsg('Enter a valid walk-in name and 10-digit phone, or select a member.');
          return;
        }
        payload.walkIn = { name: walkIn.name.trim(), phone: walkIn.phone.trim() };
      }
    }

    try {
      await createBooking.mutateAsync(payload);
      setSuccessMsg(`Saved for ${selectedSlot.courtName} at ${selectedSlot.slotTime}!`);
      setSelectedSlot(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Could not process court action.');
    }
  };

  const sportTabs = [
    { key: 'ALL', label: 'All Courts', count: allCourts.length },
    { key: 'Tennis', label: 'Tennis', count: allCourts.filter((c) => c.sport.toLowerCase() === 'tennis').length },
    { key: 'Badminton', label: 'Badminton', count: allCourts.filter((c) => c.sport.toLowerCase() === 'badminton').length },
    { key: 'Padel', label: 'Padel', count: allCourts.filter((c) => c.sport.toLowerCase() === 'padel').length },
    { key: 'Cricket', label: 'Cricket Net', count: allCourts.filter((c) => c.sport.toLowerCase() === 'cricket').length },
  ];

  return (
    <div className="space-y-4 font-sans max-w-full">
      {/* ─── MINIMAL CLEAN HEADER & DATE PICKER ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Court Schedule</h1>

        <div className="flex items-center gap-2.5">
          {/* Quick Date Switcher */}
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

          {/* Date Picker Input */}
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

      {/* ─── MINIMAL SPORT FILTER TABS ─── */}
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

      {/* ─── SOLID CLEAN STATS CARDS ─── */}
      {isAdminOrStaff && (
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
              <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Open Capacity</span>
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
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[#2e7d32] text-xs font-medium flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ─── SOLID MATRIX GRID (Clean, Minimal, Theme-matched) ─── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-[calc(100vh-270px)] overflow-y-auto">
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
                          {court.sport}
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
                                onClick={() => openDrawer(court, slot)}
                                className="w-full p-2.5 rounded-xl bg-sky-50/90 hover:bg-sky-100 text-sky-950 font-normal border border-sky-200 text-center shadow-2xs hover:shadow-xs transition-all cursor-pointer block"
                              >
                                <div className="flex items-center justify-center gap-1 text-sky-900">
                                  <Trophy className="w-3 h-3 text-sky-700" />
                                  <span className="block text-[11px] truncate font-medium text-sky-900">{slot.memberName || 'Social Play'}</span>
                                </div>
                                <span className="text-[9px] text-sky-700 font-normal block mt-0.5">8 Registered</span>
                              </button>
                            </td>
                          );
                        }

                        // 2. Booked Match Session (Light Theme-Matched Solid Cards)
                        if (!slot.isAvailable) {
                          const isMaintenance = slot.memberName?.includes('[MAINTENANCE]');
                          const isVIP = slot.memberName?.includes('[VIP]');
                          const isGold = slot.planName === 'Gold' || isVIP;
                          const isJunior = slot.planName === 'Junior';

                          if (isMaintenance) {
                            return (
                              <td key={court.courtId} className="p-1.5 border-l border-gray-100">
                                <button
                                  onClick={() => openDrawer(court, slot)}
                                  className="w-full p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-normal text-center shadow-2xs hover:shadow-xs transition-all cursor-pointer block"
                                >
                                  <div className="flex items-center justify-center gap-1">
                                    <ShieldAlert className="w-3 h-3 text-amber-700" />
                                    <span className="block text-[11px] truncate font-medium text-amber-900">Maintenance</span>
                                  </div>
                                  <span className="text-[9px] text-amber-700 block truncate mt-0.5 font-normal">Court Blocked</span>
                                </button>
                              </td>
                            );
                          }

                          return (
                            <td key={court.courtId} className="p-1.5 border-l border-gray-100">
                              <button
                                onClick={() => openDrawer(court, slot)}
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
                                    {slot.memberName || 'Reserved'}
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
                                    {isVIP ? 'VIP' : slot.planName || 'Walk-in'}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-normal">In-Play</span>
                                </div>
                              </button>
                            </td>
                          );
                        }

                        // 3. Available Empty Slot (Solid Subtle Pill)
                        return (
                          <td key={court.courtId} className="p-1.5 border-l border-gray-100 text-center">
                            {isAdminOrStaff ? (
                              <button
                                onClick={() => openDrawer(court, slot)}
                                className="group w-full py-2 px-2 rounded-xl border border-dashed border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/60 text-slate-400 hover:text-[#2e7d32] font-normal text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                                <span className="text-[10px] font-medium">Available</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => openDrawer(court, slot)}
                                className="px-4 py-1.5 rounded-xl border border-gray-200 hover:border-[#2e7d32] hover:bg-[#e8f5e9] text-slate-700 hover:text-[#2e7d32] font-medium text-xs transition-all shadow-2xs bg-white cursor-pointer"
                              >
                                Reserve
                              </button>
                            )}
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

      {/* ─── ACTION DRAWER ─── */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 space-y-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <div>
                  <h3 className="font-semibold text-base text-slate-800">
                    {isOwner ? 'Executive Court Allocation' : isFrontDesk ? 'Front Desk Counter Dispatch' : 'Reserve Court Slot'}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedSlot.courtName} · {date} ({selectedSlot.slotTime})</p>
                </div>
                <button onClick={() => setSelectedSlot(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Tabs for Admin/Staff */}
              {isAdminOrStaff && (
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActionTab('member')}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      actionTab === 'member' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {isOwner ? <Crown className="w-3.5 h-3.5 text-emerald-700" /> : <UserCheck className="w-3.5 h-3.5" />}
                    <span>{isOwner ? 'VIP Reserve' : 'Member'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionTab('social')}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      actionTab === 'social' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionTab('maintenance')}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      actionTab === 'maintenance' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Block</span>
                  </button>
                </div>
              )}

              {/* Slot Summary Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-medium text-slate-800">
                  <span>Court & Sport:</span>
                  <span>{selectedSlot.courtName} ({selectedSlot.sport})</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Date / Time:</span>
                  <span className="font-medium">{date} · {selectedSlot.slotTime} (60 min)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Standard Walk-in Rate:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(selectedSlot.walkInRate)}</span>
                </div>
              </div>

              {/* TAB 1: Member / VIP Allocation */}
              {actionTab === 'member' && (
                <div className="space-y-4">
                  {isOwner ? (
                    // 👑 OWNER VIEW: Executive VIP Allocation
                    <div className="space-y-3">
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-900 mb-1">
                          <Crown className="w-4 h-4 text-emerald-700" />
                          <span>Executive Complimentary Reserve</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed font-normal">
                          Lock this court for VIP guests or tournament practice without collecting POS counter payments.
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs font-medium">
                        <label className="text-slate-700">Select Member (or leave blank for VIP Guest)</label>
                        <select
                          value={selectedMemberId}
                          onChange={(e) => setSelectedMemberId(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-normal focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="">VIP Guest / Executive Allocation</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.user?.name} — {m.plan?.name} ({m.memberNo})
                            </option>
                          ))}
                        </select>
                      </div>

                      {!selectedMemberId && (
                        <div className="space-y-2 text-xs font-medium">
                          <div>
                            <label className="text-slate-700 block mb-1">VIP Guest / Player Name</label>
                            <input
                              value={walkIn.name}
                              onChange={(e) => setWalkIn({ ...walkIn, name: e.target.value })}
                              className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none font-normal"
                              placeholder="e.g. Rahul Dravid (VIP Guest)"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // 🏢 FRONT DESK VIEW: Reception Walk-in / Member Booking with POS Collection
                    <div className="space-y-3">
                      <div className="space-y-1.5 text-xs font-medium">
                        <label className="text-slate-700">Select Member (or leave blank for Walk-in)</label>
                        <select
                          value={selectedMemberId}
                          onChange={(e) => setSelectedMemberId(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-normal focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="">Walk-in Guest / Non-Member</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.user?.name} — {m.plan?.name} ({m.memberNo})
                            </option>
                          ))}
                        </select>
                      </div>

                      {!selectedMemberId && (
                        <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                          <div>
                            <label className="text-slate-700 block mb-1">Guest Name</label>
                            <input
                              value={walkIn.name}
                              onChange={(e) => setWalkIn({ ...walkIn, name: e.target.value })}
                              className="w-full border border-slate-200 rounded-xl p-2 focus:border-emerald-500 focus:outline-none font-normal"
                              placeholder="Player name"
                            />
                          </div>
                          <div>
                            <label className="text-slate-700 block mb-1">Phone Number</label>
                            <input
                              value={walkIn.phone}
                              onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })}
                              className="w-full border border-slate-200 rounded-xl p-2 focus:border-emerald-500 focus:outline-none font-normal"
                              placeholder="9876543210"
                            />
                          </div>
                        </div>
                      )}

                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1 text-xs">
                        <div className="flex justify-between font-medium text-sm text-slate-800">
                          <span>Counter Payable:</span>
                          <span className="text-emerald-700 font-semibold">
                            {selectedMemberId && isFree ? '₹0 (Plan Benefit)' : formatCurrency(selectedSlot.walkInRate)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs font-medium">
                        <label className="text-slate-700">Counter Payment Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.keys(PAY_MODES).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setPaymentMode(mode)}
                              className={`py-2 px-3 rounded-xl border font-medium uppercase tracking-wider text-[10px] transition-all cursor-pointer ${
                                paymentMode === mode
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Social / Clinic Event */}
              {actionTab === 'social' && (
                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="text-slate-700 block mb-1">Event / Clinic Title</label>
                    <input
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none font-medium"
                      placeholder="e.g. Weekend Club Open Championship"
                    />
                  </div>
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-[11px] leading-relaxed font-normal">
                    This slot will be published as an open Social/Clinic play on the member app.
                  </div>
                </div>
              )}

              {/* TAB 3: Maintenance Block */}
              {actionTab === 'maintenance' && (
                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="text-slate-700 block mb-1">Maintenance / Block Reason</label>
                    <input
                      value={maintenanceReason}
                      onChange={(e) => setMaintenanceReason(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-amber-500 focus:outline-none font-medium"
                      placeholder="e.g. Clay Rolling, Net replacement, Floodlight repair"
                    />
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed font-normal">
                    This court will be marked as unavailable for member self-booking during this hour.
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={createBooking.isPending}
              className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] disabled:opacity-60 text-white font-medium text-sm py-3 rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {createBooking.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {actionTab === 'maintenance'
                  ? 'Lock Slot for Maintenance'
                  : actionTab === 'social'
                  ? 'Publish Club Event Slot'
                  : isOwner
                  ? 'Lock VIP Executive Reservation'
                  : 'Confirm & Dispatch Booking'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ─── BOOKED SLOT INSPECTOR MODAL ─── */}
      {inspectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#2e7d32]" />
                <h3 className="font-semibold text-base text-slate-800">Session Inspection</h3>
              </div>
              <button onClick={() => setInspectedBooking(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between font-medium text-slate-800 text-sm">
                  <span>Player / Title:</span>
                  <span className="text-[#1b4332] font-semibold">{inspectedBooking.memberName || 'Court Reservation'}</span>
                </div>
                {inspectedBooking.memberPhone && (
                  <div className="flex justify-between text-slate-600">
                    <span>Contact Phone:</span>
                    <span className="font-mono font-medium">{inspectedBooking.memberPhone}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Plan Tier:</span>
                  <span className="font-medium text-emerald-800">{inspectedBooking.planName || 'Standard'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Court:</span>
                  <span className="font-medium">{inspectedBooking.courtName} ({inspectedBooking.sport})</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Time Slot:</span>
                  <span className="font-mono font-medium">{date} · {inspectedBooking.slotTime}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Booking Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 uppercase">
                    {inspectedBooking.bookingStatus || 'CONFIRMED'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectedBooking(null)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
