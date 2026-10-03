import React, { useState, useEffect } from 'react';
import { bookingApi } from '../../../services/apiServices';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Calendar, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AvailabilityPage = () => {
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [c, s] = await Promise.all([bookingApi.getCourts(), bookingApi.getSlots()]);
      setCourts(c);
      setSlots(s);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
          LIVE SLOT MATRIX
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Live Court Availability
        </h1>
        <p className="text-sm text-slate-600">
          Real-time slot schedule updated live across all 6 courts. Zero double bookings guaranteed by backend database exclusion constraints.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium">Loading court grid...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                  <th className="p-4">Court Name</th>
                  <th className="p-4">Sport</th>
                  <th className="p-4">Hourly Rate</th>
                  <th className="p-4">06:00 - 07:00 AM</th>
                  <th className="p-4">07:00 - 08:00 AM</th>
                  <th className="p-4">08:00 - 09:00 AM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {courts.map((court) => {
                  const cSlots = slots.filter((s) => s.courtId === court.id);
                  return (
                    <tr key={court.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{court.name}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                          {court.sport}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-emerald-700">{formatCurrency(court.hourlyRate)}/hr</td>
                      {['06:00 AM', '07:00 AM', '08:00 AM'].map((time) => {
                        const slot = cSlots.find((s) => s.startTime === time);
                        if (court.status === 'MAINTENANCE') {
                          return (
                            <td key={time} className="p-4">
                              <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium block text-center">
                                Maintenance
                              </span>
                            </td>
                          );
                        }
                        if (slot?.status === 'BOOKED') {
                          return (
                            <td key={time} className="p-4">
                              <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1.5 rounded-lg border border-rose-200 font-medium block text-center">
                                Booked ({slot.memberName})
                              </span>
                            </td>
                          );
                        }
                        if (slot?.status === 'SOCIAL_PLAY') {
                          return (
                            <td key={time} className="p-4">
                              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-lg border border-indigo-200 font-bold block text-center">
                                Social Play ({slot.joinedCount}/{slot.maxCount})
                              </span>
                            </td>
                          );
                        }
                        return (
                          <td key={time} className="p-4">
                            <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-semibold block text-center cursor-pointer hover:bg-emerald-100 transition-colors">
                              Available ({formatCurrency(court.hourlyRate)})
                            </span>
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
      )}
    </div>
  );
};
