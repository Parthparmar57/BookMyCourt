import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = '-- Select Option --',
  searchable = false,
  className = '',
  disabled = false,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Normalize options array into { value, label, subtext }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value ?? opt.id ?? '',
        label: opt.label ?? opt.name ?? String(opt.value || ''),
        subtext: opt.subtext ?? opt.description ?? opt.phone ?? null,
      };
    }
    return { value: opt, label: String(opt), subtext: null };
  });

  const selectedOption = normalizedOptions.find(
    (o) => String(o.value) === String(value)
  );

  // Filter options if searchable
  const filteredOptions = searchable && searchTerm.trim()
    ? normalizedOptions.filter(
        (o) =>
          o.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (o.subtext && o.subtext.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : normalizedOptions;

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    setIsOpen(false);
    setSearchTerm('');
    if (onChange) {
      // Pass a synthetic event for compatibility with standard form e.target.value
      onChange({
        target: { name, value: optionValue },
        value: optionValue,
      });
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left font-sans ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white border rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/15 text-slate-900'
            : 'border-slate-200 text-slate-800 hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <span className="truncate">
          {selectedOption ? (
            <span className="flex items-center gap-1.5">
              <span>{selectedOption.label}</span>
              {selectedOption.subtext && (
                <span className="text-slate-400 font-normal font-mono text-[11px]">
                  ({selectedOption.subtext})
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Floating Menu Listbox */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60 flex flex-col">
          {/* Search Input Header */}
          {searchable && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  autoFocus
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Options Scrollable Container */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-52">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate">{opt.label}</div>
                      {opt.subtext && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {opt.subtext}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400 font-medium">
                No matching options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
