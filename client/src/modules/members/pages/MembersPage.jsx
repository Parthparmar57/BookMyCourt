import React, { useState, useEffect } from 'react';
import { memberApi } from '../../../services/apiServices';
import { MOCK_PLANS } from '../../../data/mockData';
import { formatCurrency, formatDate, formatPhone } from '../../../shared/utils/formatters';
import { Search, UserPlus, QrCode, Shield, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formError, setFormError] = useState('');
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    planId: 'plan-gold',
    startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    memberApi.getMembers().then(setMembers);
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      const all = await memberApi.getMembers();
      setMembers(all);
    } else {
      const filtered = await memberApi.searchMembers(query);
      setMembers(filtered);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');

    // Age validation for Junior plan (strictly < 18)
    if (newMember.dob) {
      const birthYear = new Date(newMember.dob).getFullYear();
      const age = new Date().getFullYear() - birthYear;
      if (newMember.planId === 'plan-junior' && age >= 18) {
        setFormError('Validation Error: Junior Tier is strictly restricted to members under 18 years of age.');
        return;
      }
    }

    const planObj = MOCK_PLANS.find(p => p.id === newMember.planId);
    const created = await memberApi.createMember({
      ...newMember,
      planName: planObj?.name || 'Gold Tier',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });

    setShowAddModal(false);
    setSelectedMember(created);
    const all = await memberApi.getMembers();
    setMembers(all);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Member Directory & Profiles</h1>
          <p className="text-xs text-slate-500">Fast search by Name, Phone, Member ID or QR code scan (&lt; 1s search time).</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Member</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone, member ID (e.g. Rajesh, 9820123456, BMC-2026-8842)..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none shadow-xs"
        />
      </div>

      {/* Member Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                <th className="p-4">Member ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Plan Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4">Bar Tab Balance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{m.id}</td>
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                    <span>{m.name}</span>
                  </td>
                  <td className="p-4 font-medium text-slate-600">{formatPhone(m.phone)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                      m.planId === 'plan-gold' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {m.planName}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-900">{formatCurrency(m.activeTabBalance || 0)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedMember(m)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                    >
                      View 360° Profile →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Register New Member</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Vikramaditya Singh"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Phone Number (10 Digits) *</label>
                <input
                  required
                  type="tel"
                  pattern="[6-9][0-9]{9}"
                  placeholder="9820123456"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  placeholder="user@example.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Date of Birth *</label>
                <input
                  required
                  type="date"
                  value={newMember.dob}
                  onChange={(e) => setNewMember({ ...newMember, dob: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Membership Plan Tier</label>
                <select
                  value={newMember.planId}
                  onChange={(e) => setNewMember({ ...newMember, planId: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none bg-white"
                >
                  <option value="plan-gold">Gold Tier (₹4,999/mo - 100% Free Court Slots)</option>
                  <option value="plan-silver">Silver Tier (₹2,499/mo - 50% Off Slots)</option>
                  <option value="plan-junior">Junior Tier (₹1,499/mo - Age &lt; 18 Only)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-colors mt-2"
              >
                Create Member & Issue Digital Card
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Member 360° Profile & Digital QR Card Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Member 360° Digital Card</h3>
              <button onClick={() => setSelectedMember(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {/* Digital Card Preview */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-emerald-400">BOOKMYCOURT DIGITAL PASS</span>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded">
                  {selectedMember.planName}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <img src={selectedMember.avatar} alt={selectedMember.name} className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-lg">{selectedMember.name}</h3>
                  <p className="text-xs font-mono text-slate-400">ID: {selectedMember.id}</p>
                  <p className="text-[11px] text-slate-300">{formatPhone(selectedMember.phone)}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white p-3 rounded-xl w-32 mx-auto flex flex-col items-center gap-1 shadow-md">
                <QRCodeSVG value={selectedMember.qrCode || selectedMember.id} size={90} />
                <span className="text-[8px] font-mono text-slate-800 font-bold">SCAN AT DESK / POS</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
