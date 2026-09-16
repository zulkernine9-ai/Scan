import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { ScannedPage } from '../types';

/**
 * Downloads a Blob as a file in the browser
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports a single page as a high-quality JPG image
 */
export async function exportPageAsJpg(dataUrl: string, fileName = 'scanned_document.jpg', quality = 0.95): Promise<void> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // Fill white background for JPEG transparency safety
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  canvas.toBlob(
    (blob) => {
      if (blob) {
        downloadBlob(blob, fileName);
      }
    },
    'image/jpeg',
    quality
  );
}

/**
 * Compiles single or multi-page scanned documents into a single PDF
 */
export async function exportPagesAsPdf(
  pages: ScannedPage[],
  fileName = 'CamScanner_Document.pdf',
  onProgress?: (progress: number) => void
): Promise<Blob> {
  if (pages.length === 0) {
    throw new Error('No pages to export');
  }

  // A4 standard aspect ratio: 210mm x 297mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const imgData = page.filteredImage || page.transformedImage || page.originalImage;

    // Load image to determine native aspect ratio
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
      img.src = imgData;
    });

    const imgWidth = img.naturalWidth || 800;
    const imgHeight = img.naturalHeight || 1100;
    const imgRatio = imgWidth / imgHeight;
    const a4Ratio = pageWidth / pageHeight;

    let renderW = pageWidth;
    let renderH = pageHeight;
    let posX = 0;
    let posY = 0;

    if (imgRatio > a4Ratio) {
      // Wider than A4
      renderW = pageWidth;
      renderH = pageWidth / imgRatio;
      posY = (pageHeight - renderH) / 2;
    } else {
      // Taller than A4
      renderH = pageHeight;
      renderW = pageHeight * imgRatio;
      posX = (pageWidth - renderW) / 2;
    }

    pdf.addImage(imgData, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');

    if (onProgress) {
      onProgress(Math.round(((i + 1) / pages.length) * 100));
    }
  }

  const pdfBlob = pdf.output('blob');
  if (fileName) {
    downloadBlob(pdfBlob, fileName);
  }
  return pdfBlob;
}

/**
 * Generates an editable Microsoft Word (.docx) document from extracted OCR text
 */
export async function exportOcrToDocx(
  text: string,
  docTitle = 'Extracted Scanned Document',
  fileName = 'Scanned_Doc_OCR.docx'
): Promise<Blob> {
  const lines = text.split('\n');

  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: docTitle,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Extracted via CamScanner OCR on ${new Date().toLocaleDateString()}`,
          italics: true,
          color: '666666',
          size: 20, // 10pt
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      // Empty line spacing
      paragraphs.push(
        new Paragraph({
          text: '',
          spacing: { after: 120 },
        })
      );
    } else if (trimmed.startsWith('# ') || trimmed.toUpperCase() === trimmed && trimmed.length < 40 && !trimmed.includes('.')) {
      // Probable section header
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace(/^#\s*/, ''),
              bold: true,
              size: 28, // 14pt
              color: '1A365D',
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );
    } else {
      // Regular body paragraph
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              size: 22, // 11pt
              font: 'Calibri',
            }),
          ],
          spacing: { after: 140, line: 276 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  if (fileName) {
    downloadBlob(blob, fileName);
  }
  return blob;
}
