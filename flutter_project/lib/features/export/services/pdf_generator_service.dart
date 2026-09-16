import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

class DocumentExportService {
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
          margin: pw.EdgeInsets.zero,
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

    final outputDir = await getApplicationDocumentsDirectory();
    final timeStamp = DateTime.now().millisecondsSinceEpoch;
    final pdfFile = File('${outputDir.path}/${fileName}_$timeStamp.pdf');

    final bytes = await pdf.save();
    await pdfFile.writeAsBytes(bytes);
    return pdfFile;
  }

  static Future<File> exportAsHighResJpg({
    required File processedImageFile,
    required String targetFileName,
  }) async {
    final directory = await getApplicationDocumentsDirectory();
    final timeStamp = DateTime.now().millisecondsSinceEpoch;
    final targetPath = '${directory.path}/${targetFileName}_$timeStamp.jpg';

    return await processedImageFile.copy(targetPath);
  }
}
