import 'package:flutter/material.dart';

// Mock DTO - In a real app, this would be generated.
class SetDestinationModeDto {
  final String destinationAddress;
  final DateTime? arrivalTime;

  SetDestinationModeDto({required this.destinationAddress, this.arrivalTime});
}

class DestinationModeScreen extends StatefulWidget {
  const DestinationModeScreen({super.key});

  @override
  State<DestinationModeScreen> createState() => _DestinationModeScreenState();
}

class _DestinationModeScreenState extends State<DestinationModeScreen> {
  final _destinationController = TextEditingController();
  TimeOfDay? _selectedTime;
  bool _isDestinationModeActive = false;

  Future<void> _setDestinationMode() async {
    if (_destinationController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a destination.')),
      );
      return;
    }

    DateTime? arrivalDateTime;
    if (_selectedTime != null) {
      final now = DateTime.now();
      arrivalDateTime = DateTime(
        now.year,
        now.month,
        now.day,
        _selectedTime!.hour,
        _selectedTime!.minute,
      );
    }

    final payload = SetDestinationModeDto(
      destinationAddress: _destinationController.text,
      arrivalTime: arrivalDateTime,
    );

    // Mock API call
    print('Setting destination mode: ${payload.destinationAddress}');
    await Future.delayed(const Duration(seconds: 1));

    setState(() => _isDestinationModeActive = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Destination mode activated!')),
    );
  }

  void _cancelDestinationMode() {
    // Mock API call
    print('Cancelling destination mode.');
    setState(() {
      _isDestinationModeActive = false;
      _destinationController.clear();
      _selectedTime = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Destination Mode')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _destinationController,
              decoration: const InputDecoration(labelText: 'Enter Destination'),
              enabled: !_isDestinationModeActive,
            ),
            ListTile(
              title: Text(
                'Arrival Time: ${_selectedTime?.format(context) ?? 'Any time'}',
              ),
              trailing: const Icon(Icons.access_time),
              onTap: _isDestinationModeActive
                  ? null
                  : () async {
                      final TimeOfDay? picked = await showTimePicker(
                        context: context,
                        initialTime: _selectedTime ?? TimeOfDay.now(),
                      );
                      if (picked != null) {
                        setState(() => _selectedTime = picked);
                      }
                    },
            ),
            const SizedBox(height: 20),
            _isDestinationModeActive
                ? ElevatedButton(
                    onPressed: _cancelDestinationMode,
                    child: const Text('Cancel Destination Mode'),
                  )
                : ElevatedButton(
                    onPressed: _setDestinationMode,
                    child: const Text('Set Destination'),
                  ),
          ],
        ),
      ),
    );
  }
}
