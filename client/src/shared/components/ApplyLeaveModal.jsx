import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRequestLeave, useLeaves } from '../../hooks/useHr';
import { useLeaveRealtime } from '../../hooks/useRealtime';
import { CustomSelect } from './CustomSelect';
import { Calendar, AlertCircle, CheckCircle2, Loader2, X, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import { differenceInCalendarDays, format } from 'date-fns';

export const ApplyLeaveModal = ({ isOpen = true, onClose }) => {
  const { currentUser, currentRole } = useAuth();
  const requestLeave = useRequestLeave();
  const { data: allLeaves = [], isLoading: leavesLoading } = useLeaves();

  // Listen to live socket events when leaves are requested/approved/rejected
  useLeaveRealtime();

  const [activeModalTab, setActiveModalTab] = useState('apply'); // 'apply' | 'status'

  const [form, setForm] = useState({
    type: 'CASUAL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: '',
  });

  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  // Filter leaves belonging to this staff member
  const employeeId = currentUser?.employee?.id;
  const userId = currentUser?.id;
  const myLeaves = allLeaves.filter(
    (l) => l.employeeId === employeeId || l.employee?.userId === userId || l.employee?.id === employeeId
  );

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

      setFeedback({ type: 'success', message: 'Leave application submitted! It is now pending admin approval.' });
      setForm({
        type: 'CASUAL',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        reason: '',
      });
      setTimeout(() => {
        setActiveModalTab('status');
        setFeedback(null);
      }, 1000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Failed to submit leave application.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Staff Leave Management</h3>
              <p className="text-[11px] text-slate-500 font-normal">Request time off and track real-time approval status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveModalTab('apply')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeModalTab === 'apply'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Apply for Leave</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModalTab('status')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeModalTab === 'status'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>My Requests ({myLeaves.length})</span>
          </button>
        </div>

        {/* Staff details info bar */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">Applicant</span>
            <span className="font-medium text-slate-800">{currentUser?.name || 'Staff Member'}</span>
            <span className="text-[11px] text-slate-500 ml-1.5 font-normal">({currentRole?.replace('_', ' ')})</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">Leave Balance</span>
            <span className="font-semibold text-emerald-700 text-sm">{leaveBalance} days</span>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
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

        {/* TAB 1: APPLY FOR LEAVE FORM */}
        {activeModalTab === 'apply' && (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-medium">
            <div>
              <label className="text-slate-700 block mb-1">Leave Category</label>
              <CustomSelect
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                options={[
                  { value: 'CASUAL', label: 'Casual Leave (Short absence / personal)' },
                  { value: 'SICK', label: 'Medical / Sick Leave' },
                  { value: 'VACATION', label: 'Vacation / Annual Planned Leave' },
                ]}
              />
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
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none font-medium"
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
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Days summary calculation pill */}
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px]">
              <span className="text-emerald-800 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Calculated duration:
              </span>
              <span className="font-semibold text-emerald-900">
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
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={requestLeave.isPending}
                className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {requestLeave.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Submit Leave Request</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: MY LEAVE REQUESTS & REAL-TIME STATUS */}
        {activeModalTab === 'status' && (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {myLeaves.map((leave) => {
              const isApproved = leave.status === 'APPROVED';
              const isRejected = leave.status === 'REJECTED';
              const isPending = leave.status === 'PENDING';

              return (
                <div
                  key={leave.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                    isApproved
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isRejected
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-xs text-slate-900 block">
                        {leave.type} LEAVE ({leave.days} Day{leave.days > 1 ? 's' : ''})
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {format(new Date(leave.startDate), 'dd MMM yyyy')} – {format(new Date(leave.endDate), 'dd MMM yyyy')}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isApproved && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                      {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                      {isPending && <Clock className="w-3 h-3 text-amber-600 animate-pulse" />}
                      <span>{leave.status}</span>
                    </span>
                  </div>

                  {leave.reason && (
                    <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-100/80">
                      <span className="font-medium text-slate-700">Reason: </span>
                      {leave.reason}
                    </p>
                  )}

                  {leave.approvedBy && (
                    <div className="text-[10px] text-slate-400 text-right">
                      Reviewed by: <span className="font-medium text-slate-600">{leave.approvedBy.name}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {myLeaves.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs font-normal">
                No leave applications found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
