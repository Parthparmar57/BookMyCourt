import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Play, 
  ChevronRight, 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  Video, 
  X 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const HomePage = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { loginAsRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white overflow-hidden font-sans text-slate-900">
      {/* HERO SECTION matching exact layout of new screenshot */}
      <section className="pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Controls */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Top Pill Tag matching screenshot */}
            <div className="inline-flex items-center gap-2 border border-slate-300 rounded-full px-4 py-1.5 bg-white shadow-2xs">
              <Sparkles className="w-4 h-4 text-slate-700" />
              <span className="text-[11px] font-extrabold tracking-widest text-slate-900 uppercase">
                THE PREMIER SPORTS & RACQUET OS
              </span>
            </div>

            {/* Stacked Uppercase Headline matching screenshot */}
            <div className="space-y-1">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 uppercase leading-[1.05]">
                YOUR GAME.
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 uppercase leading-[1.05]">
                YOUR CLUB.
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 uppercase leading-[1.05]">
                YOUR SPACE.
              </h1>
            </div>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
              Book world-class courts, explore dynamic membership plans, order pro gear, and experience seamless cafeteria tabs — all unified in one digital operating system.
            </p>

            {/* 3 Metric Cards matching screenshot */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white border border-slate-300 p-3.5 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block">Courts Available</span>
                <span className="text-base font-black text-slate-950 mt-1 block">6 Courts</span>
              </div>

              <div className="bg-white border border-slate-300 p-3.5 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block">Active Members</span>
                <span className="text-base font-black text-slate-950 mt-1 block">400+</span>
              </div>

              <div className="bg-white border border-slate-300 p-3.5 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block">Double Bookings</span>
                <span className="text-base font-black text-emerald-600 mt-1 block">Strictly 0</span>
              </div>
            </div>

            {/* CTAs matching screenshot */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/courts"
                className="bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-lg transition-all"
              >
                Book a Court
              </Link>
              <Link
                to="/membership"
                className="bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-300 font-extrabold text-sm px-7 py-3.5 rounded-2xl transition-all shadow-2xs"
              >
                Explore Memberships
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Card with Floating Overlay matching screenshot */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000"
                alt="Tennis Player on Court"
                className="w-full h-[520px] object-cover"
              />

              {/* Card Bottom Tag Overlay matching screenshot */}
              <div className="absolute bottom-6 left-6 right-6 bg-slate-950/80 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="bg-white text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  CENTER COURT 01
                </span>
                <h4 className="font-extrabold text-base text-white">State-of-the-Art Racquet Arena</h4>
                <p className="text-xs text-slate-300">Climate Control • Shock-Absorbent Turf</p>
              </div>
            </div>

            {/* Floating Badge Overlay at Bottom Left matching screenshot */}
            <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-3.5 max-w-xs animate-in fade-in slide-in-from-bottom-2">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-slate-950">Instant Desk Check-In</h5>
                <p className="text-[11px] text-slate-500 font-medium">Sub-second Member QR Scanning</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* VIDEO / PRODUCT LAUNCH TRAILER */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="relative rounded-3xl bg-slate-950 text-white p-8 sm:p-14 overflow-hidden shadow-2xl border border-slate-800 text-center space-y-6">
          <div className="inline-block bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-1.5 rounded-full border border-slate-700">
            Product Showcase
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
            PUBLIC <span className="text-emerald-400">BOOKING</span> IS HERE
          </h2>

          <div className="pt-2">
            <button
              onClick={() => setShowVideoModal(true)}
              className="inline-flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-8 py-4 rounded-2xl border border-slate-600 shadow-xl transition-all"
            >
              <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              <span>Watch BookMyCourt Trailer (0:53)</span>
            </button>
          </div>
        </div>
      </section>

      {/* VIDEO TRAILER MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                BookMyCourt Platform Demo (0:53)
              </h3>
              <button onClick={() => setShowVideoModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200"
                alt="Video Poster"
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
              <div className="relative z-10 text-center space-y-3 p-6 bg-slate-950/70 rounded-2xl backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
                <h4 className="font-extrabold text-xl">BookMyCourt Digital Club OS</h4>
                <p className="text-xs text-slate-300 max-w-md">
                  Courts, Member Portal, Gear Shop, Cafeteria POS & KDS fully integrated.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
