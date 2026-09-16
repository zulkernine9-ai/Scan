import 'package:flutter/foundation.dart';
import 'package:google_mlkit_document_scanner/google_mlkit_document_scanner.dart';

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

  Future<ScanResult?> startDocumentScan({
    int pageLimit = 20,
    bool enableGalleryImport = true,
  }) async {
    try {
      final options = DocumentScannerOptions(
        documentFormat: DocumentFormat.jpeg,
        mode: ScannerMode.full,
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
}
