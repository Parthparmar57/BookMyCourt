import React, { useState } from 'react';
import { 
  useLeads, 
  useCreateLead, 
  useUpdateLead, 
  useAddFollowUp, 
  useCreateQuotation, 
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
  Users
} from 'lucide-react';

const STAGES = [
  { id: 'NEW', label: 'New Leads', color: 'border-blue-400 bg-blue-50/60 text-blue-700' },
  { id: 'CONTACTED', label: 'Contacted', color: 'border-amber-400 bg-amber-50/60 text-amber-700' },
  { id: 'QUOTED', label: 'Quotation Sent', color: 'border-purple-400 bg-purple-50/60 text-purple-700' },
  { id: 'WON', label: 'Won / Converted', color: 'border-emerald-500 bg-emerald-50/60 text-emerald-800' },
  { id: 'LOST', label: 'Lost / Closed', color: 'border-slate-300 bg-slate-100/60 text-slate-600' },
];

export const CrmPage = () => {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'enquiries'
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Queries
  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const leads = leadsData?.items || [];
  const { data: enquiries = [], isLoading: enquiriesLoading } = useEnquiries();
  const { data: plans = [] } = usePlans();

  // Mutations
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const addFollowUp = useAddFollowUp();
  const convertLead = useConvertLead();
  const updateEnquiryStatus = useUpdateEnquiryStatus();

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    sportInterest: 'Badminton',
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
  });

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLead.name.trim() || !newLead.phone.trim()) return;
    try {
      await createLead.mutateAsync(newLead);
      setShowAddLeadModal(false);
      setNewLead({ name: '', phone: '', email: '', sportInterest: 'Badminton', notes: '', source: 'WALK_IN' });
      setFeedback({ type: 'success', message: 'New sales lead added to pipeline.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to create lead.' });
    }
  };

  const handleStageMove = async (leadId, newStage) => {
    try {
      await updateLead.mutateAsync({ id: leadId, stage: newStage });
      setFeedback({ type: 'success', message: `Lead moved to ${newStage}.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Could not update lead stage.' });
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
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
      setFeedback({ type: 'error', message: err?.message || 'Failed to log follow-up.' });
    }
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await convertLead.mutateAsync({
        id: selectedLead.id,
        planId: convertForm.planId || plans[0]?.id,
        dob: convertForm.dob,
        startDate: convertForm.startDate,
        password: convertForm.password,
        emergencyContact: convertForm.emergencyContact,
      });
      setShowConvertModal(false);
      setSelectedLead(null);
      setFeedback({ type: 'success', message: 'Lead successfully converted to Active Club Member!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Conversion failed.' });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">CRM Leads & Sales Pipeline</h1>
          <p className="text-xs text-slate-500">
            Track inquiries, log follow-up interactions, and convert leads into active club members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pipeline' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban Pipeline
            </button>
            <button
              onClick={() => setActiveTab('enquiries')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'enquiries' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Web Inquiries</span>
              {enquiries.length > 0 && (
                <span className="w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {enquiries.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowAddLeadModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
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

      {/* PIPELINE KANBAN VIEW */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id);
            return (
              <div key={stage.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col min-h-[500px]">
                <div className={`flex items-center justify-between pb-2 mb-3 border-b ${stage.color} font-extrabold text-xs px-2.5 py-1.5 rounded-xl`}>
                  <span>{stage.label}</span>
                  <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-black">{stageLeads.length}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs">{lead.name}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">{formatPhone(lead.phone)}</span>
                        </div>
                        <span className="text-[9px] uppercase px-2 py-0.5 bg-slate-100 font-bold text-slate-600 rounded">
                          {lead.sportInterest || 'All Sports'}
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

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
                        <button
                          onClick={() => { setSelectedLead(lead); setShowFollowUpModal(true); }}
                          className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3 text-emerald-600" />
                          <span>Follow-up</span>
                        </button>

                        {stage.id !== 'WON' && (
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              if (plans.length && !convertForm.planId) setConvertForm(f => ({ ...f, planId: plans[0].id }));
                              setShowConvertModal(true);
                            }}
                            className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md flex items-center gap-1 font-extrabold"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Convert</span>
                          </button>
                        )}
                      </div>

                      {/* Move Stage Selector */}
                      <div className="pt-1">
                        <select
                          value={lead.stage}
                          onChange={(e) => handleStageMove(lead.id, e.target.value)}
                          className="w-full text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>Move: {s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

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
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/70">
                    <td className="p-4 font-bold text-slate-900">{enq.name}</td>
                    <td className="p-4">
                      <div>{formatPhone(enq.phone)}</div>
                      <div className="text-[10px] text-slate-400">{enq.email}</div>
                    </td>
                    <td className="p-4 font-semibold text-emerald-700">{enq.subject || 'Membership inquiry'}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{enq.message}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        enq.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800' :
                        enq.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {enq.status || 'NEW'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => updateEnquiryStatus.mutate({ id: enq.id, status: 'CONTACTED' })}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        Mark Contacted
                      </button>
                      <button
                        onClick={() => {
                          setNewLead({
                            name: enq.name,
                            phone: enq.phone,
                            email: enq.email || '',
                            sportInterest: enq.subject || 'Badminton',
                            notes: enq.message || '',
                            source: 'WEBSITE',
                          });
                          setShowAddLeadModal(true);
                        }}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800"
                      >
                        Create Lead →
                      </button>
                    </td>
                  </tr>
                ))}
                {enquiries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No inbound inquiries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE LEAD MODAL */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add New Lead</h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1">Full Name</label>
                <input
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="e.g. Aryan Malhotra"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1">Phone</label>
                  <input
                    required
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">Sport Interest</label>
                  <select
                    value={newLead.sportInterest}
                    onChange={(e) => setNewLead({ ...newLead, sportInterest: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Badminton">Badminton</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Pickleball">Pickleball</option>
                    <option value="Squash">Squash</option>
                    <option value="All Sports">All Sports</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="aryan@gmail.com"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Interested in evening slots and gold membership"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createLead.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {createLead.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Lead to Pipeline
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONVERT LEAD MODAL */}
      {showConvertModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Convert Lead to Member</h3>
                <p className="text-[11px] text-slate-500">Creating member profile for {selectedLead.name}</p>
              </div>
              <button onClick={() => setShowConvertModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleConvertLead} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1">Membership Plan</label>
                <select
                  value={convertForm.planId}
                  onChange={(e) => setConvertForm({ ...convertForm, planId: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white focus:border-emerald-600 focus:outline-none"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(Number(p.price))}
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
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={convertForm.startDate}
                    onChange={(e) => setConvertForm({ ...convertForm, startDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Portal Password</label>
                <input
                  required
                  value={convertForm.password}
                  onChange={(e) => setConvertForm({ ...convertForm, password: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={convertLead.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {convertLead.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm & Issue Membership
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
              <button onClick={() => setShowFollowUpModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

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
                    <option value="MEETING">Club Visit</option>
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
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Log Follow-up
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
