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
  Phone,
  EnvelopeSimple,
  CalendarBlank,
  Clock,
  Ticket,
  CircleNotch
} from '@phosphor-icons/react';
import { useScanMember } from '../../hooks/useMembership';

// Light Theme Member Avatar Component with First Letter Fallback
const MemberAvatar = ({ name, photoUrl }) => {
  const [imgErr, setImgErr] = useState(false);
  const initial = (name || 'M').charAt(0).toUpperCase();

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

// Map a backend member (fields live on user/plan/booking relations) into a flat
// view model for the result card.
const normalizeMember = (m) => ({
  id: m.id,
  memberNo: m.memberNo,
  name: m.user?.name || m.name || 'Member',
  phone: m.user?.phone || m.phone || '',
  email: m.user?.email || m.email || '',
  planName: m.plan?.name || m.planName || '—',
  status: m.status || 'ACTIVE',
  endDate: m.endDate || null,
  photoUrl: m.photoUrl || null,
  bookings: (m.bookings || []).map((b) => ({
    id: b.id,
    courtName: b.court?.name || 'Court',
    sport: b.court?.sport || '',
    startTime: b.startTime ? new Date(b.startTime).toLocaleString() : '',
    endTime: b.endTime ? new Date(b.endTime).toLocaleTimeString() : '',
    status: b.status || '',
  })),
  tabs: (m.tabs || []).map((t) => ({
    id: t.id,
    total: Number(t.totalAmount ?? t.total ?? 0),
    status: t.status,
  })),
});

export const QRScannerModal = ({ isOpen, onClose, onRegisterMember }) => {
  const [manualCode, setManualCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null); // { verified, member?, rawCode, message? }
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  const scanMember = useScanMember();

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
              { fps: 10, qrbox: { width: 220, height: 220 } },
              (decodedText) => {
                handleCodeScanned(decodedText);
              },
              () => {
                // Ignore silent per-frame decode errors.
              }
            )
            .then(() => setIsScanning(true))
            .catch((err) => {
              console.warn('Camera access fallback or denied:', err);
              setCameraError('Camera is blocked or unavailable. Use the manual search below.');
              setIsScanning(false);
            });
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, verificationResult]);

  // Release the camera stream.
  const stopScanner = () => {
    const s = scannerRef.current;
    if (s) {
      try {
        if (s.isScanning) {
          s.stop().then(() => s.clear()).catch(() => {});
        }
      } catch {
        /* noop */
      }
      scannerRef.current = null;
    }
  };

  // Resolve a scanned/typed code against the real backend (POST /members/scan).
  const handleCodeScanned = async (rawText) => {
    const payload = (rawText || '').trim();
    if (!payload) return;
    stopScanner();
    setIsScanning(false);

    try {
      const member = await scanMember.mutateAsync(payload);
      setVerificationResult({ verified: true, member: normalizeMember(member), rawCode: payload });
    } catch (err) {
      // Try to surface any email/phone from the payload to prefill registration.
      let parsedData = null;
      try {
        if (payload.startsWith('{') && payload.endsWith('}')) parsedData = JSON.parse(payload);
      } catch {
        /* raw string */
      }
      setVerificationResult({
        verified: false,
        rawCode: payload,
        parsedData,
        message: err?.message || 'No member found for this code.',
      });
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) handleCodeScanned(manualCode.trim());
  };

  const handleResetScan = () => {
    setVerificationResult(null);
    setManualCode('');
    setCameraError(null);
  };

  const handleClose = () => {
    stopScanner();
    handleResetScan();
    onClose?.();
  };

  const handleRegisterClick = () => {
    const prefill =
      verificationResult?.parsedData || {
        email: verificationResult?.rawCode?.includes('@') ? verificationResult.rawCode : '',
        phone: /^\d{10}$/.test(verificationResult?.rawCode || '') ? verificationResult.rawCode : '',
      };
    handleClose();
    onRegisterMember?.(prefill);
  };

  if (!isOpen) return null;

  const verifying = scanMember.isPending;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[92vh]">

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] text-[#2e7d32] border border-emerald-200 flex items-center justify-center shadow-2xs">
              <QrCode weight="bold" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Front Desk Member Scanner</h3>
              <p className="text-xs text-slate-500">Scan the digital QR pass for instant verification & history</p>
            </div>
          </div>
          <button
            onClick={handleClose}
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

                {isScanning && !cameraError && !verifying && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-60 h-60 border-2 border-dashed border-emerald-400 rounded-2xl relative overflow-hidden flex items-center justify-center">
                      <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-300 mt-3 bg-black/70 px-3 py-1 rounded-full border border-emerald-500/30">
                      Align QR Code within frame...
                    </span>
                  </div>
                )}

                {verifying && (
                  <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white gap-2">
                    <CircleNotch weight="bold" className="w-8 h-8 animate-spin text-emerald-400" />
                    <span className="text-xs font-semibold">Verifying member…</span>
                  </div>
                )}

                {cameraError && !verifying && (
                  <div className="p-6 text-center space-y-3 max-w-sm text-white">
                    <Camera weight="duotone" className="w-12 h-12 text-emerald-400/80 mx-auto" />
                    <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                  </div>
                )}
              </div>

              {/* Manual Input Search Fallback */}
              <form onSubmit={handleManualSubmit} className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Manual Lookup (Member No. or scanned QR payload)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder='e.g. MEM-001053 or {"memberNo":"MEM-001053",...}'
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-[#2e7d32] shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={verifying}
                    className="bg-[#2e7d32] hover:bg-[#236327] disabled:opacity-60 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    {verifying && <CircleNotch weight="bold" className="w-3.5 h-3.5 animate-spin" />}
                    Verify
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  The member card encodes a JSON payload; the front desk can also type a member number.
                </p>
              </form>
            </>
          ) : (
            /* VERIFICATION RESULT */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              {verificationResult.verified ? (
                <div className="bg-white border-2 border-[#2e7d32] rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-6">

                  {/* Verified Status Banner */}
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e8f5e9] text-[#2e7d32] border border-emerald-200 rounded-xl">
                      <ShieldCheck weight="fill" className="w-5 h-5 shrink-0" />
                      <span className="font-extrabold text-xs tracking-wider uppercase">
                        {/active/i.test(verificationResult.member.status) ? 'VERIFIED ACTIVE MEMBER' : `MEMBER — ${verificationResult.member.status}`}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-[#1f2125] text-white font-extrabold text-xs rounded-lg uppercase tracking-wider shadow-2xs">
                      {verificationResult.member.planName} PASS
                    </span>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-center gap-4 pt-1">
                    <MemberAvatar name={verificationResult.member.name} photoUrl={verificationResult.member.photoUrl} />
                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                        {verificationResult.member.name}
                      </h4>
                      <p className="text-xs font-mono font-bold text-[#2e7d32]">
                        ID: {verificationResult.member.memberNo}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                        {verificationResult.member.phone && (
                          <span className="flex items-center gap-1 font-semibold">
                            <Phone weight="bold" className="w-3.5 h-3.5 text-[#2e7d32]" />
                            {verificationResult.member.phone}
                          </span>
                        )}
                        {verificationResult.member.email && (
                          <span className="flex items-center gap-1 font-semibold">
                            <EnvelopeSimple weight="bold" className="w-3.5 h-3.5 text-[#2e7d32]" />
                            {verificationResult.member.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Membership summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold">Plan Tier:</span>
                      <strong className="text-[#2e7d32] font-black">{verificationResult.member.planName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold">Membership Status:</span>
                      <strong className={/active/i.test(verificationResult.member.status) ? 'text-[#2e7d32] font-black' : 'text-amber-700 font-black'}>
                        {verificationResult.member.status}
                      </strong>
                    </div>
                    {verificationResult.member.endDate && (
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold">Valid Until:</span>
                        <span className="font-mono font-bold text-slate-600">
                          {new Date(verificationResult.member.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold">Verified At:</span>
                      <span className="font-mono font-bold text-slate-600">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Open bar tabs */}
                  {verificationResult.member.tabs.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-amber-800">
                        <Ticket weight="bold" className="w-4 h-4" />
                        {verificationResult.member.tabs.length} Open Bar Tab(s)
                      </span>
                      <strong className="text-amber-900 font-black">
                        ₹{verificationResult.member.tabs.reduce((s, t) => s + t.total, 0).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  )}

                  {/* Recent bookings (history) */}
                  <div className="space-y-3 pt-1 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                        <CalendarBlank weight="bold" className="w-4 h-4 text-[#2e7d32]" />
                        <span>Recent Court Activity</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                        {verificationResult.member.bookings.length} record(s)
                      </span>
                    </div>

                    {verificationResult.member.bookings.length > 0 ? (
                      <div className="space-y-2.5">
                        {verificationResult.member.bookings.map((bk) => (
                          <div key={bk.id} className="p-3.5 rounded-2xl border bg-white border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {bk.sport && (
                                  <span className="px-2 py-0.5 bg-[#1f2125] text-white text-[10px] font-black rounded uppercase">
                                    {bk.sport}
                                  </span>
                                )}
                                <span className="font-extrabold text-xs text-slate-900">{bk.courtName}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                                <Clock weight="bold" className="w-3.5 h-3.5 text-[#2e7d32]" />
                                {bk.startTime}
                              </div>
                            </div>
                            {bk.status && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase shrink-0">
                                {bk.status}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                        <p className="text-xs text-slate-500 font-medium">No recent court activity on record.</p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 bg-[#2e7d32] hover:bg-[#236327] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle weight="bold" className="w-4 h-4" />
                      <span>Done</span>
                    </button>
                    <button
                      onClick={handleResetScan}
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowsCounterClockwise weight="bold" className="w-4 h-4" />
                      <span>Scan Next</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* NOT FOUND */
                <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-5">
                  <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
                      <ShieldWarning weight="fill" className="w-5 h-5 shrink-0 text-rose-600" />
                      <span className="font-extrabold text-xs tracking-wider uppercase">MEMBER NOT FOUND</span>
                    </div>
                    <span className="px-3 py-1 bg-rose-600 text-white font-extrabold text-xs rounded-lg uppercase tracking-wider shadow-2xs">
                      UNVERIFIED
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900">No Active Member Record</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {verificationResult.message} Scanned code:{' '}
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-rose-700 font-bold border border-slate-200 break-all">
                        {verificationResult.rawCode}
                      </span>
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-700">
                      Register this guest as a new club member now?
                    </p>
                    <button
                      onClick={handleRegisterClick}
                      className="w-full py-3 bg-[#2e7d32] hover:bg-[#236327] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus weight="bold" className="w-4 h-4" />
                      <span>Register New Member →</span>
                    </button>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleResetScan}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowsCounterClockwise weight="bold" className="w-4 h-4" />
                      <span>Try Again</span>
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
