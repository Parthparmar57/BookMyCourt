import React, { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

export const TrialPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', sport: 'Tennis', date: '', time: '07:00 AM' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 px-4 max-w-xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
            FREE TRIAL SESSION
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">Book a Trial Court Session</h1>
          <p className="text-xs text-slate-600">Experience BookMyCourt facilities and software demo first-hand.</p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Trial Request Submitted!</h3>
            <p className="text-xs text-slate-600">Our club concierge will contact you on <strong>{formData.phone}</strong> within 30 minutes to confirm your trial slot.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-bold text-emerald-700 underline pt-2"
            >
              Submit another request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
            <div>
              <label className="block mb-1 font-bold text-slate-900">Full Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Phone Number (10 Digits) *</label>
              <input
                required
                type="tel"
                pattern="[6-9][0-9]{9}"
                placeholder="9820123456"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Preferred Sport</label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="Tennis">Tennis</option>
                <option value="Badminton">Badminton</option>
                <option value="Padel">Padel</option>
                <option value="Squash">Squash</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Submit Trial Request</span>
              <Send className="w-4 h-4 text-emerald-400" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
