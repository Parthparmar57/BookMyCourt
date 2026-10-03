import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

export const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome! 👋 What can I help you with today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Thanks for reaching out! A BookMyCourt specialist will connect with you shortly. You can also click "Contact Sales" to book a live demo!'
        }
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs text-white">
                BMC
              </div>
              <div>
                <h4 className="font-semibold text-sm">BookMyCourt Support</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online Now
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 h-64 overflow-y-auto bg-slate-50 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs font-medium ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Options */}
          <div className="p-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 text-xs text-slate-600">
            <button
              onClick={() => setInput('Connect with Sales Team')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-full transition-colors"
            >
              Connect with Sales
            </button>
            <button
              onClick={() => setInput('Looking for Customer Support')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-full transition-colors"
            >
              Customer Support
            </button>
            <button
              onClick={() => setInput('Just browsing options')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-full transition-colors"
            >
              Just browsing
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-2 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Write a reply..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border-2 border-white"></span>
          </span>
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
