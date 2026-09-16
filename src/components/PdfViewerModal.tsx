import React, { useState, useRef } from 'react';
import {
  FileText,
  X,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FolderOpen,
} from 'lucide-react';
import { downloadBlob } from '../utils/pdfDocxExport';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  fileName?: string;
  onUploadPdf?: (file: File) => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  pdfBlob,
  fileName = 'CamScanner_Document.pdf',
  onUploadPdf,
}) => {
  const [zoom, setZoom] = useState(100);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update object URL when pdfBlob changes
  React.useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfUrl(null);
    }
  }, [pdfBlob]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (pdfBlob) {
      downloadBlob(pdfBlob, fileName);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (onUploadPdf) {
        onUploadPdf(file);
      } else {
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                <span>ইন-বিল্ট PDF Viewer (Flutter Demo)</span>
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {fileName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Open another PDF from device */}
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
              title="ডিভাইসের অন্য PDF খুলুন"
            >
              <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">অন্য PDF খুলুন</span>
            </button>

            {pdfBlob && (
              <button
                onClick={handleDownload}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ডাউনলোড</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Sub-toolbar (Zoom & Display Controls) */}
        <div className="flex items-center justify-between px-6 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">জুম স্কেল:</span>
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200 w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
            >
              Fit
            </button>
          </div>

          <div className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1"></span>
            <span>PDF Renderer Active</span>
          </div>
        </div>

        {/* PDF Embedded Frame / Viewer */}
        <div className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-4">
          {pdfUrl ? (
            <div
              style={{ width: `${zoom}%`, height: `${zoom}%` }}
              className="min-h-full transition-all duration-150 flex items-center justify-center"
            >
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                title="PDF Document Preview"
                className="w-full h-full min-h-[550px] rounded-xl border border-slate-800 bg-white shadow-2xl"
              />
            </div>
          ) : (
            <div className="text-center p-8 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">কোনো PDF ফাইল সিলেক্ট করা হয়নি।</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 transition"
              >
                ডিভাইস থেকে PDF ব্রাউজ করুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
