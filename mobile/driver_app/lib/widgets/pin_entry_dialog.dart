import 'package:flutter/material.dart';

class PinEntryDialog extends StatefulWidget {
  final String correctPin;
  final VoidCallback onPinVerified;

  const PinEntryDialog({
    super.key,
    required this.correctPin,
    required this.onPinVerified,
  });

  @override
  State<PinEntryDialog> createState() => _PinEntryDialogState();
}

class _PinEntryDialogState extends State<PinEntryDialog> {
  final TextEditingController _pinController = TextEditingController();
  String? _errorText;

  void _verifyPin() {
    if (_pinController.text == widget.correctPin) {
      Navigator.pop(context);
      widget.onPinVerified();
    } else {
      setState(() {
        _errorText = 'Incorrect PIN. Ask passenger for code.';
      });
      _pinController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Enter Rider PIN'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('For safety, ask the passenger for their 4-digit PIN.'),
          const SizedBox(height: 16),
          TextField(
            controller: _pinController,
            keyboardType: TextInputType.number,
            maxLength: 4,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              hintText: '----',
              errorText: _errorText,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onSubmitted: (_) => _verifyPin(),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('CANCEL'),
        ),
        ElevatedButton(
          onPressed: _verifyPin,
          child: const Text('VERIFY & START'),
        ),
      ],
    );
  }
}
