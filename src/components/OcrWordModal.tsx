import React, { useState } from 'react';
import { exportOcrToDocx, downloadBlob } from '../utils/pdfDocxExport';
import { FileText, Download, Copy, Check, X, Sparkles, FileEdit } from 'lucide-react';

interface OcrWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  ocrText: string;
  imageSrc: string;
}

export const OcrWordModal: React.FC<OcrWordModalProps> = ({
  isOpen,
  onClose,
  ocrText: initialText,
  imageSrc,
}) => {
  const [text, setText] = useState(initialText);
  const [docTitle, setDocTitle] = useState('Scanned Document OCR');
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Sync when initialText changes
  React.useEffect(() => {
    setText(initialText);
  }, [initialText]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${docTitle.replace(/\s+/g, '_')}.txt`);
  };

  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportOcrToDocx(text, docTitle, `${docTitle.replace(/\s+/g, '_')}.docx`);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export docx', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>OCR Text Recognition & Word (.docx) Export</span>
              </h2>
              <p className="text-xs text-slate-400">
                ডকুমেন্ট থেকে চিহ্নিত টেক্সট সরাসরি এডিট করুন এবং Word ফাইলে সেভ করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Side by Side (Image Preview & Editable Text) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-6 overflow-y-auto">
          {/* Left: Scanned Document Preview */}
          <div className="md:col-span-4 flex flex-col bg-slate-950 rounded-xl p-3 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>মূল ডকুমেন্ট</span>
              <span className="text-[10px] text-sky-400">উৎস ছবি</span>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg bg-black/50 border border-slate-800/80 p-2">
              <img
                src={imageSrc}
                alt="Document Preview"
                className="max-h-64 md:max-h-80 w-auto object-contain rounded shadow"
              />
            </div>
            <div className="mt-3 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>শব্দ সংখ্যা:</span>
                <span className="font-mono text-white">{wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span>লাইন সংখ্যা:</span>
                <span className="font-mono text-white">{lineCount}</span>
              </div>
            </div>
          </div>

          {/* Right: Editable OCR Text Editor */}
          <div className="md:col-span-8 flex flex-col space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                ডকুমেন্ট শিরোনাম (Word ফাইলে হেডার হিসেবে থাকবে):
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-400 flex items-center space-x-1">
                  <FileEdit className="w-3.5 h-3.5 text-sky-400" />
                  <span>এক্সট্রাক্ট করা এডিটেবল টেক্সট:</span>
                </label>
                <span className="text-[11px] text-emerald-400 font-mono">
                  ✓ OCR Recognition Completed
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                className="w-full flex-1 min-h-[260px] bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm font-sans text-slate-200 leading-relaxed focus:outline-none focus:border-sky-500 font-mono resize-none"
                placeholder="এখানে এক্সট্রাক্ট করা টেক্সট প্রদর্শিত হবে..."
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে!' : 'টেক্সট কপি'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>.txt সেভ</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              বন্ধ করুন
            </button>

            <button
              id="btn-export-docx"
              onClick={handleExportDocx}
              disabled={isExportingDocx || !text.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition active:scale-95 disabled:opacity-50"
            >
              {exportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Word (.docx) ডাউনলোড সম্পন্ন!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isExportingDocx ? 'তৈরি হচ্ছে...' : 'Word (.docx) হিসেবে এক্সপোর্ট করুন'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
