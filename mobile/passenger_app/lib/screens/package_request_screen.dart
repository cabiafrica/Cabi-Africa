import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:image_picker/image_picker.dart';
import '../services/ride_service.dart';
import 'search_screen.dart';

class PackageRequestScreen extends StatefulWidget {
  const PackageRequestScreen({super.key});

  @override
  State<PackageRequestScreen> createState() => _PackageRequestScreenState();
}

class _PackageRequestScreenState extends State<PackageRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _rideService = RideService();

  // Form controllers
  final _pickupContactController = TextEditingController();
  final _dropoffContactController = TextEditingController();
  final _packageDescriptionController = TextEditingController();

  // State
  String? _pickupAddress;
  LatLng? _pickupLocation;
  String? _dropoffAddress;
  LatLng? _dropoffLocation;
  String _packageSize = 'Small';
  File? _imageFile;
  double? _estimatedFare;
  bool _isLoading = false;

  Future<void> _selectLocation(bool isPickup) async {
    final selected = await Navigator.of(context).push<Map<String, dynamic>>(
      MaterialPageRoute(builder: (context) => const SearchScreen()),
    );

    if (selected != null) {
      setState(() {
        if (isPickup) {
          _pickupAddress = selected['name'];
          _pickupLocation = const LatLng(-1.286, 36.817); // Simulated
        } else {
          _dropoffAddress = selected['name'];
          _dropoffLocation = const LatLng(-1.283, 36.783); // Simulated
        }
      });
      _getFare();
    }
  }

  Future<void> _getFare() async {
    if (_pickupLocation != null && _dropoffLocation != null) {
      final result = await _rideService.getPackageDeliveryFare(
        pickup: _pickupLocation!,
        destination: _dropoffLocation!,
        packageSize: _packageSize,
      );
      setState(() {
        _estimatedFare = result['fare'];
      });
    }
  }

  Future<void> _pickImage() async {
    final pickedFile = await ImagePicker().pickImage(
      source: ImageSource.camera,
    );
    if (pickedFile != null) {
      setState(() {
        _imageFile = File(pickedFile.path);
      });
    }
  }

  Future<void> _submitRequest() async {
    if (_formKey.currentState!.validate() &&
        _pickupLocation != null &&
        _dropoffLocation != null &&
        _estimatedFare != null) {
      setState(() => _isLoading = true);
      try {
        await _rideService.createPackageDelivery(
          pickup: _pickupLocation!,
          destination: _dropoffLocation!,
          packageSize: _packageSize,
          packageDescription: _packageDescriptionController.text,
          pickupContact: _pickupContactController.text,
          dropoffContact: _dropoffContactController.text,
          fare: _estimatedFare!,
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Searching for a driver for your delivery...'),
            ),
          );
          Navigator.of(context).pop();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to create delivery request: $e')),
          );
        }
      } finally {
        if (mounted) {
          setState(() => _isLoading = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Send a Package')),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Location Selection
              ListTile(
                leading: const Icon(Icons.my_location),
                title: Text(_pickupAddress ?? 'Select Pickup Location'),
                onTap: () => _selectLocation(true),
              ),
              ListTile(
                leading: const Icon(Icons.location_on),
                title: Text(_dropoffAddress ?? 'Select Drop-off Location'),
                onTap: () => _selectLocation(false),
              ),
              const Divider(),

              // Contact Details
              TextFormField(
                controller: _pickupContactController,
                decoration: const InputDecoration(
                  labelText: 'Pickup Contact Name/Phone',
                ),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _dropoffContactController,
                decoration: const InputDecoration(
                  labelText: 'Drop-off Contact Name/Phone',
                ),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const Divider(),

              // Package Details
              const Text(
                'Package Size',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              DropdownButton<String>(
                value: _packageSize,
                isExpanded: true,
                items: ['Small', 'Medium', 'Large'].map((String value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
                onChanged: (newValue) {
                  setState(() {
                    _packageSize = newValue!;
                  });
                  _getFare();
                },
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _packageDescriptionController,
                decoration: const InputDecoration(
                  labelText: 'Package Description',
                ),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                icon: const Icon(Icons.camera_alt),
                label: Text(_imageFile == null ? 'Add Photo' : 'Photo Added'),
                onPressed: _pickImage,
              ),
              if (_imageFile != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Image.file(_imageFile!, height: 100),
                ),
              const Divider(),

              // Fare and Confirmation
              if (_estimatedFare != null)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16.0),
                  child: Center(
                    child: Text(
                      'Estimated Fare: KES ${_estimatedFare!.toStringAsFixed(0)}',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                ),

              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                      onPressed: _estimatedFare == null ? null : _submitRequest,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Find Driver'),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
