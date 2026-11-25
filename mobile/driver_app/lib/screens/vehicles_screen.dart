import 'package:flutter/material.dart';
import 'vehicle_account_screen.dart';

class VehiclesScreen extends StatefulWidget {
  const VehiclesScreen({super.key});

  @override
  State<VehiclesScreen> createState() => _VehiclesScreenState();
}

class _VehiclesScreenState extends State<VehiclesScreen> {
  final List<Map<String, dynamic>> _vehicles = [
    {
      'id': 'veh_1',
      'make': 'Toyota',
      'model': 'Camry',
      'year': 2020,
      'color': 'Silver',
      'licensePlate': 'ABC123',
      'type': 'SEDAN',
      'isActive': true,
    },
  ];

  void _addVehicle() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (ctx) => const AddVehicleScreen()),
    );

    if (result != null) {
      setState(() {
        _vehicles.add(result);
      });
    }
  }

  void _setActive(String vehicleId) {
    setState(() {
      for (var vehicle in _vehicles) {
        vehicle['isActive'] = vehicle['id'] == vehicleId;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Active vehicle updated')),
    );
  }

  void _deleteVehicle(String vehicleId) {
    final vehicle = _vehicles.firstWhere((v) => v['id'] == vehicleId);
    if (vehicle['isActive']) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot delete active vehicle')),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Vehicle?'),
        content: const Text('Are you sure you want to remove this vehicle?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _vehicles.removeWhere((v) => v['id'] == vehicleId);
              });
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('DELETE'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Vehicles'),
        backgroundColor: const Color(0xFFFFBE0B), // Cabi Yellow
        foregroundColor: Colors.black,
      ),
      body: _vehicles.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.directions_car, size: 80, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  const Text('No vehicles added',
                      style: TextStyle(fontSize: 18)),
                  const SizedBox(height: 24),
                  // Button to add first vehicle via portal
                  ElevatedButton.icon(
                    onPressed: _addVehicle,
                    icon: const Icon(Icons.add),
                    label: const Text('ADD VEHICLE VIA PORTAL'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFFBE0B),
                      foregroundColor: Colors.black,
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _vehicles.length,
              itemBuilder: (ctx, index) {
                final vehicle = _vehicles[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: vehicle['isActive']
                                    ? const Color(0xFFFFBE0B)
                                        .withValues(alpha: 0.2) // Yellow tint
                                    : Colors.grey[200],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                Icons.directions_car,
                                color: vehicle['isActive']
                                    ? Colors.black
                                    : Colors.grey,
                                size: 32,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${vehicle['make']} ${vehicle['model']}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                    ),
                                  ),
                                  Text(
                                    '${vehicle['year']} • ${vehicle['color']}',
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ),
                            if (vehicle['isActive'])
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.green,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  'ACTIVE',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const Divider(height: 24),
                        Row(
                          children: [
                            const Icon(Icons.confirmation_number,
                                size: 16, color: Colors.grey),
                            const SizedBox(width: 8),
                            Text(vehicle['licensePlate'],
                                style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.bold)),
                            const Spacer(),
                            Text(vehicle['type'],
                                style: TextStyle(
                                    color: Colors.grey[600], fontSize: 12)),
                          ],
                        ),
                        if (vehicle['hasDashcam'] == true) ...[
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.blue.shade50,
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(
                                      color: Colors.blue.shade300, width: 0.8),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.videocam,
                                        color: Colors.blue, size: 14),
                                    SizedBox(width: 4),
                                    Text(
                                      'DASHCAM REGISTERED (SURVEILLANCE ACTIVE)',
                                      style: TextStyle(
                                        color: Colors.blue,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (ctx) => VehicleAccountScreen(
                                    vehicleData: vehicle,
                                  ),
                                ),
                              );
                            },
                            icon: const Icon(Icons.stars_rounded, color: Colors.black, size: 18),
                            label: const Text(
                              'CAR ACCOUNT & INCENTIVES',
                              style: TextStyle(
                                color: Colors.black,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFFBE0B),
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            if (!vehicle['isActive'])
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () => _setActive(vehicle['id']),
                                  icon: const Icon(Icons.check_circle_outline),
                                  label: const Text('SET AS ACTIVE'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.black,
                                  ),
                                ),
                              ),
                            if (!vehicle['isActive']) const SizedBox(width: 8),
                            // Delete button (Disabled if active, but logic handles it above)
                            if (!vehicle['isActive'])
                              IconButton(
                                onPressed: () => _deleteVehicle(vehicle['id']),
                                icon: const Icon(Icons.delete_outline,
                                    color: Colors.red),
                                tooltip: 'Delete Vehicle',
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
      // Plus button at left bottom as requested
      floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingActionButton: FloatingActionButton(
        onPressed: _addVehicle,
        backgroundColor: const Color(0xFFFFBE0B),
        foregroundColor: Colors.black,
        tooltip: 'Go to User Portal to Add Vehicle',
        child: const Icon(Icons.add),
      ),
    );
  }
}

class AddVehicleScreen extends StatefulWidget {
  const AddVehicleScreen({super.key});

  @override
  State<AddVehicleScreen> createState() => _AddVehicleScreenState();
}

class _AddVehicleScreenState extends State<AddVehicleScreen> {
  final _formKey = GlobalKey<FormState>();
  final _makeController = TextEditingController();
  final _modelController = TextEditingController();
  final _yearController = TextEditingController();
  final _colorController = TextEditingController();
  final _plateController = TextEditingController();
  String _vehicleType = 'SEDAN';
  bool _hasDashcam = false;
  bool _dashcamDecalAffixed = false;

  void _submit() {
    if (_formKey.currentState!.validate()) {
      Navigator.pop(context, {
        'id': 'veh_${DateTime.now().millisecondsSinceEpoch}',
        'make': _makeController.text,
        'model': _modelController.text,
        'year': int.parse(_yearController.text),
        'color': _colorController.text,
        'licensePlate': _plateController.text.toUpperCase(),
        'type': _vehicleType,
        'hasDashcam': _hasDashcam,
        'dashcamDecalAffixed': _dashcamDecalAffixed,
        'isActive': false,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Portal - Vehicle Registration'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              color: Colors.blue.shade50,
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.blue),
                  SizedBox(width: 12),
                  Expanded(
                      child: Text(
                          "Use this portal to register new vehicles. Approvals may take up to 24 hours.")),
                ],
              ),
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _makeController,
              decoration: const InputDecoration(
                labelText: 'Make',
                hintText: 'Toyota',
                border: OutlineInputBorder(),
              ),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _modelController,
              decoration: const InputDecoration(
                labelText: 'Model',
                hintText: 'Camry',
                border: OutlineInputBorder(),
              ),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _yearController,
              decoration: const InputDecoration(
                labelText: 'Year',
                hintText: '2020',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _colorController,
              decoration: const InputDecoration(
                labelText: 'Color',
                hintText: 'Silver',
                border: OutlineInputBorder(),
              ),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _plateController,
              decoration: const InputDecoration(
                labelText: 'License Plate',
                hintText: 'ABC123',
                border: OutlineInputBorder(),
              ),
              textCapitalization: TextCapitalization.characters,
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _vehicleType,
              decoration: const InputDecoration(
                labelText: 'Vehicle Type',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'SEDAN', child: Text('Sedan')),
                DropdownMenuItem(value: 'SUV', child: Text('SUV')),
                DropdownMenuItem(value: 'VAN', child: Text('Van')),
                DropdownMenuItem(value: 'LUXURY', child: Text('Luxury')),
              ],
              onChanged: (value) => setState(() => _vehicleType = value!),
            ),
            const SizedBox(height: 20),
            // Mandatory Dashcam & Surveillance Declaration
            Container(
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text(
                      'Vehicle has Dashcam / Surveillance Camera',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    subtitle: const Text(
                      'Declare if inward- or outward-facing cameras are fitted to this vehicle for safety and crime deterrence.',
                      style: TextStyle(fontSize: 12),
                    ),
                    secondary: const Icon(Icons.videocam, color: Color(0xFFFFBE0B)),
                    value: _hasDashcam,
                    onChanged: (val) {
                      setState(() {
                        _hasDashcam = val;
                        if (!val) _dashcamDecalAffixed = false;
                      });
                    },
                  ),
                  if (_hasDashcam) ...[
                    const Divider(height: 1),
                    CheckboxListTile(
                      title: const Text(
                        'Passenger Warning Decal Affixed',
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                      subtitle: const Text(
                        'I confirm visible interior warning stickers notify passengers of active recording, and I covenant NEVER to upload or leak footage to social media under penalty of Section 72 of the Data Protection Act (2019).',
                        style: TextStyle(fontSize: 11, color: Colors.black87),
                      ),
                      value: _dashcamDecalAffixed,
                      onChanged: (val) {
                        setState(() {
                          _dashcamDecalAffixed = val ?? false;
                        });
                      },
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _submit,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: const Color(0xFFFFBE0B),
                foregroundColor: Colors.black,
              ),
              child: const Text('SUBMIT FOR APPROVAL'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _makeController.dispose();
    _modelController.dispose();
    _yearController.dispose();
    _colorController.dispose();
    _plateController.dispose();
    super.dispose();
  }
}

