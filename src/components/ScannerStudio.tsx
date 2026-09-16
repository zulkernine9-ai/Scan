import React, { useState, useEffect, useRef } from 'react';
import { ScannedPage, QuadCorners, FilterType, SampleDoc } from '../types';
import {
  warpPerspective,
  applyDocumentFilter,
  autoDetectDocumentCorners,
  getTransformedDimensions,
} from '../utils/imageProcessing';
import {
  exportPageAsJpg,
  exportPagesAsPdf,
} from '../utils/pdfDocxExport';
import { getInitializedSampleDocs } from '../data/sampleDocuments';
import { CropCanvas } from './CropCanvas';
import { FilterToolbar } from './FilterToolbar';
import { OcrWordModal } from './OcrWordModal';
import { PdfViewerModal } from './PdfViewerModal';
import {
  Camera,
  Upload,
  Sparkles,
  FileText,
  Download,
  Eye,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Layers,
  Crop,
  FileCode,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const ScannerStudio: React.FC = () => {
  const [sampleDocs, setSampleDocs] = useState<SampleDoc[]>([]);
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [mode, setMode] = useState<'crop' | 'preview'>('crop');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Modals
  const [isOcrOpen, setIsOcrOpen] = useState<boolean>(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState<boolean>(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initialize with realistic sample invoice on mount
  useEffect(() => {
    const samples = getInitializedSampleDocs();
    setSampleDocs(samples);

    if (samples.length > 0 && pages.length === 0) {
      const initialDoc = samples[0];
      loadDocumentFromDataUrl(initialDoc.dataUrl, initialDoc.defaultCorners, initialDoc.sampleOcr);
    }
  }, []);

  const loadDocumentFromDataUrl = (dataUrl: string, corners?: QuadCorners, sampleOcr?: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const defaultCorners: QuadCorners = corners || {
        topLeft: { x: Math.round(img.width * 0.08), y: Math.round(img.height * 0.08) },
        topRight: { x: Math.round(img.width * 0.92), y: Math.round(img.height * 0.08) },
        bottomRight: { x: Math.round(img.width * 0.92), y: Math.round(img.height * 0.92) },
        bottomLeft: { x: Math.round(img.width * 0.08), y: Math.round(img.height * 0.92) },
      };

      const newPage: ScannedPage = {
        id: `page-${Date.now()}-${Math.random()}`,
        originalImage: dataUrl,
        transformedImage: dataUrl,
        filteredImage: dataUrl,
        corners: defaultCorners,
        filter: 'magic_color',
        ocrText: sampleOcr || 'Extracted content will appear after OCR recognition.',
        pageNumber: pages.length + 1,
        width: img.width,
        height: img.height,
        createdAt: Date.now(),
      };

      setPages((prev) => [...prev, newPage]);
      setCurrentPageIndex(pages.length);
      setMode('crop');
    };
    img.src = dataUrl;
  };

  const currentPage = pages[currentPageIndex];

  // Perform Perspective Transform (Unskew)
  const handleApplyCrop = () => {
    if (!currentPage) return;
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // 1. Perspective Transform
          const unskewedCanvas = warpPerspective(img, currentPage.corners);
          const unskewedDataUrl = unskewedCanvas.toDataURL('image/jpeg', 0.95);

          // 2. Apply current filter (Default: Magic Color)
          const filteredCanvas = applyDocumentFilter(unskewedCanvas, currentPage.filter);
          const filteredDataUrl = filteredCanvas.toDataURL('image/jpeg', 0.95);

          // Update page state
          setPages((prev) =>
            prev.map((p, idx) =>
              idx === currentPageIndex
                ? {
                    ...p,
                    transformedImage: unskewedDataUrl,
                    filteredImage: filteredDataUrl,
                  }
                : p
            )
          );

          setMode('preview');
          setIsProcessing(false);
        };
        img.src = currentPage.originalImage;
      } catch (err) {
        console.error('Perspective transform error:', err);
        setIsProcessing(false);
      }
    }, 50);
  };

  // Change Filter on current transformed page
  const handleFilterChange = (filter: FilterType) => {
    if (!currentPage) return;
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const filteredCanvas = applyDocumentFilter(canvas, filter);
            const filteredDataUrl = filteredCanvas.toDataURL('image/jpeg', 0.95);

            setPages((prev) =>
              prev.map((p, idx) =>
                idx === currentPageIndex
                  ? {
                      ...p,
                      filter,
                      filteredImage: filteredDataUrl,
                    }
                  : p
              )
            );
          }
          setIsProcessing(false);
        };
        img.src = currentPage.transformedImage;
      } catch (err) {
        console.error('Filter error:', err);
        setIsProcessing(false);
      }
    }, 40);
  };

  // Handle user photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      loadDocumentFromDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Export current page as JPG
  const handleExportJpg = async () => {
    if (!currentPage) return;
    const imgData = currentPage.filteredImage || currentPage.transformedImage || currentPage.originalImage;
    await exportPageAsJpg(imgData, `CamScanner_Page_${currentPageIndex + 1}.jpg`);
  };

  // Compile multi-page PDF
  const handleGeneratePdf = async (openViewer = false) => {
    if (pages.length === 0) return;
    setIsExportingPdf(true);
    try {
      const blob = await exportPagesAsPdf(pages, openViewer ? '' : 'Scanned_Document.pdf');
      setGeneratedPdfBlob(blob);
      if (openViewer) {
        setIsPdfViewerOpen(true);
      }
    } catch (err) {
      console.error('PDF generation error', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleOpenPdfViewer = async () => {
    await handleGeneratePdf(true);
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, i) => i !== index));
    if (currentPageIndex >= pages.length - 1) {
      setCurrentPageIndex(Math.max(0, pages.length - 2));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold text-white">CamScanner ইন্টারেক্টিভ ল্যাব</span>
            <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30">
              Live Edge Detection & Perspective Warp
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            মোবাইলে যেভাবে ক্যামেরা দিয়ে স্ক্যান করা হয়, ঠিক সেভাবে এখানে লাইভ পরীক্ষা করুন
          </p>
        </div>

        {/* Action Controls (Camera, Upload, Sample Presets) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sample Preset Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] px-2 font-medium">নমুনা ফাইল:</span>
            {sampleDocs.map((sample) => (
              <button
                key={sample.id}
                onClick={() =>
                  loadDocumentFromDataUrl(sample.dataUrl, sample.defaultCorners, sample.sampleOcr)
                }
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition"
              >
                {sample.name}
              </button>
            ))}
          </div>

          {/* User File Upload */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>গ্যালারি থেকে ছবি</span>
          </button>

          {/* Camera Capture */}
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>ক্যামেরা দিয়ে স্ক্যান</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Multi-page Batch Strip & Thumbnails */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                পেজ তালিকা ({pages.length})
              </span>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>পেজ যোগ</span>
            </button>
          </div>

          {/* Thumbnail list */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {pages.map((page, index) => {
              const isSelected = index === currentPageIndex;
              const thumbSrc = page.filteredImage || page.transformedImage || page.originalImage;

              return (
                <div
                  key={page.id}
                  onClick={() => setCurrentPageIndex(index)}
                  className={`group relative flex items-center space-x-3 p-2 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-500 ring-1 ring-sky-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className="relative w-14 h-18 bg-black rounded-lg overflow-hidden border border-slate-700/80 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={thumbSrc}
                      alt={`Page ${index + 1}`}
                      className="max-h-full max-w-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-mono text-white px-1 rounded">
                      P{index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        Page {index + 1}
                      </span>
                      {page.filter !== 'original' && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded font-mono uppercase">
                          {page.filter}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {page.width} × {page.height}px
                    </p>
                  </div>

                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(index);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Multi-Page Quick Export Controls */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              id="btn-export-multipage-pdf"
              onClick={() => handleGeneratePdf(false)}
              disabled={isExportingPdf || pages.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {isExportingPdf ? 'PDF তৈরি হচ্ছে...' : `সকল পেজ মিলে PDF সেভ (${pages.length})`}
              </span>
            </button>

            <button
              id="btn-open-pdf-viewer"
              onClick={handleOpenPdfViewer}
              disabled={pages.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>ইন-বিল্ট PDF Viewer এ দেখুন</span>
            </button>
          </div>
        </div>

        {/* Right Column: Active Canvas / Unskewed Preview Area */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {currentPage ? (
            <>
              {/* Mode Switcher Toolbar (Crop / Preview) */}
              <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMode('crop')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      mode === 'crop'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>১. ক্রপ ও কোণা সমন্বয় (Edge Detect)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (currentPage.transformedImage === currentPage.originalImage) {
                        handleApplyCrop();
                      } else {
                        setMode('preview');
                      }
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      mode === 'preview'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>২. ফিল্টার ও ফাইনাল প্রিভিউ (Unskewed)</span>
                  </button>
                </div>

                {/* Right quick exports */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportJpg}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    title="এই পেজটি উচ্চমানের JPG হিসেবে সেভ করুন"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">JPG সেভ</span>
                  </button>

                  <button
                    id="btn-trigger-ocr"
                    onClick={() => setIsOcrOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>OCR & Word (.docx)</span>
                  </button>
                </div>
              </div>

              {/* Central View Area */}
              <div className="relative min-h-[500px] flex-1 flex items-center justify-center p-4 bg-slate-950">
                {mode === 'crop' ? (
                  <CropCanvas
                    imageSrc={currentPage.originalImage}
                    corners={currentPage.corners}
                    onCornersChange={(newCorners) => {
                      setPages((prev) =>
                        prev.map((p, idx) =>
                          idx === currentPageIndex ? { ...p, corners: newCorners } : p
                        )
                      );
                    }}
                    onConfirmCrop={handleApplyCrop}
                  />
                ) : (
                  /* Unskewed, Rectified & Filtered Document Preview */
                  <div className="relative max-w-full max-h-[580px] flex flex-col items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-2xl p-2 max-w-full overflow-hidden border border-slate-700">
                      <img
                        src={currentPage.filteredImage || currentPage.transformedImage}
                        alt="Unskewed Scanned Page"
                        className="max-h-[520px] w-auto object-contain rounded shadow"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Enhancement Filter Toolbar */}
              <FilterToolbar
                currentFilter={currentPage.filter}
                onFilterSelect={handleFilterChange}
                isProcessing={isProcessing}
              />
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <p>কোনো পেজ লোড করা নেই। উপরে নমুনা ফাইল অথবা ক্যামেরা সিলেক্ট করুন।</p>
            </div>
          )}
        </div>
      </div>

      {/* OCR & Word (.docx) Modal */}
      {currentPage && (
        <OcrWordModal
          isOpen={isOcrOpen}
          onClose={() => setIsOcrOpen(false)}
          ocrText={currentPage.ocrText || ''}
          imageSrc={currentPage.filteredImage || currentPage.transformedImage}
        />
      )}

      {/* In-Built PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={isPdfViewerOpen}
        onClose={() => setIsPdfViewerOpen(false)}
        pdfBlob={generatedPdfBlob}
        fileName="CamScanner_Scanned_Document.pdf"
      />
    </div>
  );
};
