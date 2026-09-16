import React from 'react';
import { FilterType } from '../types';
import { Sparkles, FileText, Contrast, Eye, Zap } from 'lucide-react';

interface FilterToolbarProps {
  currentFilter: FilterType;
  onFilterSelect: (filter: FilterType) => void;
  isProcessing?: boolean;
}

interface FilterOption {
  id: FilterType;
  name: string;
  nameBn: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    id: 'magic_color',
    name: 'Magic Color',
    nameBn: 'ম্যাজিক কালার',
    description: 'ছায়া দূর করে ব্যাকগ্রাউন্ড ধবধবে সাদা ও লেখা উজ্জ্বল করে',
    icon: Sparkles,
    tag: 'CamScanner Signature',
  },
  {
    id: 'bw',
    name: 'B & W',
    nameBn: 'ব্ল্যাক অ্যান্ড হোয়াইট',
    description: 'উচ্চ কনট্রাস্ট বাইনারি টেক্সট ফিল্টার (ফটোকপি মোড)',
    icon: Contrast,
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    nameBn: 'গ্রে-স্কেল',
    description: 'মসৃণ ধূসর টোন এবং ভারসাম্যপূর্ণ কনট্রাস্ট',
    icon: Eye,
  },
  {
    id: 'sharpen',
    name: 'Sharpen',
    nameBn: 'শার্পেন',
    description: 'অস্পষ্ট অক্ষরের কিনারা তীক্ষ্ণ ও সুস্পষ্ট করে',
    icon: Zap,
  },
  {
    id: 'original',
    name: 'Original',
    nameBn: 'অরিজিনাল',
    description: 'কোনো ফিল্টার ছাড়া ক্রপ করা মূল রূপ',
    icon: FileText,
  },
];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  currentFilter,
  onFilterSelect,
  isProcessing = false,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border-t border-slate-800 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
            Step 2: Enhancement Filters
          </span>
          <span className="text-xs text-slate-400">
            ছায়ামুক্ত ও ডকুমেন্টের মান উন্নত করার অপশন
          </span>
        </div>
        {isProcessing && (
          <span className="text-xs text-sky-400 animate-pulse font-mono">
            প্রসেস করা হচ্ছে...
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {FILTER_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = currentFilter === opt.id;

          return (
            <button
              key={opt.id}
              id={`filter-${opt.id}`}
              onClick={() => onFilterSelect(opt.id)}
              disabled={isProcessing}
              className={`relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-sky-950/60 border-sky-500 text-white shadow-md shadow-sky-500/10'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {opt.tag && (
                <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  {opt.tag}
                </span>
              )}
              <div className="flex items-center space-x-2 mb-1">
                <div
                  className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">{opt.name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{opt.nameBn}</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
