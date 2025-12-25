import 'package:flutter/material.dart';
import 'vehicle_documents_screen.dart';

class VehicleListScreen extends StatefulWidget {
  const VehicleListScreen({super.key});

  @override
  State<VehicleListScreen> createState() => _VehicleListScreenState();
}

class _VehicleListScreenState extends State<VehicleListScreen> {
  // Mock data
  final List<Map<String, dynamic>> _vehicles = [
    {
      'id': 'v1',
      'name': 'Toyota Camry (KBK 123A)',
      'status': 'VERIFIED',
      'active': true
    },
    {
      'id': 'v2',
      'name': 'Honda Civic (KCA 456B)',
      'status': 'PENDING',
      'active': false
    }
  ];

  void _setActive(String id) {
    final v = _vehicles.firstWhere((element) => element['id'] == id);
    if (v['status'] != 'VERIFIED') {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vehicle must be verified first.')));
      return;
    }

    setState(() {
      for (var element in _vehicles) {
        element['active'] = (element['id'] == id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Vehicles')),
      body: ListView.builder(
        itemCount: _vehicles.length,
        itemBuilder: (context, index) {
          final v = _vehicles[index];
          return Card(
            margin: const EdgeInsets.all(8),
            child: ListTile(
              leading: Icon(Icons.directions_car,
                  color: v['active'] ? Colors.green : Colors.grey),
              title: Text(v['name']),
              subtitle: Text('Status: ${v['status']}'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (!v['active'])
                    TextButton(
                        onPressed: () => _setActive(v['id']),
                        child: const Text('Set Active')),
                  IconButton(
                    icon: const Icon(Icons.file_upload),
                    onPressed: () {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => VehicleDocumentsScreen(
                                  vehicleId: v['id'], vehicleName: v['name'])));
                    },
                  )
                ],
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.add),
        onPressed: () {
          // Add vehicle flow
        },
      ),
    );
  }
}
