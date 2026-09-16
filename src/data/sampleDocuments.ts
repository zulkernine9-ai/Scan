import { SampleDoc } from '../types';

/**
 * Creates high-fidelity canvas-drawn sample documents with realistic skew,
 * folds, text lines, and contrast for immediate testing.
 */
function createSampleDocumentCanvas(
  title: string,
  items: string[],
  accentColor: string,
  includeStamp = true
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 850;
  canvas.height = 1150;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background desk surface (wood/gray slate)
  ctx.fillStyle = '#26282B';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle wood/desk texture lines
  ctx.strokeStyle = '#1F2023';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.height; i += 24) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Draw paper with realistic perspective skew on the desk!
  ctx.save();
  // Document shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 12;
  ctx.shadowOffsetY = 16;

  // Paper path: slightly skewed trapezoid
  const p1 = { x: 75, y: 70 };
  const p2 = { x: 775, y: 110 };
  const p3 = { x: 745, y: 1080 };
  const p4 = { x: 95, y: 1030 };

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();

  // Paper gradient (slightly warm paper tone with soft ambient light variation)
  const grad = ctx.createLinearGradient(100, 100, 700, 1000);
  grad.addColorStop(0, '#FAFAF7');
  grad.addColorStop(0.5, '#F5F4EE');
  grad.addColorStop(1, '#ECEAE1');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Subtle paper borders
  ctx.strokeStyle = '#D8D4C7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw skewed content onto the document surface by applying a transform
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.clip();

  // Draw content with gentle slant to match the paper
  ctx.translate(110, 120);
  ctx.rotate(0.045);

  // Document Header
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, 600, 6);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(title, 0, 48);

  ctx.fillStyle = '#4B5563';
  ctx.font = '14px monospace';
  ctx.fillText(`DOC-REF: ${Math.floor(100000 + Math.random() * 900000)} | DATE: 2026-09-15`, 0, 76);

  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 94);
  ctx.lineTo(600, 94);
  ctx.stroke();

  // Document lines / items
  let y = 135;
  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#1F2937';

  for (const item of items) {
    if (item.startsWith('##')) {
      y += 10;
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(item.replace('##', '').trim(), 0, y);
      y += 24;
      ctx.font = '15px sans-serif';
      ctx.fillStyle = '#1F2937';
    } else if (item.startsWith('---')) {
      ctx.strokeStyle = '#D1D5DB';
      ctx.beginPath();
      ctx.moveTo(0, y - 6);
      ctx.lineTo(600, y - 6);
      ctx.stroke();
      y += 18;
    } else {
      ctx.fillText(item, 0, y);
      y += 28;
    }
  }

  // Stamp
  if (includeStamp) {
    ctx.save();
    ctx.translate(430, y + 40);
    ctx.rotate(-0.15);
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 3;
    ctx.strokeRect(-10, -10, 150, 60);
    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('VERIFIED & PAID', 0, 26);
    ctx.font = '11px sans-serif';
    ctx.fillText('OFFICIAL AUDIT OK', 10, 42);
    ctx.restore();
  }

  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'invoice',
    name: 'Business Tax Invoice',
    category: 'Billing',
    description: 'Skewed photo on dark table with shadows and corner distortion',
    dataUrl: '', // Generated on initialization
    defaultCorners: {
      topLeft: { x: 75, y: 70 },
      topRight: { x: 775, y: 110 },
      bottomRight: { x: 745, y: 1080 },
      bottomLeft: { x: 95, y: 1030 },
    },
    sampleOcr: `COMMERCIAL INVOICE #INV-892401
DATE: September 15, 2026
DUE DATE: October 01, 2026

BILLED TO:
Apex Global Technologies Ltd.
Suite 402, Silicon Plaza, Tech City
VAT / GST ID: 9840-23910-GB

DESCRIPTION OF SERVICES:
1. Mobile Architecture Audit (Flutter/Kotlin)      $2,450.00
2. Computer Vision Pipeline (Perspective/Crop)     $3,100.00
3. On-Device OCR & Document Engine Export          $1,850.00
4. Cloud & Local PDF Generation Modules            $1,200.00
--------------------------------------------------------
SUBTOTAL                                           $8,600.00
TAX / VAT (10%)                                      $860.00
TOTAL AMOUNT PAYABLE                               $9,460.00

STATUS: VERIFIED & PAID
AUTHORIZING OFFICER: J. Reynolds, Head of Engineering`,
  },
  {
    id: 'contract',
    name: 'Service Level Agreement',
    category: 'Legal',
    description: 'Contract document with headings, signatures, and fine print',
    dataUrl: '',
    defaultCorners: {
      topLeft: { x: 80, y: 75 },
      topRight: { x: 770, y: 115 },
      bottomRight: { x: 740, y: 1075 },
      bottomLeft: { x: 100, y: 1025 },
    },
    sampleOcr: `MUTUAL CONFIDENTIALITY AND SERVICE AGREEMENT

This Agreement is entered into on September 15, 2026, by and between:
Party A: Horizon Systems Inc.
Party B: Zenith Digital Solutions Corp.

SECTION 1: SCOPE OF SERVICES
The Service Provider agrees to deliver production-ready software components adhering to Clean Architecture principles, automated test suites, and cross-platform native plugins for Android and Flutter document scanning.

SECTION 2: PROPRIETARY INFORMATION & IP
All source code, algorithms, and documentation developed under this schedule shall remain the exclusive intellectual property of the Client upon settlement of deliverables.

SECTION 3: WARRANTY & COMPLIANCE
The software shall conform to standard Google Play Store policy and Android 14/15 camera permissions guidelines.

SIGNATURES:
For Party A: [Signed digitally]
For Party B: [Signed digitally]`,
  },
];

// Initialize sample data URLs
export function getInitializedSampleDocs(): SampleDoc[] {
  return SAMPLE_DOCUMENTS.map((doc) => {
    if (doc.id === 'invoice') {
      doc.dataUrl = createSampleDocumentCanvas(
        'COMMERCIAL INVOICE',
        [
          '## BILLED TO: APEX GLOBAL TECH',
          'Suite 402, Silicon Plaza, Tech City',
          'VAT / GST ID: 9840-23910-GB',
          '---',
          '1. Mobile Architecture Audit (Flutter/Kotlin)  $2,450.00',
          '2. Computer Vision Pipeline (Perspective/Crop)  $3,100.00',
          '3. On-Device OCR & Document Engine Export       $1,850.00',
          '4. Cloud & Local PDF Generation Modules         $1,200.00',
          '---',
          'SUBTOTAL:                                     $8,600.00',
          'TAX / VAT (10%):                                $860.00',
          'TOTAL AMOUNT DUE:                             $9,460.00',
        ],
        '#0284C7',
        true
      );
    } else {
      doc.dataUrl = createSampleDocumentCanvas(
        'SERVICE LEVEL AGREEMENT',
        [
          '## SECTION 1: TERMS & APPLICABILITY',
          'This agreement governs mobile document scanning applications.',
          'All components must support auto-edge detection and perspective warp.',
          '---',
          '## SECTION 2: SECURITY & PERMISSIONS',
          'Camera and external storage permissions must follow Android 14/15 standards.',
          'All user document data stays on-device unless cloud backup is activated.',
          '---',
          '## SECTION 3: ACCEPTANCE CRITERIA',
          '1. Auto-crop accuracy >= 95% on clean backgrounds.',
          '2. Perspective transform unskew latency < 250ms.',
          '3. OCR accuracy with block segmentation supported.',
        ],
        '#1E3A8A',
        true
      );
    }
    return doc;
  });
}
