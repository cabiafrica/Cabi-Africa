import 'package:flutter/material.dart';

// Mock service to simulate backend calls
class DriverRideService {
  Future<void> respondToChange(String rideId, String response) async {
    await Future.delayed(const Duration(seconds: 1));
    debugPrint('Driver responding to change for ride $rideId: $response');
    // In a real app, this would call POST /rides/:id/respond-to-change
  }
}

class TripChangeProposal {
  final String newStopAddress;
  final double newEstimatedFare;

  TripChangeProposal({
    required this.newStopAddress,
    required this.newEstimatedFare,
  });
}

class TripInProgressPanel extends StatefulWidget {
  final String rideId;
  const TripInProgressPanel({super.key, required this.rideId});

  @override
  State<TripInProgressPanel> createState() => _TripInProgressPanelState();
}

class _TripInProgressPanelState extends State<TripInProgressPanel> {
  final _rideService = DriverRideService();
  TripChangeProposal? _pendingChange;
  bool _isResponding = false;

  @override
  void initState() {
    super.initState();
    // In a real app, you would listen to a stream (e.g., from a WebSocket or push notification handler)
    // to receive trip change proposals. For this simulation, we'll trigger it with a button.
  }

  // Simulates receiving a trip change request from the backend
  void _simulateChangeRequest() {
    setState(() {
      _pendingChange = TripChangeProposal(
        newStopAddress: 'City Mall, Nakuru',
        newEstimatedFare: 25.50,
      );
    });
  }

  Future<void> _handleResponse(String response) async {
    setState(() {
      _isResponding = true;
    });

    await _rideService.respondToChange(widget.rideId, response);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('You have ${response}d the trip change.')),
      );
      setState(() {
        _pendingChange = null;
        _isResponding = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(8.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: _pendingChange == null
            ? _buildDefaultView()
            : _buildConfirmationView(_pendingChange!),
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
          subtitle: Text('Heading to Westside Mall'),
        ),
        const SizedBox(height: 8),
        // This button is for simulation purposes only
        TextButton(
          onPressed: _simulateChangeRequest,
          child: const Text('Simulate Change Request'),
        ),
      ],
    );
  }

  Widget _buildConfirmationView(TripChangeProposal proposal) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text(
          'Trip Update Requested',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        const SizedBox(height: 12),
        Text(
          'Passenger wants to add a stop at:\n${proposal.newStopAddress}',
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          'New estimated fare: KES ${proposal.newEstimatedFare.toStringAsFixed(2)}',
        ),
        const SizedBox(height: 16),
        if (_isResponding)
          const CircularProgressIndicator()
        else
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              TextButton(
                onPressed: () => _handleResponse('declined'),
                child: const Text('Decline'),
              ),
              ElevatedButton(
                onPressed: () => _handleResponse('accepted'),
                child: const Text('Accept'),
              ),
            ],
          ),
      ],
    );
  }
}
