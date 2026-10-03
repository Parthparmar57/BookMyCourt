import React, { useState } from 'react';
import { 
  useLeads, 
  useCreateLead, 
  useUpdateLead, 
  useAddFollowUp, 
  useCreateQuotation, 
  useSendQuote,
  useUpdateQuotationStatus,
  useConvertLead, 
  useEnquiries, 
  useUpdateEnquiryStatus 
} from '../../../hooks/useCrm';
import { usePlans } from '../../../hooks/useMembership';
import { formatCurrency, formatPhone } from '../../../shared/utils/formatters';
import { 
  Kanban, 
  Plus, 
  UserCheck, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Mail, 
  Clock, 
  Inbox,
  Filter,
  Users,
  Send,
  FileText,
  IndianRupee,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';

const STAGES = [
  { id: 'NEW', label: 'New Leads', color: 'border-blue-400 bg-blue-50/60 text-blue-700' },
  { id: 'CONTACTED', label: 'Contacted', color: 'border-amber-400 bg-amber-50/60 text-amber-700' },
  { id: 'QUOTED', label: 'Quotation Sent', color: 'border-purple-400 bg-purple-50/60 text-purple-700' },
  { id: 'WON', label: 'Won / Converted', color: 'border-emerald-500 bg-emerald-50/60 text-emerald-800' },
  { id: 'LOST', label: 'Lost / Closed', color: 'border-slate-300 bg-slate-100/60 text-slate-600' },
];

const STAGE_ORDER = {
  NEW: 0,
  CONTACTED: 1,
  QUOTED: 2,
  WON: 3,
  LOST: 4,
};

const isForwardMove = (currentStage, targetStage) => {
  if (!currentStage || !targetStage || currentStage === targetStage) return false;
  if (currentStage === 'WON' || currentStage === 'LOST') return false;
  const currIdx = STAGE_ORDER[currentStage] ?? -1;
  const targetIdx = STAGE_ORDER[targetStage] ?? -1;
  return targetIdx > currIdx;
};

export const CrmPage = () => {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'enquiries'
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Drag and Drop state
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Column expansion state (max 5 cards shown by default per column)
  const [expandedStages, setExpandedStages] = useState({});

  const toggleExpandStage = (stageId) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  // Queries
  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const leads = leadsData?.items || [];
  const { data: enquiries = [], isLoading: enquiriesLoading } = useEnquiries();
  const { data: plans = [] } = usePlans();

  // Mutations
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const addFollowUp = useAddFollowUp();
  const createQuotation = useCreateQuotation();
  const sendQuote = useSendQuote();
  const updateQuotationStatus = useUpdateQuotationStatus();
  const convertLead = useConvertLead();
  const updateEnquiryStatus = useUpdateEnquiryStatus();

  // Quotation Modal State
  const [quoteForm, setQuoteForm] = useState({
    email: '',
    planId: '',
    packageName: 'Gold Membership Annual Package',
    amount: '12000',
    discount: '1200',
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    notes: 'Includes full access to indoor courts, gym facility, 10% cafe discount, and 1 free coaching trial.',
  });

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    interest: 'Badminton',
    notes: '',
    source: 'WEBSITE',
  });

  // Follow-up form
  const [followUp, setFollowUp] = useState({
    type: 'CALL',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Convert form
  const [convertForm, setConvertForm] = useState({
    planId: '',
    dob: '1995-05-15',
    startDate: new Date().toISOString().split('T')[0],
    password: 'Password@123',
    emergencyContact: '',
    sendConfirmationEmail: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [convertError, setConvertError] = useState('');
  const [addLeadError, setAddLeadError] = useState('');
  const [quoteError, setQuoteError] = useState('');
  const [followUpError, setFollowUpError] = useState('');

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setAddLeadError('');
    if (!newLead.name.trim() || !newLead.phone.trim()) return;
    try {
      await createLead.mutateAsync(newLead);
      setShowAddLeadModal(false);
      setNewLead({ name: '', phone: '', email: '', interest: 'Badminton', notes: '', source: 'WALK_IN' });
      setFeedback({ type: 'success', message: 'New sales lead added to pipeline.' });
    } catch (err) {
      setAddLeadError(err?.response?.data?.message || err?.message || 'Failed to create lead.');
    }
  };

  const handleStageMove = async (leadId, newStage) => {
    try {
      const targetLead = leads.find((l) => l.id === leadId);

      if (newStage === 'WON' && targetLead) {
        setSelectedLead(targetLead);
        const selectedPlan = plans[0];
        setConvertForm({
          planId: selectedPlan?.id || '',
          dob: '1995-05-15',
          startDate: new Date().toISOString().split('T')[0],
          password: 'Password@123',
          emergencyContact: targetLead.phone || '',
          sendConfirmationEmail: true,
        });
        setShowPassword(false);
        setConvertError('');
        setShowConvertModal(true);
        return;
      }

      await updateLead.mutateAsync({ id: leadId, stage: newStage });
      setFeedback({ type: 'success', message: `Lead moved to ${newStage}.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || err?.message || 'Could not update lead stage.' });
    }
  };

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.setData('application/json', JSON.stringify({ leadId: lead.id, stage: lead.stage }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    if (draggedLead && isForwardMove(draggedLead.stage, stageId)) {
      e.dataTransfer.dropEffect = 'move';
      if (dragOverStage !== stageId) {
        setDragOverStage(stageId);
      }
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = (e, stageId) => {
    e.preventDefault();
    if (dragOverStage === stageId) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    setDragOverStage(null);

    let leadToMove = draggedLead;
    if (!leadToMove) {
      const rawData = e.dataTransfer.getData('application/json');
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          leadToMove = leads.find((l) => l.id === parsed.leadId);
        } catch (err) {}
      }
    }

    if (!leadToMove) return;

    if (!isForwardMove(leadToMove.stage, targetStage)) {
      setFeedback({
        type: 'error',
        message: 'Reverse stage movement is not allowed. Leads can only move forward in the sales pipeline.',
      });
      setDraggedLead(null);
      return;
    }

    setDraggedLead(null);
    handleStageMove(leadToMove.id, targetStage);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    setFollowUpError('');
    if (!selectedLead || !followUp.notes.trim()) return;
    try {
      await addFollowUp.mutateAsync({
        id: selectedLead.id,
        date: followUp.date,
        type: followUp.type,
        notes: followUp.notes,
      });
      setShowFollowUpModal(false);
      setFollowUp({ type: 'CALL', notes: '', date: new Date().toISOString().split('T')[0] });
      setFeedback({ type: 'success', message: 'Follow-up interaction logged.' });
    } catch (err) {
      setFollowUpError(err?.response?.data?.message || err?.message || 'Failed to log follow-up.');
    }
  };

  // Open the quote builder for a lead
  const openQuoteModal = (lead) => {
    setSelectedLead(lead);
    setQuoteError('');
    const selectedPlan = plans[0];
    setQuoteForm({
      email: lead.email || '',
      planId: selectedPlan?.id || '',
      packageName: selectedPlan ? `${selectedPlan.name} Membership Package` : 'Champions Club Custom Package',
      amount: selectedPlan ? String(selectedPlan.price) : '10000',
      discount: '1000',
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      notes: 'Includes unlimited court booking access, gym, member cafeteria discount, and free trial coaching session.',
    });
    setShowQuoteModal(true);
  };

  const handleSendQuoteSubmit = async (e) => {
    e.preventDefault();
    setQuoteError('');
    if (!selectedLead || !quoteForm.email.trim()) return;

    try {
      await sendQuote.mutateAsync({
        id: selectedLead.id,
        email: quoteForm.email.trim(),
        planId: quoteForm.planId || undefined,
        packageName: quoteForm.packageName,
        amount: Number(quoteForm.amount),
        discount: Number(quoteForm.discount || 0),
        validUntil: quoteForm.validUntil,
        notes: quoteForm.notes,
      });

      setShowQuoteModal(false);
      setFeedback({
        type: 'success',
        message: `Official Quotation email successfully dispatched to ${quoteForm.email}. Lead stage moved to Quotation Sent.`,
      });
    } catch (err) {
      setQuoteError(err?.response?.data?.message || err?.message || 'Failed to send quotation email.');
    }
  };

  const handleUpdateQuoteStatus = async (quotationId, status) => {
    try {
      await updateQuotationStatus.mutateAsync({ quotationId, status });
      setFeedback({ type: 'success', message: `Quotation marked ${status}.` });

      if (status === 'ACCEPTED') {
        const targetLead = leads.find((l) => l.quotations?.some((q) => q.id === quotationId));
        if (targetLead) {
          const quoteObj = targetLead.quotations?.find((q) => q.id === quotationId);
          const matchedPlanId = quoteObj?.planId || plans[0]?.id || '';
          setSelectedLead(targetLead);
          setConvertForm({
            planId: matchedPlanId,
            dob: '1995-05-15',
            startDate: new Date().toISOString().split('T')[0],
            password: 'Password@123',
            emergencyContact: targetLead.phone || '',
            sendConfirmationEmail: true,
          });
          setShowPassword(false);
          setConvertError('');
          setShowConvertModal(true);
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || err?.message || 'Could not update quotation.' });
    }
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    setConvertError('');

    const targetPlanId = convertForm.planId || plans[0]?.id;
    const plan = plans.find((p) => p.id === targetPlanId);
    if (plan?.maxAge && convertForm.dob) {
      const age = Math.floor((Date.now() - new Date(convertForm.dob).getTime()) / (365.25 * 24 * 3600 * 1000));
      if (age >= plan.maxAge) {
        setConvertError(`Member age is ${age}. ${plan.name} plan requires age under ${plan.maxAge}.`);
        return;
      }
    }

    try {
      await convertLead.mutateAsync({
        id: selectedLead.id,
        planId: targetPlanId,
        dob: convertForm.dob,
        startDate: convertForm.startDate,
        password: convertForm.password,
        emergencyContact: convertForm.emergencyContact,
        sendConfirmationEmail: convertForm.sendConfirmationEmail !== false,
      });
      setShowConvertModal(false);
      setFeedback({
        type: 'success',
        message: `Successfully converted ${selectedLead.name} to active Member! ${
          convertForm.sendConfirmationEmail !== false ? 'Welcome & login credentials email dispatched.' : ''
        }`,
      });
    } catch (err) {
      setConvertError(err?.response?.data?.message || err?.message || 'Lead conversion failed.');
    }
  };

  const handleEnquiryStatus = async (id, status) => {
    try {
      await updateEnquiryStatus.mutateAsync({ id, status });
      setFeedback({ type: 'success', message: `Enquiry status updated to ${status}.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || err?.message || 'Failed to update enquiry status.' });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase font-mono tracking-wider">
              CRM & SALES PIPELINE
            </span>
            <span className="text-xs text-slate-400 font-medium">Scene 5 · Front Desk & Concierge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Leads, Enquiries & Quotations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track prospective members from website visitor to contacted, formal quote, and won conversion.
          </p>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'pipeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-4 h-4 text-emerald-600" />
              <span>Sales Pipeline ({leads.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('enquiries')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'enquiries' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Inbox className="w-4 h-4 text-blue-600" />
              <span>Web Enquiries ({enquiries.length})</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddLeadModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in ${
            feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* PIPELINE KANBAN VIEW */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id);
            const isTargeted = dragOverStage === stage.id && draggedLead && isForwardMove(draggedLead.stage, stage.id);
            const isExpanded = !!expandedStages[stage.id];
            const visibleLeads = isExpanded ? stageLeads : stageLeads.slice(0, 5);
            const hiddenCount = stageLeads.length - 5;
            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={(e) => handleDragLeave(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col min-h-[500px] transition-all ${
                  isTargeted ? 'ring-2 ring-emerald-500 bg-emerald-50/50 border-emerald-400 shadow-md' : ''
                }`}
              >
                <div className={`flex items-center justify-between pb-2 mb-3 border-b ${stage.color} font-extrabold text-xs px-2.5 py-1.5 rounded-xl`}>
                  <span>{stage.label}</span>
                  <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-black">{stageLeads.length}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {visibleLeads.map((lead) => {
                    const isBeingDragged = draggedLead?.id === lead.id;
                    const canDrag = lead.stage !== 'WON' && lead.stage !== 'LOST';
                    return (
                      <div
                        key={lead.id}
                        draggable={canDrag}
                        onDragStart={(e) => handleDragStart(e, lead)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all space-y-2.5 ${
                          canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                        } ${isBeingDragged ? 'opacity-40 border-dashed border-emerald-400 ring-2 ring-emerald-300' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-1.5">
                            {canDrag && <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />}
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-xs">{lead.name}</h4>
                              <span className="text-[10px] text-slate-500 font-medium">{formatPhone(lead.phone)}</span>
                            </div>
                          </div>
                          <span className="text-[9px] uppercase px-2 py-0.5 bg-slate-100 font-bold text-slate-600 rounded">
                            {lead.interest || lead.sportInterest || 'All Sports'}
                          </span>
                        </div>

                      {lead.email && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}

                      {lead.notes && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg line-clamp-2">
                          {lead.notes}
                        </p>
                      )}

                      {/* Existing quotations on this lead */}
                      {Array.isArray(lead.quotations) && lead.quotations.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          {lead.quotations.map((q) => (
                            <div key={q.id} className="bg-purple-50/70 border border-purple-100 rounded-lg p-2 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-purple-500" />
                                  {formatCurrency(Number(q.total || q.amount))}
                                </span>
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-purple-700 border border-purple-200">
                                  {q.status || 'DRAFT'}
                                </span>
                              </div>
                              {/* Quick status transitions */}
                              {q.status !== 'ACCEPTED' && q.status !== 'REJECTED' && (
                                <div className="flex items-center gap-1.5 text-[9px] font-bold">
                                  {q.status !== 'SENT' && (
                                    <button onClick={() => handleUpdateQuoteStatus(q.id, 'SENT')} className="text-blue-600 hover:text-blue-800 cursor-pointer">Mark Sent</button>
                                  )}
                                  <button onClick={() => handleUpdateQuoteStatus(q.id, 'ACCEPTED')} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">Accept</button>
                                  <button onClick={() => handleUpdateQuoteStatus(q.id, 'REJECTED')} className="text-rose-500 hover:text-rose-700 cursor-pointer">Reject</button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stage Action / Controls */}
                      {lead.stage === 'WON' ? (
                        <div className="pt-2 border-t border-slate-100">
                          <div className="w-full text-center inline-flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200/80">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Won & Converted</span>
                          </div>
                        </div>
                      ) : lead.stage === 'LOST' ? (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            <X className="w-3 h-3 text-slate-400" />
                            Closed / Lost
                          </span>
                          <button
                            onClick={() => handleStageMove(lead.id, 'CONTACTED')}
                            className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg font-medium text-[10px] transition-colors cursor-pointer border border-slate-200"
                            title="Reopen prospect as contacted"
                          >
                            Reopen
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Active Stage Actions */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium gap-1 flex-wrap">
                            <button
                              onClick={() => { setSelectedLead(lead); setShowFollowUpModal(true); }}
                              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 py-0.5 cursor-pointer"
                            >
                              <PhoneCall className="w-3 h-3 text-emerald-600" />
                              <span>Follow-up</span>
                            </button>
                            <button
                              onClick={() => openQuoteModal(lead)}
                              className="text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors border border-purple-200"
                              title="Send customized formal quote by email"
                            >
                              <Send className="w-3 h-3 text-purple-600" />
                              <span>Send Quote</span>
                            </button>
                            <button
                              onClick={() => { setSelectedLead(lead); setConvertError(''); setShowConvertModal(true); }}
                              className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer font-bold border border-emerald-200"
                            >
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              <span>Convert</span>
                            </button>
                          </div>

                          {/* Forward-only Move Stage Selector */}
                          <div className="pt-1">
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) handleStageMove(lead.id, e.target.value);
                              }}
                              className="w-full text-[10px] font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
                            >
                              <option value="" disabled>Move forward to...</option>
                              {lead.stage === 'NEW' && (
                                <>
                                  <option value="CONTACTED">Move to: Contacted</option>
                                  <option value="LOST">Mark as: Lost / Closed</option>
                                </>
                              )}
                              {lead.stage === 'CONTACTED' && (
                                <>
                                  <option value="QUOTED">Move to: Quotation Sent</option>
                                  <option value="LOST">Mark as: Lost / Closed</option>
                                </>
                              )}
                              {lead.stage === 'QUOTED' && (
                                <>
                                  <option value="WON">Move to: Won / Converted</option>
                                  <option value="LOST">Mark as: Lost / Closed</option>
                                </>
                              )}
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                  {stageLeads.length > 5 && (
                    <button
                      onClick={() => toggleExpandStage(stage.id)}
                      className="w-full mt-2 py-2 px-3 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          <span>Show Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          <span>Show More ({hiddenCount} more)</span>
                        </>
                      )}
                    </button>
                  )}

                  {stageLeads.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[11px] text-slate-400 font-medium">
                      No leads in {stage.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WEB INQUIRIES VIEW */}
      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Website Inbound Inquiries</h3>
            <span className="text-xs text-slate-500">{enquiries.length} submissions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="p-4">Sender</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Interest / Subject</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{enq.name}</td>
                    <td className="p-4 text-slate-600">
                      <div>{formatPhone(enq.phone)}</div>
                      {enq.email && <div className="text-[11px] text-slate-400">{enq.email}</div>}
                    </td>
                    <td className="p-4 font-medium text-slate-700">{enq.interest || 'General'}</td>
                    <td className="p-4 text-slate-600 max-w-xs">{enq.message || '—'}</td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-GB') : 'Today'}
                    </td>
                    <td className="p-4">
                      <select
                        value={enq.status}
                        onChange={(e) => handleEnquiryStatus(enq.id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          enq.status === 'NEW'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : enq.status === 'CONTACTED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : enq.status === 'CONVERTED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                  </tr>
                ))}

                {enquiries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                      No inbound inquiries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW LEAD MODAL */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add Sales Lead</h3>
              <button onClick={() => { setShowAddLeadModal(false); setAddLeadError(''); }} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            {addLeadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{addLeadError}</span>
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Verma"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1">Phone Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9820011223"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="prospect@example.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1">Sport Interest</label>
                  <select
                    value={newLead.interest}
                    onChange={(e) => setNewLead({ ...newLead, interest: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white"
                  >
                    <option value="Tennis">Tennis</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Padel">Padel</option>
                    <option value="Cricket">Cricket</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">Lead Source</label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white"
                  >
                    <option value="WEBSITE">Website</option>
                    <option value="WALK_IN">Walk-in</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="REFERRAL">Member Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Notes / Requirements</label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Looking for evening court slots, corporate package..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createLead.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {createLead.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Add to Sales Pipeline
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONVERT TO MEMBER MODAL */}
      {showConvertModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Convert Lead to Active Member</h3>
                <p className="text-xs text-slate-500">Confirm details & issue member account credentials</p>
              </div>
              <button onClick={() => setShowConvertModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-emerald-900 flex items-center justify-between">
                <span>{selectedLead.name}</span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Lead #{selectedLead.id?.slice(0, 6)}
                </span>
              </div>
              <div className="text-emerald-700 font-medium">
                {formatPhone(selectedLead.phone)} · {selectedLead.email || 'No email provided'}
              </div>
            </div>

            {convertError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{convertError}</span>
              </div>
            )}

            <form onSubmit={handleConvertLead} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1">Select Membership Plan *</label>
                <select
                  value={convertForm.planId}
                  onChange={(e) => setConvertForm({ ...convertForm, planId: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="">-- Choose Plan --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(Number(p.price))})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={convertForm.dob}
                    onChange={(e) => setConvertForm({ ...convertForm, dob: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">Membership Start Date</label>
                  <input
                    type="date"
                    required
                    value={convertForm.startDate}
                    onChange={(e) => setConvertForm({ ...convertForm, startDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Portal Account Password *</label>
                <input
                  type="text"
                  required
                  value={convertForm.password}
                  onChange={(e) => setConvertForm({ ...convertForm, password: e.target.value })}
                  placeholder="Set initial password"
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-mono text-slate-800 focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">Credentials created for member login portal</span>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={convertForm.emergencyContact}
                  onChange={(e) => setConvertForm({ ...convertForm, emergencyContact: e.target.value })}
                  placeholder="Emergency contact phone number"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none font-medium text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={convertLead.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
              >
                {convertLead.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirm & Issue Membership</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOLLOW UP MODAL */}
      {showFollowUpModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Log Follow-up: {selectedLead.name}</h3>
              <button onClick={() => { setShowFollowUpModal(false); setFollowUpError(''); }} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            {followUpError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{followUpError}</span>
              </div>
            )}

            <form onSubmit={handleAddFollowUp} className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1">Type</label>
                  <select
                    value={followUp.type}
                    onChange={(e) => setFollowUp({ ...followUp, type: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-white"
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="VISIT">Club Visit</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={followUp.date}
                    onChange={(e) => setFollowUp({ ...followUp, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Notes</label>
                <textarea
                  required
                  rows={3}
                  value={followUp.notes}
                  onChange={(e) => setFollowUp({ ...followUp, notes: e.target.value })}
                  placeholder="Discussed Gold annual plan, requested trial session on Saturday..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={addFollowUp.isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Log Follow-up
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SEND QUOTATION MODAL */}
      {showQuoteModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3 border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase mb-1">
                  <FileText className="w-3 h-3" />
                  <span>Formal Quotation Dispatch</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Send Quote to {selectedLead.name}
                </h3>
              </div>
              <button
                onClick={() => { setShowQuoteModal(false); setQuoteError(''); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quoteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{quoteError}</span>
              </div>
            )}

            <form onSubmit={handleSendQuoteSubmit} className="space-y-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-700 block">Recipient Email Address *</label>
                <input
                  type="email"
                  required
                  value={quoteForm.email}
                  onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                  placeholder="client@company.com or member@email.com"
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 block">Package Plan</label>
                  <select
                    value={quoteForm.planId}
                    onChange={(e) => {
                      const p = plans.find((x) => x.id === e.target.value);
                      setQuoteForm({
                        ...quoteForm,
                        planId: e.target.value,
                        packageName: p ? `${p.name} Membership Package` : quoteForm.packageName,
                        amount: p ? String(p.price) : quoteForm.amount,
                      });
                    }}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white cursor-pointer"
                  >
                    <option value="">Custom Package</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatCurrency(Number(p.price))})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 block">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={quoteForm.validUntil}
                    onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 block">Base Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={quoteForm.amount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 block">Special Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={quoteForm.discount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, discount: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-purple-900 block font-bold">Total Quoted Amount</span>
                  <span className="text-[10px] text-purple-700 font-normal">Includes taxes & package discounts</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-purple-900 font-mono">
                    {formatCurrency(Math.max(0, Number(quoteForm.amount || 0) - Number(quoteForm.discount || 0)))}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 block">Custom Notes / Inclusions</label>
                <textarea
                  rows={3}
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  placeholder="Includes court reservations, complimentary gear rental, personal trainer session..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendQuote.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-all"
                >
                  {sendQuote.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Quotation Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmPage;
