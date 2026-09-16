import React from 'react';
import { Scan, Code2, Sparkles, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'architecture';
  setActiveTab: (tab: 'studio' | 'architecture') => void;
  pageCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pageCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">DocScan Studio</span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  CamScanner Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Flutter Clean Architecture & Interactive Document Processing
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              id="tab-interactive-scanner"
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'studio'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-300" />
              <span>ইন্টারেক্টিভ স্ক্যানার ল্যাব</span>
              {pageCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white rounded-full text-xs font-mono">
                  {pageCount}
                </span>
              )}
            </button>

            <button
              id="tab-flutter-architecture"
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-300" />
              <span>Flutter / Kotlin কোড ও আর্কিটেকচার</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
