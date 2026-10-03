import React, { useState, useEffect } from 'react';
import { bookingApi, memberApi } from '../../../services/apiServices';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Calendar, Clock, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const BookingsPage = () => {
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [paymentMode, setPaymentMode] = useState('upi');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { currentRole, currentUser } = useAuth();

  useEffect(() => {
    async function loadData() {
      const [c, s, m] = await Promise.all([
        bookingApi.getCourts(),
        bookingApi.getSlots(),
        memberApi.getMembers()
      ]);
      setCourts(c);
      setSlots(s);
      setMembers(m);
    }
    loadData();
  }, []);

  const handleSlotClick = (court, time, slot) => {
    if (court.status === 'MAINTENANCE') return;
    if (slot?.status === 'BOOKED') return;
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedSlot({ court, time, slot });
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    // Validation rule: Daily max 2 bookings
    const selectedMember = members.find((m) => m.id === selectedMemberId);
    if (selectedMember && selectedMember.activeBookingsCountToday >= 2) {
      setErrorMsg(`Booking blocked: Member ${selectedMember.name} has reached maximum 2 bookings per day constraint.`);
      return;
    }

    const price = selectedMember?.planId === 'plan-gold' ? 0 : selectedSlot.court.hourlyRate;

    await bookingApi.createBooking({
      courtId: selectedSlot.court.id,
      startTime: selectedSlot.time,
      endTime: '08:00 AM',
      memberName: selectedMember ? selectedMember.name : (currentUser?.name || 'Walk-in Guest'),
      memberId: selectedMemberId || currentUser?.id,
      price
    });

    setSuccessMsg(`Booking confirmed for ${selectedSlot.court.name} at ${selectedSlot.time}!`);
    setSelectedSlot(null);
    const updatedSlots = await bookingApi.getSlots();
    setSlots(updatedSlots);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Interactive Court Booking Matrix</h1>
          <p className="text-xs text-slate-500">60-minute session duration, 30-min slot intervals, zero double bookings.</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Available</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Booked</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-600"></span> Social Play</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Booking Grid Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                <th className="p-4 w-48">Court / Sport</th>
                <th className="p-4">06:00 - 07:00 AM</th>
                <th className="p-4">07:00 - 08:00 AM</th>
                <th className="p-4">08:00 - 09:00 AM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {courts.map((court) => {
                const cSlots = slots.filter((s) => s.courtId === court.id);
                return (
                  <tr key={court.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">
                      <div>{court.name}</div>
                      <span className="text-[10px] text-slate-500 font-normal">{court.sport} • {formatCurrency(court.hourlyRate)}/hr</span>
                    </td>

                    {['06:00 AM', '07:00 AM', '08:00 AM'].map((time) => {
                      const slot = cSlots.find((s) => s.startTime === time);

                      if (court.status === 'MAINTENANCE') {
                        return (
                          <td key={time} className="p-4">
                            <div className="p-3 rounded-xl bg-slate-100 text-slate-400 font-semibold text-center border border-slate-200">
                              Maintenance Block
                            </div>
                          </td>
                        );
                      }

                      if (slot?.status === 'BOOKED') {
                        return (
                          <td key={time} className="p-4">
                            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 font-bold border border-rose-200">
                              <div className="text-[10px] uppercase text-rose-500">Booked Slot</div>
                              <div className="text-xs truncate">{slot.memberName}</div>
                            </div>
                          </td>
                        );
                      }

                      if (slot?.status === 'SOCIAL_PLAY') {
                        return (
                          <td key={time} className="p-4">
                            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-900 font-bold border border-indigo-200">
                              <div className="text-[10px] uppercase text-indigo-500">Friday Social Night</div>
                              <div className="text-xs text-indigo-700">{slot.joinedCount}/{slot.maxCount} Players Joined</div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={time} className="p-4">
                          <button
                            onClick={() => handleSlotClick(court, time, slot)}
                            className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 transition-all text-left flex flex-col justify-between hover:scale-[1.02]"
                          >
                            <span className="text-[10px] uppercase text-emerald-600">🟢 Available</span>
                            <span className="text-xs text-emerald-900 font-extrabold">{formatCurrency(court.hourlyRate)}</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Confirmation Drawer Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 space-y-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-900">Confirm Court Reservation</h3>
                <button onClick={() => setSelectedSlot(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Slot Details */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Court:</span>
                  <span>{selectedSlot.court.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Slot Time:</span>
                  <span>{selectedSlot.time} (60 min)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Base Court Rate:</span>
                  <span className="font-bold">{formatCurrency(selectedSlot.court.hourlyRate)}</span>
                </div>
              </div>

              {/* Member Selector */}
              <div className="space-y-1.5 text-xs font-semibold">
                <label className="text-slate-700">Select Member Profile</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-medium focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Walk-in Guest / Standard User</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.planName} - {m.planId === 'plan-gold' ? '100% Free' : '50% Off'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Calculation */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Plan Discount:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedMemberId && members.find((m) => m.id === selectedMemberId)?.planId === 'plan-gold'
                      ? '- 100% (Gold Free)'
                      : '₹0'}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-emerald-200 pt-2">
                  <span>Final Payable Amount:</span>
                  <span className="text-emerald-700 font-black">
                    {selectedMemberId && members.find((m) => m.id === selectedMemberId)?.planId === 'plan-gold'
                      ? '₹0 (Plan Free)'
                      : formatCurrency(selectedSlot.court.hourlyRate)}
                  </span>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="space-y-1.5 text-xs font-semibold">
                <label className="text-slate-700">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {['upi', 'card', 'cash'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 px-3 rounded-xl border font-bold uppercase tracking-wider text-[10px] transition-all ${
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

            <button
              onClick={handleConfirmBooking}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg transition-colors"
            >
              Confirm Booking & Lock Slot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
