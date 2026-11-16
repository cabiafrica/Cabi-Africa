import 'receipt_downloader_stub.dart'
    if (dart.library.html) 'receipt_downloader_web.dart'
    if (dart.library.io) 'receipt_downloader_io.dart';

void downloadReceiptPdf(List<int> bytes, String fileName) {
  downloadPdfFile(bytes, fileName);
}
