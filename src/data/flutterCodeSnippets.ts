import { CodeSnippet } from '../types';

export const FLUTTER_CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'pubspec',
    title: '১. dependencies (pubspec.yaml)',
    category: 'architecture',
    language: 'yaml',
    filePath: 'pubspec.yaml',
    description: 'CamScanner অ্যাপের জন্য প্রয়োজনীয় লেটেস্ট প্রোডাকশন প্যাকেজ তালিকা।',
    code: `name: camscanner_pro
description: "All-in-One Document Scanner and Manager App in Flutter"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # 1. State Management & Service Locator
  flutter_riverpod: ^2.5.1
  get_it: ^7.7.0

  # 2. Camera & Native Document Scanning
  camera: ^0.10.6
  # Google Play Services Document Scanner (Auto-crop, 4-corner Edge Detect, Unskew, Enhance)
  google_mlkit_document_scanner: ^0.2.0
  image_picker: ^1.1.2

  # 3. Image Processing & Filters (Dart-native for custom transforms/Magic Color)
  image: ^4.2.0

  # 4. OCR (Text Recognition)
  google_mlkit_text_recognition: ^0.13.0

  # 5. PDF Generation & Printing
  pdf: ^3.10.8
  printing: ^5.13.1

  # 6. Word (.docx) Document Generator & Zip Archive
  archive: ^3.6.1

  # 7. In-built PDF Viewer
  flutter_pdfview: ^1.3.2

  # 8. File Storage, Sharing & Permissions
  path_provider: ^2.1.3
  path: ^1.9.0
  permission_handler: ^11.3.1
  share_plus: ^9.0.0
  file_picker: ^8.0.5

  # 9. Icons & UI
  cupertino_icons: ^1.0.8
  lucide_icons: ^0.257.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/templates/`,
  },
  {
    id: 'architecture_structure',
    title: '২. Clean Architecture (Folder Structure)',
    category: 'architecture',
    language: 'yaml',
    filePath: 'lib/ (Folder Tree)',
    description: 'স্কেলেবল ও মেইনটেইনেবল প্রোডাকশন আর্কিটেকচার ফোল্ডার কাঠামো।',
    code: `lib/
│
├── core/                                # কোর ইউটিলিটি, থিম, কনস্ট্যান্ট এবং হেল্পার
│   ├── constants/
│   │   ├── app_colors.dart              # কালার প্যালেট ও ব্র্যান্ডিং
│   │   └── app_constants.dart           # ফিল্টার ও ফাইল সেটিংস
│   ├── errors/
│   │   └── failures.dart                # এরর হ্যান্ডলিং ক্লাস
│   ├── theme/
│   │   └── app_theme.dart               # লাইট ও ডার্ক থিম
│   └── utils/
│       ├── file_helper.dart             # ফাইল সেভ, ক্যাশ ও পাথ রেজোলিউশন
│       └── image_transformer.dart       # পার্সপেক্টিভ ট্রান্সফর্ম ও ফিল্টার
│
├── features/                            # ফিচার-ভিত্তিক মডিউলার আর্কিটেকচার
│   │
│   ├── scanner/                         # ১. অটো-স্ক্যান, এজ ডিটেকশন ও পার্সপেক্টিভ
│   │   ├── data/
│   │   │   └── document_scanner_repository.dart
│   │   ├── domain/
│   │   │   ├── models/
│   │   │   │   ├── scanned_document.dart
│   │   │   │   ├── scanned_page.dart
│   │   │   │   └── quad_corner.dart     # 4-পয়েন্ট এজ কোঅর্ডিনেট
│   │   │   └── image_filter_engine.dart # Magic Color, B&W, Grayscale
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── camera_scanner_screen.dart
│   │       │   ├── crop_adjust_screen.dart
│   │       │   └── filter_preview_screen.dart
│   │       └── widgets/
│   │           ├── corner_draggable_overlay.dart
│   │           └── filter_selector_bar.dart
│   │
│   ├── export/                          # ২. ফাইল এক্সপোর্ট (High-Res JPG ও Multi-Page PDF)
│   │   ├── services/
│   │   │   ├── pdf_generator_service.dart
│   │   │   └── jpg_exporter_service.dart
│   │   └── presentation/
│   │       └── screens/
│   │           └── export_options_dialog.dart
│   │
│   ├── ocr/                             # ৩. OCR ও Word (.docx) এক্সপোর্ট
│   │   ├── domain/
│   │   │   └── models/ocr_result.dart
│   │   ├── services/
│   │   │   ├── mlkit_ocr_service.dart   # Google ML Kit Text Recognition
│   │   │   └── docx_generator_service.dart # .docx এক্সপোর্ট ইঞ্জিন
│   │   └── presentation/
│   │       └── screens/
│   │           └── ocr_text_editor_screen.dart
│   │
│   └── pdf_viewer/                      # ৪. ইন-বিল্ট PDF Viewer
│       └── presentation/
│           ├── screens/
│           │   └── pdf_viewer_screen.dart
│           └── widgets/
│               ├── pdf_page_indicator.dart
│               └── pdf_bottom_controls.dart
│
├── android/                             # নেটিভ অ্যান্ড্রয়েড কোড (OpenCV / ML Kit)
│   └── app/src/main/kotlin/.../
│       ├── MainActivity.kt
│       └── DocumentScanMethodChannel.kt
│
└── main.dart                            # অ্যাপ্লিকেশনের মেইন এন্ট্রি পয়েন্ট`,
  },
  {
    id: 'document_scanner_service',
    title: '৩. অটো-স্ক্যান ও এজ ডিটেকশন (Document Scanner Service)',
    category: 'scanner_crop',
    language: 'dart',
    filePath: 'lib/features/scanner/data/document_scanner_service.dart',
    description: 'Google ML Kit Document Scanner API ব্যবহার করে সরাসরি স্বয়ংক্রিয় এজ ডিটেকশন, পার্সপেক্টিভ ক্রপ ও অটো-এনহ্যান্সমেন্ট।',
    code: `import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_mlkit_document_scanner/google_mlkit_document_scanner.dart';

/// রেজাল্ট মডেল যা স্ক্যান করা পেজের পাথ ধারণ করে
class ScanResult {
  final List<String> imagePaths;
  final String? pdfPath;
  final int pageCount;

  ScanResult({
    required this.imagePaths,
    this.pdfPath,
    required this.pageCount,
  });
}

class DocumentScannerService {
  DocumentScanner? _documentScanner;

  /// অটো-স্ক্যান শুরু করার ফাংশন
  /// এটি ক্যামেরা ওপেন করে অটোমেটিকভাবে ডকুমেন্টের ৪টি কোণা চিনে নেয় (Auto-Edge Detection),
  /// পার্সপেক্টিভ সোজা করে (Unskew/Perspective Transform) এবং ছায়া দূর করে।
  Future<ScanResult?> startDocumentScan({
    int pageLimit = 20,
    bool enableGalleryImport = true,
  }) async {
    try {
      final options = DocumentScannerOptions(
        documentFormat: DocumentFormat.jpeg,
        mode: ScannerMode.full, // ফুল মোডে ক্রপিং, রোটেটিং ও ফিল্টারিং এনাবল থাকে
        isGalleryImportAllowed: enableGalleryImport,
        pageLimit: pageLimit,
      );

      _documentScanner = DocumentScanner(options: options);
      final documents = await _documentScanner!.scanDocument();

      if (documents.images.isEmpty) {
        return null;
      }

      return ScanResult(
        imagePaths: documents.images,
        pdfPath: documents.pdf?.targetPath,
        pageCount: documents.images.length,
      );
    } catch (e) {
      debugPrint('Document Scanner Error: $e');
      rethrow;
    } finally {
      await _documentScanner?.close();
      _documentScanner = null;
    }
  }
}`,
  },
  {
    id: 'kotlin_opencv_channel',
    title: '৪. Native Kotlin / OpenCV Perspective Transform',
    category: 'scanner_crop',
    language: 'kotlin',
    filePath: 'android/app/src/main/kotlin/.../DocumentTransformHelper.kt',
    description: 'যদি কাস্টম ক্যামেরা ব্যবহার করে ম্যানুয়ালি ৪টি পয়েন্ট দিয়ে Perspective Transform করতে চান তবে এই Kotlin কোডটি ব্যবহার করবেন।',
    code: `package com.example.camscanner_pro

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.graphics.PointF
import org.opencv.android.Utils
import org.opencv.core.CvType
import org.opencv.core.Mat
import org.opencv.core.MatOfPoint2f
import org.opencv.core.Point
import org.opencv.core.Size
import org.opencv.imgproc.Imgproc
import java.io.File
import java.io.FileOutputStream
import kotlin.math.hypot
import kotlin.math.max

object DocumentTransformHelper {

    /**
     * ৪টি কোণার পয়েন্ট (TopLeft, TopRight, BottomRight, BottomLeft) অনুযায়ী 
     * ছবিকে Perspective Transform (Unskew) করে সোজা আয়তাকার ফাইলে রূপান্তর করে।
     */
    fun warpPerspectiveAndSave(
        sourceImagePath: String,
        points: List<PointF>, // [TL, TR, BR, BL]
        outputPath: String
    ): Boolean {
        val srcBitmap = BitmapFactory.decodeFile(sourceImagePath) ?: return false

        val tl = points[0]
        val tr = points[1]
        val br = points[2]
        val bl = points[3]

        // নতুন প্রস্থ ও উচ্চতা হিসাব (Width & Height)
        val widthTop = hypot((tr.x - tl.x).toDouble(), (tr.y - tl.y).toDouble())
        val widthBottom = hypot((br.x - bl.x).toDouble(), (br.y - bl.y).toDouble())
        val maxWidth = max(widthTop, widthBottom)

        val heightLeft = hypot((bl.x - tl.x).toDouble(), (bl.y - tl.y).toDouble())
        val heightRight = hypot((br.x - tr.x).toDouble(), (br.y - tr.y).toDouble())
        val maxHeight = max(heightLeft, heightRight)

        val srcMat = Mat()
        Utils.bitmapToMat(srcBitmap, srcMat)

        // ইনপুট ৪টি পয়েন্ট
        val srcPoints = MatOfPoint2f(
            Point(tl.x.toDouble(), tl.y.toDouble()),
            Point(tr.x.toDouble(), tr.y.toDouble()),
            Point(br.x.toDouble(), br.y.toDouble()),
            Point(bl.x.toDouble(), bl.y.toDouble())
        )

        // আউটপুট সোজা আয়তাকার ৪টি পয়েন্ট
        val dstPoints = MatOfPoint2f(
            Point(0.0, 0.0),
            Point(maxWidth - 1, 0.0),
            Point(maxWidth - 1, maxHeight - 1),
            Point(0.0, maxHeight - 1)
        )

        // Homography Matrix গণনা
        val perspectiveTransform = Imgproc.getPerspectiveTransform(srcPoints, dstPoints)
        val destMat = Mat(maxHeight.toInt(), maxWidth.toInt(), CvType.CV_8UC4)

        // আসল Unskewing / Warping অপারেশন
        Imgproc.warpPerspective(
            srcMat,
            destMat,
            perspectiveTransform,
            Size(maxWidth, maxHeight),
            Imgproc.INTER_CUBIC
        )

        // রেজাল্ট বিটম্যাপ তৈরি ও ফাইল হিসেবে সেভ
        val outBitmap = Bitmap.createBitmap(maxWidth.toInt(), maxHeight.toInt(), Bitmap.Config.ARGB_8888)
        Utils.matToBitmap(destMat, outBitmap)

        val outFile = File(outputPath)
        FileOutputStream(outFile).use { out ->
            outBitmap.compress(Bitmap.CompressFormat.JPEG, 95, out)
        }

        // মেমরি মুক্ত করা
        srcMat.release()
        destMat.release()
        perspectiveTransform.release()
        srcBitmap.recycle()
        outBitmap.recycle()

        return true
    }
}`,
  },
  {
    id: 'image_filter_engine',
    title: '৫. ইমেজ এনহ্যান্সমেন্ট ও ফিল্টার (Magic Color, B&W, Grayscale)',
    category: 'filters',
    language: 'dart',
    filePath: 'lib/features/scanner/domain/image_filter_engine.dart',
    description: 'CamScanner-এর জনপ্রিয় Magic Color ফিল্টার, শ্যাডো দূরীকরণ ও ব্ল্যাক অ্যান্ড হোয়াইট অ্যাডাপ্টিভ ফিল্টারিং।',
    code: `import 'dart:io';
import 'dart:math';
import 'package:image/image.dart' as img;

enum DocumentFilterType {
  original,
  magicColor, // ডকুমেন্টের ব্যাকগ্রাউন্ড সাদা করবে এবং টেক্সট গাঢ় করবে
  blackAndWhite, // ক্লিন বাইনারি প্রিন্টেড টেক্সট ফিল্টার
  grayscale, // স্মুথ গ্রে-স্কেল কনট্রাস্ট
}

class ImageFilterEngine {
  /// নির্দিষ্ট ফিল্টার প্রয়োগ করে প্রসেসড ছবি নতুন ফাইলে সেভ করে
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

    // High quality JPEG হিসেবে ৯৫% কোয়ালিটিতে এনকোড করা
    final encodedBytes = img.encodeJpg(processed, quality: 95);
    await outputFile.writeAsBytes(encodedBytes);
    return outputFile;
  }

  /// Magic Color: ব্যাকগ্রাউন্ডের ধূসর ছায়া দূর করে ধবধবে সাদা করে ও অক্ষরের রং উজ্জ্বল রাখে
  static img.Image _applyMagicColor(img.Image src) {
    final out = img.Image.from(src);

    for (final pixel in out) {
      final r = pixel.r;
      final g = pixel.g;
      final b = pixel.b;

      // ব্রাইটনেস বা লুমিনেন্স গণনা
      final lum = 0.299 * r + 0.587 * g + 0.114 * b;

      num newR = r;
      num newG = g;
      num newB = b;

      // যদি পিক্সেলটি হালকা ধূসর বা কাগজের কালার হয় (ছায়া), তবে সেটিকে সরাসরি সাদাতে উন্নীত করবে
      if (lum > 135) {
        final lift = (lum - 135) / 120.0;
        newR = min(255, r + lift * 45);
        newG = min(255, g + lift * 45);
        newB = min(255, b + lift * 45);
      } else {
        // টেক্সটের ক্ষেত্রে কনট্রাস্ট বৃদ্ধি করবে
        newR = max(0, r * 0.85);
        newG = max(0, g * 0.85);
        newB = max(0, b * 0.85);
      }

      pixel.r = newR.clamp(0, 255);
      pixel.g = newG.clamp(0, 255);
      pixel.b = newB.clamp(0, 255);
    }

    // সামান্য শার্পনেস বাড়ানো
    return img.adjustColor(out, contrast: 1.25, saturation: 1.1);
  }

  /// Black & White: Otsu-অনুপ্রাণিত থ্রেশহোল্ডিং যা কেবল টেক্সটকে কালো এবং বাকি সব ধবধবে সাদা রাখে
  static img.Image _applyAdaptiveThresholdBW(img.Image src) {
    final gray = img.grayscale(src);
    final out = img.Image(width: gray.width, height: gray.height);

    // হিস্টোগ্রাম গণনা করে কাট-অফ থ্রেশহোল্ড নির্ধারণ
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

    // থ্রেশহোল্ড বাইনারাইজেশন
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

  /// Grayscale Enhanced: নিখুঁত গ্রে-স্কেল ডক
  static img.Image _applyGrayscaleEnhanced(img.Image src) {
    final gray = img.grayscale(src);
    return img.adjustColor(gray, contrast: 1.35, brightness: 1.05);
  }
}`,
  },
  {
    id: 'pdf_export_service',
    title: '৬. ফাইল এক্সপোর্ট (High-Res JPG & Multi-Page PDF)',
    category: 'pdf_export',
    language: 'dart',
    filePath: 'lib/features/export/services/pdf_generator_service.dart',
    description: 'সিঙ্গেল বা একাধিক পেজ মিলে উচ্চমানের প্রিন্টেবল PDF তৈরি এবং JPG সেভ করার সার্ভিস।',
    code: `import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

class DocumentExportService {
  /// ১. স্ক্যান করা ছবিগুলোকে একটি মাল্টি-পেজ PDF ফাইলে কনভার্ট করা
  static Future<File> generateMultiPagePdf({
    required List<File> imageFiles,
    String fileName = 'Scanned_Document',
    void Function(double progress)? onProgress,
  }) async {
    final pdf = pw.Document();

    for (int i = 0; i < imageFiles.length; i++) {
      final file = imageFiles[i];
      final imageBytes = await file.readAsBytes();
      final pdfImage = pw.MemoryImage(imageBytes);

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: pw.EdgeInsets.zero, // ফুল পেজ কভারেজ
          build: (pw.Context context) {
            return pw.FullPage(
              ignoreMargins: true,
              child: pw.Center(
                child: pw.Image(
                  pdfImage,
                  fit: pw.BoxFit.contain,
                ),
              ),
            );
          },
        ),
      );

      if (onProgress != null) {
        onProgress((i + 1) / imageFiles.length);
      }
    }

    // ডিভাইসের ডকুমেন্ট ডিরেক্টরিতে সেভ করা
    final outputDir = await getApplicationDocumentsDirectory();
    final timeStamp = DateTime.now().millisecondsSinceEpoch;
    final pdfFile = File('\${outputDir.path}/\${fileName}_\$timeStamp.pdf');

    final bytes = await pdf.save();
    await pdfFile.writeAsBytes(bytes);
    return pdfFile;
  }

  /// ২. একক পেজকে হাই-রেজোলিউশন JPG হিসেবে এক্সটার্নাল স্টোরেজে এক্সপোর্ট করা
  static Future<File> exportAsHighResJpg({
    required File processedImageFile,
    required String targetFileName,
  }) async {
    final directory = await getApplicationDocumentsDirectory();
    final timeStamp = DateTime.now().millisecondsSinceEpoch;
    final targetPath = '\${directory.path}/\${targetFileName}_\$timeStamp.jpg';

    // কপি করে হাই-কোয়ালিটি ফাইল হিসেবে প্রস্তুত রাখা
    return await processedImageFile.copy(targetPath);
  }
}`,
  },
  {
    id: 'ocr_and_docx_service',
    title: '৭. OCR (Text Recognition) & Word (.docx) এক্সপোর্ট',
    category: 'ocr_docx',
    language: 'dart',
    filePath: 'lib/features/ocr/services/ocr_docx_service.dart',
    description: 'ছবি থেকে টেক্সট বের করার জন্য অন-ডিভাইস Google ML Kit OCR এবং এক্সট্রাক্ট করা টেক্সটকে সরাসরি এডিটেবল Word (.docx) ফাইলে কনভার্ট করা।',
    code: `import 'dart:convert';
import 'dart:io';
import 'package:archive/archive.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:path_provider/path_provider.dart';

class OcrDocxService {
  final TextRecognizer _textRecognizer = TextRecognizer(
    script: TextRecognitionScript.latin,
  );

  /// ১. ছবি থেকে লেখা (OCR) এক্সট্রাক্ট করার ফাংশন
  Future<String> extractTextFromImage(String imagePath) async {
    final inputImage = InputImage.fromFilePath(imagePath);
    final RecognizedText recognizedText = await _textRecognizer.processImage(inputImage);

    final StringBuffer buffer = StringBuffer();
    for (final block in recognizedText.blocks) {
      for (final line in block.lines) {
        buffer.writeln(line.text);
      }
      buffer.writeln(); // প্যারাগ্রাফ বিভাজন
    }

    return buffer.toString().trim();
  }

  /// ২. এক্সট্রাক্ট করা টেক্সটকে সরাসরি Microsoft Word (.docx) ডকুমেন্টে রূপান্তর করা
  /// এটি OpenXML স্পেসিফিকেশন অনুযায়ী একটি পরিপূর্ণ .docx ফাইল আর্কিটেকচার তৈরি করে।
  Future<File> generateDocxFromText({
    required String contentText,
    String documentTitle = 'Scanned Document OCR',
  }) async {
    final archive = Archive();

    // 1. [Content_Types].xml
    final contentTypesXml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>''';
    archive.addFile(ArchiveFile('[Content_Types].xml', contentTypesXml.length, utf8.encode(contentTypesXml)));

    // 2. _rels/.rels
    final relsXml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>''';
    archive.addFile(ArchiveFile('_rels/.rels', relsXml.length, utf8.encode(relsXml)));

    // 3. word/document.xml - টেক্সটকে প্যারাগ্রাফ আকারে সাজানো
    final paragraphsXml = StringBuffer();
    
    // টাইটেল প্যারাগ্রাফ
    paragraphsXml.write('''<w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>\${_escapeXml(documentTitle)}</w:t></w:r>
    </w:p>''');

    // বডি টেক্সট লাইন বাই লাইন
    final lines = contentText.split('\\n');
    for (final line in lines) {
      final trimmed = line.trim();
      if (trimmed.isEmpty) {
        paragraphsXml.write('<w:p/>');
      } else {
        paragraphsXml.write('''<w:p>
          <w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Calibri"/></w:rPr><w:t xml:space="preserve">\${_escapeXml(trimmed)}</w:t></w:r>
        </w:p>''');
      }
    }

    final documentXml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    \$paragraphsXml
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/></w:sectPr>
  </w:body>
</w:document>''';
    archive.addFile(ArchiveFile('word/document.xml', documentXml.length, utf8.encode(documentXml)));

    // Zip এনকোড করে .docx ফাইল তৈরি
    final zipData = ZipEncoder().encode(archive);
    if (zipData == null) throw Exception('DOCX Encoding failed');

    final dir = await getApplicationDocumentsDirectory();
    final timeStamp = DateTime.now().millisecondsSinceEpoch;
    final docxFile = File('\${dir.path}/OCR_Export_\$timeStamp.docx');
    await docxFile.writeAsBytes(zipData);

    return docxFile;
  }

  String _escapeXml(String string) {
    return string
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
  }

  void dispose() {
    _textRecognizer.close();
  }
}`,
  },
  {
    id: 'pdf_viewer_screen',
    title: '৮. ইন-বিল্ট PDF Viewer স্ক্রিন',
    category: 'pdf_viewer',
    language: 'dart',
    filePath: 'lib/features/pdf_viewer/presentation/screens/pdf_viewer_screen.dart',
    description: 'ফোনের যেকোনো লোকাল PDF ফাইল জুম, পেজ নেভিগেশন ও শেয়ারিং সহ প্রদর্শনের জন্য স্ক্রিন।',
    code: `import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:share_plus/share_plus.dart';

class PdfViewerScreen extends StatefulWidget {
  final File pdfFile;
  final String title;

  const PdfViewerScreen({
    super.key,
    required this.pdfFile,
    this.title = 'Document Viewer',
  });

  @override
  State<PdfViewerScreen> createState() => _PdfViewerScreenState();
}

class _PdfViewerScreenState extends State<PdfViewerScreen> {
  int _totalPages = 0;
  int _currentPage = 0;
  bool _isReady = false;
  String _errorMessage = '';
  PDFViewController? _pdfViewController;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.title, style: const TextStyle(fontSize: 16)),
            if (_isReady)
              Text(
                'Page \${_currentPage + 1} of \$_totalPages',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            tooltip: 'Share PDF',
            onPressed: () {
              Share.shareXFiles(
                [XFile(widget.pdfFile.path)],
                text: 'Scanned Document from CamScanner Pro',
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.first_page),
            tooltip: 'First Page',
            onPressed: () => _pdfViewController?.setPage(0),
          ),
          IconButton(
            icon: const Icon(Icons.last_page),
            tooltip: 'Last Page',
            onPressed: () => _pdfViewController?.setPage(_totalPages - 1),
          ),
        ],
      ),
      body: Stack(
        children: [
          PDFView(
            filePath: widget.pdfFile.path,
            enableSwipe: true,
            swipeHorizontal: false, // খাড়া স্ক্রোলিং
            autoSpacing: true,
            pageFling: true,
            pageSnap: true,
            fitPolicy: FitPolicy.BOTH,
            onRender: (pages) {
              setState(() {
                _totalPages = pages ?? 0;
                _isReady = true;
              });
            },
            onError: (error) {
              setState(() {
                _errorMessage = error.toString();
              });
            },
            onPageError: (page, error) {
              setState(() {
                _errorMessage = '\$page: \${error.toString()}';
              });
            },
            onViewCreated: (PDFViewController controller) {
              _pdfViewController = controller;
            },
            onPageChanged: (int? page, int? total) {
              setState(() {
                _currentPage = page ?? 0;
              });
            },
          ),
          if (!_isReady && _errorMessage.isEmpty)
            const Center(child: CircularProgressIndicator()),
          if (_errorMessage.isNotEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'PDF লোড করতে সমস্যা হয়েছে:\\n\$_errorMessage',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.red),
                ),
              ),
            ),
        ],
      ),
      // নিচে দ্রুত পেজ জাম্প করার কন্ট্রোল বার
      bottomNavigationBar: _isReady
          ? Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              color: Theme.of(context).cardColor,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left),
                    onPressed: _currentPage > 0
                        ? () => _pdfViewController?.setPage(_currentPage - 1)
                        : null,
                  ),
                  Text('\${_currentPage + 1} / \$_totalPages',
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.chevron_right),
                    onPressed: _currentPage < _totalPages - 1
                        ? () => _pdfViewController?.setPage(_currentPage + 1)
                        : null,
                  ),
                ],
              ),
            )
          : null,
    );
  }
}`,
  },
  {
    id: 'main_dart_sample',
    title: '৯. main.dart ও ড্যাশবোর্ড নেভিগেশন',
    category: 'architecture',
    language: 'dart',
    filePath: 'lib/main.dart',
    description: 'অ্যাপের রুট এন্ট্রি ও নেভিগেশন ফ্লো।',
    code: `import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'features/scanner/data/document_scanner_service.dart';
import 'features/pdf_viewer/presentation/screens/pdf_viewer_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const CamScannerApp());
}

class CamScannerApp extends StatelessWidget {
  const CamScannerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CamScanner Pro',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF0284C7),
        brightness: Brightness.light,
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF0284C7),
        brightness: Brightness.dark,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final DocumentScannerService _scannerService = DocumentScannerService();
  bool _isScanning = false;

  Future<void> _handleScan() async {
    setState(() => _isScanning = true);
    try {
      final result = await _scannerService.startDocumentScan(pageLimit: 25);
      if (result != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('সফলভাবে \${result.pageCount} টি পেজ স্ক্যান হয়েছে!')),
        );
        // স্ক্যান করা ফাইল দিয়ে প্রিভিউ স্ক্রিনে যাওয়া
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('স্ক্যান এরর: \$e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isScanning = false);
    }
  }

  Future<void> _openLocalPdf() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result != null && result.files.single.path != null && mounted) {
      final file = File(result.files.single.path!);
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PdfViewerScreen(
            pdfFile: file,
            title: result.files.single.name,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CamScanner Pro'),
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton.icon(
              icon: const Icon(Icons.document_scanner),
              label: Text(_isScanning ? 'স্ক্যান হচ্ছে...' : 'ডকুমেন্ট স্ক্যান শুরু করুন'),
              onPressed: _isScanning ? null : _handleScan,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
              ),
            ),
            const SizedBox(height: 20),
            OutlinedButton.icon(
              icon: const Icon(Icons.picture_as_pdf),
              label: const Text('যেকোনো PDF ফাইল ওপেন করুন'),
              onPressed: _openLocalPdf,
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
  },
];
