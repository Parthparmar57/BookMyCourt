import React, { useState, useRef, useEffect } from 'react';
import {
  useEmployees,
  useCreateEmployee,
  useLeaves,
  useUpdateLeaveStatus,
  usePayrolls,
  useRunPayroll,
  useUpdatePayrollStatus,
} from '../../../hooks/useHr';
import { formatCurrency, formatPhone } from '../../../shared/utils/formatters';
import { CustomSelect } from '../../../shared/components/CustomSelect';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Check, 
  XCircle,
  Clock,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const ROLE_COLORS = {
  OWNER: 'bg-rose-100 text-rose-800',
  FRONT_DESK: 'bg-emerald-100 text-emerald-800',
  BAR_STAFF: 'bg-amber-100 text-amber-800',
  KITCHEN: 'bg-red-100 text-red-800',
  SHOP_STAFF: 'bg-blue-100 text-blue-800',
  MEMBER: 'bg-slate-100 text-slate-800',
};

const LEAVE_TYPE_COLORS = {
  CASUAL: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SICK: 'bg-rose-50 text-rose-700 border-rose-200',
  PAID: 'bg-amber-50 text-amber-700 border-amber-200',
  VACATION: 'bg-amber-50 text-amber-700 border-amber-200',
  UNPAID: 'bg-slate-100 text-slate-700 border-slate-200',
};

// Sexy Table Page Size Selector (Floats smoothly upwards)
const TablePageSizeSelect = ({ value, onChange, options = [10, 20, 50, 'all'], totalCount }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const normalizedOptions = options.map((opt) => ({
    value: opt,
    label: opt === 'all' ? `Show All (${totalCount || ''})` : `${opt} / page`,
  }));

  const current = normalizedOptions.find((o) => String(o.value) === String(value)) || normalizedOptions[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left select-none">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
          open
            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-300'
        }`}
      >
        <span>{current.label}</span>
        <ChevronUp className={`w-3.5 h-3.5 text-emerald-700 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-44 bg-white/95 backdrop-blur-md border border-emerald-100 rounded-2xl shadow-xl shadow-emerald-950/10 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Rows Per Page
          </div>
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-950'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const HrPage = () => {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'leaves' | 'payroll'
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [feedback, setFeedback] = useState(null);

  // Queries
  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const { data: leaves = [], isLoading: leavesLoading } = useLeaves();
  const { data: payrolls = [], isLoading: payrollLoading } = usePayrolls();

  // Mutations
  const createEmployee = useCreateEmployee();
  const updateLeaveStatus = useUpdateLeaveStatus();
  const runPayroll = useRunPayroll();
  const updatePayrollStatus = useUpdatePayrollStatus();

  // Add Employee Form State
  const [addEmpError, setAddEmpError] = useState('');
  const [empForm, setEmpForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'FRONT_DESK',
    designation: 'Front Desk Associate',
    salary: '35000',
    joiningDate: new Date().toISOString().split('T')[0],
    password: 'Staff@123',
  });

  // Staff Search, Role Filter & Pagination State
  const [searchStaff, setSearchStaff] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [staffPage, setStaffPage] = useState(1);
  const [staffPageSize, setStaffPageSize] = useState(10);

  // Payroll Pagination State
  const [payrollPage, setPayrollPage] = useState(1);
  const [payrollPageSize, setPayrollPageSize] = useState(10);

  useEffect(() => {
    setStaffPage(1);
  }, [searchStaff, roleFilter, staffPageSize]);

  useEffect(() => {
    setPayrollPage(1);
  }, [payrollPageSize]);

  // Filtered and Paginated Staff
  const filteredEmployees = employees.filter((emp) => {
    const q = searchStaff.toLowerCase().trim();
    const matchesSearch = !q ||
      emp.employeeNo?.toLowerCase().includes(q) ||
      emp.user?.name?.toLowerCase().includes(q) ||
      emp.user?.email?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q) ||
      emp.user?.phone?.includes(q);

    const matchesRole = roleFilter === 'ALL' ||
      (roleFilter === 'COACHES' && /coach|trainer|physio|specialist/i.test(emp.designation)) ||
      (roleFilter === 'FRONT_DESK' && emp.user?.role === 'FRONT_DESK' && !/coach|trainer|physio|specialist/i.test(emp.designation)) ||
      emp.user?.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const staffLimit = staffPageSize === 'all' ? filteredEmployees.length : Number(staffPageSize);
  const paginatedStaff = filteredEmployees.slice((staffPage - 1) * staffLimit, staffPage * staffLimit);

  // Paginated Payrolls
  const payrollLimit = payrollPageSize === 'all' ? payrolls.length : Number(payrollPageSize);
  const paginatedPayrolls = payrolls.slice((payrollPage - 1) * payrollLimit, payrollPage * payrollLimit);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setAddEmpError('');
    try {
      await createEmployee.mutateAsync(empForm);
      setShowAddEmployee(false);
      setEmpForm({
        name: '',
        email: '',
        phone: '',
        role: 'FRONT_DESK',
        designation: 'Front Desk Associate',
        salary: '35000',
        joiningDate: new Date().toISOString().split('T')[0],
        password: 'Staff@123',
      });
      setFeedback({ type: 'success', message: 'New employee added to the staff roster successfully.' });
    } catch (err) {
      setAddEmpError(err?.response?.data?.message || err?.message || 'Failed to create employee.');
    }
  };

  const handleLeaveDecision = async (id, status, staffName) => {
    try {
      await updateLeaveStatus.mutateAsync({ id, status });
      setFeedback({
        type: 'success',
        message: `Leave request for ${staffName || 'employee'} has been ${status === 'APPROVED' ? 'approved' : 'rejected'}.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || err?.message || `Failed to ${status.toLowerCase()} leave request.`,
      });
    }
  };

  const handleRunPayroll = async () => {
    const now = new Date();
    try {
      await runPayroll.mutateAsync({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        allowances: 1500,
      });
      setFeedback({ type: 'success', message: 'Monthly payroll calculation completed successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to run payroll.' });
    }
  };

  // Filtered leaves
  const filteredLeaves = leaves.filter((lv) => {
    if (leaveStatusFilter === 'ALL') return true;
    return lv.status === leaveStatusFilter;
  });

  const pendingLeavesCount = leaves.filter((lv) => lv.status === 'PENDING').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">HR, Staff Roster & Leave Approvals</h1>
          <p className="text-xs text-slate-500">
            Staff management directory, leave approvals queue, and monthly payroll disbursement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50/70 p-1 rounded-xl flex text-xs font-bold border border-emerald-200/60">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'directory' ? 'bg-emerald-800 shadow-xs text-white' : 'text-emerald-900 hover:text-emerald-950 hover:bg-emerald-100/50'
              }`}
            >
              Staff Directory ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'leaves' ? 'bg-emerald-800 shadow-xs text-white' : 'text-emerald-900 hover:text-emerald-950 hover:bg-emerald-100/50'
              }`}
            >
              <span>Leave Queue</span>
              {pendingLeavesCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                  {pendingLeavesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'payroll' ? 'bg-emerald-800 shadow-xs text-white' : 'text-emerald-900 hover:text-emerald-950 hover:bg-emerald-100/50'
              }`}
            >
              Payroll
            </button>
          </div>

          {activeTab === 'directory' && (
            <button
              onClick={() => { setAddEmpError(''); setShowAddEmployee(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          )}

          {activeTab === 'payroll' && (
            <button
              onClick={handleRunPayroll}
              disabled={runPayroll.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {runPayroll.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              <span>Run Month Payroll</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer text-slate-500 hover:text-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Staff Personnel Directory</h3>
              <p className="text-[11px] text-slate-500">Active club employees across Management, Front Desk, Coaches, Bar, Kitchen, and Pro Shop.</p>
            </div>
            <span className="text-xs font-bold text-slate-500">{filteredEmployees.length} employees found</span>
          </div>

          {/* Search & Role Filter Toolbar */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name, emp no, role, or designation..."
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>

            {/* Quick Role Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: 'All Roles', val: 'ALL' },
                { label: 'Front Desk', val: 'FRONT_DESK' },
                { label: 'Coaches & Academies', val: 'COACHES' },
                { label: 'Bar & Café', val: 'BAR_STAFF' },
                { label: 'Kitchen', val: 'KITCHEN' },
                { label: 'Pro Shop', val: 'SHOP_STAFF' },
              ].map((rf) => (
                <button
                  key={rf.val}
                  onClick={() => setRoleFilter(rf.val)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    roleFilter === rf.val
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#e8f5e9] text-[#1b5e20] border-b-2 border-emerald-200/90 uppercase text-[11px] font-black tracking-wider whitespace-nowrap">
                  <th className="p-4">Emp No</th>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Leave Balance</th>
                  <th className="p-4">Monthly Salary</th>
                  <th className="p-4">Joining Date</th>
                  <th className="p-4 text-right">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStaff.map((emp) => (
                  <tr key={emp.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 whitespace-nowrap">{emp.employeeNo}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 whitespace-nowrap">{emp.user?.name}</div>
                      <div className="text-[10px] text-slate-400">{emp.user?.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ROLE_COLORS[emp.user?.role] || 'bg-slate-100 text-slate-700'}`}>
                        {emp.user?.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{emp.designation || 'Staff'}</td>
                    <td className="p-4">
                      <span className="inline-block whitespace-nowrap font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {emp.leaveBalance} days left
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900 whitespace-nowrap">{formatCurrency(Number(emp.salary))}/mo</td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(emp.joiningDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-4 text-right font-medium text-slate-600 whitespace-nowrap">{formatPhone(emp.user?.phone)}</td>
                  </tr>
                ))}
                {paginatedStaff.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No staff members matching search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {(() => {
            const totalCount = filteredEmployees.length;
            const currentLimit = staffPageSize === 'all' ? totalCount : Number(staffPageSize);
            const totalPages = Math.ceil(totalCount / currentLimit) || 1;
            const startIdx = totalCount > 0 ? (staffPage - 1) * currentLimit + 1 : 0;
            const endIdx = staffPageSize === 'all' ? totalCount : Math.min(staffPage * currentLimit, totalCount);

            return (
              <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 font-semibold flex items-center gap-2">
                  <span>
                    Showing <strong className="text-slate-900">{startIdx}</strong> to{' '}
                    <strong className="text-slate-900">{endIdx}</strong> of{' '}
                    <strong className="text-emerald-800 font-extrabold">{totalCount}</strong> employees
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-600">
                    <span>Show:</span>
                    <TablePageSizeSelect
                      value={staffPageSize}
                      onChange={(val) => setStaffPageSize(val === 'all' ? 'all' : Number(val))}
                      options={[10, 20, 50, 'all']}
                      totalCount={totalCount}
                    />
                  </div>

                  {staffPageSize !== 'all' && totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
                        disabled={staffPage <= 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <span className="px-3 py-1.5 font-extrabold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs">
                        Page {staffPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setStaffPage((p) => Math.min(totalPages, p + 1))}
                        disabled={staffPage >= totalPages}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: LEAVE QUEUE (Admin View: Review, Approve, Reject ONLY) */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          {/* Quick status filter pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
              </span>
              {[
                { label: 'All Requests', val: 'ALL', count: leaves.length },
                { label: 'Pending Approval', val: 'PENDING', count: pendingLeavesCount, highlight: true },
                { label: 'Approved', val: 'APPROVED', count: leaves.filter(l => l.status === 'APPROVED').length },
                { label: 'Rejected', val: 'REJECTED', count: leaves.filter(l => l.status === 'REJECTED').length },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => setLeaveStatusFilter(btn.val)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    leaveStatusFilter === btn.val
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-950'
                  }`}
                >
                  <span>{btn.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    leaveStatusFilter === btn.val
                      ? 'bg-white/20 text-white'
                      : btn.highlight && btn.count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {btn.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Staff apply from their portals. Admin reviews and takes decision below.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Staff Leave Requests Queue</h3>
                <p className="text-[11px] text-slate-500">Approve or reject leave applications submitted across all staff departments.</p>
              </div>
              <span className="text-xs font-bold text-slate-500">{filteredLeaves.length} applications shown</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#e8f5e9] text-[#1b5e20] border-b-2 border-emerald-200/90 uppercase text-[11px] font-black tracking-wider whitespace-nowrap">
                    <th className="p-4">Employee</th>
                    <th className="p-4">Leave Type</th>
                    <th className="p-4">Duration & Days</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Admin Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.map((lv) => (
                    <tr key={lv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 whitespace-nowrap">{lv.employee?.user?.name || 'Staff Member'}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                          <span className={`inline-block whitespace-nowrap px-2 py-0.2 rounded-full text-[9px] font-bold ${ROLE_COLORS[lv.employee?.user?.role] || 'bg-slate-100 text-slate-700'}`}>
                            {lv.employee?.user?.role?.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({lv.employee?.employeeNo})</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-bold border ${LEAVE_TYPE_COLORS[lv.type] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {lv.type}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {new Date(lv.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' → '}
                          {new Date(lv.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{lv.days} day{lv.days > 1 ? 's' : ''} requested</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-700 max-w-sm">
                        <p className="line-clamp-2 italic">"{lv.reason || 'No reason specified'}"</p>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                          lv.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          lv.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {lv.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                          {lv.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                          {lv.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          <span>{lv.status}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {lv.status === 'PENDING' ? (
                          <div className="inline-flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleLeaveDecision(lv.id, 'APPROVED', lv.employee?.user?.name)}
                              disabled={updateLeaveStatus.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                              title="Approve Leave Application"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleLeaveDecision(lv.id, 'REJECTED', lv.employee?.user?.name)}
                              disabled={updateLeaveStatus.isPending}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                              title="Reject Leave Application"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 italic">
                            Decision recorded
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredLeaves.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="font-bold text-slate-600">No leave applications found</div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {leaveStatusFilter === 'ALL'
                            ? 'When staff members apply for leave from their portals, requests will appear here.'
                            : `No leave requests matching status "${leaveStatusFilter}".`}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYROLL */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Monthly Payroll Sheets</h3>
              <p className="text-[11px] text-slate-500">Calculated with basic salary, attendance deductions, and allowances.</p>
            </div>
            <span className="text-xs font-bold text-slate-500">{payrolls.length} payslips</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#e8f5e9] text-[#1b5e20] border-b-2 border-emerald-200/90 uppercase text-[11px] font-black tracking-wider whitespace-nowrap">
                  <th className="p-4">Payslip #</th>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Month / Year</th>
                  <th className="p-4">Base Salary</th>
                  <th className="p-4">Deductions</th>
                  <th className="p-4">Net Payout</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPayrolls.map((pay) => (
                  <tr key={pay.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 whitespace-nowrap">{pay.payrollNo || pay.id.slice(0, 8)}</td>
                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{pay.employee?.user?.name || 'Staff'}</td>
                    <td className="p-4 text-slate-600 font-semibold whitespace-nowrap">{pay.month}/{pay.year}</td>
                    <td className="p-4 text-slate-700 whitespace-nowrap">{formatCurrency(Number(pay.basicSalary))}</td>
                    <td className="p-4 text-rose-700 whitespace-nowrap">-{formatCurrency(Number(pay.deductions || 0))}</td>
                    <td className="p-4 font-black text-emerald-900 whitespace-nowrap">{formatCurrency(Number(pay.netSalary))}</td>
                    <td className="p-4">
                      <span className={`inline-block whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold ${
                        pay.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {pay.status !== 'PAID' && (
                        <button
                          onClick={() => updatePayrollStatus.mutate({ id: pay.id, status: 'PAID' })}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                        >
                          Disburse & Mark Paid →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedPayrolls.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No payroll runs generated yet. Click "Run Month Payroll" above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Payroll */}
          {(() => {
            const totalCount = payrolls.length;
            const currentLimit = payrollPageSize === 'all' ? totalCount : Number(payrollPageSize);
            const totalPages = Math.ceil(totalCount / currentLimit) || 1;
            const startIdx = totalCount > 0 ? (payrollPage - 1) * currentLimit + 1 : 0;
            const endIdx = payrollPageSize === 'all' ? totalCount : Math.min(payrollPage * currentLimit, totalCount);

            return (
              <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 font-semibold flex items-center gap-2">
                  <span>
                    Showing <strong className="text-slate-900">{startIdx}</strong> to{' '}
                    <strong className="text-slate-900">{endIdx}</strong> of{' '}
                    <strong className="text-emerald-800 font-extrabold">{totalCount}</strong> payslips
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-600">
                    <span>Show:</span>
                    <TablePageSizeSelect
                      value={payrollPageSize}
                      onChange={(val) => setPayrollPageSize(val === 'all' ? 'all' : Number(val))}
                      options={[10, 20, 50, 'all']}
                      totalCount={totalCount}
                    />
                  </div>

                  {payrollPageSize !== 'all' && totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPayrollPage((p) => Math.max(1, p - 1))}
                        disabled={payrollPage <= 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <span className="px-3 py-1.5 font-extrabold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs">
                        Page {payrollPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPayrollPage((p) => Math.min(totalPages, p + 1))}
                        disabled={payrollPage >= totalPages}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {showAddEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add Staff Member</h3>
              <button onClick={() => setShowAddEmployee(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addEmpError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{addEmpError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1">Full Name</label>
                <input
                  required
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  placeholder="e.g. Vikram Joshi"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={empForm.email}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                    placeholder="vikram@bookmycourt.com"
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">Phone</label>
                  <input
                    required
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1">System Role</label>
                  <CustomSelect
                    value={empForm.role}
                    onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })}
                    options={[
                      { value: 'FRONT_DESK', label: 'Front Desk' },
                      { value: 'BAR_STAFF', label: 'Bar Staff' },
                      { value: 'KITCHEN', label: 'Kitchen' },
                      { value: 'SHOP_STAFF', label: 'Shop Staff' },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">Designation</label>
                  <input
                    required
                    value={empForm.designation}
                    onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value })}
                    placeholder="e.g. Head Barista"
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    required
                    value={empForm.salary}
                    onChange={(e) => setEmpForm({ ...empForm, salary: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">Portal Password</label>
                  <input
                    required
                    value={empForm.password}
                    onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createEmployee.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {createEmployee.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Employee to Roster
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
