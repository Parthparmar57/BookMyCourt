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
import { invoicesApi } from '../../../services/finance.service';
import { formatCurrency } from '../../../shared/utils/formatters';
import { 
  Receipt, 
  Download, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Filter, 
  CreditCard 
} from 'lucide-react';

const SOURCE_COLORS = {
  COURT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  SHOP: 'bg-blue-100 text-blue-800 border-blue-200',
  BAR: 'bg-amber-100 text-amber-800 border-amber-200',
  MEMBERSHIP: 'bg-purple-100 text-purple-800 border-purple-200',
  OTHER: 'bg-slate-100 text-slate-800 border-slate-200',
};

export const AccountingPage = () => {
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'invoices' | 'expenses'
  const [sourceFilter, setSourceFilter] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Queries
  const { data: ledgerData, isLoading: ledgerLoading } = useLedger(sourceFilter ? { source: sourceFilter } : {});
  const transactions = ledgerData?.transactions || [];
  const { data: summary } = useLedgerSummary();
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices();
  const invoices = invoicesData?.invoices || [];
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();

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

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
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
      setFeedback({ type: 'error', message: err?.message || 'Failed to create invoice.' });
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
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
      setFeedback({ type: 'error', message: err?.message || 'Failed to log expense.' });
    }
  };

  // Summaries
  const totalLedger = ledgerData?.totalAmount || summary?.total?.amount || 0;
  const totalTax = ledgerData?.totalTax || summary?.total?.tax || 0;
  const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);
  const netProfit = totalLedger - totalExpenses;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Ledger & Invoicing</h1>
          <p className="text-xs text-slate-500">
            Double-entry transaction audit, GST tax invoices with PDF export, and operational expense logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ledger' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ledger
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'invoices' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tax Invoices
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'expenses' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
          </div>

          {activeTab === 'invoices' && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          )}

          {activeTab === 'expenses' && (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>TOTAL INFLOW</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{formatCurrency(totalLedger)}</div>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Courts, Shop, Bar & Membership</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>GST TAX COLLECTED</span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-blue-900">{formatCurrency(totalTax)}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">18% GST Compliance</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>OPERATING EXPENSES</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-rose-900">{formatCurrency(totalExpenses)}</div>
          <p className="text-[10px] text-rose-600 mt-1 font-semibold">Facility, Equipment & Utilities</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>NET OPERATING MARGIN</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-900">{formatCurrency(netProfit)}</div>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Inflow minus expenses</p>
        </div>
      </div>

      {/* TAB 1: LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="font-extrabold text-sm text-slate-900">Transaction Audit Ledger</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 bg-white focus:outline-none"
              >
                <option value="">All Revenue Streams</option>
                <option value="COURT">Courts</option>
                <option value="SHOP">Pro Shop</option>
                <option value="BAR">Bar & Cafe</option>
                <option value="MEMBERSHIP">Membership</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
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
                {transactions.map((tx) => {
                  const gross = Number(tx.amount || 0) + Number(tx.tax || 0);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="p-4 font-mono font-bold text-slate-900">{tx.refNo || tx.id.slice(0, 8)}</td>
                      <td className="p-4 text-slate-600">
                        {new Date(tx.date || tx.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${SOURCE_COLORS[tx.source] || SOURCE_COLORS.OTHER}`}>
                          {tx.source}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">
                        {tx.member?.user?.name || tx.customerName || 'Walk-in Guest'}
                      </td>
                      <td className="p-4 font-bold text-slate-600">{tx.paymentMode || 'UPI'}</td>
                      <td className="p-4 text-slate-700">{formatCurrency(Number(tx.amount || 0))}</td>
                      <td className="p-4 text-slate-500">{formatCurrency(Number(tx.tax || 0))}</td>
                      <td className="p-4 text-right font-black text-slate-900">{formatCurrency(gross)}</td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No transactions recorded in the ledger yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">GST Tax Invoices</h3>
            <span className="text-xs text-slate-500">{invoices.length} invoices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
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
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70">
                    <td className="p-4 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{inv.companyName || inv.member?.user?.name || 'Private Client'}</div>
                      <div className="text-[10px] text-slate-500">{inv.clientEmail || inv.member?.user?.email}</div>
                    </td>
                    <td className="p-4 text-slate-600">{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-4 text-slate-700">{formatCurrency(Number(inv.amount))}</td>
                    <td className="p-4 text-slate-500">{formatCurrency(Number(inv.tax))}</td>
                    <td className="p-4 font-black text-slate-900">{formatCurrency(Number(inv.total))}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => recordPayment.mutate({ id: inv.id, paymentMode: 'UPI', amount: inv.total })}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadPdf(inv)}
                        disabled={downloadingId === inv.id}
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        {downloadingId === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No invoices issued yet. Click "Create Invoice" above to generate a GST bill.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Operational Club Expenses</h3>
            <span className="text-xs text-slate-500">{expenses.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Payee / Vendor</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70">
                    <td className="p-4 font-bold text-slate-900">{exp.category}</td>
                    <td className="p-4 text-slate-700">{exp.description}</td>
                    <td className="p-4 text-slate-500 font-semibold">{exp.payee || 'Direct Supplier'}</td>
                    <td className="p-4 font-black text-rose-800">{formatCurrency(Number(exp.amount))}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        exp.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {exp.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {exp.status !== 'PAID' && (
                        <button
                          onClick={() => markExpensePaid.mutate(exp.id)}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800"
                        >
                          Mark Paid →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No operational expenses logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Issue GST Tax Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {createInvoice.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Generate & Issue Tax Invoice
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
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white focus:border-emerald-600 focus:outline-none"
                >
                  <option value="MAINTENANCE">Facility Maintenance & Cleaning</option>
                  <option value="EQUIPMENT">Sports Gear & Court Equipment</option>
                  <option value="UTILITIES">Electricity, Water & AC</option>
                  <option value="KITCHEN_STOCK">Cafeteria Raw Materials</option>
                  <option value="SALARY">Staff Wages & Payroll</option>
                  <option value="OTHER">General Miscellaneous</option>
                </select>
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
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {createExpense.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Log Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
