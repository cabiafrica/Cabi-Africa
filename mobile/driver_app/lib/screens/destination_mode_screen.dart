import 'package:flutter/material.dart';
import 'package:driver_app/screens/map_picker_screen.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

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
    debugPrint('Setting destination mode: ${payload.destinationAddress}');
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    setState(() => _isDestinationModeActive = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Destination mode activated!')),
    );
  }

  void _cancelDestinationMode() {
    // Mock API call
    debugPrint('Cancelling destination mode.');
    setState(() {
      _isDestinationModeActive = false;
      _destinationController.clear();
      _selectedTime = null;
    });
  }

  void _pickLocationOnMap() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const MapPickerScreen()),
    );

    if (result != null && result is LatLng) {
      setState(() {
        _destinationController.text =
            'Lat: ${result.latitude.toStringAsFixed(5)}, Lng: ${result.longitude.toStringAsFixed(5)}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Destination Mode')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _destinationController,
                    decoration: const InputDecoration(
                      labelText: 'Enter Destination',
                      border: OutlineInputBorder(),
                    ),
                    enabled: !_isDestinationModeActive,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.location_on, color: Colors.red),
                  onPressed:
                      _isDestinationModeActive ? null : _pickLocationOnMap,
                  tooltip: 'Pin on Map',
                ),
              ],
            ),
            const SizedBox(height: 16),
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
            SizedBox(
              width: double.infinity,
              child: _isDestinationModeActive
                  ? ElevatedButton(
                      onPressed: _cancelDestinationMode,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Cancel Destination Mode'),
                    )
                  : ElevatedButton(
                      onPressed: _setDestinationMode,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Set Destination'),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
