import 'package:flutter/material.dart';

class Vehicle {
  final String id;
  final String make;
  final String model;
  final String licensePlate;
  final bool isActive;

  Vehicle({
    required this.id,
    required this.make,
    required this.model,
    required this.licensePlate,
    this.isActive = false,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'],
      make: json['make'],
      model: json['model'],
      licensePlate: json['licensePlate'],
      isActive: json['isActive'] ?? false,
    );
  }
}

class VehicleManagementScreen extends StatefulWidget {
  const VehicleManagementScreen({Key? key}) : super(key: key);

  @override
  _VehicleManagementScreenState createState() =>
      _VehicleManagementScreenState();
}

class _VehicleManagementScreenState extends State<VehicleManagementScreen> {
  // Mock data - in a real app, this would come from a Provider or Repository
  List<Vehicle> _vehicles = [
    Vehicle(
      id: '1',
      make: 'Toyota',
      model: 'Prius',
      licensePlate: 'KBA 123A',
      isActive: true,
    ),
    Vehicle(
      id: '2',
      make: 'Honda',
      model: 'Fit',
      licensePlate: 'KCD 456B',
      isActive: false,
    ),
    Vehicle(
      id: '3',
      make: 'Nissan',
      model: 'Note',
      licensePlate: 'KDE 789C',
      isActive: false,
    ),
  ];

  bool _isLoading = false;

  Future<void> _setActiveVehicle(String vehicleId) async {
    setState(() {
      _isLoading = true;
    });

    // Simulate API call
    await Future.delayed(const Duration(seconds: 1));

    setState(() {
      _vehicles = _vehicles.map((v) {
        return Vehicle(
          id: v.id,
          make: v.make,
          model: v.model,
          licensePlate: v.licensePlate,
          isActive: v.id == vehicleId,
        );
      }).toList();
      _isLoading = false;
    });

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Active vehicle updated')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Vehicles')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: _vehicles.length,
              itemBuilder: (context, index) {
                final vehicle = _vehicles[index];
                return Card(
                  elevation: 2,
                  margin: const EdgeInsets.only(bottom: 16.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: vehicle.isActive
                        ? BorderSide(
                            color: Theme.of(context).primaryColor,
                            width: 2,
                          )
                        : BorderSide.none,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${vehicle.make} ${vehicle.model}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (vehicle.isActive)
                              Chip(
                                label: const Text(
                                  'Active',
                                  style: TextStyle(color: Colors.white),
                                ),
                                backgroundColor: Theme.of(context).primaryColor,
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          vehicle.licensePlate,
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 16),
                        if (!vehicle.isActive)
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton(
                              onPressed: () => _setActiveVehicle(vehicle.id),
                              child: const Text('Set as Active Vehicle'),
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
