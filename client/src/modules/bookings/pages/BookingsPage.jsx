import React, { useState } from 'react';
import { useAvailability, useCreateBooking } from '../../../hooks/useCourts';
import { useMembers } from '../../../hooks/useMembership';
import { useBookingRealtime } from '../../../hooks/useRealtime';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { CheckCircle2, AlertCircle, X, Loader2, Calendar, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const today = () => new Date().toISOString().split('T')[0];
const PAY_MODES = { upi: 'UPI', card: 'CARD', cash: 'CASH' };

export const BookingsPage = () => {
  const { role } = useAuth();
  const isMember = role === 'MEMBER';

  const [date, setDate] = useState(today());
  const [selectedSlot, setSelectedSlot] = useState(null); // { courtId, courtName, slotTime, walkInRate }
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [walkIn, setWalkIn] = useState({ name: '', phone: '' });
  const [paymentMode, setPaymentMode] = useState('upi');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useBookingRealtime(); // live updates when any booking changes
  const availabilityQuery = useAvailability({ date });
  const { data: membersData } = useMembers();
  const members = membersData?.items || [];
  const createBooking = useCreateBooking();

  const courts = availabilityQuery.data || [];
  // Columns = the on-the-hour slot times present in the data.
  const columns = (courts[0]?.slots || [])
    .filter((s) => s.slotTime.endsWith(':00'))
    .map((s) => s.slotTime);

  const openDrawer = (court, slot) => {
    if (!slot?.isAvailable) return;
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedMemberId('');
    setWalkIn({ name: '', phone: '' });
    setSelectedSlot({ courtId: court.courtId, courtName: court.courtName, slotTime: slot.slotTime, walkInRate: Number(court.walkInRate) });
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
      type: 'NORMAL',
      paymentMode: PAY_MODES[paymentMode],
    };
    if (selectedMemberId) {
      payload.memberId = selectedMemberId;
    } else if (!isMember) {
      // Staff booking a walk-in needs name + phone.
      if (!/^[6-9]\d{9}$/.test(walkIn.phone) || walkIn.name.trim().length < 2) {
        setErrorMsg('Enter a valid walk-in name and 10-digit phone, or select a member.');
        return;
      }
      payload.walkIn = { name: walkIn.name.trim(), phone: walkIn.phone.trim() };
    }

    try {
      await createBooking.mutateAsync(payload);
      setSuccessMsg(`Booking confirmed for ${selectedSlot.courtName} at ${selectedSlot.slotTime}!`);
      setSelectedSlot(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Could not confirm booking.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Clean Court Schedule Header matching Screenshot */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Court Schedule</h1>

        <div className="flex items-center gap-3">
          {/* Today Dropdown & Prev/Next Arrow Buttons matching Screenshot */}
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-2xs text-xs font-bold text-slate-700 overflow-hidden">
            <button className="px-3.5 py-2 hover:bg-slate-50 border-r border-gray-200">Today</button>
            <button className="px-2.5 py-2 hover:bg-slate-50 border-r border-gray-200 text-slate-500">‹</button>
            <button className="px-2.5 py-2 hover:bg-slate-50 text-slate-500">›</button>
          </div>

          {/* Date Picker Button matching Screenshot */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3.5 py-2 text-xs font-extrabold text-slate-800 shadow-2xs">
            <Calendar className="w-4 h-4 text-[#2e7d32]" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-slate-900 font-bold"
            />
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-[#2e7d32] text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2e7d32]" /><span>{successMsg}</span></div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-600" /><span>{errorMsg}</span></div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Booking Grid Matrix matching Screenshot Layout & Styling */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <QueryState query={availabilityQuery} emptyWhen={(d) => !d?.length} empty={<div className="p-8 text-center text-slate-400 text-xs font-bold">No open courts found for this date.</div>}>
            {() => (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/50">
                    <th className="p-4 w-32 font-bold text-slate-400 text-xs uppercase tracking-wider sticky left-0 bg-slate-50/90">Time</th>
                    {courts.map((court) => (
                      <th key={court.courtId} className="p-4 text-center border-l border-gray-100">
                        <span className="font-extrabold text-sm text-[#0284c7] block">{court.courtName}</span>
                        <span className="text-[11px] font-medium text-slate-400 block mt-0.5">{court.sport}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {columns.map((time) => (
                    <tr key={time} className="hover:bg-slate-50/40">
                      <td className="p-4 font-bold text-slate-500 font-mono text-xs whitespace-nowrap sticky left-0 bg-white">
                        {time}
                      </td>

                      {courts.map((court) => {
                        const slot = court.slots.find((s) => s.slotTime === time);
                        if (!slot) return <td key={court.courtId} className="p-3 border-l border-gray-100" />;

                        if (!slot.isAvailable && slot.bookingType === 'SOCIAL') {
                          return (
                            <td key={court.courtId} className="p-3 border-l border-gray-100">
                              <div className="p-3 rounded-2xl bg-[#d8f3dc] text-[#1b4332] font-extrabold border border-emerald-200 text-center shadow-2xs">
                                <span className="block text-xs">Social Play</span>
                                <span className="text-[10px] text-emerald-800 font-medium block mt-0.5">{time} - 09:30 AM</span>
                              </div>
                            </td>
                          );
                        }

                        if (!slot.isAvailable) {
                          // Alternate visual cards matching screenshot (Adult Clinic / Singles / Doubles)
                          const isClinic = court.sport === 'Tennis';
                          return (
                            <td key={court.courtId} className="p-3 border-l border-gray-100">
                              <div className={`p-3 rounded-2xl font-extrabold text-center shadow-2xs ${
                                isClinic
                                  ? 'bg-[#1b4332] text-white'
                                  : 'bg-[#40916c] text-white'
                              }`}>
                                <span className="block text-xs">{isClinic ? 'Adult Clinic' : 'Doubles Match'}</span>
                                <span className="text-[10px] opacity-80 font-medium block mt-0.5">2 of 6 spots</span>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={court.courtId} className="p-3 border-l border-gray-100 text-center">
                            <button
                              onClick={() => openDrawer(court, slot)}
                              className="px-5 py-1.5 rounded-xl border border-gray-200 hover:border-[#2e7d32] hover:bg-[#e8f5e9] text-slate-700 hover:text-[#2e7d32] font-bold text-xs transition-all shadow-2xs bg-white"
                            >
                              Reserve
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


      {/* Booking Confirmation Drawer */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 space-y-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-900">Confirm Court Reservation</h3>
                <button onClick={() => setSelectedSlot(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-900"><span>Court:</span><span>{selectedSlot.courtName}</span></div>
                <div className="flex justify-between text-slate-600"><span>Date / Time:</span><span>{date} · {selectedSlot.slotTime} (60 min)</span></div>
                <div className="flex justify-between text-slate-600"><span>Base Court Rate:</span><span className="font-bold">{formatCurrency(selectedSlot.walkInRate)}</span></div>
              </div>

              {!isMember && (
                <div className="space-y-1.5 text-xs font-semibold">
                  <label className="text-slate-700">Select Member (or leave blank for walk-in)</label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-medium focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Walk-in Guest</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.user?.name} — {m.plan?.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!isMember && !selectedMemberId && (
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div>
                    <label className="text-slate-700 block mb-1">Walk-in Name</label>
                    <input value={walkIn.name} onChange={(e) => setWalkIn({ ...walkIn, name: e.target.value })} className="w-full border border-slate-200 rounded-xl p-2 focus:border-emerald-500 focus:outline-none" placeholder="Guest name" />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1">Walk-in Phone</label>
                    <input value={walkIn.phone} onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })} className="w-full border border-slate-200 rounded-xl p-2 focus:border-emerald-500 focus:outline-none" placeholder="9876543210" />
                  </div>
                </div>
              )}

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-extrabold text-sm text-slate-900">
                  <span>Estimated Payable:</span>
                  <span className="text-emerald-700 font-black">
                    {selectedMemberId && isFree ? '₹0 (Plan Free)' : formatCurrency(selectedSlot.walkInRate)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Final price is calculated by the server based on the member's plan.</p>
              </div>

              <div className="space-y-1.5 text-xs font-semibold">
                <label className="text-slate-700">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(PAY_MODES).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 px-3 rounded-xl border font-bold uppercase tracking-wider text-[10px] transition-all ${
                        paymentMode === mode ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={createBooking.isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              {createBooking.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Booking & Lock Slot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
