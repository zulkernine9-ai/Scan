/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ScannerStudio } from './components/ScannerStudio';
import { ArchitectureGuide } from './components/ArchitectureGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'architecture'>('studio');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pageCount={0}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'studio' ? (
          <ScannerStudio />
        ) : (
          <ArchitectureGuide />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>
          DocScan Studio • All-in-One CamScanner Engine for Flutter & Kotlin • Clean Architecture & ML Kit Vision
        </p>
      </footer>
    </div>
  );
}
