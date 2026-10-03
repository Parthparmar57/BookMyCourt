import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User as UserIcon, Calendar, ShoppingBag, Utensils, QrCode, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { memberApi } from '../../services/api';
import { Member } from '../../types';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length > 0) {
      memberApi.getMembers(query).then(res => setResults(res.slice(0, 5)));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectMember = (id: string) => {
    onClose();
    navigate(`/staff/frontdesk/members/${id}`);
  };

  const quickLinks = [
    { label: 'Book Court Grid', icon: Calendar, url: '/staff/frontdesk/bookings' },
    { label: 'Member Directory', icon: UserIcon, url: '/staff/frontdesk/members' },
    { label: 'Bar & Cafeteria POS', icon: Utensils, url: '/staff/bar' },
    { label: 'Gear Shop POS', icon: ShoppingBag, url: '/staff/shop' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-overlay backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-white text-foreground rounded-lg border border-border shadow-[0_20px_50px_rgba(33,36,36,0.2)] z-10 overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-border bg-surface/30">
              <Search className="w-5 h-5 text-primary shrink-0 mr-3" />
              <input
                autoFocus
                type="text"
                placeholder="Search member by Name, Phone, Member ID (e.g. CC-2026-8842), or QR Code..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full text-base bg-transparent border-none outline-none placeholder:text-text-muted/60 text-foreground"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 text-text-muted hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="ml-2 px-2 py-0.5 text-[10px] font-mono text-text-muted bg-surface-muted border border-border rounded">
                ESC
              </kbd>
            </div>

            {/* Results Area */}
            <div className="p-3 max-h-96 overflow-y-auto space-y-3">
              {query.trim().length > 0 ? (
                <div>
                  <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">
                    Members ({results.length})
                  </div>
                  {results.length > 0 ? (
                    <div className="space-y-1">
                      {results.map(m => (
                        <div
                          key={m.id}
                          onClick={() => handleSelectMember(m.id)}
                          className="flex items-center justify-between p-3 rounded-md hover:bg-surface-muted cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img src={m.photoUrl} alt={m.name} className="w-9 h-9 rounded-full object-cover border" />
                            <div>
                              <div className="text-sm font-bold flex items-center gap-2">
                                {m.name}
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                                  {m.memberId}
                                </span>
                              </div>
                              <div className="text-xs text-text-muted">{m.phone} • {m.planName} Plan</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-text-muted" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-text-muted">
                      No member found matching "{query}"
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">
                    Quick Operations
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickLinks.map((link, idx) => {
                      const Icon = link.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            onClose();
                            navigate(link.url);
                          }}
                          className="flex items-center gap-3 p-3 rounded-md border border-border/60 hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all"
                        >
                          <div className="p-2 rounded-md bg-surface text-primary">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold">{link.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
