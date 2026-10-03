import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useBookings, useCancelBooking } from '../../../hooks/useCourts';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters';
import { Calendar, Clock, AlertCircle, XCircle, ArrowLeft, Loader2, Plus, QrCode, Ticket } from 'lucide-react';
import { BookingPassModal } from '../../../components/booking/BookingPassModal';

export const MemberBookingsPage = () => {
  const { user } = useAuth();
  const { data: bookingsData, isLoading } = useBookings();
  const cancelBooking = useCancelBooking();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  const [selectedTicketBooking, setSelectedTicketBooking] = useState(null);

  const allBookings = bookingsData?.items || [];
  const filteredBookings = allBookings.filter((b) => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? The slot will be released.')) {
      try {
        await cancelBooking.mutateAsync({ id: bookingId, reason: 'Cancelled by member' });
      } catch (err) {
        alert(err?.message || 'Failed to cancel booking');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Court Reservations</h1>
          <p className="text-xs text-slate-500">Track upcoming match slots, history, and digital booking pass receipts</p>
        </div>
        <Link
          to="/member/book"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Court</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All Bookings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Ready to play? Check the live court matrix and reserve your next 60-minute session.
          </p>
          <Link
            to="/member/book"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm mt-2"
          >
            Open Booking Grid
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                    🎾
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{b.court?.name || 'Tennis Court'}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{b.court?.sport || 'Tennis'}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    b.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'CANCELLED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Date</span>
                  <span className="font-semibold text-slate-800">{formatDate(b.startTime)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Time Slot</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Rate Charged</span>
                  <span className="font-semibold text-emerald-700">
                    {Number(b.price || 0) === 0 ? '₹0 (Member perk)' : `₹${Number(b.price).toFixed(2)}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Booking ID</span>
                  <span className="font-mono text-[10px] text-slate-500 truncate block">{b.id?.slice(0, 8)}…</span>
                </div>
              </div>

              {b.status === 'CONFIRMED' && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedTicketBooking(b)}
                    className="text-xs font-extrabold text-[#2e7d32] hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#2e7d32]" />
                    <span>View Pass & QR Code</span>
                  </button>

                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelBooking.isPending}
                    className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Digital Booking Ticket Pass Modal */}
      {selectedTicketBooking && (
        <BookingPassModal
          booking={selectedTicketBooking}
          onClose={() => setSelectedTicketBooking(null)}
        />
      )}
    </div>
  );
};
export default MemberBookingsPage;
