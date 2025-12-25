import 'package:flutter/material.dart';
import '../services/ride_service.dart';

class RideHistoryScreen extends StatefulWidget {
  const RideHistoryScreen({Key? key}) : super(key: key);

  @override
  State<RideHistoryScreen> createState() => _RideHistoryScreenState();
}

class _RideHistoryScreenState extends State<RideHistoryScreen> {
  final RideService _rideService = RideService();
  late Future<List<RideHistoryItem>> _historyFuture;

  @override
  void initState() {
    super.initState();
    _historyFuture = _rideService.getRideHistory();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Your Rides')),
      body: FutureBuilder<List<RideHistoryItem>>(
        future: _historyFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return const Center(child: Text('Error loading ride history'));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No rides found.'));
          }

          final rides = snapshot.data!;
          return ListView.separated(
            itemCount: rides.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final ride = rides[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: ride.status == 'Cancelled'
                      ? Colors.red[100]
                      : Colors.blue[100],
                  child: Icon(
                    ride.status == 'Cancelled'
                        ? Icons.cancel
                        : Icons.directions_car,
                    color:
                        ride.status == 'Cancelled' ? Colors.red : Colors.blue,
                  ),
                ),
                title: Text(
                  ride.destination,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(
                  '${ride.date.day}/${ride.date.month} • ${ride.status}',
                  style: TextStyle(color: Colors.grey[600]),
                ),
                trailing: Text(
                  'KES ${ride.price.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => RideDetailsScreen(ride: ride),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}

class RideDetailsScreen extends StatelessWidget {
  final RideHistoryItem ride;

  const RideDetailsScreen({Key? key, required this.ride}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ride Details')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Map Placeholder
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Center(
                child: Text(
                  'Map Snapshot Placeholder',
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ),
            const SizedBox(height: 24),

            Text(
              ride.destination,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            Text(
              '${ride.date.day}/${ride.date.month}/${ride.date.year} at ${ride.date.hour}:${ride.date.minute.toString().padLeft(2, '0')}',
              style: const TextStyle(color: Colors.grey),
            ),

            const Divider(height: 32),

            _buildDetailRow('Driver', ride.driverName),
            const SizedBox(height: 16),
            _buildDetailRow('Status', ride.status),
            const SizedBox(height: 16),
            _buildDetailRow(
              'Total Fare',
              'KES ${ride.price.toStringAsFixed(0)}',
              isBold: true,
            ),

            const Spacer(),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {}, // Re-book logic would go here
                child: const Text('Re-book Ride'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 16, color: Colors.grey)),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
