import 'package:core_models/core_models.dart';
import 'package:driver_app/src/api/ride_service.dart';
import 'package:flutter/material.dart';

class TripHistoryScreen extends StatefulWidget {
  const TripHistoryScreen({super.key});

  @override
  State<TripHistoryScreen> createState() => _TripHistoryScreenState();
}

class _TripHistoryScreenState extends State<TripHistoryScreen> {
  final RideService _rideService = RideService();
  late Future<List<Ride>> _tripHistoryFuture;

  @override
  void initState() {
    super.initState();
    _tripHistoryFuture = _rideService.getDriverTripHistory();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Trip History')),
      body: FutureBuilder<List<Ride>>(
        future: _tripHistoryFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
              child: Text(
                "You haven't completed any trips yet.",
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            );
          } else {
            final trips = snapshot.data!;
            return ListView.builder(
              itemCount: trips.length,
              itemBuilder: (context, index) {
                final trip = trips[index];
                // A more robust date formatting would use the intl package
                final formattedDate =
                    '${trip.timestamp?.toLocal().toIso8601String().substring(0, 10)}';

                return Card(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  child: ListTile(
                    leading: const Icon(Icons.directions_car),
                    title: Text('To: ${trip.destinationAddress}'),
                    subtitle: Text(
                      'With ${trip.passengerName ?? "Passenger"} on $formattedDate',
                    ),
                    trailing: Text(
                      'KES ${trip.fare?.toStringAsFixed(2) ?? '0.00'}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                );
              },
            );
          }
        },
      ),
    );
  }
}
