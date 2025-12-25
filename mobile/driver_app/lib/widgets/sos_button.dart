import 'package:flutter/material.dart';
import '../services/sos_service.dart';

class SosButton extends StatefulWidget {
  final String tripId;

  const SosButton({super.key, required this.tripId});

  @override
  State<SosButton> createState() => _SosButtonState();
}

class _SosButtonState extends State<SosButton> {
  final SosService _sosService = SosService();
  bool _isActivated = false;
  bool _isLoading = false;

  Future<void> _handleSosActivation() async {
    // 1. Confirmation Dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Activate SOS?'),
        content: const Text(
          'This will alert the admin team and stream audio. Are you sure?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('ACTIVATE'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isLoading = true);

    try {
      // 2. Call Backend (mock location for now)
      await _sosService.activateSos(widget.tripId, {
        'lat': -1.2921,
        'lng': 36.8219,
      });

      if (mounted) {
        setState(() {
          _isActivated = true;
          _isLoading = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('SOS Alert Sent! Help is on the way.')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to activate SOS: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isActivated) {
      return Container(
        padding: const EdgeInsets.all(16),
        color: Colors.red,
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.warning, color: Colors.white),
            SizedBox(width: 8),
            Text(
              'SOS ACTIVE - RECORDING',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    }

    return GestureDetector(
      onLongPress: _handleSosActivation,
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.red.shade700,
          boxShadow: [
            BoxShadow(
              color: Colors.red.withValues(alpha: 0.4),
              blurRadius: 10,
              spreadRadius: 2,
            ),
          ],
        ),
        child: _isLoading
            ? const CircularProgressIndicator(color: Colors.white)
            : const Icon(Icons.sos, color: Colors.white, size: 30),
      ),
    );
  }
}
