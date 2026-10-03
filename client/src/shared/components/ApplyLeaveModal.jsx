import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRequestLeave } from '../../hooks/useHr';
import { Calendar, AlertCircle, CheckCircle2, Loader2, X, Clock } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';

export const ApplyLeaveModal = ({ isOpen, onClose }) => {
  const { currentUser, currentRole } = useAuth();
  const requestLeave = useRequestLeave();

  const [form, setForm] = useState({
    type: 'CASUAL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: '',
  });

  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  // Calculate inclusive calendar days
  const calculateDays = () => {
    try {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
      return differenceInCalendarDays(end, start) + 1;
    } catch {
      return 0;
    }
  };

  const daysCount = calculateDays();
  const leaveBalance = currentUser?.employee?.leaveBalance ?? 18;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (daysCount <= 0) {
      setFeedback({ type: 'error', message: 'End date must be greater than or equal to start date.' });
      return;
    }

    if (daysCount > leaveBalance) {
      setFeedback({ 
        type: 'error', 
        message: `Requested ${daysCount} days, but your remaining leave balance is ${leaveBalance} days.` 
      });
      return;
    }

    try {
      await requestLeave.mutateAsync({
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
        employeeId: currentUser?.employee?.id,
      });

      setFeedback({ type: 'success', message: 'Leave application submitted successfully! It is now pending admin approval.' });
      setTimeout(() => {
        onClose();
        setFeedback(null);
        setForm({
          type: 'CASUAL',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          reason: '',
        });
      }, 1400);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Failed to submit leave application.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Apply for Staff Leave</h3>
              <p className="text-[11px] text-slate-500 font-medium">Request time off for approval by Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Staff details info bar */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Applicant</span>
            <span className="font-extrabold text-slate-900">{currentUser?.name || 'Staff Member'}</span>
            <span className="text-[11px] text-slate-500 ml-1.5 font-semibold">({currentRole?.replace('_', ' ')})</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Leave Balance</span>
            <span className="font-extrabold text-emerald-700 text-sm">{leaveBalance} days</span>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="leading-tight">{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-semibold">
          <div>
            <label className="text-slate-700 block mb-1">Leave Category</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-slate-800 focus:border-emerald-600 focus:outline-none transition-colors"
            >
              <option value="CASUAL">Casual Leave (Short absence / personal)</option>
              <option value="SICK">Medical / Sick Leave</option>
              <option value="VACATION">Vacation / Annual Planned Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 block mb-1">Start Date</label>
              <input
                type="date"
                required
                value={form.startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 block mb-1">End Date</label>
              <input
                type="date"
                required
                value={form.endDate}
                min={form.startDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Days summary calculation pill */}
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px]">
            <span className="text-emerald-800 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Calculated duration:
            </span>
            <span className="font-extrabold text-emerald-900">
              {daysCount > 0 ? `${daysCount} Day${daysCount > 1 ? 's' : ''}` : 'Invalid range'}
            </span>
          </div>

          <div>
            <label className="text-slate-700 block mb-1">Reason for Leave</label>
            <textarea
              required
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="State the reason for taking leave..."
              className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none resize-none placeholder:text-slate-400 font-normal"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requestLeave.isPending}
              className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {requestLeave.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Submit Leave Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
