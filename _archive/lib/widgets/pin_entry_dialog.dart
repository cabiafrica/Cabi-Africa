import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// Mock service to simulate backend validation
class RidePinService {
  Future<bool> validatePin(String rideId, String pin) async {
    // In a real app, this would call the backend's startTripWithPin endpoint.
    await Future.delayed(const Duration(milliseconds: 700));
    // Mocking a correct PIN for demonstration
    if (pin == "1234") {
      print('PIN validation successful for ride $rideId');
      return true;
    } else {
      print('PIN validation failed for ride $rideId');
      return false;
    }
  }
}

class PinEntryDialog extends StatefulWidget {
  final String rideId;
  final Function() onPinVerified;

  const PinEntryDialog({
    super.key,
    required this.rideId,
    required this.onPinVerified,
  });

  @override
  State<PinEntryDialog> createState() => _PinEntryDialogState();
}

class _PinEntryDialogState extends State<PinEntryDialog> {
  final _pinController = TextEditingController();
  final _pinService = RidePinService();
  bool _isLoading = false;
  String? _errorText;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  Future<void> _submitPin() async {
    if (_pinController.text.length != 4) return;

    setState(() {
      _isLoading = true;
      _errorText = null;
    });

    final bool success = await _pinService.validatePin(
      widget.rideId,
      _pinController.text,
    );

    if (mounted) {
      if (success) {
        widget.onPinVerified();
      } else {
        setState(() {
          _isLoading = false;
          _errorText = 'Invalid PIN. Please try again.';
        });
        _pinController.clear();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Start Trip'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text("Enter the passenger's 4-digit PIN to begin."),
          const SizedBox(height: 16),
          TextField(
            controller: _pinController,
            autofocus: true,
            obscureText: true,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            maxLength: 4,
            style: const TextStyle(fontSize: 24, letterSpacing: 16),
            decoration: InputDecoration(
              counterText: '',
              errorText: _errorText,
              border: const OutlineInputBorder(),
            ),
            onChanged: (value) => setState(() {}),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: (_pinController.text.length == 4 && !_isLoading)
              ? _submitPin
              : null,
          child: _isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Start Trip'),
        ),
      ],
    );
  }
}
