import 'package:flutter/material.dart';
import '../widgets/ride_booking_panel.dart';

/// A screen that allows users to search for a destination and book a ride,
/// either for now or for a future time.
class SearchScreen extends StatefulWidget {
  const SearchScreen({Key? key}) : super(key: key);

  @override
  _SearchScreenState createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  /// This would be a call to a service that communicates with the backend.
  Future<void> _createScheduledRide(DateTime pickupTime) async {
    // In a real app, this would call the backend API:
    // POST /scheduled-rides
    // Body: { pickupLocation: ..., destination: ..., pickupTime: ... }
    print('Scheduling ride for: ${pickupTime.toIso8601String()}');

    // Show a confirmation dialog
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Ride scheduled for ${pickupTime.toLocal()}'),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _createRideNow() {
    print('Booking ride for now.');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Finding a ride for you now...'),
        duration: Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Book a Ride')),
      body: RideBookingPanel(
        onScheduleConfirm: _createScheduledRide,
        onRideNowConfirm: _createRideNow,
      ),
    );
  }
}
