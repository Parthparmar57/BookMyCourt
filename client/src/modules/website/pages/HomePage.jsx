import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Play,
  Pause,
  ChevronRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  Video,
  X,
  Banknote,
  Globe,
  GraduationCap,
  BarChart3,
  Smartphone,
  Receipt,
  ShoppingBag,
  Lock,
  Layers,
  TrendingUp
} from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.log('Video play error:', err);
        });
      }
    }
  };

  return (
    <div className="bg-white overflow-hidden font-sans text-slate-900 selection:bg-[#4A812F] selection:text-white">
      {/* 1. ANNOUNCEMENT NETWORK PILL BANNER */}
      <div className="pt-6 pb-2 px-4 sm:px-8 max-w-4xl mx-auto">
        <Link
          to="/trial"
          className="p-3 px-6 rounded-2xl border border-gray-200 bg-white hover:border-[#4A812F] shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-4 text-xs font-medium text-gray-700 truncate">
            {/* Phone App Mock Thumbnail */}
            <div className="hidden sm:block w-12 h-10 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=150"
                alt="BookMyCourt App"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#e63946] text-white font-extrabold text-[10px] uppercase tracking-wider shrink-0 shadow-2xs">
                  LIVE
                </span>
                <span className="font-extrabold text-[#4A812F] text-sm tracking-tight">BookMyCourt Network™</span>
              </div>
              <p className="text-sm font-black text-gray-900 mt-0.5 tracking-tight">
                Reach game-ready players nearby — <span className="font-normal text-gray-500">Now in beta for eligible Florida clubs</span>
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 group-hover:bg-[#4A812F]/10 group-hover:border-[#4A812F]/30 transition-colors">
            <ChevronRight className="w-5 h-5 text-[#4A812F] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 2. HERO MAIN SECTION */}
      <section className="py-8 lg:py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column (60%) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-black tracking-widest uppercase text-gray-700 font-mono">
              BOOKINGS • PAYMENTS • MEMBERSHIPS • EVENTS • MOBILE APP
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-black text-[#121212] tracking-tight leading-[1.06]">
              The future of club growth starts here
            </h1>

            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed max-w-xl">
              Join the industry's top club management platform reshaping the way you connect with players and grow your business.
            </p>

            {/* CTAs matching reference */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/trial"
                className="px-7 py-3.5 bg-[#1a1c1e] text-white text-sm font-extrabold rounded-lg hover:bg-black transition-all flex items-center gap-2 shadow-md active:scale-95"
              >
                <span>Contact Sales</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </Link>

              <Link
                to="/login"
                className="px-7 py-3.5 bg-white text-[#121212] border border-gray-300 text-sm font-extrabold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95 shadow-2xs"
              >
                <span>Player Login</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </Link>
            </div>
          </div>

          {/* Right Column: CourtReserve Reference Graphic Composite */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-2xl hover:shadow-3xl transition-shadow">
              <img
                src="/9923a9a7-ccb8-44f4-b085-21df8fc8691d.png"
                alt="BookMyCourt Management Portal & Player App"
                className="w-full h-auto max-h-[480px] object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. SUB-HERO STATS SECTION */}
      <section className="py-14 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-10">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#121212] tracking-tight">
            Built for racquet & paddle sports facilities
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-1">
              <div className="text-5xl sm:text-6xl font-black text-[#121212] tracking-tight">
                2,300+
              </div>
              <div className="text-lg font-bold text-gray-500">
                Clubs
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-5xl sm:text-6xl font-black text-[#121212] tracking-tight">
                6M+
              </div>
              <div className="text-lg font-bold text-gray-500">
                Players
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-5xl sm:text-6xl font-black text-[#121212] tracking-tight">
                105M+
              </div>
              <div className="text-lg font-bold text-gray-500">
                Bookings
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DARK CHARCOAL CARD CONTAINER ON WHITE PAGE BACKGROUND */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 bg-white">
        <div className="bg-[#1c1d1f] text-white rounded-[2.5rem] p-8 sm:p-12 lg:p-16 max-w-6xl mx-auto shadow-2xl space-y-12 border border-gray-800/80">
          {/* Title Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              See what you can do <br className="hidden sm:block" /> with BookMyCourt
            </h2>
          </div>

          {/* 12 Features Grid (2 Columns matching screenshot 1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Court Reservations', icon: Banknote, link: '/courts' },
              { name: 'Public Booking', icon: Globe, link: '/availability' },
              { name: 'Lessons', icon: GraduationCap, link: '/trial' },
              { name: 'Events & Programming', icon: Calendar, link: '/trial' },
              { name: 'Memberships', icon: CreditCard, link: '/membership' },
              { name: 'Leagues & Ladders', icon: BarChart3, link: '/trial' },
              { name: 'Branded Mobile App', icon: Smartphone, link: '/trial' },
              { name: 'Invoicing & Batch Billing', icon: Receipt, link: '/admin' },
              { name: 'Pro Shop & POS', icon: ShoppingBag, link: '/shop' },
              { name: 'Access Control', icon: Lock, link: '/admin' },
              { name: 'Integrations', icon: Layers, link: '/trial' },
              { name: 'Reporting', icon: TrendingUp, link: '/admin' },
            ].map((feat, idx) => {
              const IconComponent = feat.icon;
              return (
                <Link
                  key={idx}
                  to={feat.link}
                  className="bg-[#2d3036] hover:bg-[#383b42] border border-gray-700/60 p-4 px-6 rounded-2xl flex items-center gap-4 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 group-hover:bg-[#4A812F] transition-colors shadow-2xs">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                    {feat.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Subnav link: Explore all Features > */}
          <div className="text-center pt-2">
            <Link
              to="/trial"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-white hover:text-emerald-400 underline underline-offset-4 transition-colors"
            >
              <span>Explore all Features</span>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>

          {/* INTERACTIVE VIDEO FRAME CARD WITH CENTER PLAY/PAUSE BUTTON */}
          <div className="pt-4">
            <div className="relative rounded-3xl border-2 border-white/90 bg-[#0c0d0f] overflow-hidden shadow-2xl aspect-video max-w-4xl mx-auto group">
              <video
                ref={videoRef}
                src="/gemini_generated_video_8dec1fae.mp4"
                loop
                playsInline
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-cover rounded-2xl cursor-pointer"
                onClick={togglePlay}
              >
                Your browser does not support HTML5 video player.
              </video>

              {/* CENTER PLAY / PAUSE BUTTON OVERLAY */}
              <div
                onClick={togglePlay}
                className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer z-20 pointer-events-auto ${isPlaying
                  ? 'bg-black/0 hover:bg-black/40 opacity-0 hover:opacity-100'
                  : 'bg-black/50 hover:bg-black/60 opacity-100'
                  }`}
              >
                <button
                  type="button"
                  className="bg-[#1c1d1f]/95 backdrop-blur-md border border-white/40 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-[#4A812F] text-white flex items-center justify-center font-bold text-xs shadow-md">
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-white text-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    )}
                  </div>
                  <span>{isPlaying ? 'Pause Video' : 'Play BookMyCourt Trailer (0:53)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 TRUSTED BY THOUSANDS OF CLUBS SECTION */}
      <section className="py-16 px-4 sm:px-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#121212] tracking-tight leading-tight">
              Trusted by thousands of beloved and respected clubs
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              The{' '}
              <span className="text-[#4A812F] font-extrabold underline underline-offset-4 decoration-2 decoration-[#4A812F]">
                court booking software
              </span>{' '}
              behind 2,300+ tennis, pickleball, and padel facilities — powering bookings, payments, and memberships in one platform.
            </p>
          </div>

          {/* 3 Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl h-[420px] flex flex-col justify-between p-7 text-white border border-gray-200 group hover:shadow-2xl transition-all cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800"
                alt="Dill Dinkers Pickleball"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40" />

              {/* Top Logo Badge */}
              <div className="relative z-10">
                <div className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-black tracking-tight inline-block shadow-md uppercase font-mono border border-gray-200">
                  DILL DINKERS PICKLEBALL
                </div>
              </div>

              {/* Quote & Source */}
              <div className="relative z-10 space-y-4">
                <p className="text-base sm:text-lg font-bold leading-snug text-white">
                  "BookMyCourt provides the flexibility to scale while ensuring all locations run smoothly."
                </p>
                <div className="flex items-center gap-1 text-xs font-bold text-white hover:text-emerald-400">
                  <span className="underline underline-offset-4">Source</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl h-[420px] flex flex-col justify-between p-7 text-white border border-gray-200 group hover:shadow-2xl transition-all cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=800"
                alt="Princeton Racquet Club"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40" />

              {/* Top Logo Badge */}
              <div className="relative z-10">
                <div className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-black tracking-tight inline-block shadow-md font-serif italic border border-gray-200">
                  Princeton Racquet Club
                </div>
              </div>

              {/* Quote & Source */}
              <div className="relative z-10 space-y-4">
                <p className="text-base sm:text-lg font-bold leading-snug text-white">
                  "BookMyCourt is a total game changer. Its had a huge positive impact on our club."
                </p>
                <div className="flex items-center gap-1 text-xs font-bold text-white hover:text-emerald-400">
                  <span className="underline underline-offset-4">Source</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl h-[420px] flex flex-col justify-between p-7 text-white border border-gray-200 group hover:shadow-2xl transition-all cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1626248801379-51a0748a5f96?auto=format&fit=crop&q=80&w=800"
                alt="Club Pickleball"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40" />

              {/* Top Logo Badge */}
              <div className="relative z-10">
                <div className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-black tracking-tight inline-block shadow-md border border-gray-200">
                  <span className="text-red-600 font-extrabold">pickleball</span> <span className="text-gray-700 text-[10px]">FREEDOM TO PLAY</span>
                </div>
              </div>

              {/* Quote & Source */}
              <div className="relative z-10 space-y-4">
                <p className="text-base sm:text-lg font-bold leading-snug text-white">
                  "We looked at others, but it wasn't even close. BookMyCourt was an easy decision."
                </p>
                <div className="flex items-center gap-1 text-xs font-bold text-white hover:text-emerald-400">
                  <span className="underline underline-offset-4">Source</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Partner Logo Ribbon */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all text-xs font-extrabold text-gray-600 uppercase tracking-widest">
            <span>DILL DINKERS</span>
            <span>PICKLEBALL JW MARRIOTT</span>
            <span>MONTGOMERY TENNISPLEX</span>
            <span>LUCKY SHOTS</span>
            <span>PICKLEBALL CHARLOTTE</span>
            <span>CLUB PICKLEBALL</span>
            <span>GORIN TENNIS</span>
          </div>
        </div>
      </section>

      {/* 5. OUR GUARANTEES SECTION */}
      <section className="py-20 px-4 sm:px-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black tracking-widest text-gray-500 uppercase font-mono block">
              OUR GUARANTEES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#121212] tracking-tight leading-tight">
              The BookMyCourt Promise
            </h2>
          </div>

          {/* 2-Column Grid */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 h-[520px]">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"
                  alt="BookMyCourt Team Onboarding & Demo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white p-4 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/20">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">PROMISE IN ACTION</span>
                  <p className="text-sm font-bold text-white mt-1">
                    Dedicated onboarding specialists helping you launch smoothly with 0 downtime.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 5 Promise Cards Stack */}
            <div className="lg:col-span-7 space-y-4">
              {[
                {
                  title: 'See BookMyCourt before you buy',
                  desc: 'Learn how BookMyCourt helps clubs run smoother operations and grow their community.'
                },
                {
                  title: 'Transparent subscription pricing',
                  desc: 'Clear, straightforward pricing with no surprises.'
                },
                {
                  title: 'Guided implementation',
                  desc: "We'll guide your onboarding, customize your account, and help you launch with success."
                },
                {
                  title: 'Expert US-based support',
                  desc: 'Live chat support available daily: Mon–Fri 9 AM–8 PM EST, Sat–Sun 9 AM–5 PM EST.'
                },
                {
                  title: 'Continuous innovation',
                  desc: 'New features, integrations, and improvements shaped by real club feedback.'
                }
              ].map((promise, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-[#4A812F] text-[#4A812F] flex items-center justify-center shrink-0 shadow-2xs font-black bg-[#EBF7E7]">
                    <CheckCircle2 className="w-5 h-5 text-[#4A812F]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base sm:text-lg font-black text-[#121212] tracking-tight">
                      {promise.title}
                    </h4>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                      {promise.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. PLAYER EXPERIENCE SECTION */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 bg-white">
        <div className="bg-[#f0f7ef] text-gray-900 rounded-[2.5rem] p-8 sm:p-14 max-w-6xl mx-auto shadow-xs border border-[#d6ebd3] space-y-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black tracking-widest text-[#2d6215] uppercase font-mono block">
              PLAYER EXPERIENCE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#121212] tracking-tight leading-tight">
              Players feel the BookMyCourt difference
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-medium">
              BookMyCourt has the features your community craves
            </p>
          </div>

          {/* 3 Mobile Screens Columns: Book, Pay, Replay */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto items-end pt-4">
            {/* Column 1: Book */}
            <div className="text-center space-y-4 group">
              <h3 className="text-xl font-extrabold text-[#121212] tracking-tight">
                Book
              </h3>
              <div className="relative mx-auto max-w-[250px] transition-transform duration-300 group-hover:-translate-y-2">
                <img
                  src="/Homepage-Mobile-Images_CourtReserve_Book.png"
                  alt="Book Court Mobile Screen"
                  className="w-full h-auto drop-shadow-xl"
                />
              </div>
            </div>

            {/* Column 2: Pay */}
            <div className="text-center space-y-4 group">
              <h3 className="text-xl font-extrabold text-[#121212] tracking-tight">
                Pay
              </h3>
              <div className="relative mx-auto max-w-[250px] transition-transform duration-300 group-hover:-translate-y-2">
                <img
                  src="/Homepage-Mobile-Images_CourtReserve_Pay.png"
                  alt="Payment Mobile Screen"
                  className="w-full h-auto drop-shadow-xl"
                />
              </div>
            </div>

            {/* Column 3: Replay */}
            <div className="text-center space-y-4 group">
              <h3 className="text-xl font-extrabold text-[#121212] tracking-tight">
                Replay
              </h3>
              <div className="relative mx-auto max-w-[250px] transition-transform duration-300 group-hover:-translate-y-2">
                <img
                  src="/Homepage-Mobile-Images_CourtReserve_Replay.png"
                  alt="Save My Play Replay Screen"
                  className="w-full h-auto drop-shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Store App Install Buttons */}
          <div className="text-center space-y-6 pt-6 border-t border-[#d6ebd3]/60">
            <p className="text-base font-extrabold text-gray-800 tracking-tight">
              Available on iOS and Android
            </p>

            <div className="flex flex-wrap items-center justify-center gap-5">
              <a
                href="#playstore"
                className="inline-block transition-transform hover:scale-105"
              >
                <img
                  src="/Frame-43-2-300x116.webp"
                  alt="Get it on Google Play"
                  className="h-12 sm:h-14 w-auto object-contain rounded-xl shadow-xs"
                />
              </a>

              <a
                href="#appstore"
                className="inline-block transition-transform hover:scale-105"
              >
                <img
                  src="/Frame-44-1-300x116.webp"
                  alt="Download on the App Store"
                  className="h-12 sm:h-14 w-auto object-contain rounded-xl shadow-xs"
                />
              </a>
            </div>

            {/* Bottom Search & Book link */}
            <div className="pt-2">
              <Link
                to="/courts"
                className="inline-flex items-center gap-1 text-sm font-extrabold text-[#121212] hover:text-[#4A812F] underline underline-offset-4 transition-colors"
              >
                <span>Find your club, search, and book</span>
                <ChevronRight className="w-4 h-4 text-[#4A812F]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRE-FOOTER CTA BANNER SECTION */}
      <section className="py-16 sm:py-20 px-6 lg:px-16 bg-[#18191c] text-white border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Text */}
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.08]">
              Grow your club on <br className="hidden sm:inline" />BookMyCourt
            </h2>
            <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
              From bookings and payments to memberships and player experience, everything your racquet or paddle sports club needs to grow on one platform.
            </p>
          </div>

          {/* Right Sharp Big Cards */}
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto shrink-0 justify-center lg:justify-end">
            {/* Green Big Card: Contact Sales */}
            <a
              href="https://courtreserve.com/schedule-a-call/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#9be65c] hover:bg-[#8ee048] text-[#121212] rounded-2xl p-6 sm:p-7 w-full sm:w-60 md:w-64 h-40 sm:h-44 flex flex-col justify-end transition-all transform hover:-translate-y-1 shadow-2xl cursor-pointer group border border-[#8ce04a]"
            >
              <div className="flex items-center justify-between text-xl sm:text-2xl font-black tracking-tight text-[#121212]">
                <span>Contact Sales</span>
                <ChevronRight className="w-6 h-6 stroke-[3] text-[#121212] group-hover:translate-x-1.5 transition-transform" />
              </div>
            </a>

            {/* White Big Card: See Pricing */}
            <a
              href="https://courtreserve.com/pricing/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-100 text-[#121212] rounded-2xl p-6 sm:p-7 w-full sm:w-60 md:w-64 h-40 sm:h-44 flex flex-col justify-end transition-all transform hover:-translate-y-1 shadow-2xl cursor-pointer group border border-gray-200"
            >
              <div className="flex items-center justify-between text-xl sm:text-2xl font-black tracking-tight text-[#121212]">
                <span>See Pricing</span>
                <ChevronRight className="w-6 h-6 stroke-[3] text-[#121212] group-hover:translate-x-1.5 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};





