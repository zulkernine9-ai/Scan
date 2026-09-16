import 'dart:io';
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
          SnackBar(content: Text('সফলভাবে ${result.pageCount} টি পেজ স্ক্যান সম্পন্ন হয়েছে!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('স্ক্যান এরর: $e')),
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
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.document_scanner, size: 72, color: Color(0xFF0284C7)),
              const SizedBox(height: 16),
              const Text(
                'CamScanner Pro Mobile',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'অল-ইন-ওয়ান ডকুমেন্ট স্ক্যানার ও PDF ম্যানেজার',
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                icon: const Icon(Icons.camera_alt),
                label: Text(_isScanning ? 'স্ক্যান হচ্ছে...' : 'ডকুমেন্ট স্ক্যান শুরু করুন'),
                onPressed: _isScanning ? null : _handleScan,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(260, 52),
                ),
              ),
              const SizedBox(height: 14),
              OutlinedButton.icon(
                icon: const Icon(Icons.picture_as_pdf),
                label: const Text('যেকোনো PDF ফাইল ওপেন করুন'),
                onPressed: _openLocalPdf,
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(260, 52),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
