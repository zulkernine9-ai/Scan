import 'dart:io';
import 'dart:math';
import 'package:image/image.dart' as img;

enum DocumentFilterType {
  original,
  magicColor,
  blackAndWhite,
  grayscale,
}

class ImageFilterEngine {
  static Future<File> applyFilter({
    required File inputFile,
    required File outputFile,
    required DocumentFilterType filterType,
  }) async {
    final bytes = await inputFile.readAsBytes();
    final image = img.decodeImage(bytes);
    if (image == null) throw Exception('Unable to decode image');

    img.Image processed;

    switch (filterType) {
      case DocumentFilterType.magicColor:
        processed = _applyMagicColor(image);
        break;
      case DocumentFilterType.blackAndWhite:
        processed = _applyAdaptiveThresholdBW(image);
        break;
      case DocumentFilterType.grayscale:
        processed = _applyGrayscaleEnhanced(image);
        break;
      case DocumentFilterType.original:
      default:
        processed = image;
        break;
    }

    final encodedBytes = img.encodeJpg(processed, quality: 95);
    await outputFile.writeAsBytes(encodedBytes);
    return outputFile;
  }

  static img.Image _applyMagicColor(img.Image src) {
    final out = img.Image.from(src);

    for (final pixel in out) {
      final r = pixel.r;
      final g = pixel.g;
      final b = pixel.b;

      final lum = 0.299 * r + 0.587 * g + 0.114 * b;

      num newR = r;
      num newG = g;
      num newB = b;

      if (lum > 135) {
        final lift = (lum - 135) / 120.0;
        newR = min(255, r + lift * 45);
        newG = min(255, g + lift * 45);
        newB = min(255, b + lift * 45);
      } else {
        newR = max(0, r * 0.85);
        newG = max(0, g * 0.85);
        newB = max(0, b * 0.85);
      }

      pixel.r = newR.clamp(0, 255);
      pixel.g = newG.clamp(0, 255);
      pixel.b = newB.clamp(0, 255);
    }

    return img.adjustColor(out, contrast: 1.25, saturation: 1.1);
  }

  static img.Image _applyAdaptiveThresholdBW(img.Image src) {
    final gray = img.grayscale(src);
    final out = img.Image(width: gray.width, height: gray.height);

    final histogram = List<int>.filled(256, 0);
    for (final pixel in gray) {
      histogram[pixel.r.toInt()]++;
    }

    int totalPixels = gray.width * gray.height;
    double sum = 0;
    for (int t = 0; t < 256; t++) sum += t * histogram[t];

    double sumB = 0;
    int wB = 0;
    int wF = 0;
    double varMax = 0;
    int threshold = 128;

    for (int t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB == 0) continue;
      wF = totalPixels - wB;
      if (wF == 0) break;

      sumB += t * histogram[t];
      double mB = sumB / wB;
      double mF = (sum - sumB) / wF;

      double varBetween = wB * wF * (mB - mF) * (mB - mF);
      if (varBetween > varMax) {
        varMax = varBetween;
        threshold = t;
      }
    }

    final finalThreshold = threshold.clamp(90, 180);
    for (int y = 0; y < gray.height; y++) {
      for (int x = 0; x < gray.width; x++) {
        final p = gray.getPixel(x, y);
        final val = p.r < finalThreshold ? 0 : 255;
        out.setPixelRgb(x, y, val, val, val);
      }
    }

    return out;
  }

  static img.Image _applyGrayscaleEnhanced(img.Image src) {
    final gray = img.grayscale(src);
    return img.adjustColor(gray, contrast: 1.35, brightness: 1.05);
  }
}
