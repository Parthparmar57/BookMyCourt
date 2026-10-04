import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useMembers, usePlans } from '../../../hooks/useMembership';
import { membersApi } from '../../../services/membership.service';
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
  Sparkles,
  Clock,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Crown,
  Zap
} from 'lucide-react';

export const MemberCardPage = () => {
  const { user } = useAuth();
  const membersQuery = useMembers();
  const { data: plans = [] } = usePlans();
  const [copied, setCopied] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);

  // Synchronize upgrade requests & approvals across windows/components
  useEffect(() => {
    const handleSync = () => setSyncVersion((v) => v + 1);
    window.addEventListener('bmc_upgrade_change', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('bmc_upgrade_change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const rawMembers = membersQuery?.data?.members || membersQuery?.data?.items || (Array.isArray(membersQuery?.data) ? membersQuery.data : []);

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

  const dbPlanName = realMember?.plan?.name || user?.member?.plan?.name || user?.plan || user?.membershipTier;

  // Check localStorage only as a fallback if DB plan is absent
  const approvedUpgrades = JSON.parse(localStorage.getItem('bmc_approved_upgrades') || '{}');
  const approvedTier = 
    approvedUpgrades[userEmail] || 
    (userEmail && approvedUpgrades[userEmail.toLowerCase()]) || 
    approvedUpgrades[userPhone] || 
    approvedUpgrades[memberNo] || 
    approvedUpgrades[user?.id] || 
    approvedUpgrades[userName];

  const rawPlanName = dbPlanName || approvedTier || 'Silver';
  const planName = rawPlanName.replace(/pass|annual|standard|youth/gi, '').trim() || 'Silver';
  const isGold = /gold/i.test(planName);
  const isJunior = /junior|youth|child/i.test(rawPlanName) || /junior/i.test(planName);
  const isSilver = !isGold && !isJunior;

  // Dynamic Card Theme Config based on Membership Tier
  const cardTheme = isGold
    ? {
        tierName: 'GOLD',
        border: 'border-2 border-amber-500 shadow-lg shadow-amber-500/10',
        topBar: 'bg-amber-500',
        brandSubtext: 'text-amber-600 font-extrabold',
        badgeBg: 'bg-amber-100 text-amber-950 border-2 border-amber-500',
        BadgeIcon: Crown,
        subtext: 'text-amber-600',
        memberIdText: 'text-amber-600 font-black',
        phoneIcon: 'text-amber-600',
        mailIcon: 'text-amber-600',
        perksBg: 'bg-amber-50/90 border border-amber-300 text-amber-950',
        perksHeader: 'text-amber-700',
        perksText: '✓ 100% Free Court Access  •  ✓ 20% Shop Discount  •  ✓ 15% Bar Discount',
        qrBorder: 'border-2 border-amber-500',
        qrSubtext: 'text-amber-700 font-bold',
        statusDot: 'bg-amber-500',
        statusText: 'text-amber-700',
        // Canvas Export Colors
        canvasPrimary: '#d97706',
        canvasBorder: '#f59e0b',
        canvasBgAccent: '#fffbeb',
        canvasBorderAccent: '#f59e0b',
      }
    : isJunior
    ? {
        tierName: 'JUNIOR',
        border: 'border-2 border-sky-500 shadow-lg shadow-sky-500/10',
        topBar: 'bg-sky-500',
        brandSubtext: 'text-sky-600 font-extrabold',
        badgeBg: 'bg-sky-100 text-sky-950 border-2 border-sky-500',
        BadgeIcon: Zap,
        subtext: 'text-sky-600',
        memberIdText: 'text-sky-600 font-black',
        phoneIcon: 'text-sky-600',
        mailIcon: 'text-sky-600',
        perksBg: 'bg-sky-50/90 border border-sky-300 text-sky-950',
        perksHeader: 'text-sky-700',
        perksText: '✓ Junior Coaching Pass  •  ✓ 15% Shop Discount  •  ✓ Free Refreshments',
        qrBorder: 'border-2 border-sky-500',
        qrSubtext: 'text-sky-700 font-bold',
        statusDot: 'bg-sky-500',
        statusText: 'text-sky-700',
        // Canvas Export Colors
        canvasPrimary: '#0284c7',
        canvasBorder: '#0284c7',
        canvasBgAccent: '#f0f9ff',
        canvasBorderAccent: '#0284c7',
      }
    : {
        tierName: 'SILVER',
        border: 'border-2 border-slate-600 shadow-lg shadow-slate-500/10',
        topBar: 'bg-slate-600',
        brandSubtext: 'text-slate-600 font-extrabold',
        badgeBg: 'bg-slate-100 text-slate-900 border-2 border-slate-600',
        BadgeIcon: ShieldCheck,
        subtext: 'text-slate-600',
        memberIdText: 'text-slate-700 font-black',
        phoneIcon: 'text-slate-600',
        mailIcon: 'text-slate-600',
        perksBg: 'bg-slate-50 border border-slate-300 text-slate-900',
        perksHeader: 'text-slate-700',
        perksText: '✓ Standard Rate  •  ✓ 10% Shop Discount  •  ✓ 5% Bar Discount',
        qrBorder: 'border-2 border-slate-900',
        qrSubtext: 'text-slate-700 font-bold',
        statusDot: 'bg-slate-600',
        statusText: 'text-slate-700',
        // Canvas Export Colors
        canvasPrimary: '#475569',
        canvasBorder: '#64748b',
        canvasBgAccent: '#f8fafc',
        canvasBorderAccent: '#64748b',
      };

  // Check for pending upgrade request (ignored if already approved as Gold)
  const pendingRequests = JSON.parse(localStorage.getItem('bmc_membership_upgrade_requests') || '[]');
  const rawPendingRequest = pendingRequests.find(r =>
    (userEmail && r.email && r.email.toLowerCase() === userEmail.toLowerCase()) ||
    (userPhone && r.phone === userPhone) ||
    (memberNo && r.memberNo === memberNo) ||
    (userName && r.name === userName)
  );
  const myPendingRequest = isGold ? null : rawPendingRequest;

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

  const handleRequestGoldUpgrade = () => {
    const existing = JSON.parse(localStorage.getItem('bmc_membership_upgrade_requests') || '[]');
    const filtered = existing.filter(r => r.email !== userEmail && r.memberNo !== memberNo);

    const newReq = {
      id: 'UPG-' + Date.now(),
      memberNo,
      name: userName,
      email: userEmail,
      phone: userPhone,
      currentPlan: planName,
      requestedPlan: 'Gold VIP Annual Pass',
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    localStorage.setItem('bmc_membership_upgrade_requests', JSON.stringify([newReq, ...filtered]));
    window.dispatchEvent(new Event('bmc_upgrade_change'));
  };

  const handleCancelRequest = () => {
    const existing = JSON.parse(localStorage.getItem('bmc_membership_upgrade_requests') || '[]');
    const filtered = existing.filter(r => r.email !== userEmail && r.memberNo !== memberNo);
    localStorage.setItem('bmc_membership_upgrade_requests', JSON.stringify(filtered));
    window.dispatchEvent(new Event('bmc_upgrade_change'));
  };

  const handleSetDemoTier = async (targetTier) => {
    const targetPlan = plans.find(p => p.name.toLowerCase().includes(targetTier.toLowerCase()));
    const mId = realMember?.id || foundMember?.id;

    if (mId && targetPlan?.id) {
      try {
        await membersApi.renew(mId, { planId: targetPlan.id, paymentMode: 'UPI' });
      } catch (err) {
        console.warn('Central DB renew note:', err?.message || err);
      }
    }

    const approved = JSON.parse(localStorage.getItem('bmc_approved_upgrades') || '{}');
    approved[userEmail] = targetTier;
    if (userEmail) approved[userEmail.toLowerCase()] = targetTier;
    approved[userPhone] = targetTier;
    approved[memberNo] = targetTier;
    approved[userName] = targetTier;
    approved['GLOBAL_ACTIVE_MEMBER'] = targetTier;
    localStorage.setItem('bmc_approved_upgrades', JSON.stringify(approved));

    // Clear pending request if toggled manually
    const existing = JSON.parse(localStorage.getItem('bmc_membership_upgrade_requests') || '[]');
    const filtered = existing.filter(r => r.email !== userEmail && r.memberNo !== memberNo);
    localStorage.setItem('bmc_membership_upgrade_requests', JSON.stringify(filtered));

    membersQuery.refetch();
    window.dispatchEvent(new Event('bmc_upgrade_change'));
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

    // Outer Card Frame with Dynamic Tier Border
    drawRoundedRect(20, 20, 1160, 680, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = cardTheme.canvasBorder;
    ctx.stroke();

    // Top Header Stripe
    ctx.fillStyle = cardTheme.canvasBorder;
    ctx.fillRect(20, 20, 1160, 14);

    // Load BookMyCourt logo image
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/bookmycourt_logo.png';

    logo.onload = () => {
      // Draw Logo Image directly without background container or border
      ctx.drawImage(logo, 60, 60, 150, 50);

      // Header Brand Text
      ctx.fillStyle = '#0f172a'; // Black text
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('BOOKMYCOURT', 230, 88);
      ctx.fillStyle = cardTheme.canvasPrimary;
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('OFFICIAL DIGITAL MEMBER PASS', 230, 112);

      // Member Badge (Dynamic Tier Pill)
      drawRoundedRect(870, 60, 250, 46, 23);
      ctx.fillStyle = cardTheme.canvasBgAccent;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = cardTheme.canvasBorderAccent;
      ctx.stroke();
      ctx.fillStyle = cardTheme.canvasPrimary;
      ctx.font = 'bold 17px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${planName.toUpperCase()} MEMBER`, 995, 89);
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

      // Member ID (Dynamic Tier Color)
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('MEMBER ID', 60, 290);
      ctx.fillStyle = cardTheme.canvasPrimary;
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

      // Dynamic Tier Perks Container
      drawRoundedRect(60, 460, 680, 115, 16);
      ctx.fillStyle = cardTheme.canvasBgAccent;
      ctx.fill();
      ctx.strokeStyle = cardTheme.canvasBorderAccent;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = cardTheme.canvasPrimary;
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText(`${cardTheme.tierName} MEMBER BENEFITS`, 85, 495);
      ctx.fillStyle = '#0f172a';
      ctx.font = '600 16px sans-serif';
      ctx.fillText(cardTheme.perksText, 85, 535);

      // Draw QR SVG onto Canvas
      const svgElement = document.getElementById('member-qr-code-svg');
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        const qrImg = new Image();
        qrImg.onload = () => {
          // White QR container with dynamic tier border
          drawRoundedRect(790, 175, 330, 390, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = cardTheme.canvasBorder;
          ctx.stroke();

          ctx.drawImage(qrImg, 825, 205, 260, 260);

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 15px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SCAN FOR VERIFICATION', 955, 505);
          ctx.font = 'bold 13px sans-serif';
          ctx.fillStyle = cardTheme.canvasPrimary;
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
          ctx.fillStyle = cardTheme.canvasPrimary;
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText(`● STATUS: ACTIVE ${cardTheme.tierName} MEMBER`, 60, 650);

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
    <div className="py-8 px-4 max-w-4xl mx-auto space-y-6 font-sans">
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
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={handleDownloadPNG}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer text-xs"
        >
          <Download className="w-4 h-4" />
          <span>Download ID Card (PNG)</span>
        </button>

        <button
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-black text-white font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer text-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>

        <button
          onClick={handleCopyId}
          className="bg-white hover:bg-slate-50 text-slate-800 font-semibold px-4 py-2 rounded-xl border border-slate-300 flex items-center gap-2 transition-all cursor-pointer text-xs shadow-2xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4 text-slate-500" />}
          <span>{copied ? 'Copied ID!' : 'Copy ID'}</span>
        </button>

        {/* Single Relevant Active Membership Tag */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
          <div
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-2xs ${cardTheme.badgeBg}`}
          >
            <cardTheme.BadgeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{planName} Tier</span>
          </div>
        </div>
      </div>

      {/* Official Rectangular Member ID Card (Dynamic Tier Theme) */}
      <div
        id="member-id-card-view"
        className={`relative max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 bg-white text-slate-900 overflow-hidden space-y-6 transition-all ${cardTheme.border}`}
      >
        {/* Top Accent Bar */}
        <div className={`absolute top-0 left-0 right-0 h-2.5 ${cardTheme.topBar}`} />

        {/* Card Header: Brand Logo & Dynamic Tier Badge with Icon */}
        <div className="flex items-center justify-between relative z-10 border-b border-slate-200 pb-5 pt-1">
          <div className="flex items-center gap-3">
            {/* Real BookMyCourt Logo */}
            <div className="flex items-center justify-center shrink-0">
              <img
                src="/bookmycourt_logo.png"
                alt="BookMyCourt Logo"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h3 className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                BOOKMYCOURT
              </h3>
              <p className={`text-[11px] uppercase tracking-widest mt-1 ${cardTheme.brandSubtext}`}>
                Official Digital Member Pass
              </p>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-full font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${cardTheme.badgeBg}`}>
            <cardTheme.BadgeIcon className="w-4 h-4 shrink-0" />
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
                <span className={`font-mono text-sm tracking-wide ${cardTheme.memberIdText}`}>
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
                <Phone className={`w-3.5 h-3.5 shrink-0 ${cardTheme.phoneIcon}`} />
                <span className="font-bold text-slate-900">{userPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className={`w-3.5 h-3.5 shrink-0 ${cardTheme.mailIcon}`} />
                <span className="font-medium text-slate-700 truncate">{userEmail}</span>
              </div>
            </div>

            {/* Dynamic Perks Box */}
            <div className={`pt-1 flex items-center gap-2 text-[11px] font-bold px-3.5 py-2 rounded-xl ${cardTheme.perksBg}`}>
              <cardTheme.BadgeIcon className="w-4 h-4 shrink-0" />
              <span>{cardTheme.perksText}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className={`sm:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm text-slate-900 ${cardTheme.qrBorder}`}>
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
            <span className={`text-[9px] ${cardTheme.qrSubtext}`}>
              BookMyCourt Front Desk & POS
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${cardTheme.statusDot} animate-pulse`} />
            <span className="font-bold text-slate-900">Status: <strong className={`${cardTheme.statusText} uppercase font-extrabold`}>● ACTIVE {cardTheme.tierName} MEMBER</strong></span>
          </div>
          <span className="font-bold text-slate-500 text-[11px]">Authorized Member Pass • BookMyCourt</span>
        </div>
      </div>

      {/* Reframed Gold VIP Pass Upgrade Section */}
      {myPendingRequest ? (
        <div className="max-w-2xl mx-auto bg-amber-50 border-2 border-amber-400 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-950 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200/60 border border-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm text-amber-900">Upgrade Request Sent to Front Desk</h4>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md border border-amber-400">
                  Pending
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                You requested an upgrade from <strong>{planName}</strong> to <strong>Gold VIP Member Pass</strong>. Front desk staff will approve your request.
              </p>
            </div>
          </div>
          <button
            onClick={handleCancelRequest}
            className="text-xs font-bold px-4 py-2 bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 rounded-xl transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            Cancel Request
          </button>
        </div>
      ) : isGold ? (
        <div className="max-w-2xl mx-auto bg-emerald-50 border-2 border-emerald-300 p-4 rounded-3xl flex items-center justify-between gap-3 text-emerald-950 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-700" />
            </div>
            <span className="text-xs font-extrabold text-emerald-900">
              You are currently enjoying full <strong>Gold VIP Membership Pass</strong> privileges!
            </span>
          </div>
          <button
            onClick={() => handleSetDemoTier('Silver')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-300 px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs"
            title="Switch tier for testing"
          >
            Switch to Silver Tier (Demo)
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-emerald-50 via-white to-emerald-50/60 border-2 border-emerald-700 rounded-3xl p-5 sm:p-6 text-slate-900 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0 shadow-sm mt-0.5">
                <Sparkles className="w-6 h-6 text-emerald-200" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                    VIP Upgrade Available
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">
                  Upgrade to Gold VIP Pass
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unlock unlimited free court bookings, priority court reservations, gear shop discounts, and cafeteria perks.
                </p>
              </div>
            </div>

            <button
              onClick={handleRequestGoldUpgrade}
              className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <span>Request Gold Upgrade</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Perks chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 px-3 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>100% Free Court Access</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 px-3 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>20% Gear Shop Discount</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 px-3 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>15% Bar & Cafe Discount</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberCardPage;
