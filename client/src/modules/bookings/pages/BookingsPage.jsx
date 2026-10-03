import React, { useState } from 'react';
import { useAvailability, useCreateBooking } from '../../../hooks/useCourts';
import { useMembers } from '../../../hooks/useMembership';
import { useBookingRealtime } from '../../../hooks/useRealtime';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
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
    // (A logged-in MEMBER sends neither — the server books for them.)

    try {
      await createBooking.mutateAsync(payload);
      setSuccessMsg(`Booking confirmed for ${selectedSlot.courtName} at ${selectedSlot.slotTime}!`);
      setSelectedSlot(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Could not confirm booking.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Interactive Court Booking Matrix</h1>
          <p className="text-xs text-slate-500">60-minute sessions, 30-min intervals, DB-enforced zero double-bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
          />
          <div className="hidden md:flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Available</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Booked</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-600"></span> Social</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>{successMsg}</span></div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-600" /><span>{errorMsg}</span></div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Booking Grid Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <QueryState query={availabilityQuery} emptyWhen={(d) => !d?.length} empty={<div className="p-6 text-center text-slate-400 text-sm">No open courts for this date.</div>}>
            {() => (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <th className="p-4 w-48 sticky left-0 bg-slate-900">Court / Sport</th>
                    {columns.map((c) => (
                      <th key={c} className="p-4 whitespace-nowrap">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {courts.map((court) => (
                    <tr key={court.courtId} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900 sticky left-0 bg-white">
                        <div>{court.courtName}</div>
                        <span className="text-[10px] text-slate-500 font-normal">{court.sport} • {formatCurrency(Number(court.walkInRate))}/hr</span>
                      </td>
                      {columns.map((time) => {
                        const slot = court.slots.find((s) => s.slotTime === time);
                        if (!slot) return <td key={time} className="p-4" />;

                        if (!slot.isAvailable && slot.bookingType === 'SOCIAL') {
                          return (
                            <td key={time} className="p-4">
                              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-900 font-bold border border-indigo-200">
                                <div className="text-[10px] uppercase text-indigo-500">Social Night</div>
                              </div>
                            </td>
                          );
                        }
                        if (!slot.isAvailable) {
                          return (
                            <td key={time} className="p-4">
                              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 font-bold border border-rose-200">
                                <div className="text-[10px] uppercase text-rose-500">Booked</div>
                              </div>
                            </td>
                          );
                        }
                        return (
                          <td key={time} className="p-4">
                            <button
                              onClick={() => openDrawer(court, slot)}
                              className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 transition-all text-left flex flex-col gap-1 hover:scale-[1.02]"
                            >
                              <span className="text-[10px] uppercase text-emerald-600">Available</span>
                              <span className="text-xs text-emerald-900 font-extrabold">{formatCurrency(Number(court.walkInRate))}</span>
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
