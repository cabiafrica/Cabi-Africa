import 'package:flutter/material.dart';

// Mock service to simulate adding a stop and getting a new fare
class RideModificationService {
  Future<Map<String, dynamic>> addStop(
    String tripId,
    String newStopAddress,
  ) async {
    await Future.delayed(const Duration(seconds: 1));
    print('Backend: Adding stop "$newStopAddress" to trip $tripId');
    // Simulate backend response with a new estimated fare
    return {'success': true, 'newEstimatedFare': 25.50};
  }

  Future<void> confirmStopAddition(String tripId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    print(
      'Backend: Passenger confirmed new stop for trip $tripId. Notifying driver.',
    );
  }
}

class InTripPanel extends StatefulWidget {
  const InTripPanel({super.key});

  @override
  State<InTripPanel> createState() => _InTripPanelState();
}

class _InTripPanelState extends State<InTripPanel> {
  final _rideService = RideModificationService();
  bool _isProposingStop = false;
  String? _proposedStop;
  double? _newFare;

  // Simulates the user searching for and selecting a new stop
  Future<void> _startAddStopFlow() async {
    // In a real app, this would open a map/search screen
    const newStopAddress = 'City Mall, Nakuru';
    final result = await _rideService.addStop('ride-123', newStopAddress);

    if (mounted && result['success']) {
      setState(() {
        _proposedStop = newStopAddress;
        _newFare = result['newEstimatedFare'];
        _isProposingStop = true;
      });
    }
  }

  // Confirms the new stop with the backend
  Future<void> _confirmNewStop() async {
    await _rideService.confirmStopAddition('ride-123');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Your trip has been updated!')),
      );
      setState(() {
        _isProposingStop = false;
        _proposedStop = null;
        _newFare = null;
        // Here, the app state would be updated to show the new itinerary
      });
    }
  }

  // Cancels the "add stop" flow
  void _cancelAddStop() {
    setState(() {
      _isProposingStop = false;
      _proposedStop = null;
      _newFare = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(8.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: _isProposingStop
            ? _buildConfirmationView()
            : _buildDefaultView(),
      ),
    );
  }

  Widget _buildDefaultView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const ListTile(
          leading: Icon(Icons.drive_eta),
          title: Text('Trip in Progress'),
          subtitle: Text('On your way to Westside Mall'),
        ),
        const SizedBox(height: 8),
        ElevatedButton.icon(
          icon: const Icon(Icons.add_location_alt_outlined),
          label: const Text('Add a Stop'),
          onPressed: _startAddStopFlow,
        ),
      ],
    );
  }

  Widget _buildConfirmationView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Add stop at $_proposedStop?'),
        const SizedBox(height: 8),
        Text('New estimated fare: KES ${_newFare?.toStringAsFixed(2)}'),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            TextButton(onPressed: _cancelAddStop, child: const Text('Cancel')),
            ElevatedButton(
              onPressed: _confirmNewStop,
              child: const Text('Confirm'),
            ),
          ],
        ),
      ],
    );
  }
}
