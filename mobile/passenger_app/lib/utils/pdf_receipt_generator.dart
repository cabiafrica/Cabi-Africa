import 'dart:convert';
import 'dart:typed_data';

class PdfReceiptGenerator {
  static Uint8List generateBytes({
    required String tripId,
    required String driverName,
    required double fare,
    required String pickup,
    required String destination,
    required String vehicleInfo,
    int? tipAmount,
  }) {
    final now = DateTime.now();
    final dateStr =
        '${now.day.toString().padLeft(2, '0')}-${now.month.toString().padLeft(2, '0')}-${now.year} ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    final fareStr = fare.toStringAsFixed(2);
    final tipStr = (tipAmount != null && tipAmount > 0) ? tipAmount.toStringAsFixed(2) : '0.00';
    final grandTotal = (fare + (tipAmount ?? 0)).toStringAsFixed(2);
    final cleanTripId = tripId.length > 12 ? tripId.substring(0, 12).toUpperCase() : tripId.toUpperCase();
    final cleanPickup = pickup.replaceAll(RegExp(r'[()]'), '');
    final cleanDest = destination.replaceAll(RegExp(r'[()]'), '');
    final cleanDriver = driverName.replaceAll(RegExp(r'[()]'), '');
    final cleanVehicle = vehicleInfo.replaceAll(RegExp(r'[()]'), '');

    final stream = '''
q
% Top Gold Banner
0.83 0.69 0.22 rg
40 760 515 48 re f

BT
/F1 18 Tf
1 1 1 rg
55 778 Td
(CABI MOBILITY AFRICA - OFFICIAL TRIP RECEIPT) Tj
ET

% Metadata Container
0.96 0.96 0.97 rg
40 670 515 75 re f
0.85 0.85 0.85 RG
1 w
40 670 515 75 re S

BT
/F1 10 Tf
0.15 0.15 0.15 rg
55 725 Td
(TRIP REFERENCE: #$cleanTripId) Tj
0 -16 Td
/F2 9.5 Tf
(ISSUED DATE: $dateStr) Tj
0 -16 Td
(PAYMENT CHANNEL: M-PESA EXPRESS (PREPAID)) Tj
ET

BT
/F1 10 Tf
0.15 0.15 0.15 rg
330 725 Td
(CAPTAIN: $cleanDriver) Tj
0 -16 Td
/F2 9.5 Tf
(VEHICLE: $cleanVehicle) Tj
0 -16 Td
(AFFILIATION: 2NK Sacco VERIFIED) Tj
ET

% Route Box
0.98 0.98 0.99 rg
40 575 515 80 re f
0.85 0.85 0.85 RG
40 575 515 80 re S

BT
/F1 10.5 Tf
0.83 0.69 0.22 rg
55 632 Td
(PICKUP POINT:) Tj
/F2 10 Tf
0.1 0.1 0.1 rg
100 0 Td
($cleanPickup) Tj
ET

BT
/F1 10.5 Tf
0.83 0.69 0.22 rg
55 600 Td
(DESTINATION:) Tj
/F2 10 Tf
0.1 0.1 0.1 rg
100 0 Td
($cleanDest) Tj
ET

% Table Header
0.12 0.12 0.14 rg
40 530 515 28 re f

BT
/F1 10.5 Tf
1 1 1 rg
55 539 Td
(FARE ITEMIZATION & CHARGES) Tj
370 0 Td
(AMOUNT (KES)) Tj
ET

% Table Content
BT
/F2 10 Tf
0.2 0.2 0.2 rg
55 505 Td
(Base Fare & Flag Drop (First 3 km included)) Tj
370 0 Td
(150.00) Tj
0 -22 Td
(Distance & Route Charge) Tj
370 0 Td
($fareStr) Tj
0 -22 Td
(Sacco Passenger Safety & Accident Cover Levy) Tj
370 0 Td
(Included) Tj
0 -22 Td
0.65 0.45 0.15 rg
/F1 10 Tf
(Driver Coffee & Gratuity Tip) Tj
/F2 10 Tf
0.2 0.2 0.2 rg
370 0 Td
($tipStr) Tj
ET

% Divider
0.8 0.8 0.8 RG
1 w
40 405 m 555 405 l S

% Grand Total Banner
0.83 0.69 0.22 rg
310 355 245 40 re f

BT
/F1 12.5 Tf
0.1 0.1 0.1 rg
325 370 Td
(TOTAL SETTLED: KES $grandTotal) Tj
ET

% Tax / Legal Compliance Stamp
0.96 0.96 0.97 rg
40 250 515 85 re f
0.85 0.85 0.85 RG
40 250 515 85 re S

BT
/F1 10 Tf
0.05 0.55 0.25 rg
55 315 Td
([VERIFIED] DIGITAL TAX RECEIPT & E-TIMS COMPLIANCE) Tj
/F2 8.5 Tf
0.35 0.35 0.35 rg
0 -16 Td
(Cabi Mobility Africa Ltd | PIN: P051982736Z | Nairobi, Kenya) Tj
0 -14 Td
(Driver coffee gratuity remitted 100% directly to captain M-Pesa account.) Tj
0 -14 Td
(Thank you for choosing Cabi Africa. Official Support: support@cabi.africa) Tj
ET
Q
'''.trim();

    final streamBytes = latin1.encode(stream);
    final streamLen = streamBytes.length;

    final objects = <String>[];
    objects.add('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    objects.add('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
    objects.add('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n');
    objects.add('4 0 obj\n<< /Length $streamLen >>\nstream\n$stream\nendstream\nendobj\n');
    objects.add('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');
    objects.add('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

    final header = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
    final headerBytes = latin1.encode(header);
    var body = '';
    final offsets = <int>[];
    var currentOffset = headerBytes.length;

    for (final obj in objects) {
      offsets.add(currentOffset);
      final objBytes = latin1.encode(obj);
      currentOffset += objBytes.length;
      body += obj;
    }

    final xrefOffset = currentOffset;
    var xref = 'xref\n0 ${objects.length + 1}\n0000000000 65535 f \n';
    for (final off in offsets) {
      xref += '${off.toString().padLeft(10, '0')} 00000 n \n';
    }

    final trailer = 'trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n$xrefOffset\n%%EOF\n';
    return Uint8List.fromList(latin1.encode(header + body + xref + trailer));
  }
}
