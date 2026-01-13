import 'package:flutter/material.dart';

class SosAlertScreen extends StatelessWidget {
  final Map<String, dynamic> alertData;

  const SosAlertScreen({super.key, required this.alertData});

  void _navigateToDriver(BuildContext context) {
    // Implement navigation logic (e.g., launch Google Maps)
    final lat = alertData['lat'];
    final lng = alertData['lng'];
    debugPrint('Navigating to $lat, $lng');

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Launching Navigation...')));
    // Navigator.pop(context); // Optionally close alert after accepting
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.red.shade900,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.warning_amber_rounded,
                size: 80,
                color: Colors.white,
              ),
              const SizedBox(height: 24),
              const Text(
                'SOS ALERT!',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 2.0,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'A nearby driver needs assistance.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18, color: Colors.white70),
              ),
              const SizedBox(height: 32),
              // Placeholder for Map View
              Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.map, size: 40, color: Colors.grey),
                      Text('Live Location Map'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              _buildInfoRow('Driver', alertData['driverName'] ?? 'Unknown'),
              _buildInfoRow('Distance', alertData['distance'] ?? 'Unknown'),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: () => _navigateToDriver(context),
                  icon: const Icon(Icons.navigation),
                  label: const Text('NAVIGATE TO DRIVER'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.red.shade900,
                    textStyle: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text(
                  'Ignore (I cannot assist)',
                  style: TextStyle(color: Colors.white54),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.white70, fontSize: 16),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
