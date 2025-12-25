class Document {
  final String type;
  String status;
  String? rejectionReason;

  Document({
    required this.type,
    this.status = 'Not Uploaded',
    this.rejectionReason,
  });
}
