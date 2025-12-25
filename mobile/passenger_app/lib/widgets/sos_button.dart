import 'package:flutter/material.dart';

class SOSButton extends StatelessWidget {
  const SOSButton({super.key});

  void _triggerSOS(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('EMERGENCY ALERT', style: TextStyle(color: Colors.red)),
        content: const Text(
            'Are you sure you want to trigger an SOS? This will alert our safety team and prompt you to call emergency services.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.of(ctx).pop();
              // 1. Send API Alert
              print('Sending SOS Alert to Backend...');
              // 2. Launch Dialer
              print('Launching Dialer with Emergency Number...');
            },
            child: const Text('CONFIRM SOS', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(8),
      child: FloatingActionButton.extended(
        onPressed: () => _triggerSOS(context),
        backgroundColor: Colors.red,
        icon: const Icon(Icons.warning_amber_rounded, color: Colors.white),
        label: const Text('SOS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
