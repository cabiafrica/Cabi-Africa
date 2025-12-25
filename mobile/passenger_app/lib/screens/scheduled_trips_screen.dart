import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../providers/providers.dart';

class ScheduledTripsScreen extends ConsumerStatefulWidget {
  const ScheduledTripsScreen({super.key});

  @override
  ConsumerState<ScheduledTripsScreen> createState() =>
      _ScheduledTripsScreenState();
}

class _ScheduledTripsScreenState extends ConsumerState<ScheduledTripsScreen> {
  late Future<List<Map<String, dynamic>>> _scheduledRidesFuture;

  @override
  void initState() {
    super.initState();
    _scheduledRidesFuture = ref.read(rideServiceProvider).getScheduledRides();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Scheduled Rides')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _scheduledRidesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final trips = snapshot.data;
          if (trips == null || trips.isEmpty) {
            return const Center(child: Text("You have no upcoming rides."));
          }

          return ListView.builder(
            itemCount: trips.length,
            itemBuilder: (context, index) {
              final trip = trips[index];
              final pickupTime = DateTime.parse(trip['pickupTime']);
              final formattedTime = DateFormat(
                'EEE, MMM d, h:mm a',
              ).format(pickupTime);

              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  leading: const Icon(Icons.watch_later_outlined),
                  title: Text('To: ${trip['destination']}'),
                  subtitle: Text(formattedTime),
                  trailing: TextButton(
                    child: const Text(
                      'Cancel',
                      style: TextStyle(color: Colors.red),
                    ),
                    onPressed: () {
                      // In a real app, this would call a service to cancel the ride.
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Ride cancelled.')),
                      );
                      setState(() {
                        trips.removeAt(index);
                      });
                    },
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
