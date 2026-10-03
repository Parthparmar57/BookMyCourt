import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Sparkles, CheckCircle2, QrCode, Sliders } from 'lucide-react';

const TIER_THEMES = {
  Gold: {
    badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    cardGradient: 'from-amber-950 via-slate-900 to-yellow-950',
    glowColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    idColor: 'text-amber-400',
    perkText: 'Free Court Access • 20% Shop • 15% Bar',
    tierTitle: 'Gold VIP Annual Pass',
  },
  Silver: {
    badgeBg: 'bg-slate-300/20 text-slate-200 border-slate-300/40',
    cardGradient: 'from-slate-900 via-slate-800 to-zinc-950',
    glowColor: 'bg-slate-400/20',
    borderColor: 'border-slate-400/30',
    idColor: 'text-slate-300',
    perkText: '₹200 Court Rate • 10% Shop • 5% Bar',
    tierTitle: 'Silver Standard 6-Month Pass',
  },
  Junior: {
    badgeBg: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
    cardGradient: 'from-cyan-950 via-slate-900 to-blue-950',
    glowColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    idColor: 'text-cyan-400',
    perkText: '₹100 Court Rate • 15% Shop • 10% Bar (Age < 18)',
    tierTitle: 'Junior Youth 6-Month Pass',
  },
};

export const MemberCardPage = () => {
  const { user } = useAuth();
  const [demoTierOverride, setDemoTierOverride] = useState(null);

  const realPlanName = user?.member?.plan?.name || 'Gold';
  const activePlanName = demoTierOverride || realPlanName;
  const theme = TIER_THEMES[activePlanName] || TIER_THEMES.Gold;

  const memberNo = user?.member?.memberNo || 'MEM-001001';
  const endDateStr = user?.member?.endDate
    ? new Date(user.member.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '31 Dec 2026';

  // Scannable QR Payload matches backend G3 contract
  const qrPayload = JSON.stringify({
    memberNo,
    email: user?.email || 'member@championsclub.com',
    plan: activePlanName,
  });

  return (
    <div className="py-6 px-4 max-w-2xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Digital Member Pass
        </h1>
        <p className="text-xs text-slate-500">
          Present this pass at the front desk, gear shop, or cafeteria for instant discount verification.
        </p>
      </div>

      {/* Demo Tier Switcher Toolbar (For Hackathon Review) */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <span>Demo Pass Tier Switcher:</span>
        </div>
        <div className="flex items-center gap-2">
          {['Gold', 'Silver', 'Junior'].map((tier) => (
            <button
              key={tier}
              onClick={() => setDemoTierOverride(tier)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activePlanName === tier
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tier === 'Gold' ? '🥇 Gold' : tier === 'Silver' ? '🥈 Silver' : '🧒 Junior'}
            </button>
          ))}
        </div>
      </div>

      {/* Digital Pass Holographic Card */}
      <div className={`relative rounded-3xl p-8 bg-gradient-to-br ${theme.cardGradient} text-white shadow-2xl border ${theme.borderColor} overflow-hidden space-y-6 transition-all duration-300`}>
        {/* Glow Accent */}
        <div className={`absolute -right-16 -top-16 w-64 h-64 ${theme.glowColor} rounded-full blur-3xl pointer-events-none`}></div>

        {/* Card Top */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight leading-none text-white">THE CHAMPIONS CLUB</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{theme.tierTitle}</p>
            </div>
          </div>

          <span className={`text-[11px] font-black uppercase tracking-wider ${theme.badgeBg} border px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs`}>
            <Sparkles className="w-3.5 h-3.5" />
            {activePlanName}
          </span>
        </div>

        {/* Card Center: Member Info & QR */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-slate-900/85 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80 relative z-10">
          <div className="sm:col-span-7 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Member Name</span>
              <h2 className="text-xl font-black text-white tracking-tight">{user?.name || 'Rohan Gupta'}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Member ID</span>
                <span className={`font-mono font-bold ${theme.idColor} text-xs`}>{memberNo}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Valid Thru</span>
                <span className="font-semibold text-slate-200">{endDateStr}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{theme.perkText}</span>
            </div>
          </div>

          {/* QR Box */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-inner text-slate-900">
            <QRCodeSVG
              value={qrPayload}
              size={130}
              level="H"
              includeMargin={false}
              className="rounded-lg"
            />
            <span className="text-[9px] font-mono font-bold text-slate-500 mt-2 tracking-widest uppercase">
              Scan for Profile
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-4 relative z-10">
          <span>Status: <strong className="text-emerald-400">ACTIVE</strong></span>
          <span>Authorized Sports Pass</span>
        </div>
      </div>
    </div>
  );
};
export default MemberCardPage;
