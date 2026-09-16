import React, { useState } from 'react';
import { FLUTTER_CODE_SNIPPETS } from '../data/flutterCodeSnippets';
import { CodeSnippet } from '../types';
import {
  Code2,
  Copy,
  Check,
  FolderTree,
  Package,
  Layers,
  Sparkles,
  FileDown,
  Terminal,
  Search,
  ExternalLink,
  Smartphone,
  HelpCircle,
  X,
  FolderArchive,
  ArrowRight,
} from 'lucide-react';
import { downloadBlob } from '../utils/pdfDocxExport';
import JSZip from 'jszip';

export const ArchitectureGuide: React.FC = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(FLUTTER_CODE_SNIPPETS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const selectedSnippet =
    FLUTTER_CODE_SNIPPETS.find((s) => s.id === selectedSnippetId) || FLUTTER_CODE_SNIPPETS[0];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleDownloadFile = (snippet: CodeSnippet) => {
    const extension = snippet.language === 'dart' ? '.dart' : snippet.language === 'kotlin' ? '.kt' : '.yaml';
    const fileName = snippet.filePath.split('/').pop() || `code_${snippet.id}${extension}`;
    const blob = new Blob([snippet.code], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, fileName);
  };

  const handleDownloadFullProjectZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('camscanner_flutter_project');

      if (folder) {
        // Add all snippets to appropriate paths
        for (const s of FLUTTER_CODE_SNIPPETS) {
          if (s.id === 'architecture_structure') continue;
          folder.file(s.filePath, s.code);
        }

        // Add README for building APK
        folder.file(
          'README.md',
          `# CamScanner Pro - Flutter Project

## Build APK:
1. flutter pub get
2. flutter build apk --release

Output will be located at: build/app/outputs/flutter-apk/app-release.apk
`
        );

        // Add GitHub Actions workflow
        const ghFolder = zip.folder('.github/workflows');
        if (ghFolder) {
          ghFolder.file(
            'build-apk.yml',
            `name: Build Android APK
on: [push, workflow_dispatch]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.22.x'
      - run: flutter pub get
      - run: flutter build apk --release
      - uses: actions/upload-artifact@v4
        with:
          name: CamScanner-APK
          path: build/app/outputs/flutter-apk/app-release.apk
`
          );
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'CamScanner_Flutter_Project.zip');
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to create zip', e);
    } finally {
      setIsZipping(false);
    }
  };

  const filteredSnippets = FLUTTER_CODE_SNIPPETS.filter((snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.filePath.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' || snippet.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'সকল কোড' },
    { id: 'architecture', label: 'আর্কিটেকচার ও pubspec' },
    { id: 'scanner_crop', label: '১. স্ক্যান ও ক্রপ' },
    { id: 'filters', label: '২. ফিল্টার ও এনহ্যান্স' },
    { id: 'pdf_export', label: '৩. PDF ও JPG এক্সপোর্ট' },
    { id: 'ocr_docx', label: '৪. OCR ও Word (.docx)' },
    { id: 'pdf_viewer', label: '৫. PDF Viewer' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Summary */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Production-Ready Flutter & Kotlin Implementation</span>
            </div>

            {/* Direct APK Build & Download Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsApkGuideOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>APK ডাউনলোড গাইড (GitHub CI/CD)</span>
              </button>

              <button
                onClick={handleDownloadFullProjectZip}
                disabled={isZipping}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/30 active:scale-95 disabled:opacity-50"
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>
                  {isZipping
                    ? 'জিপ তৈরি হচ্ছে...'
                    : zipSuccess
                    ? 'ডাউনলোড সম্পন্ন!'
                    : 'সম্পূর্ণ Flutter প্রজেক্ট (.zip) ডাউনলোড'}
                </span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            CamScanner অল-ইন-ওয়ান ডকুমেন্ট স্ক্যানার আর্কিটেকচার
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
            ক্লিন আর্কিটেকচার (Clean Architecture) অনুসরণে তৈরি সম্পূর্ণ মডিউলার প্রজেক্ট। এতে অন্তর্ভুক্ত রয়েছে
            স্বয়ংক্রিয় এজ ডিটেকশন, পার্সপেক্টিভ ট্রান্সফর্ম (Unskew), শ্যাডো রিমুভাল (Magic Color), মাল্টি-পেজ
            PDF জেনারেটর, অন-ডিভাইস OCR এবং Word (.docx) ফাইল কনভার্টার।
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Package className="w-3.5 h-3.5 text-sky-400" />
              <span>Flutter 3.2x+ / Dart 3</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google ML Kit Document Scanner API</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Kotlin / OpenCV Native Homography</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-medium text-emerald-300 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800">
              <Check className="w-3.5 h-3.5" />
              <span>GitHub Actions CI/CD (.github/workflows/build-apk.yml) যুক্ত আছে</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Code Explorer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Snippet File List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="ফিচার বা ফাইল খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                  activeCategory === c.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Snippet Items */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredSnippets.map((snippet) => {
              const isSelected = snippet.id === selectedSnippet.id;
              return (
                <button
                  key={snippet.id}
                  onClick={() => setSelectedSnippetId(snippet.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-500 text-white shadow-md shadow-sky-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{snippet.title}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        snippet.language === 'dart'
                          ? 'bg-blue-500/20 text-blue-400'
                          : snippet.language === 'kotlin'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {snippet.language}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                    {snippet.filePath}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                    {snippet.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area: Active Code File Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* File Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">{selectedSnippet.title}</span>
                <span className="text-xs font-mono text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                  {selectedSnippet.filePath}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedSnippet.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(selectedSnippet.code, selectedSnippet.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedId === selectedSnippet.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>কোড কপি করুন</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownloadFile(selectedSnippet)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow transition"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>ডাউনলোড ফাইল</span>
              </button>
            </div>
          </div>

          {/* Syntax Highlighted Code Box */}
          <div className="relative bg-slate-950 p-6 overflow-x-auto max-h-[640px] text-xs font-mono leading-relaxed text-slate-200 select-text">
            <pre className="whitespace-pre">
              <code>{selectedSnippet.code}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* APK Generation & Download Guide Modal */}
      {isApkGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Flutter থেকে সাইনড APK তৈরির ২টি সহজ ও ফ্রি পদ্ধতি
                  </h2>
                  <p className="text-xs text-slate-400">
                    মোবাইলে সরাসরি ইনস্টলযোগ্য আসল .apk ফাইল পাওয়ার সম্পূর্ণ উপায়
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsApkGuideOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs leading-relaxed text-slate-300">
              {/* Method 1: GitHub Actions */}
              <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    পদ্ধতি ১: GitHub Actions দিয়ে ১-ক্লিকে ফ্রি APK বিল্ড (সবচেয়ে সহজ)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                    অটোমেটিক CI/CD
                  </span>
                </div>
                <p className="text-slate-300">
                  আমরা ইতিমধ্যে প্রজেক্টে <code className="text-sky-300 font-mono">.github/workflows/build-apk.yml</code> কনফিগার করে দিয়েছি।
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-sans">
                  <li>
                    AI Studio-র উপরের ডানদিকের মেনু থেকে <strong className="text-white">Export to GitHub</strong> সিলেক্ট করুন।
                  </li>
                  <li>
                    আপনার GitHub অ্যাকাউন্টে পুশ হওয়ার সাথে সাথে GitHub Actions ব্যাকগ্রাউন্ডে <code className="text-emerald-400 font-mono">flutter build apk --release</code> রান করবে।
                  </li>
                  <li>
                    রিপোজিটরির <strong className="text-white">Actions</strong> ট্যাবে গিয়ে <strong className="text-white">Artifacts</strong> থেকে সরাসরি <code className="text-amber-400 font-mono">app-release.apk</code> ডাউনলোড করে ফোনে ইনস্টল করুন!
                  </li>
                </ol>
              </div>

              {/* Method 2: Local Flutter Build */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    পদ্ধতি ২: আপনার পিসিতে লোকালি APK তৈরি
                  </span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-mono">
                    Local Terminal
                  </span>
                </div>
                <p className="text-slate-300">
                  উপরের <strong className="text-white">"সম্পূর্ণ Flutter প্রজেক্ট (.zip) ডাউনলোড"</strong> বাটনে ক্লিক করে জিপ ফাইলটি আনজিপ করুন এবং টার্মিনালে রান করুন:
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-sky-300 space-y-1">
                  <div>cd flutter_project</div>
                  <div>flutter pub get</div>
                  <div className="text-emerald-400 font-bold">flutter build apk --release</div>
                </div>
                <p className="text-slate-400 text-[11px]">
                  তৈরি হওয়া APK ফাইলটি পাবেন: <code className="text-slate-300 font-mono">build/app/outputs/flutter-apk/app-release.apk</code>
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                ফাইল এক্সপ্লোরারে <code className="text-sky-400 font-mono">flutter_project/</code> ফোল্ডারে সম্পূর্ণ সোর্স কোড সংরক্ষিত রয়েছে।
              </span>
              <button
                onClick={() => setIsApkGuideOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
