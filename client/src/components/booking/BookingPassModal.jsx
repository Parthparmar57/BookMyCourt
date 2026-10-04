import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Printer,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const BookingPassModal = ({ booking, onClose }) => {
  if (!booking) return null;

  // Extract variables
  const bookingId = booking.id || 'BK-TEMP';
  const courtName = booking.court?.name || booking.courtName || 'Court Facility';
  const sport = booking.court?.sport || booking.sport || 'Sports Court';
  const startTime = booking.startTime ? new Date(booking.startTime) : new Date();
  const endTime = booking.endTime ? new Date(booking.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000);
  
  // Member details
  const memberName = booking.member?.user?.name || booking.walkInName || booking.memberName || 'Valued Member';
  const memberCode = booking.member?.memberCode || (booking.memberId ? `MEM-${booking.memberId.slice(0, 6).toUpperCase()}` : 'GUEST-PASS');
  const rawPlanName = booking.member?.plan?.name || booking.planName || booking.member?.user?.plan || 'Silver';
  const planName = /standard/i.test(rawPlanName) ? 'Silver' : rawPlanName;

  // Membership Tier Badge Detection (Only 3 plans: Gold, Silver, Junior)
  const getTierBadge = (planStr) => {
    const nameUpper = (planStr || '').toUpperCase();
    if (nameUpper.includes('GOLD')) {
      return {
        label: 'GOLD MEMBERSHIP',
        icon: '🥇',
        bg: 'bg-amber-50 text-amber-900 border-amber-300',
        printBadge: 'background: #fffbe6; color: #78350f; border: 1px solid #fde68a;'
      };
    }
    if (nameUpper.includes('JUNIOR') || nameUpper.includes('YOUTH') || nameUpper.includes('CHILD')) {
      return {
        label: 'JUNIOR MEMBERSHIP',
        icon: '🎽',
        bg: 'bg-sky-50 text-sky-900 border-sky-300',
        printBadge: 'background: #f0f9ff; color: #0c4a6e; border: 1px solid #bae6fd;'
      };
    }
    return {
      label: 'SILVER MEMBERSHIP',
      icon: '🥈',
      bg: 'bg-slate-100 text-slate-800 border-slate-300',
      printBadge: 'background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1;'
    };
  };

  const tier = getTierBadge(planName);
  const initial = memberName ? memberName.charAt(0).toUpperCase() : 'M';

  // Format times
  const timeFormatted = `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const dateFormatted = startTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  
  const isGoldPlan = /gold/i.test(planName);
  const isJuniorPlan = /junior|youth|child/i.test(planName);
  const rawBookingPrice = Number(booking.price ?? 0);

  let priceFormatted = '';
  if (isGoldPlan) {
    priceFormatted = '₹0.00 (Included in Plan)';
  } else if (rawBookingPrice > 0) {
    priceFormatted = `₹${rawBookingPrice.toFixed(2)}`;
  } else if (isJuniorPlan) {
    priceFormatted = '₹100.00 (Junior Plan Rate)';
  } else {
    priceFormatted = '₹200.00 (Silver Plan Rate)';
  }
  const paymentMethodLabel = booking.paymentMode || 'Direct Approval / Member Plan';

  // Encode payload for QR scanner
  const qrPayload = booking.member?.qrCode || JSON.stringify({
    bookingId: bookingId,
    memberCode: memberCode,
    court: courtName,
    date: dateFormatted,
    slot: timeFormatted
  });

  const handlePrint = () => {
    const printContent = document.getElementById('printable-paper-receipt');
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=600,height=850');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${bookingId}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
            }
            .ticket-box {
              width: 100%;
              max-width: 440px;
              border: 1.5px solid #0f172a;
              border-radius: 16px;
              padding: 24px;
              background: #ffffff;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div class="ticket-box">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      {/* Screen Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden font-sans relative flex flex-col max-h-[85vh] my-auto">
          
          {/* Top Brand Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between relative border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2e7d32] text-white flex items-center justify-center font-black text-sm shadow-sm">
                B
              </div>
              <div>
                <div className="text-base font-black tracking-tight text-white leading-none font-sans flex items-center gap-0.5">
                  <span>Book</span>
                  <span className="text-emerald-400">My</span>
                  <span>Court</span>
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mt-0.5">Official Court Ticket Pass</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content / Preview - min-h-0 guarantees flex container stays within max-h */}
          <div className="p-4 space-y-3 overflow-y-auto min-h-0 flex-1 bg-slate-50/50">
            
            {/* Member & Tier Header */}
            <div className={`p-3.5 rounded-2xl border ${tier.bg} flex items-center justify-between gap-3 shadow-xs`}>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#e8f5e9] text-[#2e7d32] border border-emerald-300 flex items-center justify-center font-black text-lg shrink-0 shadow-2xs">
                  {initial}
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900 leading-tight">{memberName}</h3>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5 font-bold">ID: {memberCode}</p>
                </div>
              </div>

              <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-xl border shadow-xs ${tier.bg}`}>
                <span>{tier.icon}</span>
                <span>{tier.label}</span>
              </span>
            </div>

            {/* Payment & Match Confirmation Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
              
              {/* Payment Approval Stamp */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Booking Reference</span>
                  <span className="font-mono text-xs font-bold text-slate-800">{bookingId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Payment Status</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-[#2e7d32]" />
                    <span>PAID · APPROVED</span>
                  </span>
                </div>
              </div>

              {/* Match Details */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#2e7d32] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Facility / Sport</span>
                    <span className="font-extrabold text-slate-900 text-xs">{courtName}</span>
                    <span className="text-[9px] text-slate-500 block font-semibold">{sport}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Reservation Date</span>
                    <span className="font-extrabold text-slate-900 text-xs">{dateFormatted}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 col-span-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Time Slot Window</span>
                    <span className="font-extrabold text-slate-900 text-xs">{timeFormatted} (60 Mins)</span>
                  </div>
                </div>

                {/* Total Charged & Payment Breakdown */}
                <div className="col-span-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/90 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold text-emerald-800 block uppercase tracking-wider">Total Charged</span>
                    <span className="text-xs font-black text-[#2e7d32]">{priceFormatted}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-extrabold text-slate-500 block uppercase">Method</span>
                    <span className="text-[10px] font-bold text-slate-700">{paymentMethodLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Scanner Pass */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 text-center space-y-1.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />
                Scannable Digital Entry Pass
              </span>

              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 inline-block mx-auto">
                {qrPayload.startsWith('data:image/') ? (
                  <img src={qrPayload} alt="QR Code" className="w-24 h-24 object-contain mx-auto" />
                ) : (
                  <QRCodeSVG
                    value={qrPayload}
                    size={96}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="M"
                  />
                )}
              </div>
              <p className="text-[9px] text-slate-400 font-medium">Scan at front desk or court kiosk for instant entry</p>
            </div>
          </div>

          {/* Fixed Footer Actions at bottom of card */}
          <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-2.5 shrink-0">
            <button
              onClick={handlePrint}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print Paper Receipt</span>
            </button>
            
            <button
              onClick={onClose}
              className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>

        </div>
      </div>

      {/* ─── DEDICATED REAL PAPER TICKET RECEIPT FOR PRINTING & PDF DOWNLOAD ─── */}
      <div id="printable-paper-receipt" style={{ display: 'none' }}>
        
        {/* Receipt Brand Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #0f172a', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '28px', height: '28px', background: '#2e7d32', color: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '15px', fontFamily: 'sans-serif' }}>B</div>
            <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px', color: '#0f172a', fontFamily: 'sans-serif' }}>
              Book<span style={{ color: '#2e7d32' }}>My</span>Court
            </div>
          </div>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '2px' }}>
            BOOKMYCOURT · OFFICIAL COURT PASS RECEIPT
          </div>
          
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#166534', background: '#dcfce7', padding: '4px 12px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
              PAYMENT VERIFIED & APPROVED ✓
            </span>
          </div>
        </div>

        {/* Member Card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', marginBottom: '16px', ...parsePrintStyle(tier.printBadge) }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{memberName}</div>
            <div style={{ fontSize: '10px', fontFamily: 'monospace', opacity: '0.8', marginTop: '2px', fontWeight: '700' }}>ID: {memberCode}</div>
          </div>
          <div style={{ fontSize: '11px', fontWeight: '900', padding: '4px 10px', borderRadius: '6px', border: '1px solid currentColor' }}>
            {tier.icon} {tier.label}
          </div>
        </div>

        {/* Details Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '16px' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '8px 0', color: '#64748b', fontWeight: '600' }}>Booking Ref ID:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '800', fontFamily: 'monospace', color: '#0f172a' }}>{bookingId}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '8px 0', color: '#64748b', fontWeight: '600' }}>Facility / Court:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>{courtName} ({sport})</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '8px 0', color: '#64748b', fontWeight: '600' }}>Reservation Date:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>{dateFormatted}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '8px 0', color: '#64748b', fontWeight: '600' }}>Time Window:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>{timeFormatted} (60 Mins)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '8px 0', color: '#64748b', fontWeight: '600' }}>Payment Method:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>{paymentMethodLabel}</td>
            </tr>
            <tr style={{ borderBottom: '2px solid #0f172a' }}>
              <td style={{ padding: '10px 0', fontWeight: '800', fontSize: '12px', color: '#0f172a' }}>Total Amount Charged:</td>
              <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '900', fontSize: '13px', color: '#2e7d32' }}>{priceFormatted}</td>
            </tr>
          </tbody>
        </table>

        {/* QR Section */}
        <div style={{ textAlign: 'center', border: '1px border-dashed #cbd5e1', padding: '16px', borderRadius: '12px', marginBottom: '16px', background: '#f8fafc' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '10px', letterSpacing: '0.5px' }}>
            SCANNABLE DIGITAL ENTRY PASS
          </div>
          <div style={{ display: 'inline-block', padding: '10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            {qrPayload.startsWith('data:image/') ? (
              <img src={qrPayload} alt="Pass QR" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
            ) : (
              <QRCodeSVG value={qrPayload} size={130} bgColor="#ffffff" fgColor="#0f172a" level="M" />
            )}
          </div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '8px' }}>
            Present this QR code at the front desk scanner or court entrance kiosk for instant entry.
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '9px', color: '#94a3b8', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
          <div style={{ fontWeight: '700' }}>Thank you for playing at BookMyCourt!</div>
          <div style={{ fontFamily: 'monospace', marginTop: '2px' }}>bookmycourt.com · Official Digital Pass Receipt</div>
        </div>
      </div>
    </>
  );
};

// Helper function to parse style object from inline style string if needed
const parsePrintStyle = (styleStr) => {
  if (!styleStr) return {};
  const styles = {};
  styleStr.split(';').forEach(rule => {
    const [key, val] = rule.split(':');
    if (key && val) {
      const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
      styles[camelKey] = val.trim();
    }
  });
  return styles;
};
