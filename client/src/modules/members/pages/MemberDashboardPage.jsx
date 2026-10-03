import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useBookings, useCancelBooking, useSocialSessions, useJoinSocial } from '../../../hooks/useCourts';
import { useMembers } from '../../../hooks/useMembership';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { 
  Calendar, 
  Sparkles, 
  QrCode, 
  Coffee, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  XCircle,
  Loader2
} from 'lucide-react';

export const MemberDashboardPage = () => {
  const { user } = useAuth();
  const { data: bookingsData, isLoading: loadingBookings } = useBookings();
  const { data: socialSessions = [] } = useSocialSessions();
  const cancelBooking = useCancelBooking();
  const joinSocial = useJoinSocial();

  const allBookings = bookingsData?.items || [];
  // Filter bookings belonging to this member (or all in demo member account)
  const myBookings = allBookings.slice(0, 5);
  const upcomingBookings = myBookings.filter(b => b.status === 'CONFIRMED');

  const memberPlan = user?.member?.plan || { name: 'Gold Annual', courtRate: 0, shopDiscountPct: 20, barDiscountPct: 15 };
  const memberNo = user?.member?.memberNo || 'MEM-001001';
  const endDate = user?.member?.endDate ? new Date(user.member.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '31 Dec 2026';

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? The slot will be released.')) {
      try {
        await cancelBooking.mutateAsync({ id: bookingId, reason: 'Cancelled by member' });
      } catch (err) {
        alert(err?.message || 'Failed to cancel booking');
      }
    }
  };

  const handleJoinFridaySocial = async (sessionId) => {
    try {
      await joinSocial.mutateAsync({ id: sessionId });
      alert('You have successfully joined the Friday Social Play session!');
    } catch (err) {
      alert(err?.message || 'Failed to join social play');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {memberPlan.name} Tier
              </span>
              <span className="text-xs text-slate-400 font-semibold">• ID: {memberNo}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="text-emerald-400">{user?.name || 'Member'}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Enjoy your <strong className="text-emerald-300 font-bold">100% Free Court Access</strong>, {memberPlan.shopDiscountPct}% Pro Shop discount, and {memberPlan.barDiscountPct}% Cafeteria perk today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/member/book"
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Court</span>
            </Link>
            <Link
              to="/member/card"
              className="bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all border border-slate-700"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Digital Pass</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Perk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tier Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Membership Status</p>
            <h3 className="text-lg font-black text-slate-900">Active • {memberPlan.name}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold">Valid till {endDate}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Court Perk */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Court Booking Rate</p>
            <h3 className="text-lg font-black text-slate-900">
              {Number(memberPlan.courtRate) === 0 ? '₹0 / Session' : formatCurrency(memberPlan.courtRate)}
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">Max 2 bookings / day</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Bar & Cafeteria Perk */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cafeteria & Bar</p>
            <h3 className="text-lg font-black text-slate-900">{memberPlan.barDiscountPct}% Off Menu</h3>
            <Link to="/member/tab" className="text-[11px] text-emerald-600 hover:underline font-bold">
              Order food & drinks ➔
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coffee className="w-6 h-6" />
          </div>
        </div>

        {/* Pro Shop Perk */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pro Shop Discount</p>
            <h3 className="text-lg font-black text-slate-900">{memberPlan.shopDiscountPct}% OFF</h3>
            <Link to="/member/shop" className="text-[11px] text-emerald-600 hover:underline font-bold">
              Shop Gear online ➔
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upcoming Bookings */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">My Active Reservations</h2>
              <p className="text-xs text-slate-500">Upcoming match slots and practice sessions</p>
            </div>
            <Link to="/member/book" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              Book New Slot <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingBookings ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No active bookings right now</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Courts are open today! Reserve a 60-minute session on Tennis, Padel, or Badminton.
              </p>
              <Link
                to="/member/book"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Reserve Court Slot
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">
                      🎾
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{b.court?.name || 'Tennis Court'}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(b.startTime)} • {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                      CONFIRMED • ₹{Number(b.price || 0).toFixed(0)}
                    </span>
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={cancelBooking.isPending}
                      className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Friday Social Play & Digital ID Preview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Friday Social Play */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-950 border border-indigo-800 rounded-3xl p-6 text-white space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full">
                Weekly Event
              </span>
              <span className="text-xs font-bold text-indigo-300">Every Friday 7:00 PM</span>
            </div>
            <h3 className="text-lg font-black text-white">Friday Night Social Play</h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Share the court with fellow club members in a rotating doubles tournament. Free drinks & snacks included!
            </p>
            <button
              onClick={() => {
                if (socialSessions[0]) handleJoinFridaySocial(socialSessions[0].id);
                else alert('Next Friday session opens for registration this Thursday!');
              }}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/30"
            >
              Join Friday Session
            </button>
          </div>

          {/* Digital Member Card Preview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Your Digital Club Pass</h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan your QR code at the front desk, gear shop, or cafeteria for instant discount verification.
              </p>
            </div>
            <Link
              to="/member/card"
              className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
            >
              Open Digital Pass & QR
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MemberDashboardPage;
