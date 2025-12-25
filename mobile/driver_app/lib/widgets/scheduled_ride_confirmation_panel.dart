import 'package:core_ui/core_ui.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ScheduledRideConfirmationPanel extends StatelessWidget {
  final DateTime scheduledTime;
  final String destinationAddress;
  final VoidCallback onCancel;

  const ScheduledRideConfirmationPanel({
    super.key,
    required this.scheduledTime,
    required this.destinationAddress,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final formattedTime = DateFormat.yMMMd().add_jm().format(scheduledTime);

    return BasePanel(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle, color: Colors.green, size: 48),
          const SizedBox(height: 16),
          const Text(
            'Your Ride is Scheduled',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'For $formattedTime to $destinationAddress',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16, color: Colors.black54),
          ),
          const SizedBox(height: 24),
          TextButton(
            onPressed: onCancel,
            child: const Text(
              'Cancel Scheduled Ride',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}
