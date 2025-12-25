import 'package:flutter/material.dart';

enum DocumentStatus { valid, expiringSoon, expired, missing }

class DocumentExpiryCard extends StatelessWidget {
  final String documentName;
  final DateTime? expiryDate;
  final DocumentStatus status;
  final VoidCallback onUpdate;

  const DocumentExpiryCard({
    Key? key,
    required this.documentName,
    required this.expiryDate,
    required this.status,
    required this.onUpdate,
  }) : super(key: key);

  String _getExpiryText() {
    if (expiryDate == null) return 'No Date Set';
    final days = expiryDate!.difference(DateTime.now()).inDays;

    if (days < 0) return 'Expired ${-days} days ago';
    if (days == 0) return 'Expires TODAY';
    return 'Expires in $days days';
  }

  Color _getStatusColor() {
    switch (status) {
      case DocumentStatus.valid:
        return Colors.green;
      case DocumentStatus.expiringSoon:
        return const Color(0xFFF59E0B);
      case DocumentStatus.expired:
        return Colors.red;
      case DocumentStatus.missing:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon() {
    switch (status) {
      case DocumentStatus.valid:
        return Icons.check_circle;
      case DocumentStatus.expiringSoon:
        return Icons.warning_amber_rounded;
      case DocumentStatus.expired:
        return Icons.error_outline;
      case DocumentStatus.missing:
        return Icons.upload_file;
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor();
    final isCritical =
        status == DocumentStatus.expired || status == DocumentStatus.missing;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCritical
              ? statusColor.withValues(alpha: 0.5)
              : Colors.grey.shade200,
          width: isCritical ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _getStatusIcon(),
                    color: statusColor,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        documentName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        status == DocumentStatus.missing
                            ? 'Upload required'
                            : '${_getExpiryText()} (${expiryDate!.year}-${expiryDate!.month}-${expiryDate!.day})',
                        style: TextStyle(
                          fontSize: 13,
                          color: isCritical
                              ? Colors.red.shade700
                              : Colors.grey.shade600,
                          fontWeight:
                              isCritical ? FontWeight.w600 : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                ),
                if (status != DocumentStatus.valid)
                  ElevatedButton(
                    onPressed: onUpdate,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isCritical ? Colors.red : Colors.black,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      minimumSize: Size.zero,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                        status == DocumentStatus.missing ? 'Upload' : 'Renew'),
                  ),
              ],
            ),
          ),
          if (status == DocumentStatus.expiringSoon ||
              status == DocumentStatus.expired)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.1),
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(12),
                  bottomRight: Radius.circular(12),
                ),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, size: 16, color: statusColor),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      status == DocumentStatus.expired
                          ? 'You cannot go online until this is updated.'
                          : 'Update now to avoid service interruption.',
                      style: TextStyle(
                        fontSize: 12,
                        color: statusColor.withValues(
                            alpha: 1.0), // Fully opaque text
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
