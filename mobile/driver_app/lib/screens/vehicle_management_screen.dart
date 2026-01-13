import 'package:flutter/material.dart';

// Mock data models. In a real app, these would be generated from JSON.
class Vehicle {
  final String id;
  final String make;
  final String model;
  final String licensePlate;
  bool isActive;

  Vehicle({
    required this.id,
    required this.make,
    required this.model,
    required this.licensePlate,
    this.isActive = false,
  });
}

// Mock service. In a real app, this would make HTTP requests.
class VehicleService {
  Future<List<Vehicle>> getVehicles() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return [
      Vehicle(
        id: 'v1',
        make: 'Toyota',
        model: 'Camry',
        licensePlate: 'KDA 123A',
        isActive: true,
      ),
      Vehicle(id: 'v2', make: 'Honda', model: 'Fit', licensePlate: 'KDB 456B'),
    ];
  }

  Future<void> setActiveVehicle(String vehicleId) async {
    await Future.delayed(const Duration(milliseconds: 400));
    debugPrint('Setting vehicle $vehicleId as active.');
    // In a real app, this would be a PUT request to the vehicle-service
  }

  Future<void> deleteVehicle(String vehicleId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    debugPrint('Deleting vehicle: $vehicleId');
  }
}

class VehicleManagementScreen extends StatefulWidget {
  const VehicleManagementScreen({super.key});

  @override
  State<VehicleManagementScreen> createState() =>
      _VehicleManagementScreenState();
}

class _VehicleManagementScreenState extends State<VehicleManagementScreen> {
  final VehicleService _service = VehicleService();
  late Future<List<Vehicle>> _vehiclesFuture;

  @override
  void initState() {
    super.initState();
    _vehiclesFuture = _service.getVehicles();
  }

  void _refreshVehicles() {
    setState(() {
      _vehiclesFuture = _service.getVehicles();
    });
  }

  Future<void> _setActive(String vehicleId) async {
    await _service.setActiveVehicle(vehicleId);
    // Refresh the list to show the change
    _refreshVehicles();

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Active vehicle has been updated.')),
    );
  }

  Future<void> _handleDelete(String vehicleId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Vehicle'),
        content: const Text('Are you sure you want to delete this vehicle?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Delete')),
        ],
      ),
    );

    if (confirm == true) {
      await _service.deleteVehicle(vehicleId);
      _refreshVehicles();

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vehicle deleted successfully.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Vehicles')),
      body: FutureBuilder<List<Vehicle>>(
        future: _vehiclesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Could not load vehicles.'));
          }
          final vehicles = snapshot.data!;
          return ListView.builder(
            itemCount: vehicles.length,
            itemBuilder: (context, index) {
              final vehicle = vehicles[index];
              return Card(
                margin:
                    const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                child: ListTile(
                  title: Text('${vehicle.make} ${vehicle.model}'),
                  subtitle: Text(vehicle.licensePlate),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (vehicle.isActive)
                        const Chip(
                            label: Text('Active'),
                            backgroundColor: Colors.green)
                      else
                        OutlinedButton(
                          onPressed: () => _setActive(vehicle.id),
                          child: const Text('Set Active'),
                        ),
                      IconButton(
                        icon:
                            const Icon(Icons.delete_outline, color: Colors.red),
                        onPressed: () => _handleDelete(vehicle.id),
                      ),
                    ],
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
