import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  Camera, 
  X, 
  ShieldCheck, 
  ShieldWarning, 
  CheckCircle, 
  UserPlus, 
  ArrowsCounterClockwise, 
  Sparkle,
  Phone,
  EnvelopeSimple,
  CalendarBlank,
  Clock,
  MapPin,
  Trophy,
  Ticket,
  Check,
  Plus
} from '@phosphor-icons/react';
import { MOCK_MEMBERS, MOCK_BOOKINGS } from '../../data/mockData';

// Light Theme Member Avatar Component with First Letter Fallback
const MemberAvatar = ({ name, photoUrl }) => {
  const [imgErr, setImgErr] = useState(false);
  const initial = (name || 'M').charAt(0).toUpperCase();

  // If photoUrl is valid and not a default generic placeholder, try loading it
  if (photoUrl && !imgErr && !photoUrl.includes('ui-avatars.com')) {
    return (
      <img
        src={photoUrl}
        alt={name}
        onError={() => setImgErr(true)}
        className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2e7d32] shadow-sm shrink-0"
      />
    );
  }

  return (
    <div className="w-16 h-16 rounded-2xl bg-[#e8f5e9] text-[#2e7d32] border-2 border-[#2e7d32]/40 flex items-center justify-center font-black text-2xl shadow-2xs shrink-0 uppercase select-none">
      {initial}
    </div>
  );
};

export const QRScannerModal = ({ isOpen, onClose, membersList = [], onRegisterMember }) => {
  const [manualCode, setManualCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null); // { verified: boolean, member?: any, rawCode?: string, parsedData?: any, bookings?: any[] }
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [checkedInBookings, setCheckedInBookings] = useState({});
  const scannerRef = useRef(null);

  // Combine members list passed from props with mock members fallback
  const allMembers = [...membersList, ...MOCK_MEMBERS.map(m => ({
    id: m.id,
    memberNo: m.memberId || m.memberNo,
    name: m.name,
    phone: m.phone,
    email: m.email,
    planName: m.planName || 'Gold',
    status: m.status || 'ACTIVE',
    qrCode: m.qrCode,
    tabBalance: 0,
    avatar: m.photoUrl
  }))];

  useEffect(() => {
    let html5QrCode = null;

    if (isOpen && !verificationResult) {
      setCameraError(null);
      
      const timer = setTimeout(() => {
        const container = document.getElementById('qr-reader-container');
        if (container) {
          html5QrCode = new Html5Qrcode('qr-reader-container');
          scannerRef.current = html5QrCode;

          html5QrCode
            .start(
              { facingMode: 'environment' },
              {
                fps: 10,
                qrbox: { width: 220, height: 220 }
              },
              (decodedText) => {
                handleCodeScanned(decodedText);
              },
              () => {
                // Ignore silent frame scanning errors
              }
            )
            .then(() => {
              setIsScanning(true);
            })
            .catch((err) => {
              console.warn('Camera access fallback or denied:', err);
              setCameraError('Camera stream blocked or unavailable. Use manual input or demo scan buttons below.');
              setIsScanning(false);
            });
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              scannerRef.current.stop().then(() => {
                scannerRef.current?.clear();
              }).catch(console.error);
            }
          } catch (e) {
            console.error('Error stopping scanner:', e);
          }
        }
      };
    }
  }, [isOpen, verificationResult]);

  const getBookingsForMember = (member) => {
    // Find matching bookings in mock or generate realistic today's bookings for demo
    const matched = MOCK_BOOKINGS.filter(b => 
      (b.memberName && b.memberName.toLowerCase().includes(member.name.split(' ')[0].toLowerCase())) ||
      (b.memberId && b.memberId.toLowerCase() === (member.id || '').toLowerCase())
    );

    if (matched.length > 0) return matched;

    // Default sample today's booking for verified members
    return [
      {
        id: 'bk-demo-1',
        bookingNumber: 'BK-2026-891',
        courtName: 'Center Court 01',
        sport: 'Tennis',
        date: 'Today',
        startTime: '06:00 PM',
        endTime: '07:00 PM',
        price: 800,
        status: 'confirmed'
      },
      {
        id: 'bk-demo-2',
        bookingNumber: 'BK-2026-892',
        courtName: 'Padel Glass Court 02',
        sport: 'Padel',
        date: 'Today',
        startTime: '07:30 PM',
        endTime: '08:30 PM',
        price: 1200,
        status: 'confirmed'
      }
    ];
  };

  const handleCodeScanned = (rawText) => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }

    let parsed = null;
    let searchNo = rawText.trim();
    let searchEmail = '';
    let searchPhone = '';

    try {
      if (rawText.startsWith('{') && rawText.endsWith('}')) {
        parsed = JSON.parse(rawText);
        searchNo = parsed.memberNo || parsed.id || searchNo;
        searchEmail = parsed.email || '';
        searchPhone = parsed.phone || '';
      }
    } catch (e) {
      // Raw string
    }

    // Lookup member in list
    const found = allMembers.find((m) => {
      const mNo = (m.memberNo || '').toLowerCase();
      const mQr = (m.qrCode || '').toLowerCase();
      const mEmail = (m.email || '').toLowerCase();
      const mPhone = (m.phone || '').replace(/\D/g, '');
      const queryNo = searchNo.toLowerCase();
      const queryEmail = searchEmail.toLowerCase();
      const queryPhone = searchPhone.replace(/\D/g, '');

      return (
        mNo === queryNo ||
        mQr === queryNo ||
        (queryEmail && mEmail === queryEmail) ||
        (queryPhone && mPhone && mPhone.includes(queryPhone)) ||
        mNo.includes(queryNo) ||
        m.name.toLowerCase().includes(queryNo)
      );
    });

    if (found) {
      const memberBookings = getBookingsForMember(found);
      setVerificationResult({
        verified: true,
        member: found,
        rawCode: rawText,
        bookings: memberBookings
      });
    } else {
      setVerificationResult({
        verified: false,
        rawCode: rawText,
        parsedData: parsed
      });
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCodeScanned(manualCode.trim());
    }
  };

  const handleResetScan = () => {
    setVerificationResult(null);
    setManualCode('');
    setCameraError(null);
  };

  const handleToggleCheckInBooking = (bookingId) => {
    setCheckedInBookings(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const handleRegisterClick = () => {
    onClose();
    if (onRegisterMember) {
      const prefill = verificationResult?.parsedData || {
        email: verificationResult?.rawCode?.includes('@') ? verificationResult.rawCode : '',
        phone: /^\d{10}$/.test(verificationResult?.rawCode || '') ? verificationResult.rawCode : ''
      };
      onRegisterMember(prefill);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[92vh]">
        
        {/* Modal Header (Light Executive Theme) */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] text-[#2e7d32] border border-emerald-200 flex items-center justify-center shadow-2xs">
              <QrCode weight="bold" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Front Desk Member Scanner
              </h3>
              <p className="text-xs text-slate-500">Scan digital QR pass for instant check-in & verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!verificationResult ? (
            <>
              {/* Camera Scanner Viewport */}
              <div className="relative bg-slate-900 rounded-2xl border-2 border-[#2e7d32]/40 overflow-hidden min-h-[250px] flex flex-col items-center justify-center shadow-inner">
                <div id="qr-reader-container" className="w-full h-full min-h-[250px]" />
                
                {/* Visual Laser Scanning Animation Line */}
                {isScanning && !cameraError && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-60 h-60 border-2 border-dashed border-emerald-400 rounded-2xl relative overflow-hidden flex items-center justify-center">
                      <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-300 mt-3 bg-black/70 px-3 py-1 rounded-full border border-emerald-500/30">
                      Align QR Code within frame...
                    </span>
                  </div>
                )}

                {/* Camera Fallback Error Message */}
                {cameraError && (
                  <div className="p-6 text-center space-y-3 max-w-sm text-white">
                    <Camera weight="duotone" className="w-12 h-12 text-emerald-400/80 mx-auto" />
                    <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                  </div>
                )}
              </div>

              {/* Manual Input Search Fallback */}
              <form onSubmit={handleManualSubmit} className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Manual Search (Member No, Phone, Email or QR Payload)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. MEM-001053, Rohan, or 9876543210..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-[#2e7d32] shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="bg-[#2e7d32] hover:bg-[#236327] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
              </form>

              {/* Quick Demo Test Simulator Presets */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Demo Quick-Scan Presets:</span>
                  <span className="text-[10px] text-[#2e7d32] font-mono font-bold">1-Click Simulator</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCodeScanned(JSON.stringify({ memberNo: 'MEM-001053', name: 'Anmol Kharb', email: 'anmol.k@championsclub.com', plan: 'Junior' }))}
                    className="p-2.5 bg-[#e8f5e9]/70 border border-emerald-200 hover:bg-[#e8f5e9] rounded-xl text-left text-xs transition-all group cursor-pointer"
                  >
                    <div className="font-extrabold text-[#2e7d32]">Anmol Kharb</div>
                    <div className="text-[10px] text-slate-500 font-mono">MEM-001053 • Junior Pass</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCodeScanned(JSON.stringify({ memberNo: 'MEM-001001', name: 'Rohan Gupta', email: 'rohan@example.com', plan: 'Gold' }))}
                    className="p-2.5 bg-[#e8f5e9]/70 border border-emerald-200 hover:bg-[#e8f5e9] rounded-xl text-left text-xs transition-all group cursor-pointer"
                  >
                    <div className="font-extrabold text-[#2e7d32]">Rohan Gupta</div>
                    <div className="text-[10px] text-slate-500 font-mono">MEM-001001 • Gold VIP</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCodeScanned(JSON.stringify({ memberNo: 'CC-2026-8842', name: 'Rajesh Sharma', email: 'rajesh.sharma@gmail.com', plan: 'Gold' }))}
                    className="p-2.5 bg-[#e8f5e9]/70 border border-emerald-200 hover:bg-[#e8f5e9] rounded-xl text-left text-xs transition-all group cursor-pointer"
                  >
                    <div className="font-extrabold text-[#2e7d32]">Rajesh Sharma</div>
                    <div className="text-[10px] text-slate-500 font-mono">CC-2026-8842 • Gold Pass</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCodeScanned('UNREGISTERED-GUEST-999')}
                    className="p-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl text-left text-xs transition-all group cursor-pointer"
                  >
                    <div className="font-extrabold text-rose-700">Unregistered Guest</div>
                    <div className="text-[10px] text-rose-500 font-mono">Test Not-Found Flow</div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* VERIFICATION RESULT DISPLAY CARD (EXECUTIVE LIGHT THEME) */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              {verificationResult.verified ? (
                /* ----------------- LIGHT THEME VERIFIED MEMBER CARD ----------------- */
                <div className="bg-white border-2 border-[#2e7d32] rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-6">
                  
                  {/* Verified Status Banner */}
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e8f5e9] text-[#2e7d32] border border-emerald-200 rounded-xl">
                      <ShieldCheck weight="fill" className="w-5 h-5 shrink-0" />
                      <span className="font-extrabold text-xs tracking-wider uppercase">VERIFIED ACTIVE MEMBER</span>
                    </div>
                    <span className="px-3 py-1 bg-[#1f2125] text-white font-extrabold text-xs rounded-lg uppercase tracking-wider shadow-2xs">
                      {verificationResult.member.planName} PASS
                    </span>
                  </div>

                  {/* Profile Header with First Letter Light Avatar */}
                  <div className="flex items-center gap-4 pt-1">
                    <MemberAvatar
                      name={verificationResult.member.name}
                      photoUrl={verificationResult.member.avatar || verificationResult.member.photoUrl}
                    />
                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                        {verificationResult.member.name}
                      </h4>
                      <p className="text-xs font-mono font-bold text-[#2e7d32]">
                        ID: {verificationResult.member.memberNo}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <Phone weight="bold" className="w-3.5 h-3.5 text-[#2e7d32]" />
                          {verificationResult.member.phone || '9876543273'}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <EnvelopeSimple weight="bold" className="w-3.5 h-3.5 text-[#2e7d32]" />
                          {verificationResult.member.email || 'member@championsclub.com'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Member Privileges Light Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold">Court Access Privileges:</span>
                      <strong className="text-[#2e7d32] font-black">100% Granted (VIP)</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold">Pro Shop & Bar Tab Discount:</span>
                      <strong className="text-[#2e7d32] font-black">15% Off Active</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold">Verification Timestamp:</span>
                      <span className="font-mono font-bold text-slate-600">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* MEMBER BOOKING DETAILS SECTION (NEW & LIGHT THEME) */}
                  <div className="space-y-3 pt-1 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                        <CalendarBlank weight="bold" className="w-4 h-4 text-[#2e7d32]" />
                        <span>Active Court Reservations</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                        {verificationResult.bookings?.length || 0} Booking(s)
                      </span>
                    </div>

                    {verificationResult.bookings && verificationResult.bookings.length > 0 ? (
                      <div className="space-y-2.5">
                        {verificationResult.bookings.map((bk) => {
                          const isCheckedIn = checkedInBookings[bk.id];
                          return (
                            <div
                              key={bk.id}
                              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                isCheckedIn
                                  ? 'bg-[#e8f5e9] border-[#a5d6a7]'
                                  : 'bg-white border-slate-200 hover:border-[#2e7d32]/50 shadow-2xs'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-[#1f2125] text-white text-[10px] font-black rounded uppercase">
                                    {bk.sport || 'Tennis'}
                                  </span>
                                  <span className="font-extrabold text-xs text-slate-900">{bk.courtName}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                                  <span className="flex items-center gap-1">
                                    <Clock weight="bold" className="w-3.5 h-3.5 text-[#2e7d32]" />
                                    {bk.date || 'Today'} • {bk.startTime} - {bk.endTime}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleToggleCheckInBooking(bk.id)}
                                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                  isCheckedIn
                                    ? 'bg-[#2e7d32] text-white shadow-xs'
                                    : 'bg-[#e8f5e9] text-[#2e7d32] border border-emerald-300 hover:bg-[#2e7d32] hover:text-white'
                                }`}
                              >
                                {isCheckedIn ? (
                                  <>
                                    <Check weight="bold" className="w-3.5 h-3.5" />
                                    <span>Checked In</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle weight="bold" className="w-3.5 h-3.5" />
                                    <span>Check In</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                        <p className="text-xs text-slate-500 font-medium">No active court reservations scheduled for today.</p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions Toolbar */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 bg-[#2e7d32] hover:bg-[#236327] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle weight="bold" className="w-4 h-4" />
                      <span>Confirm & Complete Desk Check-in</span>
                    </button>
                    <button
                      onClick={handleResetScan}
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowsCounterClockwise weight="bold" className="w-4 h-4" />
                      <span>Scan Next Member</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* ----------------- LIGHT THEME UNVERIFIED / NOT FOUND CARD ----------------- */
                <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-5">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
                      <ShieldWarning weight="fill" className="w-5 h-5 shrink-0 text-rose-600" />
                      <span className="font-extrabold text-xs tracking-wider uppercase">MEMBER NOT FOUND</span>
                    </div>
                    <span className="px-3 py-1 bg-rose-600 text-white font-extrabold text-xs rounded-lg uppercase tracking-wider shadow-2xs">
                      UNVERIFIED
                    </span>
                  </div>

                  {/* Error Info */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900">No Active Member Record Found</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The scanned QR code <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-rose-700 font-bold border border-slate-200">{verificationResult.rawCode}</span> does not belong to any active member in the system.
                    </p>
                  </div>

                  {/* Action Box to Register New Member */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-700">
                      Would you like to quickly register this guest as a new club member now?
                    </p>
                    <button
                      onClick={handleRegisterClick}
                      className="w-full py-3 bg-[#2e7d32] hover:bg-[#236327] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus weight="bold" className="w-4.5 h-4.5" />
                      <span>Register New Member Now →</span>
                    </button>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleResetScan}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowsCounterClockwise weight="bold" className="w-4 h-4" />
                      <span>Try Scanning Again</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
