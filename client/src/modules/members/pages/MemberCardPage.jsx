import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useMembers } from '../../../hooks/useMembership';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  CreditCard
} from 'lucide-react';

export const MemberCardPage = () => {
  const { user } = useAuth();
  const membersQuery = useMembers();
  const [copied, setCopied] = useState(false);

  const rawMembers = membersQuery?.data?.items || [];

  // Resolve real member profile for logged in user
  const foundMember = rawMembers.find(m =>
    m.userId === user?.id ||
    m.user?.id === user?.id ||
    (m.user?.email && user?.email && m.user.email.toLowerCase() === user.email.toLowerCase()) ||
    (m.email && user?.email && m.email.toLowerCase() === user.email.toLowerCase())
  );

  const realMember = user?.member || foundMember;

  // Real Member Details
  const userName = user?.name || foundMember?.user?.name || 'Vinu Kumar';
  const userEmail = user?.email || foundMember?.user?.email || 'vinu@gmail.com';
  const userPhone = user?.phone || foundMember?.user?.phone || '8401517177';
  const memberNo = realMember?.memberNo || user?.memberNo || `MEM-${userPhone}`;

  const rawPlanName = realMember?.plan?.name || user?.plan || user?.membershipTier || 'Gold';
  const planName = rawPlanName.replace(/pass|annual|standard|youth/gi, '').trim() || 'Gold';

  const endDateStr = realMember?.endDate
    ? new Date(realMember.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '03 Oct 2027';

  // Scannable QR Payload
  const qrPayload = JSON.stringify({
    memberNo,
    name: userName,
    email: userEmail,
    phone: userPhone,
    plan: planName,
    validThru: endDateStr,
    status: 'ACTIVE',
    issuer: 'BookMyCourt'
  });

  const handleCopyId = () => {
    navigator.clipboard.writeText(memberNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crisp Light Card background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 720);

    const drawRoundedRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // Outer Card Frame with Emerald Green Border
    drawRoundedRect(20, 20, 1160, 680, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#15803d'; // Green border
    ctx.stroke();

    // Top Green Header Stripe
    ctx.fillStyle = '#15803d';
    ctx.fillRect(20, 20, 1160, 14);

    // Load BookMyCourt logo image
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/bookmycourt_logo.png';

    logo.onload = () => {
      // Draw Logo Container & Image
      drawRoundedRect(60, 60, 150, 54, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();
      ctx.drawImage(logo, 65, 65, 140, 44);

      // Header Brand Text
      ctx.fillStyle = '#0f172a'; // Black text
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('BOOKMYCOURT', 230, 88);
      ctx.fillStyle = '#15803d'; // Green subtext
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('OFFICIAL DIGITAL MEMBER PASS', 230, 112);

      // Member Badge (Emerald Green pill)
      drawRoundedRect(890, 60, 230, 46, 23);
      ctx.fillStyle = '#f0fdf4';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#16a34a';
      ctx.stroke();
      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 17px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${planName.toUpperCase()} MEMBER`, 1005, 89);
      ctx.textAlign = 'left';

      // Divider Line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 145);
      ctx.lineTo(1140, 145);
      ctx.stroke();

      // Member Name
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('MEMBER NAME', 60, 190);
      ctx.fillStyle = '#0f172a'; // Black
      ctx.font = '900 36px sans-serif';
      ctx.fillText(userName, 60, 235);

      // Member ID (Green monospace)
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('MEMBER ID', 60, 290);
      ctx.fillStyle = '#15803d'; // Emerald green
      ctx.font = 'bold 26px monospace';
      ctx.fillText(memberNo, 60, 325);

      // Valid Thru
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('VALID THRU', 420, 290);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(endDateStr, 420, 325);

      // Contact Info
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('CONTACT DETAILS', 60, 385);
      ctx.fillStyle = '#1e293b';
      ctx.font = '600 20px sans-serif';
      ctx.fillText(`${userPhone}  •  ${userEmail}`, 60, 420);

      // Light Green Perks Container
      drawRoundedRect(60, 460, 680, 115, 16);
      ctx.fillStyle = '#f0fdf4';
      ctx.fill();
      ctx.strokeStyle = '#bbf7d0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText('ACTIVE MEMBER BENEFITS', 85, 495);
      ctx.fillStyle = '#0f172a';
      ctx.font = '600 17px sans-serif';
      ctx.fillText('✓ Free Court Access  •  ✓ 20% Shop Discount  •  ✓ 15% Bar Discount', 85, 535);

      // Draw QR SVG onto Canvas
      const svgElement = document.getElementById('member-qr-code-svg');
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        const qrImg = new Image();
        qrImg.onload = () => {
          // White QR container with crisp black border
          drawRoundedRect(790, 175, 330, 390, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#0f172a';
          ctx.stroke();

          ctx.drawImage(qrImg, 825, 205, 260, 260);

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 15px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SCAN FOR VERIFICATION', 955, 505);
          ctx.font = 'bold 13px sans-serif';
          ctx.fillStyle = '#15803d';
          ctx.fillText('BookMyCourt Front Desk & POS', 955, 530);
          ctx.textAlign = 'left';

          // Footer Line
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(60, 615);
          ctx.lineTo(1140, 615);
          ctx.stroke();

          // Status & Watermark
          ctx.fillStyle = '#15803d';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('● STATUS: ACTIVE MEMBER', 60, 650);

          ctx.fillStyle = '#64748b';
          ctx.font = '600 16px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('BookMyCourt Sports Infrastructure • Official Card', 1140, 650);

          // Trigger PNG download link
          const link = document.createElement('a');
          link.download = `BookMyCourt_Member_Card_${memberNo}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          URL.revokeObjectURL(blobURL);
        };
        qrImg.src = blobURL;
      }
    };
  };

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto space-y-8 font-sans">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #member-id-card-view, #member-id-card-view * { visibility: visible !important; }
          #member-id-card-view {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100% !important;
            max-width: 650px !important;
            border: 2px solid #15803d !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Official Membership Credential</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Digital Member ID Card
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Present this official rectangular membership pass at the front desk, gear shop, or cafeteria for instant member verification and benefits.
        </p>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleDownloadPNG}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Download ID Card (PNG)</span>
        </button>

        <button
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-black text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>

        <button
          onClick={handleCopyId}
          className="bg-white hover:bg-slate-50 text-slate-800 font-semibold px-4 py-2.5 rounded-xl border border-slate-300 flex items-center gap-2 transition-all cursor-pointer text-sm shadow-2xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4 text-slate-500" />}
          <span>{copied ? 'Copied Member ID!' : 'Copy ID'}</span>
        </button>
      </div>

      {/* Official Light Theme Rectangular Member ID Card (White, Black, Green) */}
      <div
        id="member-id-card-view"
        className="relative max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 bg-white text-slate-900 shadow-xl border-2 border-emerald-700 overflow-hidden space-y-6 transition-all"
      >
        {/* Top Green Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-emerald-700" />

        {/* Card Header: Brand Logo & Tier */}
        <div className="flex items-center justify-between relative z-10 border-b border-slate-200 pb-5 pt-1">
          <div className="flex items-center gap-3">
            {/* Real BookMyCourt Logo */}
            <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <img
                src="/bookmycourt_logo.png"
                alt="BookMyCourt Logo"
                className="h-10 sm:h-12 w-auto object-contain rounded-md"
              />
            </div>
            <div>
              <h3 className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                BOOKMYCOURT
              </h3>
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest mt-1">
                Official Digital Member Pass
              </p>
            </div>
          </div>

          <div className="px-4 py-1.5 rounded-full font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs bg-emerald-50 text-emerald-800 border-2 border-emerald-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{planName} Member</span>
          </div>
        </div>

        {/* Main Content: User Details + QR Code */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center relative z-10">
          {/* Member Details */}
          <div className="sm:col-span-7 space-y-4">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                Member Name
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {userName}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Member ID
                </span>
                <span className="font-mono font-bold text-sm tracking-wide text-emerald-800">
                  {memberNo}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Valid Thru
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {endDateStr}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-bold text-slate-900">{userPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-medium text-slate-700 truncate">{userEmail}</span>
              </div>
            </div>

            {/* Perks Box */}
            <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-900 font-bold bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>Free Court Access • 20% Shop • 15% Bar</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm text-slate-900 border-2 border-slate-900">
            <QRCodeSVG
              id="member-qr-code-svg"
              value={qrPayload}
              size={145}
              level="H"
              includeMargin={false}
              className="rounded-md"
            />
            <span className="text-[10px] font-mono font-black text-slate-900 mt-2.5 tracking-widest uppercase text-center">
              SCAN FOR VERIFICATION
            </span>
            <span className="text-[9px] font-bold text-emerald-700">
              BookMyCourt Front Desk & POS
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-bold text-slate-900">Status: <strong className="text-emerald-700 uppercase font-extrabold">● ACTIVE MEMBER</strong></span>
          </div>
          <span className="font-bold text-slate-500 text-[11px]">Authorized Member Pass • BookMyCourt</span>
        </div>
      </div>
    </div>
  );
};

export default MemberCardPage;
