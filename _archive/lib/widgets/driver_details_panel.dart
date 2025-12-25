import 'package:flutter/material.dart';

// Mock data model for demonstration
class AssignedDriverInfo {
  final String driverName;
  final String vehicleModel;
  final String licensePlate;
  final String ridePin;

  AssignedDriverInfo({
    required this.driverName,
    required this.vehicleModel,
    required this.licensePlate,
    required this.ridePin,
  });
}

class DriverDetailsPanel extends StatelessWidget {
  final AssignedDriverInfo driverInfo;

  const DriverDetailsPanel({super.key, required this.driverInfo});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
        boxShadow: [
          BoxShadow(blurRadius: 10, color: Colors.black.withOpacity(0.1)),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Your driver is on the way!',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          _buildDriverInfo(),
          const Divider(height: 32),
          _buildPinDisplay(context),
        ],
      ),
    );
  }

  Widget _buildDriverInfo() {
    return Row(
      children: [
        const CircleAvatar(radius: 30, child: Icon(Icons.person, size: 30)),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              driverInfo.driverName,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const SizedBox(height: 4),
            Text('${driverInfo.vehicleModel} • ${driverInfo.licensePlate}'),
          ],
        ),
      ],
    );
  }

  Widget _buildPinDisplay(BuildContext context) {
    return Column(
      children: [
        const Text('Show this PIN to your driver to start the trip'),
        const SizedBox(height: 8),
        Text(
          driverInfo.ridePin,
          style: Theme.of(context).textTheme.displayMedium?.copyWith(
            fontWeight: FontWeight.bold,
            letterSpacing: 12,
          ),
        ),
      ],
    );
  }
}
