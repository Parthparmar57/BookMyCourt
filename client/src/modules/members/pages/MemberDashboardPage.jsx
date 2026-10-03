import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useBookings, useCancelBooking, useSocialSessions, useJoinSocial } from '../../../hooks/useCourts';
import { useMembers } from '../../../hooks/useMembership';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { useTabs } from '../../../hooks/useBar';
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
  const { data: tabsData } = useTabs();
  const cancelBooking = useCancelBooking();
  const joinSocial = useJoinSocial();

  const allBookings = bookingsData?.items || [];
  // Filter bookings belonging to this member (or all in demo member account)
  const myBookings = allBookings.slice(0, 5);
  const upcomingBookings = myBookings.filter(b => b.status === 'CONFIRMED');

  const allTabs = Array.isArray(tabsData) ? tabsData : (tabsData?.items || []);
  const activeTab = allTabs.find((t) => t.status === 'OPEN');
  const activeTabBalance = activeTab ? Number(activeTab.totalAmount || 0) : 0;

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
      {/* Welcome Hero Banner (Light Green Theme Design) */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-emerald-50/90 border-2 border-emerald-600/30 text-slate-900 shadow-md overflow-hidden transition-all">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-700" />
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white text-emerald-800 border border-emerald-300 px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                {memberPlan.name} Member Pass
              </span>
              <span className="text-xs text-slate-500 font-bold">• ID: {memberNo}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, <span className="text-emerald-800">{user?.name || 'Member'}</span> 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 max-w-xl font-medium">
              Enjoy your <strong className="text-emerald-900 font-black">100% Free Court Access</strong>, {memberPlan.shopDiscountPct}% Pro Shop discount, and {memberPlan.barDiscountPct}% Cafeteria perk today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/member/book"
              className="bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Court</span>
            </Link>

            <Link
              to="/member/card"
              className="bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all border border-slate-300 shadow-2xs"
            >
              <QrCode className="w-4 h-4 text-emerald-700" />
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
            <h3 className="text-lg font-black text-slate-900">
              {activeTabBalance > 0 ? `₹${activeTabBalance.toFixed(2)} Tab` : `${memberPlan.barDiscountPct}% Off Menu`}
            </h3>
            <Link to="/member/tab" className="text-[11px] text-emerald-600 hover:underline font-bold">
              {activeTabBalance > 0 ? 'View active tab ➔' : 'Order food & drinks ➔'}
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
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 space-y-4 shadow-sm text-slate-900 overflow-hidden">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[16/9] bg-slate-100">
              <img
                src="/friday_night_play_img.jpg"
                alt="Friday Night Social Play"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-purple-700 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                Weekly Event
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-black text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                Every Friday 7:00 PM
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Friday Night Social Play</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Share the court with fellow club members in a rotating doubles tournament. Free drinks & snacks included!
              </p>
            </div>

            <button
              onClick={() => {
                if (socialSessions[0]) handleJoinFridaySocial(socialSessions[0].id);
                else alert('Next Friday session opens for registration this Thursday!');
              }}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-purple-200 active:scale-95"
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
