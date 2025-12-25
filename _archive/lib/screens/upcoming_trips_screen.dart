import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

// Mock data model and service
class ScheduledRide {
  final String id;
  final DateTime pickupTime;
  final String destination;
  ScheduledRide({
    required this.id,
    required this.pickupTime,
    required this.destination,
  });
}

class RideService {
  Future<List<ScheduledRide>> getUpcomingRides() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return [
      ScheduledRide(
        id: 'ride-1',
        pickupTime: DateTime.now().add(const Duration(days: 1)),
        destination: 'Airport',
      ),
      ScheduledRide(
        id: 'ride-2',
        pickupTime: DateTime.now().add(const Duration(days: 3)),
        destination: 'Downtown Hotel',
      ),
    ];
  }

  Future<void> cancelRide(String rideId) async {
    // Simulate network call to the backend
    await Future.delayed(const Duration(milliseconds: 500));
    print('Cancelling ride $rideId...');
  }
}

class UpcomingTripsScreen extends StatefulWidget {
  const UpcomingTripsScreen({super.key});

  @override
  State<UpcomingTripsScreen> createState() => _UpcomingTripsScreenState();
}

class _UpcomingTripsScreenState extends State<UpcomingTripsScreen> {
  final RideService _rideService = RideService();
  late Future<List<ScheduledRide>> _upcomingRides;

  @override
  void initState() {
    super.initState();
    _upcomingRides = _rideService.getUpcomingRides();
  }

  void _showCancelConfirmation(String rideId) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Cancel Ride'),
          content: const Text(
            'Are you sure you want to cancel this scheduled ride?',
          ),
          actions: <Widget>[
            TextButton(
              child: const Text('No'),
              onPressed: () => Navigator.of(context).pop(),
            ),
            TextButton(
              child: const Text('Yes, Cancel'),
              onPressed: () async {
                await _rideService.cancelRide(rideId);
                Navigator.of(context).pop();
                setState(() {
                  _upcomingRides = _rideService.getUpcomingRides();
                }); // Refresh list
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upcoming Trips')),
      body: FutureBuilder<List<ScheduledRide>>(
        future: _upcomingRides,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No upcoming trips.'));
          }
          final rides = snapshot.data!;
          return ListView.builder(
            itemCount: rides.length,
            itemBuilder: (context, index) {
              final ride = rides[index];
              return ListTile(
                leading: const Icon(Icons.watch_later_outlined),
                title: Text(ride.destination),
                subtitle: Text(
                  DateFormat.yMMMd().add_jm().format(ride.pickupTime),
                ),
                trailing: TextButton(
                  child: const Text(
                    'Cancel',
                    style: TextStyle(color: Colors.red),
                  ),
                  onPressed: () => _showCancelConfirmation(ride.id),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
