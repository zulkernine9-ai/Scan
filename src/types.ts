export interface Point {
  x: number;
  y: number;
}

export interface QuadCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export type FilterType = 'original' | 'magic_color' | 'bw' | 'grayscale' | 'sharpen';

export interface ScannedPage {
  id: string;
  originalImage: string; // data URL or URL
  transformedImage: string; // after perspective transform
  filteredImage: string; // after enhancement filter applied
  corners: QuadCorners;
  filter: FilterType;
  ocrText?: string;
  pageNumber: number;
  width: number;
  height: number;
  createdAt: number;
}

export interface CodeSnippet {
  id: string;
  title: string;
  category: 'architecture' | 'scanner_crop' | 'filters' | 'pdf_export' | 'ocr_docx' | 'pdf_viewer';
  language: 'dart' | 'kotlin' | 'yaml' | 'json';
  filePath: string;
  description: string;
  code: string;
}

export interface SampleDoc {
  id: string;
  name: string;
  category: string;
  description: string;
  dataUrl: string;
  defaultCorners: QuadCorners;
  sampleOcr: string;
}
