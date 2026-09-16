import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Point, QuadCorners } from '../types';
import { autoDetectDocumentCorners } from '../utils/imageProcessing';
import { Maximize2, RotateCcw, Sparkles, Check } from 'lucide-react';

interface CropCanvasProps {
  imageSrc: string;
  corners: QuadCorners;
  onCornersChange: (newCorners: QuadCorners) => void;
  onConfirmCrop: () => void;
  onCancel?: () => void;
}

type CornerKey = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';

export const CropCanvas: React.FC<CropCanvasProps> = ({
  imageSrc,
  corners,
  onCornersChange,
  onConfirmCrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCorner, setActiveCorner] = useState<CornerKey | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [loupePoint, setLoupePoint] = useState<Point | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImgElement(img);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Recalculate layout & scale on resize
  const updateLayout = useCallback(() => {
    if (!containerRef.current || !imgElement || !canvasRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight || 500;

    const imgWidth = imgElement.naturalWidth || 800;
    const imgHeight = imgElement.naturalHeight || 1100;

    const scaleX = (containerWidth - 40) / imgWidth;
    const scaleY = (containerHeight - 40) / imgHeight;
    const s = Math.min(scaleX, scaleY, 1);

    const renderedWidth = imgWidth * s;
    const renderedHeight = imgHeight * s;

    const offsetX = (containerWidth - renderedWidth) / 2;
    const offsetY = (containerHeight - renderedHeight) / 2;

    setScale(s);
    setOffset({ x: offsetX, y: offsetY });

    const canvas = canvasRef.current;
    canvas.width = containerWidth;
    canvas.height = containerHeight;
  }, [imgElement]);

  useEffect(() => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [updateLayout]);

  // Render canvas overlay
  useEffect(() => {
    if (!canvasRef.current || !imgElement) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    ctx.drawImage(imgElement, 0, 0);

    // Quad Polygon points
    const { topLeft, topRight, bottomRight, bottomLeft } = corners;

    // Dim outside region
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, imgElement.naturalWidth, imgElement.naturalHeight);

    // Cut out quadrilateral
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Quad Outline
    ctx.strokeStyle = '#38BDF8'; // Sky blue
    ctx.lineWidth = 3 / scale;
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();
    ctx.stroke();

    // Draw grid guide lines (3x3 grid inside quad)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1 / scale;
    for (let i = 1; i <= 2; i++) {
      const t = i / 3;
      // Horizontal grid
      const lx = topLeft.x + (bottomLeft.x - topLeft.x) * t;
      const ly = topLeft.y + (bottomLeft.y - topLeft.y) * t;
      const rx = topRight.x + (bottomRight.x - topRight.x) * t;
      const ry = topRight.y + (bottomRight.y - topRight.y) * t;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(rx, ry);
      ctx.stroke();

      // Vertical grid
      const tx = topLeft.x + (topRight.x - topLeft.x) * t;
      const ty = topLeft.y + (topRight.y - topLeft.y) * t;
      const bx = bottomLeft.x + (bottomRight.x - bottomLeft.x) * t;
      const by = bottomLeft.y + (bottomRight.y - bottomLeft.y) * t;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    ctx.restore();
  }, [imgElement, corners, scale, offset]);

  // Handle Dragging
  const handlePointerDown = (corner: CornerKey, e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveCorner(corner);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeCorner || !containerRef.current || !imgElement) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert screen coordinates to original image coordinates
    const imgX = Math.round(Math.max(0, Math.min(imgElement.naturalWidth, (mouseX - offset.x) / scale)));
    const imgY = Math.round(Math.max(0, Math.min(imgElement.naturalHeight, (mouseY - offset.y) / scale)));

    setLoupePoint({ x: imgX, y: imgY });

    onCornersChange({
      ...corners,
      [activeCorner]: { x: imgX, y: imgY },
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeCorner) {
      setActiveCorner(null);
      setLoupePoint(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Convert image point to screen point for DOM handles
  const toScreenPoint = (p: Point): Point => {
    return {
      x: offset.x + p.x * scale,
      y: offset.y + p.y * scale,
    };
  };

  const resetToFullBounds = () => {
    if (!imgElement) return;
    const w = imgElement.naturalWidth;
    const h = imgElement.naturalHeight;
    onCornersChange({
      topLeft: { x: 10, y: 10 },
      topRight: { x: w - 10, y: 10 },
      bottomRight: { x: w - 10, y: h - 10 },
      bottomLeft: { x: 10, y: h - 10 },
    });
  };

  const handleAutoDetect = () => {
    if (!imgElement) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgElement.naturalWidth;
    tempCanvas.height = imgElement.naturalHeight;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imgElement, 0, 0);
      const detected = autoDetectDocumentCorners(tempCanvas);
      onCornersChange(detected);
    }
  };

  const cornerLabels: Record<CornerKey, string> = {
    topLeft: 'Top Left',
    topRight: 'Top Right',
    bottomRight: 'Bottom Right',
    bottomLeft: 'Bottom Left',
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/60">
            Step 1: Crop & Unskew
          </span>
          <span className="text-sm text-slate-300 hidden md:inline">
            কোণাগুলো টেনে ডকুমেন্টের সীমানা ঠিক করুন
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-auto-detect-corners"
            onClick={handleAutoDetect}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-sky-300 hover:bg-slate-700 border border-slate-700 transition"
            title="স্বয়ংক্রিয় কোণা শনাক্তকরণ"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>অটো-ডিটেক্ট কোণা</span>
          </button>

          <button
            id="btn-reset-bounds"
            onClick={resetToFullBounds}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition"
            title="সম্পূর্ণ ছবি নির্বাচন করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ফুল সাইজ</span>
          </button>

          <button
            id="btn-confirm-crop"
            onClick={onConfirmCrop}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>সোজা ও সমান করুন (Unskew)</span>
          </button>
        </div>
      </div>

      {/* Interactive Dragging Canvas */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="relative flex-1 min-h-[480px] w-full select-none cursor-crosshair overflow-hidden touch-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

        {/* 4 Draggable Corner Handles */}
        {(['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as CornerKey[]).map((cornerKey) => {
          const screenPt = toScreenPoint(corners[cornerKey]);
          const isActive = activeCorner === cornerKey;

          return (
            <div
              key={cornerKey}
              id={`handle-${cornerKey}`}
              onPointerDown={(e) => handlePointerDown(cornerKey, e)}
              onPointerUp={handlePointerUp}
              style={{
                transform: `translate(${screenPt.x - 20}px, ${screenPt.y - 20}px)`,
              }}
              className="absolute top-0 left-0 w-10 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
            >
              {/* Outer pulsing ring when active */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-sky-500 ring-4 ring-sky-400/40 shadow-lg scale-125'
                    : 'bg-white border-2 border-sky-500 shadow-md hover:scale-110'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isActive ? 'bg-white' : 'bg-sky-600'
                  }`}
                />
              </div>
            </div>
          );
        })}

        {/* Precision Magnifying Loupe while dragging */}
        {activeCorner && loupePoint && imgElement && (
          <div className="absolute top-4 right-4 z-30 w-36 h-36 rounded-2xl overflow-hidden border-2 border-sky-400 bg-slate-900 shadow-2xl pointer-events-none flex flex-col items-center">
            <div className="relative w-full h-28 overflow-hidden bg-black">
              {/* Loupe Canvas showing 2.5x zoomed view */}
              <canvas
                width={144}
                height={112}
                ref={(loupeCanvas) => {
                  if (!loupeCanvas) return;
                  const ctx = loupeCanvas.getContext('2d');
                  if (!ctx) return;
                  ctx.clearRect(0, 0, 144, 112);

                  const zoom = 2.4;
                  const srcW = 144 / zoom;
                  const srcH = 112 / zoom;
                  const srcX = Math.max(0, Math.min(imgElement.naturalWidth - srcW, loupePoint.x - srcW / 2));
                  const srcY = Math.max(0, Math.min(imgElement.naturalHeight - srcH, loupePoint.y - srcH / 2));

                  ctx.drawImage(imgElement, srcX, srcY, srcW, srcH, 0, 0, 144, 112);

                  // Center crosshair in loupe
                  ctx.strokeStyle = '#38BDF8';
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.moveTo(72, 0);
                  ctx.lineTo(72, 112);
                  ctx.moveTo(0, 56);
                  ctx.lineTo(144, 56);
                  ctx.stroke();

                  ctx.strokeStyle = '#FFFFFF';
                  ctx.beginPath();
                  ctx.arc(72, 56, 8, 0, Math.PI * 2);
                  ctx.stroke();
                }}
              />
            </div>
            <div className="w-full bg-slate-800 text-center py-1 text-[10px] font-mono text-sky-300">
              {cornerLabels[activeCorner]}: {loupePoint.x} × {loupePoint.y}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
