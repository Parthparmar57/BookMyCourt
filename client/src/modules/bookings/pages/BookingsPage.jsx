import React, { useState, useMemo } from 'react';
import {
  useAvailability,
  useCreateBooking,
  useCancelBooking,
  useBookings,
  useCourts,
  useUpdateCourt,
  useSocialSessions,
  useCreateSocialSession,
  useJoinSocial,
  useLeaveSocial,
} from '../../../hooks/useCourts';
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
  Check,
  User,
  Ticket,
  Users,
  UserPlus,
  Plus,
  CreditCard,
  Phone,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { addDays, subDays, format, parseISO, getDay } from 'date-fns';

const today = () => new Date().toISOString().split('T')[0];

const getNextFriday = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = (5 - day + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  return d.toISOString().split('T')[0];
};

export const BookingsPage = () => {
  const { role, user } = useAuth();
  const isOwner = role === 'OWNER';
  const isFrontDesk = role === 'FRONT_DESK';
  const isStaff = isOwner || isFrontDesk;
  const isMember = role === 'MEMBER';
  const currentMemberId = user?.memberId || user?.member?.id || null;

  // Filter states
  const [activeMainTab, setActiveMainTab] = useState('schedule'); // 'schedule' | 'social' | 'history' | 'rules'
  const [date, setDate] = useState(today());
  const [selectedSport, setSelectedSport] = useState('ALL'); // 'ALL' | 'Tennis' | 'Badminton' | 'Padel' | 'Cricket'
  const [slotIntervalFilter, setSlotIntervalFilter] = useState('ALL'); // 'ALL' (30-min slots) | 'HOURLY' (:00 only)
  const [timeSessionFilter, setTimeSessionFilter] = useState('SHIFT'); // 'SHIFT' (6-10 AM & 5-9 PM) | 'MORNING' | 'EVENING' | 'ALL'
  const [slotStatusFilter, setSlotStatusFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'BOOKED'

  // Drawer / Selection states
  const [selectedSlot, setSelectedSlot] = useState(null); // { courtId, courtName, sport, slotTime, walkInRate }
  const [inspectedBooking, setInspectedBooking] = useState(null); // Slot object for viewing details & cancellation
  const [bookingTab, setBookingTab] = useState('member'); // 'member' | 'walkin' | 'maintenance' | 'event'

  // Booking Form fields
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [maintenanceReason, setMaintenanceReason] = useState('Routine Surface Rolling & Net Inspection');
  const [sessionTitle, setSessionTitle] = useState('Club Invitational Tournament');

  // Social Play Management states
  const [isSchedulingSocial, setIsSchedulingSocial] = useState(false);
  const [socialCourtId, setSocialCourtId] = useState('');
  const [socialDate, setSocialDate] = useState(getNextFriday());
  const [socialStartTime, setSocialStartTime] = useState('18:00');
  const [socialMaxPlayers, setSocialMaxPlayers] = useState(8);
  const [socialFee, setSocialFee] = useState(100);

  // Social Play Join modal states
  const [selectedSocialSession, setSelectedSocialSession] = useState(null);
  const [socialJoinTab, setSocialJoinTab] = useState('member'); // 'member' | 'guest'
  const [socialMemberId, setSocialMemberId] = useState('');
  const [socialGuestName, setSocialGuestName] = useState('');
  const [socialGuestPhone, setSocialGuestPhone] = useState('');
  const [socialPaymentMode, setSocialPaymentMode] = useState('UPI');

  // Edit Court Rate state
  const [cancelReason, setCancelReason] = useState('Administrative court schedule adjustment');
  const [editingCourt, setEditingCourt] = useState(null);
  const [updatedRate, setUpdatedRate] = useState('');

  // History states
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useBookingRealtime();
  const availabilityQuery = useAvailability({ date });
  const bookingsQuery = useBookings();
  const courtsQuery = useCourts();
  const membersQuery = useMembers();
  const socialSessionsQuery = useSocialSessions();

  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();
  const updateCourt = useUpdateCourt();
  const createSocial = useCreateSocialSession();
  const joinSocial = useJoinSocial();
  const leaveSocial = useLeaveSocial();

  const allCourts = availabilityQuery.data || [];
  const rawBookings = bookingsQuery.data?.items || [];
  const rawCourtsList = courtsQuery.data || [];
  const rawMembers = membersQuery.data?.items || [];
  const rawSocialSessions = socialSessionsQuery.data || [];

  const displayedCourts =
    selectedSport === 'ALL'
      ? allCourts
      : allCourts.filter((c) => c.sport.toLowerCase() === selectedSport.toLowerCase());

  // 5-Column Court Pagination (Rule: Show only 5 courts per view)
  const [courtPage, setCourtPage] = useState(0);
  const COURTS_PER_PAGE = 5;

  const totalCourtPages = Math.ceil(displayedCourts.length / COURTS_PER_PAGE) || 1;

  const visibleCourts = useMemo(() => {
    const start = courtPage * COURTS_PER_PAGE;
    return displayedCourts.slice(start, start + COURTS_PER_PAGE);
  }, [displayedCourts, courtPage]);

  // Reset page when sport filter changes
  React.useEffect(() => {
    setCourtPage(0);
  }, [selectedSport]);

  // Defined Time Sessions (Morning 6-10 AM & Evening 5-9 PM)
  const MORNING_SLOTS = ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30'];
  const EVENING_SLOTS = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];
  const SHIFT_SLOTS = [...MORNING_SLOTS, ...EVENING_SLOTS];

  // Format HH:mm string into 12-hour AM/PM label (e.g. 09:00 AM)
  const formatTimeLabel = (timeStr) => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const padH = String(h).padStart(2, '0');
    const padM = String(m).padStart(2, '0');
    return `${padH}:${padM} ${ampm}`;
  };

  // Derive unique slot times across all displayed courts
  const allSlotTimes = useMemo(() => {
    const times = new Set();
    allCourts.forEach((c) => {
      (c.slots || []).forEach((s) => times.add(s.slotTime));
    });
    return Array.from(times).sort();
  }, [allCourts]);

  const columns = useMemo(() => {
    if (timeSessionFilter === 'MORNING') return MORNING_SLOTS;
    if (timeSessionFilter === 'EVENING') return EVENING_SLOTS;
    if (timeSessionFilter === 'SHIFT') return SHIFT_SLOTS;
    if (slotIntervalFilter === 'HOURLY') {
      return allSlotTimes.filter((t) => t.endsWith(':00'));
    }
    return allSlotTimes.length > 0 ? allSlotTimes : SHIFT_SLOTS;
  }, [allSlotTimes, slotIntervalFilter, timeSessionFilter]);

  // Multi-hour slot merging helper (continuous span without breaks)
  const getSlotSpanInfo = (court, cols, timeIndex) => {
    const time = cols[timeIndex];
    const currentSlot = court.slots?.find((s) => s.slotTime === time);
    if (!currentSlot || currentSlot.isAvailable) {
      return { skip: false, rowSpan: 1, slot: currentSlot, timeRangeText: '' };
    }

    const bookingKey =
      currentSlot.bookingId ||
      (currentSlot.memberName ? `mem-${currentSlot.memberName}` : `type-${currentSlot.bookingType}`);

    // Check if previous slot in columns belongs to the SAME booking key
    if (timeIndex > 0) {
      const prevTime = cols[timeIndex - 1];
      const prevSlot = court.slots?.find((s) => s.slotTime === prevTime);
      if (prevSlot && !prevSlot.isAvailable) {
        const prevKey =
          prevSlot.bookingId ||
          (prevSlot.memberName ? `mem-${prevSlot.memberName}` : `type-${prevSlot.bookingType}`);
        if (prevKey === bookingKey) {
          return { skip: true, rowSpan: 0, slot: currentSlot, timeRangeText: '' };
        }
      }
    }

    // Count consecutive future slots with same booking key
    let span = 1;
    for (let i = timeIndex + 1; i < cols.length; i++) {
      const nextTime = cols[i];
      const nextSlot = court.slots?.find((s) => s.slotTime === nextTime);
      if (nextSlot && !nextSlot.isAvailable) {
        const nextKey =
          nextSlot.bookingId ||
          (nextSlot.memberName ? `mem-${nextSlot.memberName}` : `type-${nextSlot.bookingType}`);
        if (nextKey === bookingKey) {
          span++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // Calculate time duration badge string (e.g., 09:00 AM - 11:00 AM)
    const startFormatted = formatTimeLabel(time);
    const lastTimeIndex = timeIndex + span - 1;
    const [lastH, lastM] = cols[lastTimeIndex].split(':').map(Number);
    const endTotalMins = lastH * 60 + lastM + 30;
    const endH = Math.floor(endTotalMins / 60);
    const endM = endTotalMins % 60;
    const endFormatted = formatTimeLabel(
      `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
    );

    return {
      skip: false,
      rowSpan: span,
      slot: currentSlot,
      timeRangeText: `${startFormatted} - ${endFormatted}`,
    };
  };

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

  // Filter members for autocomplete
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return rawMembers.slice(0, 15);
    const q = memberSearch.toLowerCase();
    return rawMembers.filter(
      (m) =>
        m.user?.name?.toLowerCase().includes(q) ||
        m.user?.phone?.includes(q) ||
        m.memberNo?.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [rawMembers, memberSearch]);

  const selectedMemberObj = useMemo(() => {
    if (isMember && currentMemberId) {
      return rawMembers.find((m) => m.id === currentMemberId);
    }
    return rawMembers.find((m) => m.id === selectedMemberId);
  }, [rawMembers, selectedMemberId, isMember, currentMemberId]);

  // Date Navigation
  const handlePrevDay = () => {
    try {
      const current = parseISO(date);
      const prevDate = format(subDays(current, 1), 'yyyy-MM-dd');
      if (prevDate >= today()) {
        setDate(prevDate);
      }
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

  const handleTomorrow = () => {
    try {
      setDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    } catch {
      setDate(today());
    }
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

    // Guard against past time slots on today's date (Rule R11)
    const isToday = date === today();
    if (isToday) {
      const [h, m] = slot.slotTime.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      if (slotDate < new Date()) {
        setErrorMsg('Cannot book a court slot in the past.');
        return;
      }
    }

    // Default booking tab: member if member or staff booking
    setBookingTab(isMember ? 'member' : 'member');
    setSelectedMemberId(isMember && currentMemberId ? currentMemberId : '');
    setWalkInName('');
    setWalkInPhone('');
    setPaymentMode('UPI');
    setSelectedSlot({
      courtId: court.courtId,
      courtName: court.courtName,
      sport: court.sport,
      slotTime: slot.slotTime,
      walkInRate: Number(court.walkInRate),
    });
  };

  // Handle Confirm Booking (Member, Walk-in, Maintenance, Event)
  const handleConfirmBooking = async (e) => {
    e?.preventDefault();
    if (!selectedSlot) return;
    setErrorMsg('');

    const payload = {
      courtId: selectedSlot.courtId,
      date,
      startTime: selectedSlot.slotTime,
      type: bookingTab === 'event' ? 'SOCIAL' : 'NORMAL',
      paymentMode,
    };

    if (bookingTab === 'member') {
      if (isMember) {
        // Logged-in member: backend automatically resolves member from user token
      } else {
        if (!selectedMemberId) {
          setErrorMsg('Please select a member to book for.');
          return;
        }
        payload.memberId = selectedMemberId;
      }
    } else if (bookingTab === 'walkin') {
      if (!walkInName.trim()) {
        setErrorMsg('Please enter guest full name.');
        return;
      }
      if (!walkInPhone.trim() || !/^[6-9]\d{9}$/.test(walkInPhone.trim())) {
        setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
        return;
      }
      payload.walkIn = { name: walkInName.trim(), phone: walkInPhone.trim() };
    } else if (bookingTab === 'maintenance') {
      if (!maintenanceReason.trim()) {
        setErrorMsg('Please specify maintenance reason.');
        return;
      }
      payload.walkIn = { name: `[MAINTENANCE] ${maintenanceReason.trim()}`, phone: '9999999999' };
    } else if (bookingTab === 'event') {
      if (!sessionTitle.trim()) {
        setErrorMsg('Please enter tournament / clinic session title.');
        return;
      }
      payload.walkIn = { name: `[EVENT] ${sessionTitle.trim()}`, phone: '9876543210' };
    }

    try {
      const res = await createBooking.mutateAsync(payload);
      setSuccessMsg(
        bookingTab === 'maintenance'
          ? `Court ${selectedSlot.courtName} locked for maintenance at ${selectedSlot.slotTime}.`
          : bookingTab === 'event'
            ? `Club event scheduled on ${selectedSlot.courtName} at ${selectedSlot.slotTime}.`
            : `Court reserved successfully on ${selectedSlot.courtName} at ${selectedSlot.slotTime}.`
      );
      setSelectedSlot(null);
      setWalkInName('');
      setWalkInPhone('');
      setSelectedMemberId('');
      availabilityQuery.refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Could not complete booking.';
      setErrorMsg(msg);
      // Auto-refetch on collision to show updated availability
      if (err?.response?.status === 409) {
        availabilityQuery.refetch();
      }
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
      availabilityQuery.refetch();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to cancel booking.');
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
      availabilityQuery.refetch();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Could not update court pricing.');
    }
  };

  // Friday Social Play: Schedule Session
  const handleCreateSocialSession = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    if (!socialCourtId) {
      setErrorMsg('Please select a court for the social play session.');
      return;
    }
    const d = new Date(socialDate);
    if (getDay(d) !== 5) {
      setErrorMsg('Social play sessions can only be scheduled on Fridays (Rule R9).');
      return;
    }
    try {
      await createSocial.mutateAsync({
        courtId: socialCourtId,
        date: socialDate,
        startTime: socialStartTime,
        maxPlayers: Number(socialMaxPlayers) || 8,
        feePerPlayer: Number(socialFee) || 100,
      });
      setSuccessMsg('Friday Social Play session published successfully.');
      setIsSchedulingSocial(false);
      socialSessionsQuery.refetch();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to schedule social play.');
    }
  };

  // Friday Social Play: Join Session
  const handleJoinSocial = async (e) => {
    e?.preventDefault();
    if (!selectedSocialSession) return;
    setErrorMsg('');

    const payload = {
      paymentMode: socialPaymentMode,
    };

    if (isMember) {
      if (currentMemberId) payload.memberId = currentMemberId;
    } else {
      if (socialJoinTab === 'member') {
        if (!socialMemberId) {
          setErrorMsg('Please select a member to enroll.');
          return;
        }
        payload.memberId = socialMemberId;
      } else {
        if (!socialGuestName.trim() || !socialGuestPhone.trim()) {
          setErrorMsg('Please enter guest name and phone number.');
          return;
        }
        if (!/^[6-9]\d{9}$/.test(socialGuestPhone.trim())) {
          setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
          return;
        }
        payload.guestName = socialGuestName.trim();
        payload.guestPhone = socialGuestPhone.trim();
      }
    }

    try {
      await joinSocial.mutateAsync({
        id: selectedSocialSession.id,
        ...payload,
      });
      setSuccessMsg('Player enrolled into Friday Social Play session successfully!');
      setSelectedSocialSession(null);
      setSocialMemberId('');
      setSocialGuestName('');
      setSocialGuestPhone('');
      socialSessionsQuery.refetch();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to join social play.');
    }
  };

  // Friday Social Play: Leave Session
  const handleLeaveSocial = async (sessionId, participantId) => {
    setErrorMsg('');
    try {
      await leaveSocial.mutateAsync({ id: sessionId, participantId });
      setSuccessMsg('Player removed from Friday Social Play session.');
      socialSessionsQuery.refetch();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to remove player.');
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
      {/* ─── TOP HEADER & NAVIGATION TABS ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Court Management & Schedules</h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Facility bookings, live availability, Friday social play, and member/walk-in court reservations.
          </p>
        </div>

        {/* View Switching Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveMainTab('schedule')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeMainTab === 'schedule'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>Master Schedule</span>
          </button>
          <button
            onClick={() => setActiveMainTab('social')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeMainTab === 'social'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Friday Social Play</span>
            {rawSocialSessions.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-semibold">
                {rawSocialSessions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveMainTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeMainTab === 'history'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
            <span>Revenue & Logs</span>
          </button>
          {isStaff && (
            <button
              onClick={() => setActiveMainTab('rules')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeMainTab === 'rules'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Settings className="w-3.5 h-3.5 text-purple-600" />
              <span>Pricing & Rules</span>
            </button>
          )}
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
            <CheckCircle2 className="w-4 h-4 text-[#2e7d32] shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4 cursor-pointer" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4 cursor-pointer" /></button>
        </div>
      )}

      {/* ─── TAB 1: MASTER SCHEDULE MATRIX VIEW ─── */}
      {activeMainTab === 'schedule' && (
        <div className="space-y-3">
          {/* Filter Bar & Date Picker */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5">
            {/* Sport Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar w-full lg:w-auto">
              {sportTabs.map((tab) => {
                const isSelected = selectedSport === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedSport(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Date Switcher, Interval Switcher & Calendar */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
              {/* Slot Duration & Shift Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium border border-gray-200">
                <button
                  type="button"
                  onClick={() => setTimeSessionFilter('SHIFT')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    timeSessionFilter === 'SHIFT'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Show Morning (6-10 AM) & Evening (5-9 PM) shifts"
                >
                  6-10 AM & 5-9 PM
                </button>
                <button
                  type="button"
                  onClick={() => setTimeSessionFilter('MORNING')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    timeSessionFilter === 'MORNING'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Show Morning slots only"
                >
                  Morning (6-10 AM)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeSessionFilter('EVENING')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    timeSessionFilter === 'EVENING'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Show Evening slots only"
                >
                  Evening (5-9 PM)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeSessionFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    timeSessionFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Show all available hours"
                >
                  Full Day
                </button>
              </div>

              {/* Day Nav */}
              <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-2xs text-xs font-medium text-slate-600 overflow-hidden">
                <button
                  onClick={handleToday}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    date === today() ? 'bg-[#2e7d32] text-white shadow-2xs font-extrabold' : 'hover:bg-slate-200/80'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={handleTomorrow}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    date === format(addDays(new Date(), 1), 'yyyy-MM-dd') ? 'bg-[#2e7d32] text-white shadow-2xs font-extrabold' : 'hover:bg-slate-200/80'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  onClick={handlePrevDay}
                  title="Previous Day"
                  disabled={date <= today()}
                  className="px-2 py-1.5 hover:bg-slate-50 border-r border-gray-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextDay}
                  title="Next Day"
                  className="px-1.5 py-1.5 hover:bg-slate-200/80 rounded-lg text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Native Calendar Picker Input */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:border-emerald-500 transition-colors">
                <Calendar className="w-4 h-4 text-[#2e7d32]" />
                <input
                  type="date"
                  value={date}
                  min={today()}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer text-slate-800 font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Matrix Grid Container - 5 Court Columns per view */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col">
            {/* Top 5-Court Pagination Bar */}
            {displayedCourts.length > 5 && (
              <div className="flex flex-wrap items-center justify-between bg-slate-50 px-4 py-2 border-b border-gray-200 text-xs font-bold text-slate-700 gap-2">
                <span className="text-slate-700 font-extrabold">
                  Showing Courts {courtPage * COURTS_PER_PAGE + 1} – {Math.min((courtPage + 1) * COURTS_PER_PAGE, displayedCourts.length)} of {displayedCourts.length} Courts
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={courtPage === 0}
                    onClick={() => setCourtPage((p) => Math.max(0, p - 1))}
                    className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-xs cursor-pointer shadow-2xs"
                  >
                    ‹ Prev 5 Courts
                  </button>
                  <span className="text-slate-500 font-bold">Page {courtPage + 1} / {totalCourtPages}</span>
                  <button
                    type="button"
                    disabled={courtPage >= totalCourtPages - 1}
                    onClick={() => setCourtPage((p) => Math.min(totalCourtPages - 1, p + 1))}
                    className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-xs cursor-pointer shadow-2xs"
                  >
                    Next 5 Courts ›
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto max-h-[calc(100vh-250px)] min-h-[480px] overflow-y-auto">
              <QueryState
                query={availabilityQuery}
                emptyWhen={(d) => !d?.length}
                empty={<div className="p-8 text-center text-slate-400 text-xs font-medium">No courts found for this date.</div>}
              >
                {() => (
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead className="sticky top-0 z-20 bg-white text-slate-800 text-xs font-bold border-b border-gray-200 shadow-2xs">
                      <tr>
                        <th className="p-3.5 w-24 text-center font-bold text-slate-400 text-xs uppercase tracking-wider sticky left-0 bg-white z-30 border-r border-gray-200">
                          Time
                        </th>
                        {visibleCourts.map((court, idx) => (
                          <th key={court.courtId} className="p-3.5 text-center border-l border-gray-200 bg-white">
                            <span className="font-extrabold text-sm text-sky-600 block truncate">
                              Court #{courtPage * COURTS_PER_PAGE + idx + 1}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 block truncate mt-0.5">
                              {court.courtName}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {columns.map((time, timeIdx) => {
                        // Check if transitioning from Morning (09:30) to Evening (17:00) in SHIFT mode
                        const isEveningStart = timeSessionFilter === 'SHIFT' && time === '17:00';

                        return (
                          <React.Fragment key={time}>
                            {isEveningStart && (
                              <tr className="bg-slate-100/80 text-slate-600 font-extrabold text-[11px] uppercase tracking-wider">
                                <td colSpan={visibleCourts.length + 1} className="py-2.5 px-4 text-center border-y border-slate-200 shadow-2xs">
                                  Evening Session (05:00 PM – 09:00 PM)
                                </td>
                              </tr>
                            )}
                            <tr className="h-16 hover:bg-slate-50/40 transition-colors">
                              {/* Left Time Label */}
                              <td className="p-2 font-bold text-slate-600 text-xs text-center whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200 shadow-2xs">
                                {formatTimeLabel(time)}
                              </td>

                              {/* Visible Courts Cells */}
                              {visibleCourts.map((court) => {
                                const spanInfo = getSlotSpanInfo(court, columns, timeIdx);
                                if (spanInfo.skip) return null; // Skip rendering cell because it's merged into an earlier rowSpan!

                                const slot = spanInfo.slot;
                                const rowSpan = spanInfo.rowSpan;

                                if (!slot) {
                                  return (
                                    <td key={court.courtId} rowSpan={rowSpan} className="p-1 border-l border-gray-100 bg-white" />
                                  );
                                }

                                // 1. BOOKED / RESERVED SLOT CARD (Lime / Medium Green continuous highlight)
                                if (!slot.isAvailable) {
                                  const rawName = slot.memberName || 'Reserved Player';
                                  const isMaintenance = rawName.includes('[MAINTENANCE]');
                                  const isSocial = slot.bookingType === 'SOCIAL';
                                  const cleanName = rawName.replace('[MAINTENANCE] ', '').replace('[EVENT] ', '');

                                  return (
                                    <td
                                      key={court.courtId}
                                      rowSpan={rowSpan}
                                      className="p-1.5 border-l border-gray-100 align-top h-full"
                                    >
                                      <div
                                        onClick={() => handleSlotClick(court, slot)}
                                        className={`w-full h-full rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all shadow-sm hover:shadow-md border relative group overflow-hidden ${
                                          isMaintenance
                                            ? 'bg-amber-500 border-amber-600 text-white'
                                            : isSocial
                                            ? 'bg-slate-800 border-slate-900 text-white'
                                            : 'bg-[#70B42C] hover:bg-[#62a024] border-[#5a9321] text-white'
                                        }`}
                                      >
                                        {/* Info Circle Icon in top right corner */}
                                        <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-white/25 group-hover:bg-white/40 flex items-center justify-center text-[10px] font-bold text-white transition-colors">
                                          i
                                        </div>

                                        <div className="space-y-1">
                                          <span className="font-extrabold text-sm text-white block leading-tight truncate pr-4">
                                            {cleanName}
                                          </span>
                                          <span className="text-[11px] font-medium text-white/90 block">
                                            {spanInfo.timeRangeText || `${formatTimeLabel(slot.slotTime)} - ${formatTimeLabel(slot.slotTime)}`}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                  );
                                }

                                // 2. PAST SLOT (DISABLED)
                                const isToday = date === today();
                                const isPast = isToday && (() => {
                                  const [h, m] = slot.slotTime.split(':').map(Number);
                                  const slotDate = new Date();
                                  slotDate.setHours(h, m, 0, 0);
                                  return slotDate < new Date();
                                })();

                                if (isPast) {
                                  return (
                                    <td key={court.courtId} rowSpan={rowSpan} className="p-1.5 border-l border-gray-100 text-center align-middle bg-slate-50/50">
                                      <div className="w-full h-10 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-400 font-medium text-xs flex items-center justify-center select-none">
                                        Passed
                                      </div>
                                    </td>
                                  );
                                }

                                // 3. AVAILABLE SLOT (White cell with clean pill "Reserve" button)
                                const isSelectedByForm = selectedSlot?.courtId === court.courtId && selectedSlot?.slotTime === slot.slotTime;

                                return (
                                  <td
                                    key={court.courtId}
                                    rowSpan={rowSpan}
                                    className="p-1.5 border-l border-gray-100 text-center align-middle bg-white hover:bg-slate-50/60 transition-colors"
                                  >
                                    <div className="w-full h-full min-h-[48px] flex items-center justify-center">
                                      <button
                                        type="button"
                                        onClick={() => handleSlotClick(court, slot)}
                                        className={`px-4 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer border shadow-2xs ${
                                          isSelectedByForm
                                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 font-extrabold'
                                            : 'bg-white text-slate-700 border-gray-200 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40'
                                        }`}
                                      >
                                        {isSelectedByForm ? 'Selected' : 'Reserve'}
                                      </button>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </QueryState>
            </div>

            {/* Bottom Overview Strip */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-400 inline-block" />
                  <span className="font-semibold text-slate-700 text-xs">White: Available Slot (Reserve)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#70B42C] inline-block" />
                  <span className="font-semibold text-slate-900 text-xs">Green: Booked (Player Name & Duration)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="font-medium text-slate-700 text-xs">Amber: Maintenance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
                  <span className="font-medium text-slate-700 text-xs">Dark: Social Event</span>
                </div>
              </div>
              <div className="text-slate-500 font-medium text-xs">
                Showing 5 courts per view · Morning (6–10 AM) & Evening (5–9 PM)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: FRIDAY SOCIAL PLAY SESSIONS (I-4) ─── */}
      {activeMainTab === 'social' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-sm text-slate-800">Friday Social Play Sessions</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Weekly community round-robins held every Friday. Capacity strictly limited per court to ensure maximum court time.
              </p>
            </div>

            {isStaff && (
              <button
                type="button"
                onClick={() => {
                  setSocialDate(getNextFriday());
                  setSocialCourtId(allCourts[0]?.courtId || '');
                  setIsSchedulingSocial(true);
                }}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Friday Social</span>
              </button>
            )}
          </div>

          {/* Social Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rawSocialSessions.map((session) => {
              const participants = session.socialParticipants || [];
              const maxPlayers = session.maxPlayers || 8;
              const isFull = participants.length >= maxPlayers;
              const fillPct = Math.round((participants.length / maxPlayers) * 100);

              // Check if current logged in member has joined
              const userParticipant = isMember
                ? participants.find((p) => p.memberId === currentMemberId || p.member?.user?.id === user?.id)
                : null;

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {session.court?.sport || 'Club Sport'}
                        </span>
                        <h4 className="font-semibold text-sm text-slate-800 mt-1">
                          {session.court?.name || 'Club Court'}
                        </h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${isFull
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                          }`}
                      >
                        {isFull ? 'FULL' : `${maxPlayers - participants.length} SPOTS LEFT`}
                      </span>
                    </div>

                    {/* Date & Time */}
                    <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {format(new Date(session.startTime), 'EEEE, dd MMM yyyy')}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {format(new Date(session.startTime), 'HH:mm')} – {format(new Date(session.endTime), 'HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Entry Fee:</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(session.price)} / player</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Enrolled Capacity</span>
                        <span className="font-semibold text-slate-800">
                          {participants.length} / {maxPlayers} Players
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${isFull ? 'bg-rose-500' : fillPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          style={{ width: `${Math.min(fillPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Enrolled Players List */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-medium text-slate-500 block">Participants:</span>
                      {participants.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No players enrolled yet. Be the first to join!</p>
                      ) : (
                        <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                          {participants.map((p) => {
                            const pName = p.member?.user?.name || p.guestName || 'Player';
                            const pPhone = p.member?.user?.phone || p.guestPhone || '';
                            const isMe = isMember && (p.memberId === currentMemberId || p.member?.user?.id === user?.id);

                            return (
                              <div
                                key={p.id}
                                className="flex items-center justify-between text-[11px] bg-slate-50 px-2 py-1 rounded-lg"
                              >
                                <div className="truncate">
                                  <span className="font-medium text-slate-800 truncate">
                                    {pName} {isMe && '(You)'}
                                  </span>
                                  {pPhone && <span className="text-slate-400 text-[10px] ml-1">({pPhone})</span>}
                                </div>

                                {(isStaff || isMe) && (
                                  <button
                                    onClick={() => handleLeaveSocial(session.id, p.id)}
                                    className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                                    title="Remove participant"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100">
                    {userParticipant ? (
                      <button
                        onClick={() => handleLeaveSocial(session.id, userParticipant.id)}
                        disabled={leaveSocial.isPending}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Leave Session</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedSocialSession(session);
                          setSocialJoinTab(isMember ? 'member' : 'member');
                          setSocialMemberId(isMember && currentMemberId ? currentMemberId : '');
                          setSocialGuestName('');
                          setSocialGuestPhone('');
                        }}
                        disabled={isFull}
                        className={`w-full py-2 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${isFull
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs'
                          }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{isFull ? 'Session Full' : isMember ? 'Join Session' : 'Enroll Player / Guest'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {rawSocialSessions.length === 0 && (
              <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
                <Trophy className="w-10 h-10 text-amber-500 mx-auto opacity-70" />
                <h4 className="font-semibold text-slate-800 text-sm">No Upcoming Friday Social Sessions</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Friday community round-robins have not been scheduled yet. Staff can schedule a new session above.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: BOOKING HISTORY & REVENUE LOGS ─── */}
      {activeMainTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm text-slate-800">Booking History & Ledger</h3>
              <p className="text-xs text-slate-400">Search all historical matches, player contact logs, and revenue generation.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
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
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${isCancelled
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                            }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {!isCancelled && new Date(b.startTime) > new Date() ? (
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
                            Cancel
                          </button>
                        ) : !isCancelled ? (
                          <span className="text-[10px] text-slate-400 font-medium italic">Completed</span>
                        ) : null}
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

      {/* ─── TAB 4: FACILITY RATES & PRICING RULES ─── */}
      {activeMainTab === 'rules' && isStaff && (
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
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${c.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
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

      {/* ─── MODAL 1: BOOKING & COURT ACTION DRAWER (I-3) ─── */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 space-y-5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <div>
                  <h3 className="font-semibold text-base text-slate-800">
                    {isMember ? 'Reserve Court Slot' : 'Court Reservation'}
                  </h3>
                  <p className="text-xs font-bold text-[#2e7d32] mt-0.5">{selectedSlot.courtName} · {date} ({selectedSlot.slotTime})</p>
                </div>
                <button onClick={() => setSelectedSlot(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Selection Tabs for Staff */}
              {isStaff ? (
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setBookingTab('member')}
                    className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${bookingTab === 'member'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Member</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingTab('walkin')}
                    className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${bookingTab === 'walkin'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Walk-in</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingTab('maintenance')}
                    className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${bookingTab === 'maintenance'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Block</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingTab('event')}
                    className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${bookingTab === 'event'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-sky-600" />
                    <span>Event</span>
                  </button>
                </div>
              ) : null}

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
                  <span className="font-semibold text-slate-800">
                    {bookingTab === 'member' && selectedMemberObj?.plan?.courtRate != null
                      ? `${formatCurrency(selectedMemberObj.plan.courtRate)}/hr (Plan Rate)`
                      : `${formatCurrency(selectedSlot.walkInRate)}/hr (Walk-in)`}
                  </span>
                </div>
              </div>

              {/* 1. Member Booking Tab Form */}
              {bookingTab === 'member' && (
                <div className="space-y-3.5 text-xs font-medium">
                  {isMember ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 space-y-1">
                      <span className="text-[11px] text-emerald-700 font-semibold block uppercase">Booking As</span>
                      <p className="font-semibold text-sm">{user?.name}</p>
                      <p className="text-[11px] text-emerald-800">{user?.email || user?.phone}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-slate-700 block">Select Club Member</label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          placeholder="Search member by name, phone, or ID..."
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-xs font-normal"
                        />
                      </div>

                      <select
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-medium focus:border-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Choose Member ({filteredMembers.length} available) --</option>
                        {filteredMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.user?.name} · {m.memberNo} ({m.plan?.name || 'Standard'}) - {m.user?.phone}
                          </option>
                        ))}
                      </select>

                      {selectedMemberObj && (
                        <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl text-[11px] space-y-1 text-emerald-950 font-normal">
                          <div className="flex justify-between">
                            <span className="font-medium">Plan Tier:</span>
                            <span className="font-semibold text-emerald-800">{selectedMemberObj.plan?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Member Court Rate:</span>
                            <span className="font-semibold text-emerald-900">{formatCurrency(selectedMemberObj.plan?.courtRate || 0)}/hr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Daily Limit:</span>
                            <span>{selectedMemberObj.plan?.maxBookingsDay || 2} bookings/day</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Mode */}
                  <div>
                    <label className="text-slate-700 block mb-1">Payment Method</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-medium focus:border-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="CASH">Cash Counter</option>
                      <option value="CARD">Credit / Debit Card</option>
                      <option value="ONLINE">Online Portal</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 2. Walk-in Guest Form */}
              {bookingTab === 'walkin' && (
                <div className="space-y-3.5 text-xs font-medium">
                  <div>
                    <label className="text-slate-700 block mb-1">Guest Full Name *</label>
                    <input
                      type="text"
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-blue-500 focus:outline-none font-normal text-xs"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1">Mobile Phone Number (10 digits) *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-blue-500 focus:outline-none font-mono text-xs"
                      placeholder="e.g. 9876543210"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-medium focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="CASH">Cash Counter</option>
                      <option value="CARD">Credit / Debit Card</option>
                      <option value="ONLINE">Online Portal</option>
                    </select>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed font-normal">
                    Walk-in players will be billed standard hourly tariff of{' '}
                    <strong>{formatCurrency(selectedSlot.walkInRate)}</strong> for this session.
                  </div>
                </div>
              )}

              {/* 3. Maintenance Block Form */}
              {bookingTab === 'maintenance' && (
                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="text-slate-800 block mb-1.5 font-extrabold text-sm">Maintenance Reason</label>
                    <input
                      value={maintenanceReason}
                      onChange={(e) => setMaintenanceReason(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 focus:border-amber-500 focus:outline-none font-semibold text-sm shadow-2xs"
                      placeholder="e.g. Clay Rolling, Net Replacement, Floodlight Repair"
                    />
                  </div>
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed font-medium">
                    This court slot will be blocked on the master matrix and marked unavailable for member self-booking.
                  </div>
                </div>
              )}

              {/* 4. Event / Clinic Form */}
              {bookingTab === 'event' && (
                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="text-slate-800 block mb-1.5 font-extrabold text-sm">Event / Tournament Title</label>
                    <input
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 focus:border-sky-500 focus:outline-none font-semibold text-sm shadow-2xs"
                      placeholder="e.g. Weekend Club Open Championship"
                    />
                  </div>
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-[11px] leading-relaxed font-normal">
                    This slot will be designated as a club event / tournament session on the schedule.
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={createBooking.isPending}
              className={`w-full text-white font-medium text-xs py-3 rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${bookingTab === 'maintenance'
                  ? 'bg-amber-700 hover:bg-amber-800'
                  : bookingTab === 'event'
                    ? 'bg-sky-700 hover:bg-sky-800'
                    : bookingTab === 'walkin'
                      ? 'bg-blue-700 hover:bg-blue-800'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
            >
              {createBooking.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {bookingTab === 'maintenance'
                  ? 'Lock Court for Maintenance'
                  : bookingTab === 'event'
                    ? 'Schedule Club Event Slot'
                    : bookingTab === 'walkin'
                      ? `Confirm Walk-in Booking (${formatCurrency(selectedSlot.walkInRate)})`
                      : `Confirm Member Reservation`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: SESSION INSPECTION & CANCELLATION ─── */}
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
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Charged:</span>
                      <span className="font-extrabold text-[#2e7d32]">
                        {Number(inspectedBooking.bookingPrice || 0) === 0
                          ? '₹0.00 (Included in Plan)'
                          : formatCurrency(inspectedBooking.bookingPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Payment Status:</span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        COMPLETED (Direct Approval)
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Booking Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${inspectedBooking.bookingStatus === 'CANCELLED'
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
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              {inspectedBooking.bookingId && (
                <button
                  onClick={() => {
                    const bkObj = rawBookings.find((b) => b.id === inspectedBooking.bookingId) || inspectedBooking;
                    setActiveTicketBooking(bkObj);
                    setInspectedBooking(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>View Pass & QR Code</span>
                </button>
              )}

              {inspectedBooking.bookingStatus !== 'CANCELLED' && inspectedBooking.bookingId && (
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelBooking.isPending}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {cancelBooking.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: SCHEDULE FRIDAY SOCIAL PLAY (STAFF) ─── */}
      {isSchedulingSocial && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-base text-slate-800">Schedule Friday Social Play</h3>
              </div>
              <button onClick={() => setIsSchedulingSocial(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSocialSession} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="text-slate-700 block mb-1">Select Facility Court *</label>
                <select
                  value={socialCourtId}
                  onChange={(e) => setSocialCourtId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-medium focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose Court --</option>
                  {allCourts.map((c) => (
                    <option key={c.courtId} value={c.courtId}>
                      {c.courtName} ({c.sport})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Session Date (Must be a Friday) *</label>
                <input
                  type="date"
                  value={socialDate}
                  min={today()}
                  onChange={(e) => setSocialDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1">Start Time (:00 / :30) *</label>
                  <select
                    value={socialStartTime}
                    onChange={(e) => setSocialStartTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-mono focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    {['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1">Player Capacity *</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={socialMaxPlayers}
                    onChange={(e) => setSocialMaxPlayers(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                    placeholder="8"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Fee Per Player (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={socialFee}
                  onChange={(e) => setSocialFee(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-amber-500 focus:outline-none font-semibold"
                  placeholder="100"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed font-normal">
                Scheduled session lasts 60 minutes. Players will be able to join via community ledger until capacity is reached.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSchedulingSocial(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSocial.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {createSocial.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: JOIN FRIDAY SOCIAL PLAY ─── */}
      {selectedSocialSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-base text-slate-800">Join Friday Social Play</h3>
              </div>
              <button onClick={() => setSelectedSocialSession(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1.5 border border-slate-200/80">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Facility:</span>
                <span>{selectedSocialSession.court?.name} ({selectedSocialSession.court?.sport})</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-mono">
                  {format(new Date(selectedSocialSession.startTime), 'EEE, dd MMM yyyy · HH:mm')}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 pt-1 border-t border-slate-200">
                <span>Entry Tariff:</span>
                <span>{formatCurrency(selectedSocialSession.price)}</span>
              </div>
            </div>

            <form onSubmit={handleJoinSocial} className="space-y-3.5 text-xs font-medium">
              {isStaff ? (
                <div>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-3">
                    <button
                      type="button"
                      onClick={() => setSocialJoinTab('member')}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${socialJoinTab === 'member'
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      Club Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setSocialJoinTab('guest')}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${socialJoinTab === 'guest'
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      Walk-in Guest
                    </button>
                  </div>

                  {socialJoinTab === 'member' ? (
                    <div>
                      <label className="text-slate-700 block mb-1">Select Member</label>
                      <select
                        value={socialMemberId}
                        onChange={(e) => setSocialMemberId(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-medium focus:border-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Choose Member --</option>
                        {rawMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.user?.name} · {m.memberNo} ({m.user?.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-slate-700 block mb-1">Guest Full Name *</label>
                        <input
                          type="text"
                          value={socialGuestName}
                          onChange={(e) => setSocialGuestName(e.target.value)}
                          placeholder="e.g. Ankit Verma"
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 block mb-1">Mobile Phone (10 digits) *</label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={socialGuestPhone}
                          onChange={(e) => setSocialGuestPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 9876543210"
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                  Joining as member <strong>{user?.name}</strong>.
                </div>
              )}

              <div>
                <label className="text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={socialPaymentMode}
                  onChange={(e) => setSocialPaymentMode(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-medium focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CASH">Cash Counter</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="ONLINE">Online Portal</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSocialSession(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joinSocial.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {joinSocial.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Enrollment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
