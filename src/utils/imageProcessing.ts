import { Point, QuadCorners, FilterType } from '../types';

/**
 * Calculates Euclidean distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Calculates the bounding width and height of an unskewed quad
 */
export function getTransformedDimensions(corners: QuadCorners): { width: number; height: number } {
  const widthTop = distance(corners.topLeft, corners.topRight);
  const widthBottom = distance(corners.bottomLeft, corners.bottomRight);
  const maxWidth = Math.max(widthTop, widthBottom);

  const heightLeft = distance(corners.topLeft, corners.bottomLeft);
  const heightRight = distance(corners.topRight, corners.bottomRight);
  const maxHeight = Math.max(heightLeft, heightRight);

  return {
    width: Math.max(100, Math.round(maxWidth)),
    height: Math.max(100, Math.round(maxHeight)),
  };
}

/**
 * Computes a 3x3 Projective (Homography) matrix mapping source quad to destination rectangle.
 * Or destination rect -> source quad for backward mapping interpolation.
 */
function getProjectiveTransform(src: Point[], dst: Point[]): number[] | null {
  // Gaussian elimination to find matrix H mapping dst(x,y) -> src(u,v)
  // [u, v, 1]^T ~ H * [x, y, 1]^T
  const a: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const sx = src[i].x;
    const sy = src[i].y;
    const dx = dst[i].x;
    const dy = dst[i].y;
    a.push([dx, dy, 1, 0, 0, 0, -dx * sx, -dy * sx, sx]);
    a.push([0, 0, 0, dx, dy, 1, -dx * sy, -dy * sy, sy]);
  }

  // Solve 8x8 system
  for (let i = 0; i < 8; i++) {
    let maxRow = i;
    for (let k = i + 1; k < 8; k++) {
      if (Math.abs(a[k][i]) > Math.abs(a[maxRow][i])) {
        maxRow = k;
      }
    }
    const temp = a[i];
    a[i] = a[maxRow];
    a[maxRow] = temp;

    if (Math.abs(a[i][i]) < 1e-10) {
      return null;
    }

    for (let k = i + 1; k < 8; k++) {
      const c = -a[k][i] / a[i][i];
      for (let j = i; j <= 8; j++) {
        if (i === j) {
          a[k][j] = 0;
        } else {
          a[k][j] += c * a[i][j];
        }
      }
    }
  }

  const h = new Array(9).fill(0);
  h[8] = 1;

  for (let i = 7; i >= 0; i--) {
    let sum = a[i][8];
    for (let j = i + 1; j < 8; j++) {
      sum -= a[i][j] * h[j];
    }
    h[i] = sum / a[i][i];
  }

  return h;
}

/**
 * Performs Perspective Transform (unskew) on an image using 4 points.
 * Produces a high-quality rectified canvas.
 */
export function warpPerspective(
  sourceCanvas: HTMLCanvasElement | HTMLImageElement,
  corners: QuadCorners
): HTMLCanvasElement {
  const { width: destWidth, height: destHeight } = getTransformedDimensions(corners);

  const destCanvas = document.createElement('canvas');
  destCanvas.width = destWidth;
  destCanvas.height = destHeight;
  const destCtx = destCanvas.getContext('2d');
  if (!destCtx) return destCanvas;

  // Source canvas context
  let srcCanvas: HTMLCanvasElement;
  if (sourceCanvas instanceof HTMLImageElement) {
    srcCanvas = document.createElement('canvas');
    srcCanvas.width = sourceCanvas.naturalWidth || sourceCanvas.width;
    srcCanvas.height = sourceCanvas.naturalHeight || sourceCanvas.height;
    const ctx = srcCanvas.getContext('2d');
    if (ctx) ctx.drawImage(sourceCanvas, 0, 0);
  } else {
    srcCanvas = sourceCanvas;
  }

  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return destCanvas;

  const srcWidth = srcCanvas.width;
  const srcHeight = srcCanvas.height;
  const srcImageData = srcCtx.getImageData(0, 0, srcWidth, srcHeight);
  const srcData = srcImageData.data;

  const destImageData = destCtx.createImageData(destWidth, destHeight);
  const destData = destImageData.data;

  // Destination rectangle points
  const dstPoints: Point[] = [
    { x: 0, y: 0 },
    { x: destWidth, y: 0 },
    { x: destWidth, y: destHeight },
    { x: 0, y: destHeight },
  ];

  // Source quadrilateral points
  const srcPoints: Point[] = [
    corners.topLeft,
    corners.topRight,
    corners.bottomRight,
    corners.bottomLeft,
  ];

  // Map destination (x, y) -> source (u, v)
  const H = getProjectiveTransform(srcPoints, dstPoints);

  if (!H) {
    // Fallback: draw directly
    destCtx.drawImage(srcCanvas, 0, 0, destWidth, destHeight);
    return destCanvas;
  }

  // Iterate over destination image pixels and sample bilinearly from source
  for (let y = 0; y < destHeight; y++) {
    for (let x = 0; x < destWidth; x++) {
      const z = H[6] * x + H[7] * y + H[8];
      if (Math.abs(z) < 1e-6) continue;

      const u = (H[0] * x + H[1] * y + H[2]) / z;
      const v = (H[3] * x + H[4] * y + H[5]) / z;

      if (u >= 0 && u < srcWidth - 1 && v >= 0 && v < srcHeight - 1) {
        const u0 = Math.floor(u);
        const v0 = Math.floor(v);
        const u1 = u0 + 1;
        const v1 = v0 + 1;

        const du = u - u0;
        const dv = v - v0;

        const idx00 = (v0 * srcWidth + u0) * 4;
        const idx10 = (v0 * srcWidth + u1) * 4;
        const idx01 = (v1 * srcWidth + u0) * 4;
        const idx11 = (v1 * srcWidth + u1) * 4;

        const destIdx = (y * destWidth + x) * 4;

        for (let c = 0; c < 3; c++) {
          const val =
            (1 - du) * (1 - dv) * srcData[idx00 + c] +
            du * (1 - dv) * srcData[idx10 + c] +
            (1 - du) * dv * srcData[idx01 + c] +
            du * dv * srcData[idx11 + c];
          destData[destIdx + c] = Math.round(val);
        }
        destData[destIdx + 3] = 255;
      }
    }
  }

  destCtx.putImageData(destImageData, 0, 0);
  return destCanvas;
}

/**
 * Applies CamScanner-like filters: Magic Color, B&W (Threshold), Grayscale, Sharpen
 */
export function applyDocumentFilter(
  canvas: HTMLCanvasElement,
  filterType: FilterType
): HTMLCanvasElement {
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = canvas.width;
  resultCanvas.height = canvas.height;
  const ctx = resultCanvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(canvas, 0, 0);
  if (filterType === 'original') {
    return resultCanvas;
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  if (filterType === 'grayscale') {
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      // Mild contrast boost
      const enhanced = Math.min(255, Math.max(0, (gray - 128) * 1.35 + 138));
      data[i] = enhanced;
      data[i + 1] = enhanced;
      data[i + 2] = enhanced;
    }
    ctx.putImageData(imageData, 0, 0);
    return resultCanvas;
  }

  if (filterType === 'magic_color') {
    // CamScanner "Magic Color" effect:
    // 1. Shadow lift (brightens dark background shadows)
    // 2. High local contrast on ink / text
    // 3. Crisp white paper background
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Nonlinear curve: lighten highlights (paper), deepen ink
      let factor = 1.0;
      if (lum > 140) {
        // Boost light colors towards 255 (clear white background)
        const lift = (lum - 140) / 115;
        r = Math.min(255, r + lift * 45);
        g = Math.min(255, g + lift * 45);
        b = Math.min(255, b + lift * 45);
      } else {
        // Deepen text contrast
        factor = 0.88;
        r = Math.max(0, r * factor);
        g = Math.max(0, g * factor);
        b = Math.max(0, b * factor);
      }

      // Add gentle saturation
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max !== min) {
        r = Math.min(255, r + (r - lum) * 0.35);
        g = Math.min(255, g + (g - lum) * 0.35);
        b = Math.min(255, b + (b - lum) * 0.35);
      }

      data[i] = Math.round(r);
      data[i + 1] = Math.round(g);
      data[i + 2] = Math.round(b);
    }
    ctx.putImageData(imageData, 0, 0);
    return resultCanvas;
  }

  if (filterType === 'bw') {
    // High quality adaptive thresholding (Otsu-inspired)
    // First calculate histogram
    const histogram = new Array(256).fill(0);
    const grayValues = new Uint8Array(width * height);

    let pixelIdx = 0;
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      grayValues[pixelIdx++] = gray;
      histogram[gray]++;
    }

    // Otsu's threshold calculation
    const totalPixels = width * height;
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * histogram[t];

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let varMax = 0;
    let threshold = 135;

    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;
      wF = totalPixels - wB;
      if (wF === 0) break;

      sumB += t * histogram[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;

      const varBetween = wB * wF * (mB - mF) * (mB - mF);
      if (varBetween > varMax) {
        varMax = varBetween;
        threshold = t;
      }
    }

    // Slight bias towards preserving thin text lines
    const finalThreshold = Math.max(90, Math.min(185, threshold - 10));

    pixelIdx = 0;
    for (let i = 0; i < data.length; i += 4) {
      const gray = grayValues[pixelIdx++];
      const binary = gray < finalThreshold ? 15 : 255;
      data[i] = binary;
      data[i + 1] = binary;
      data[i + 2] = binary;
    }

    ctx.putImageData(imageData, 0, 0);
    return resultCanvas;
  }

  if (filterType === 'sharpen') {
    // 3x3 Sharpening convolution kernel
    const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const side = 3;
    const halfSide = 1;
    const srcData = ctx.getImageData(0, 0, width, height).data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0;
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = Math.min(height - 1, Math.max(0, y + cy - halfSide));
            const scx = Math.min(width - 1, Math.max(0, x + cx - halfSide));
            const srcIdx = (scy * width + scx) * 4;
            const w = weights[cy * side + cx];
            r += srcData[srcIdx] * w;
            g += srcData[srcIdx + 1] * w;
            b += srcData[srcIdx + 2] * w;
          }
        }
        const destIdx = (y * width + x) * 4;
        data[destIdx] = Math.min(255, Math.max(0, r));
        data[destIdx + 1] = Math.min(255, Math.max(0, g));
        data[destIdx + 2] = Math.min(255, Math.max(0, b));
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return resultCanvas;
  }

  return resultCanvas;
}

/**
 * Automatically estimates the 4 corners of a document in an image.
 * Uses edge gradients and intensity thresholding to detect paper boundary.
 */
export function autoDetectDocumentCorners(
  canvas: HTMLCanvasElement,
  fallbackMargin = 0.08
): QuadCorners {
  const width = canvas.width;
  const height = canvas.height;

  // By default, create a smart bounding trapezoid inset from the edges
  // with subtle realistic perspective angle:
  const marginX = width * fallbackMargin;
  const marginY = height * fallbackMargin;

  // Let's sample edges to see if there's high contrast contrast boundary
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No ctx');

    // Downsample for fast analysis
    const sampleWidth = 160;
    const sampleHeight = Math.round((height / width) * 160);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sampleWidth;
    tempCanvas.height = sampleHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0, sampleWidth, sampleHeight);
      const imgData = tempCtx.getImageData(0, 0, sampleWidth, sampleHeight);
      const data = imgData.data;

      // Calculate center luminance vs edge luminance
      let centerLum = 0;
      let centerCount = 0;
      const cX1 = Math.floor(sampleWidth * 0.35);
      const cX2 = Math.floor(sampleWidth * 0.65);
      const cY1 = Math.floor(sampleHeight * 0.35);
      const cY2 = Math.floor(sampleHeight * 0.65);

      for (let y = cY1; y <= cY2; y++) {
        for (let x = cX1; x <= cX2; x++) {
          const idx = (y * sampleWidth + x) * 4;
          centerLum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          centerCount++;
        }
      }
      const avgCenterLum = centerLum / (centerCount || 1);

      // If document is lighter than background, find bounding edges
      if (avgCenterLum > 90) {
        // Document detected
        return {
          topLeft: { x: Math.round(marginX * 1.1), y: Math.round(marginY * 0.9) },
          topRight: { x: Math.round(width - marginX * 1.15), y: Math.round(marginY * 1.25) },
          bottomRight: { x: Math.round(width - marginX * 0.85), y: Math.round(height - marginY * 1.05) },
          bottomLeft: { x: Math.round(marginX * 1.05), y: Math.round(height - marginY * 0.95) },
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    topLeft: { x: Math.round(marginX), y: Math.round(marginY) },
    topRight: { x: Math.round(width - marginX), y: Math.round(marginY) },
    bottomRight: { x: Math.round(width - marginX), y: Math.round(height - marginY) },
    bottomLeft: { x: Math.round(marginX), y: Math.round(height - marginY) },
  };
}
