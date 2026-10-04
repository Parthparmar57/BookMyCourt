import React, { useState } from 'react';
import { 
  useLedger, 
  useLedgerSummary, 
  useInvoices, 
  useCreateInvoice, 
  useRecordInvoicePayment, 
  useExpenses, 
  useCreateExpense, 
  useMarkExpensePaid 
} from '../../../hooks/useFinance';
import { useRevenueReport } from '../../../hooks/useDashboard';
import { invoicesApi } from '../../../services/finance.service';
import { reportsApi } from '../../../services/dashboard.service';
import { formatCurrency } from '../../../shared/utils/formatters';
import { CustomSelect } from '../../../shared/components/CustomSelect';
import { 
  Receipt, 
  Download, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Filter,
  CreditCard,
  FileSpreadsheet,
  FileDown,
  BarChart3,
  RefreshCw
} from 'lucide-react';

const SOURCE_COLORS = {
  COURT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  SHOP: 'bg-sky-50 text-sky-800 border-sky-200',
  BAR: 'bg-amber-50 text-amber-800 border-amber-200',
  MEMBERSHIP: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  OTHER: 'bg-slate-50 text-slate-800 border-slate-200',
};

export const AccountingPage = () => {
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'invoices' | 'expenses' | 'reports'
  const [sourceFilter, setSourceFilter] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [expenseError, setExpenseError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [reportDownloading, setReportDownloading] = useState(''); // which report file is downloading

  // Ledger Pagination State
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(20);

  // Invoices Pagination State
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(20);

  // Queries
  const { 
    data: ledgerData, 
    isLoading: ledgerLoading, 
    isError: ledgerError, 
    refetch: refetchLedger 
  } = useLedger({
    ...(sourceFilter ? { source: sourceFilter } : {}),
    page: ledgerPage,
    limit: ledgerPageSize === 'all' ? 1000 : ledgerPageSize,
  });
  const transactions = ledgerData?.transactions || ledgerData?.items || [];
  const totalCount = ledgerData?.total ?? transactions.length;
  const totalPages = ledgerData?.totalPages || Math.ceil(totalCount / (ledgerPageSize === 'all' ? 1000 : ledgerPageSize)) || 1;

  const { data: summary } = useLedgerSummary();

  const { 
    data: invoicesData, 
    isLoading: invoicesLoading, 
    isError: invoicesError, 
    refetch: refetchInvoices 
  } = useInvoices({
    page: invoicePage,
    limit: invoicePageSize === 'all' ? 1000 : invoicePageSize,
  });
  const invoices = invoicesData?.invoices || invoicesData?.items || [];
  const invoiceTotalCount = invoicesData?.total ?? invoices.length;
  const invoiceTotalPages = invoicesData?.totalPages || Math.ceil(invoiceTotalCount / (invoicePageSize === 'all' ? 1000 : invoicePageSize)) || 1;

  const { 
    data: expensesData, 
    isLoading: expensesLoading, 
    isError: expensesError, 
    refetch: refetchExpenses 
  } = useExpenses();
  const expenses = Array.isArray(expensesData) ? expensesData : expensesData?.expenses || expensesData?.items || [];

  const { data: revenueReport, isLoading: revenueLoading } = useRevenueReport();

  // Mutations
  const createInvoice = useCreateInvoice();
  const recordPayment = useRecordInvoicePayment();
  const createExpense = useCreateExpense();
  const markExpensePaid = useMarkExpensePaid();

  // Invoice Form State
  const [invoiceForm, setInvoiceForm] = useState({
    clientEmail: '',
    companyName: 'Private Client',
    description: 'Corporate Tournament & Court Booking',
    unitPrice: '5000',
    quantity: '1',
    taxPct: '18',
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  });

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    category: 'MAINTENANCE',
    description: 'Synthetic Court Cleaning & Relining',
    amount: '8500',
    payee: 'Apex Surfaces Ltd',
  });

  const handleDownloadPdf = async (invoice) => {
    try {
      setDownloadingId(invoice.id);
      const res = await invoicesApi.downloadPdf(invoice.id);
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoiceNo || 'invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Could not download PDF invoice.' });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadReport = async (key, fetchFn, baseName, mime) => {
    try {
      setReportDownloading(key);
      const res = await fetchFn();
      const blob = new Blob([res], { type: mime });
      const url = window.URL.createObjectURL(blob);
      const ext = mime === 'application/pdf' ? 'pdf' : 'xlsx';
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${baseName}_${new Date().toISOString().split('T')[0]}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Could not download the report.' });
    } finally {
      setReportDownloading('');
    }
  };

  const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const PDF_MIME = 'application/pdf';

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setInvoiceError('');
    try {
      await createInvoice.mutateAsync({
        clientEmail: invoiceForm.clientEmail,
        companyName: invoiceForm.companyName,
        dueDate: invoiceForm.dueDate,
        items: [
          {
            description: invoiceForm.description,
            quantity: Number(invoiceForm.quantity),
            unitPrice: Number(invoiceForm.unitPrice),
            taxPct: Number(invoiceForm.taxPct),
          },
        ],
      });
      setShowInvoiceModal(false);
      setFeedback({ type: 'success', message: 'GST Tax Invoice issued successfully.' });
    } catch (err) {
      setInvoiceError(err?.response?.data?.message || err?.message || 'Failed to create invoice.');
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setExpenseError('');
    try {
      await createExpense.mutateAsync({
        category: expenseForm.category,
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        payee: expenseForm.payee,
      });
      setShowExpenseModal(false);
      setFeedback({ type: 'success', message: 'Operational expense recorded.' });
    } catch (err) {
      setExpenseError(err?.response?.data?.message || err?.message || 'Failed to log expense.');
    }
  };

  // Summaries
  const totalLedger = Number(summary?.totalRevenue || ledgerData?.totalAmount || transactions.reduce((acc, tx) => acc + Number(tx.amount || 0), 0));
  const totalTax = Number(ledgerData?.totalTax || Math.round(totalLedger * 0.1438) || 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);
  const netProfit = totalLedger - totalExpenses;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Ledger & Invoicing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Double-entry transaction audit, GST tax invoices with PDF export, and operational expense logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Synchronized Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold border border-slate-200/60">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'ledger' 
                  ? 'bg-white shadow-xs text-[#1b5e20] font-black' 
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              Ledger
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'invoices' 
                  ? 'bg-white shadow-xs text-[#1b5e20] font-black' 
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              Tax Invoices
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'expenses' 
                  ? 'bg-white shadow-xs text-[#1b5e20] font-black' 
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'reports' 
                  ? 'bg-white shadow-xs text-[#1b5e20] font-black' 
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              Reports
            </button>
          </div>

          {activeTab === 'invoices' && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          )}

          {activeTab === 'expenses' && (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer hover:opacity-75"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>TOTAL INFLOW</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{formatCurrency(totalLedger)}</div>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Courts, Shop, Bar & Membership</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>GST TAX COLLECTED</span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-blue-900">{formatCurrency(totalTax)}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">18% GST Compliance</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>OPERATING EXPENSES</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-rose-900">{formatCurrency(totalExpenses)}</div>
          <p className="text-[10px] text-rose-600 mt-1 font-semibold">Facility, Equipment & Utilities</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>NET OPERATING MARGIN</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-900">{formatCurrency(netProfit)}</div>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Inflow minus expenses</p>
        </div>
      </div>

      {/* TAB 1: LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-0">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Transaction Audit Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live double-entry audit records across all club revenue centers</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#1b5e20] border border-emerald-200">
                {totalCount} Records
              </span>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <CustomSelect
                  value={sourceFilter}
                  onChange={(e) => {
                    setSourceFilter(e.target.value);
                    setLedgerPage(1);
                  }}
                  options={[
                    { value: '', label: 'All Revenue Streams' },
                    { value: 'COURT', label: 'Courts' },
                    { value: 'SHOP', label: 'Pro Shop' },
                    { value: 'BAR', label: 'Bar & Cafe' },
                    { value: 'MEMBERSHIP', label: 'Membership' },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#e8f5e9] text-[#1b5e20] border-b-2 border-emerald-200/90 uppercase text-[10px] font-black tracking-wider">
                  <th className="p-4">Ref / Txn No</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Customer / Member</th>
                  <th className="p-4">Mode</th>
                  <th className="p-4">Net Amount</th>
                  <th className="p-4">Tax (GST)</th>
                  <th className="p-4 text-right">Gross Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Loading Skeleton */}
                {ledgerLoading && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                        <td className="p-4 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                      </tr>
                    ))}
                  </>
                )}

                {/* Error State */}
                {!ledgerLoading && ledgerError && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        <span className="text-xs font-bold text-rose-700">Unable to load transactions from ledger.</span>
                        <button
                          onClick={() => refetchLedger()}
                          className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#1b5e20] border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data Rows */}
                {!ledgerLoading && !ledgerError && transactions.map((tx) => {
                  const gross = Number(tx.amount || 0) + Number(tx.tax || 0);
                  const customerName = tx.member?.user?.name || tx.customerName || (tx.source === 'SHOP' ? 'Pro Shop Retail' : tx.source === 'BAR' ? 'Cafeteria Guest' : 'Walk-in Guest');
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {tx.transactionNo || tx.reference || tx.refNo || `#${tx.id.slice(0, 8)}`}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {new Date(tx.date || tx.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border shadow-2xs ${SOURCE_COLORS[tx.source] || SOURCE_COLORS.OTHER}`}>
                          {tx.source}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {customerName}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[10px] border border-slate-200">
                          {tx.paymentMode || 'UPI'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 font-mono font-bold">{formatCurrency(Number(tx.amount || 0))}</td>
                      <td className="p-4 text-slate-500 font-mono">{formatCurrency(Number(tx.tax || 0))}</td>
                      <td className="p-4 text-right font-black text-slate-900 font-mono">{formatCurrency(gross)}</td>
                    </tr>
                  );
                })}

                {/* Empty State */}
                {!ledgerLoading && !ledgerError && transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Receipt className="w-8 h-8 text-slate-300" />
                        <span className="text-sm font-semibold text-slate-600">No transactions recorded in the ledger yet.</span>
                        <span className="text-xs text-slate-400">Transactions from court bookings, shop orders, cafeteria, and memberships will appear here.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Ledger Pagination Bar */}
          {!ledgerLoading && totalCount > 0 && (
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-600 bg-slate-50/60">
              <div>
                Showing <strong className="text-slate-900">{((ledgerPage - 1) * (ledgerPageSize === 'all' ? totalCount : ledgerPageSize)) + 1}</strong> to{' '}
                <strong className="text-slate-900">{Math.min(ledgerPage * (ledgerPageSize === 'all' ? totalCount : ledgerPageSize), totalCount)}</strong> of{' '}
                <strong className="text-emerald-800 font-black">{totalCount}</strong> transactions
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Show:</span>
                  <select
                    value={ledgerPageSize}
                    onChange={(e) => {
                      setLedgerPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                      setLedgerPage(1);
                    }}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value="all">All ({totalCount})</option>
                  </select>
                </div>

                {ledgerPageSize !== 'all' && totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                      disabled={ledgerPage <= 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1.5 font-extrabold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs">
                      Page {ledgerPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setLedgerPage((p) => Math.min(totalPages, p + 1))}
                      disabled={ledgerPage >= totalPages}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-0">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">GST Tax Invoices</h3>
              <p className="text-xs text-slate-500 mt-0.5">Official tax invoices with PDF export for memberships and corporate tournaments</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#1b5e20] border border-emerald-200">
                {invoiceTotalCount} Invoices
              </span>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Invoice</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                {/* Synchronized Light-Green Table Header */}
                <tr className="bg-[#e8f5e9] text-[#1b5e20] border-b-2 border-emerald-200/90 uppercase text-[10px] font-black tracking-wider">
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Client / Entity</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">GST (18%)</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Loading Skeleton */}
                {invoicesLoading && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-14"></div></td>
                        <td className="p-4 text-right"><div className="h-4 bg-slate-200 rounded w-24 ml-auto"></div></td>
                      </tr>
                    ))}
                  </>
                )}

                {/* Error State */}
                {!invoicesLoading && invoicesError && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        <span className="text-xs font-bold text-rose-700">Unable to load tax invoices.</span>
                        <button
                          onClick={() => refetchInvoices()}
                          className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#1b5e20] border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data Rows */}
                {!invoicesLoading && !invoicesError && invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{inv.companyName || inv.member?.user?.name || 'Private Client'}</div>
                      <div className="text-[10px] text-slate-500">{inv.clientEmail || inv.member?.user?.email}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-4 text-slate-700 font-mono font-bold">{formatCurrency(Number(inv.amount))}</td>
                    <td className="p-4 text-slate-500 font-mono">{formatCurrency(Number(inv.tax))}</td>
                    <td className="p-4 font-black text-slate-900 font-mono">{formatCurrency(Number(inv.total))}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border shadow-2xs uppercase ${
                        inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        inv.status === 'OVERDUE' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => recordPayment.mutate({ id: inv.id, paymentMode: 'UPI', amount: inv.total })}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#1b5e20] hover:text-[#2e7d32] bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadPdf(inv)}
                        disabled={downloadingId === inv.id}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                      >
                        {downloadingId === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {!invoicesLoading && !invoicesError && invoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Receipt className="w-8 h-8 text-slate-300" />
                        <span className="text-sm font-semibold text-slate-600">No invoices issued yet.</span>
                        <span className="text-xs text-slate-400">Click "Create Invoice" above to generate a GST compliant bill.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Invoices Pagination Bar */}
          {!invoicesLoading && invoiceTotalCount > 0 && (
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-600 bg-slate-50/60">
              <div>
                Showing <strong className="text-slate-900">{((invoicePage - 1) * (invoicePageSize === 'all' ? invoiceTotalCount : invoicePageSize)) + 1}</strong> to{' '}
                <strong className="text-slate-900">{Math.min(invoicePage * (invoicePageSize === 'all' ? invoiceTotalCount : invoicePageSize), invoiceTotalCount)}</strong> of{' '}
                <strong className="text-emerald-800 font-black">{invoiceTotalCount}</strong> invoices
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Show:</span>
                  <select
                    value={invoicePageSize}
                    onChange={(e) => {
                      setInvoicePageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                      setInvoicePage(1);
                    }}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value="all">All ({invoiceTotalCount})</option>
                  </select>
                </div>

                {invoicePageSize !== 'all' && invoiceTotalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                      disabled={invoicePage <= 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1.5 font-extrabold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs">
                      Page {invoicePage} of {invoiceTotalPages}
                    </span>
                    <button
                      onClick={() => setInvoicePage((p) => Math.min(invoiceTotalPages, p + 1))}
                      disabled={invoicePage >= invoiceTotalPages}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-0">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Operational Club Expenses</h3>
              <p className="text-xs text-slate-500 mt-0.5">Facility upkeep, utilities, equipment purchases, and maintenance logs</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#1b5e20] border border-emerald-200">
                {expenses.length} Records
              </span>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log Expense</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                {/* Synchronized Light-Green Table Header */}
                <tr className="bg-[#e8f5e9] text-[#1b5e20] border-b-2 border-emerald-200/90 uppercase text-[10px] font-black tracking-wider">
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Payee / Vendor</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Loading Skeleton */}
                {expensesLoading && (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                        <td className="p-4 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                      </tr>
                    ))}
                  </>
                )}

                {/* Error State */}
                {!expensesLoading && expensesError && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        <span className="text-xs font-bold text-rose-700">Unable to load expense records.</span>
                        <button
                          onClick={() => refetchExpenses()}
                          className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#1b5e20] border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data Rows */}
                {!expensesLoading && !expensesError && expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border shadow-2xs bg-slate-100 text-slate-800 border-slate-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{exp.description}</td>
                    <td className="p-4 text-slate-600 font-medium">{exp.payee || exp.vendor || 'Direct Supplier'}</td>
                    <td className="p-4 font-black text-rose-800 font-mono">{formatCurrency(Number(exp.amount))}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border shadow-2xs uppercase ${
                        exp.status === 'PAID' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {exp.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {exp.status !== 'PAID' && (
                        <button
                          onClick={() => markExpensePaid.mutate(exp.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#1b5e20] hover:text-[#2e7d32] bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {!expensesLoading && !expensesError && expenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <TrendingDown className="w-8 h-8 text-slate-300" />
                        <span className="text-sm font-semibold text-slate-600">No operational expenses logged yet.</span>
                        <span className="text-xs text-slate-400">Click "Log Expense" above to record maintenance, utility, or equipment bills.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Revenue Analytics Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                <h3 className="font-extrabold text-sm text-slate-900">Revenue & Inflow Breakdown</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#1b5e20] border border-emerald-200">
                All-Time Audit
              </span>
            </div>

            {revenueLoading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-emerald-600" />
                <span className="text-xs font-bold text-slate-600">Loading consolidated revenue analytics…</span>
              </div>
            ) : (
              <div className="p-5 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#e8f5e9]/50 border border-emerald-200 p-4 rounded-2xl">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Total Revenue</div>
                    <div className="text-xl font-black text-emerald-950 mt-1">{formatCurrency(Number(revenueReport?.totalRevenue || 0))}</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl">
                    <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Total Tax (GST)</div>
                    <div className="text-xl font-black text-blue-900 mt-1">{formatCurrency(Number(revenueReport?.totalTax || 0))}</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Transactions</div>
                    <div className="text-xl font-black text-slate-900 mt-1">{revenueReport?.totalTransactions || 0}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* By Source */}
                  <div className="border border-slate-200/90 rounded-2xl overflow-hidden">
                    <div className="bg-[#e8f5e9] text-[#1b5e20] border-b border-emerald-200/90 uppercase text-[10px] font-black tracking-wider px-4 py-2.5 flex items-center justify-between">
                      <span>Revenue by Department</span>
                      <span>Amount</span>
                    </div>
                    <div className="divide-y divide-slate-100 bg-white">
                      {(revenueReport?.bySource || []).map((s) => (
                        <div key={s.source} className="flex items-center justify-between px-4 py-3 text-xs">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border shadow-2xs ${SOURCE_COLORS[s.source] || SOURCE_COLORS.OTHER}`}>
                            {s.source}
                          </span>
                          <span className="font-mono font-black text-slate-900">{formatCurrency(Number(s.amount || 0))}</span>
                        </div>
                      ))}
                      {(!revenueReport?.bySource || revenueReport.bySource.length === 0) && (
                        <div className="px-4 py-6 text-center text-slate-400 text-xs">No department revenue recorded yet.</div>
                      )}
                    </div>
                  </div>

                  {/* By Payment Mode */}
                  <div className="border border-slate-200/90 rounded-2xl overflow-hidden">
                    <div className="bg-[#e8f5e9] text-[#1b5e20] border-b border-emerald-200/90 uppercase text-[10px] font-black tracking-wider px-4 py-2.5 flex items-center justify-between">
                      <span>Revenue by Payment Mode</span>
                      <span>Amount</span>
                    </div>
                    <div className="divide-y divide-slate-100 bg-white">
                      {(revenueReport?.byPaymentMode || []).map((m) => (
                        <div key={m.mode} className="flex items-center justify-between px-4 py-3 text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            {m.mode}
                          </span>
                          <span className="font-mono font-black text-slate-900">{formatCurrency(Number(m.amount || 0))}</span>
                        </div>
                      ))}
                      {(!revenueReport?.byPaymentMode || revenueReport.byPaymentMode.length === 0) && (
                        <div className="px-4 py-6 text-center text-slate-400 text-xs">No payment modes recorded yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Downloadable Reports Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-white">
              <h3 className="font-extrabold text-sm text-slate-900">Export & Share Reports</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Download structured financial datasets as Excel spreadsheets or printable PDF audits.</p>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Revenue Report', xlsx: reportsApi.exportRevenue, pdf: reportsApi.pdfRevenue, base: 'Revenue_Report' },
                { title: 'GST Tax Summary', xlsx: reportsApi.exportTax, pdf: null, base: 'Tax_Report' },
                { title: 'Inventory Valuation', xlsx: reportsApi.exportInventory, pdf: reportsApi.pdfInventory, base: 'Inventory_Report' },
                { title: 'Membership Inflow', xlsx: reportsApi.exportMembership, pdf: reportsApi.pdfMembership, base: 'Membership_Report' },
              ].map((r) => (
                <div key={r.base} className="border border-slate-200/90 rounded-2xl p-4 space-y-3 bg-white hover:border-emerald-300 transition-colors">
                  <h4 className="font-extrabold text-sm text-slate-900">{r.title}</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDownloadReport(`${r.base}-xlsx`, r.xlsx, r.base, XLSX_MIME)}
                      disabled={reportDownloading === `${r.base}-xlsx`}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#1b5e20] bg-[#e8f5e9] hover:bg-[#c8e6c9] border border-emerald-200/90 px-3 py-2 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {reportDownloading === `${r.base}-xlsx` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />}
                      <span>Export Excel</span>
                    </button>
                    {r.pdf && (
                      <button
                        onClick={() => handleDownloadReport(`${r.base}-pdf`, r.pdf, r.base, PDF_MIME)}
                        disabled={reportDownloading === `${r.base}-pdf`}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/90 px-3 py-2 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        {reportDownloading === `${r.base}-pdf` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-blue-700" />}
                        <span>Export PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Issue GST Tax Invoice</h3>
              <button onClick={() => { setShowInvoiceModal(false); setInvoiceError(''); }} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {invoiceError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{invoiceError}</span>
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1">Company / Client Name</label>
                <input
                  required
                  value={invoiceForm.companyName}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, companyName: e.target.value })}
                  placeholder="e.g. Infosys Sports Council"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Client Email</label>
                <input
                  type="email"
                  required
                  value={invoiceForm.clientEmail}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, clientEmail: e.target.value })}
                  placeholder="accounts@client.com"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Line Description</label>
                <input
                  required
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.unitPrice}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, unitPrice: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.quantity}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, quantity: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">GST Tax %</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.taxPct}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, taxPct: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createInvoice.isPending}
                className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-extrabold py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {createInvoice.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Generate & Issue Tax Invoice</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Record Operational Expense</h3>
              <button onClick={() => { setShowExpenseModal(false); setExpenseError(''); }} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {expenseError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{expenseError}</span>
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1">Expense Category</label>
                <CustomSelect
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  options={[
                    { value: 'MAINTENANCE', label: 'Facility Maintenance & Cleaning' },
                    { value: 'EQUIPMENT', label: 'Sports Gear & Court Equipment' },
                    { value: 'UTILITIES', label: 'Electricity, Water & AC' },
                    { value: 'KITCHEN_STOCK', label: 'Cafeteria Raw Materials' },
                    { value: 'SALARY', label: 'Staff Wages & Payroll' },
                    { value: 'OTHER', label: 'General Miscellaneous' },
                  ]}
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Description</label>
                <input
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="e.g. LED court floodlight replacement"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Payee / Vendor</label>
                <input
                  required
                  value={expenseForm.payee}
                  onChange={(e) => setExpenseForm({ ...expenseForm, payee: e.target.value })}
                  placeholder="e.g. Apex Surfaces Ltd"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createExpense.isPending}
                className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-extrabold py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {createExpense.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Log Expense</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
