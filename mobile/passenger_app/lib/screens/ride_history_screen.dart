import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:provider/provider.dart' as legacy_provider;
import '../providers/auth_provider.dart';
import '../providers/providers.dart';
import '../services/ride_service.dart';

class RideHistoryScreen extends ConsumerStatefulWidget {
  const RideHistoryScreen({super.key});

  @override
  ConsumerState<RideHistoryScreen> createState() => _RideHistoryScreenState();
}

class _RideHistoryScreenState extends ConsumerState<RideHistoryScreen> {
  late Future<List<RideHistoryItem>> _historyFuture;

  @override
  void initState() {
    super.initState();
    final rideService = ref.read(rideServiceProvider);
    final authProvider =
        legacy_provider.Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.userId ?? 'current-user-stub';
    _historyFuture = rideService.getRideHistory(userId);
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

  const RideDetailsScreen({super.key, required this.ride});

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
