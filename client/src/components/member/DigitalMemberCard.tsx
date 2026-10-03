import React from 'react';
import { Member } from '../../types';
import { Trophy, QrCode, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface DigitalMemberCardProps {
  member: Member;
}

export const DigitalMemberCard: React.FC<DigitalMemberCardProps> = ({ member }) => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[1.586/1] rounded-xl p-6 bg-gradient-to-br from-[#1C1F1D] via-[#282C29] to-[#141615] text-white shadow-2xl border border-white/10 overflow-hidden flex flex-col justify-between select-none">
      {/* Decorative Foil Accent Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/my_fevicon_logo.png"
            alt="BookMyCourt"
            className="w-7 h-7 object-contain bg-white/10 p-0.5 rounded-md border border-white/20"
          />
          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase">BOOK MY COURT</div>
            <div className="text-[9px] text-accent font-semibold tracking-widest uppercase">Digital Member Pass</div>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-accent/20 text-accent border border-accent/30 tracking-wider">
          {member.planName} MEMBER
        </span>
      </div>

      {/* Member Details & Photo */}
      <div className="relative z-10 flex items-center gap-4 my-2">
        <img
          src={member.photoUrl}
          alt={member.name}
          className="w-14 h-14 rounded-full object-cover border-2 border-accent/60 shadow-md shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold truncate leading-tight tracking-tight">{member.name}</h3>
          <p className="text-xs font-mono text-white/70 mt-0.5 tracking-wider">{member.memberId}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-white/50">Valid Thru: {member.endDate}</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-accent font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom QR Code Strip */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10 backdrop-blur-xs">
          {/* Simulated QR Code SVG pattern */}
          <div className="w-10 h-10 bg-white p-1 rounded shrink-0 flex items-center justify-center">
            <QrCode className="w-8 h-8 text-foreground" />
          </div>
          <div className="text-[10px]">
            <div className="text-white/60">Scan for Desk Check-In</div>
            <div className="font-mono text-accent font-bold mt-0.5">{member.qrCode}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] text-white/40 uppercase tracking-widest">Digital OS</div>
          <div className="text-xs font-extrabold text-white">#001-CHAMP</div>
        </div>
      </div>
    </div>
  );
};
