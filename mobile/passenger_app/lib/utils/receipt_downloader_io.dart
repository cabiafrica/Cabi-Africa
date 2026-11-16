import 'dart:typed_data';
import 'package:share_plus/share_plus.dart';

void downloadPdfFile(List<int> bytes, String fileName) {
  Share.shareXFiles(
    [XFile.fromData(Uint8List.fromList(bytes), mimeType: 'application/pdf', name: fileName)],
    text: 'Cabi Africa Official Trip Receipt',
  );
}
