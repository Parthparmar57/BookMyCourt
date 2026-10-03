import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicAvailability } from '../../../hooks/useCrm';
import { useBookingRealtime } from '../../../hooks/useRealtime';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';

const today = () => new Date().toISOString().split('T')[0];

export const AvailabilityPage = () => {
  const [date, setDate] = useState(today());
  useBookingRealtime(); // live grid updates
  const availabilityQuery = usePublicAvailability({ date });
  const courts = availabilityQuery.data || [];
  const columns = (courts[0]?.slots || []).filter((s) => s.slotTime.endsWith(':00')).map((s) => s.slotTime);

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
          LIVE SLOT MATRIX
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Live Court Availability</h1>
        <p className="text-sm text-slate-600">
          Real-time slot schedule. Zero double bookings, guaranteed by backend database exclusion constraints.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <QueryState query={availabilityQuery} emptyWhen={(d) => !d?.length} empty={<div className="p-10 text-center text-slate-400 text-sm">No open courts for this date.</div>}>
            {() => (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <th className="p-4 sticky left-0 bg-slate-900">Court</th>
                    <th className="p-4">Sport</th>
                    <th className="p-4">Rate</th>
                    {columns.map((c) => <th key={c} className="p-4 whitespace-nowrap">{c}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {courts.map((court) => (
                    <tr key={court.courtId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900 sticky left-0 bg-white">{court.courtName}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">{court.sport}</span>
                      </td>
                      <td className="p-4 font-semibold text-emerald-700">{formatCurrency(Number(court.walkInRate))}/hr</td>
                      {columns.map((time) => {
                        const slot = court.slots.find((s) => s.slotTime === time);
                        if (!slot) return <td key={time} className="p-4" />;
                        if (!slot.isAvailable) {
                          const social = slot.bookingType === 'SOCIAL';
                          return (
                            <td key={time} className="p-4">
                              <span className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium block text-center ${
                                social ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {social ? 'Social Play' : 'Booked'}
                              </span>
                            </td>
                          );
                        }
                        return (
                          <td key={time} className="p-4">
                            <Link
                              to="/login"
                              className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-semibold block text-center hover:bg-emerald-100 transition-colors"
                            >
                              Available
                            </Link>
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
  );
};
