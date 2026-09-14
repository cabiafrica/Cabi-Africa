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
      MaterialPageRoute(
        builder: (context) => const SearchScreen(),
        settings: RouteSettings(arguments: isPickup),
      ),
    );

    if (selected != null) {
      setState(() {
        final lat = double.tryParse(selected['lat']?.toString() ?? '') ?? (isPickup ? -1.286 : -1.283);
        final lon = double.tryParse(selected['lon']?.toString() ?? '') ?? (isPickup ? 36.817 : 36.783);

        if (isPickup) {
          _pickupAddress = selected['name'];
          _pickupLocation = LatLng(lat, lon);
        } else {
          _dropoffAddress = selected['name'];
          _dropoffLocation = LatLng(lat, lon);
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
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Send a Package',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Location Selection Card
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1E1E),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF2C2C2C)),
                ),
                child: Column(
                  children: [
                    ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.my_location_rounded, color: Color(0xFFF59E0B), size: 20),
                      ),
                      title: Text(
                        _pickupAddress ?? 'Select Pickup Location',
                        style: TextStyle(
                          color: _pickupAddress != null ? Colors.white : Colors.white54,
                          fontWeight: _pickupAddress != null ? FontWeight.bold : FontWeight.normal,
                          fontSize: 14,
                        ),
                      ),
                      trailing: const Icon(Icons.chevron_right_rounded, color: Colors.white38),
                      onTap: () => _selectLocation(true),
                    ),
                    const Divider(height: 1, color: Color(0xFF2C2C2C)),
                    ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.location_on_rounded, color: Color(0xFFF59E0B), size: 20),
                      ),
                      title: Text(
                        _dropoffAddress ?? 'Select Drop-off Location',
                        style: TextStyle(
                          color: _dropoffAddress != null ? Colors.white : Colors.white54,
                          fontWeight: _dropoffAddress != null ? FontWeight.bold : FontWeight.normal,
                          fontSize: 14,
                        ),
                      ),
                      trailing: const Icon(Icons.chevron_right_rounded, color: Colors.white38),
                      onTap: () => _selectLocation(false),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Contact Details Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1E1E),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF2C2C2C)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextFormField(
                      controller: _pickupContactController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        prefixIcon: const Icon(Icons.person_pin_circle_rounded, color: Color(0xFFF59E0B), size: 22),
                        labelText: 'Pickup Contact Name/Phone',
                        labelStyle: const TextStyle(color: Colors.white54),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFF333333)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFF59E0B)),
                        ),
                      ),
                      validator: (v) => v!.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _dropoffContactController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        prefixIcon: const Icon(Icons.person_pin_rounded, color: Color(0xFFF59E0B), size: 22),
                        labelText: 'Drop-off Contact Name/Phone',
                        labelStyle: const TextStyle(color: Colors.white54),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFF333333)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFF59E0B)),
                        ),
                      ),
                      validator: (v) => v!.isEmpty ? 'Required' : null,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Package Details Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1E1E),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF2C2C2C)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.inventory_2_rounded, color: Color(0xFFF59E0B), size: 18),
                        SizedBox(width: 8),
                        Text(
                          'Package Size',
                          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: _packageSize,
                      isExpanded: true,
                      dropdownColor: const Color(0xFF1E1E1E),
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFF333333)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFF59E0B)),
                        ),
                      ),
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
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _packageDescriptionController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        prefixIcon: const Icon(Icons.description_rounded, color: Color(0xFFF59E0B), size: 20),
                        labelText: 'Package Description',
                        labelStyle: const TextStyle(color: Colors.white54),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFF333333)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFF59E0B)),
                        ),
                      ),
                      validator: (v) => v!.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 14),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.add_a_photo_rounded, size: 20),
                      label: Text(_imageFile == null ? 'Add Package Photo' : 'Photo Attached'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFF59E0B),
                        side: const BorderSide(color: Color(0xFF333333)),
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: _pickImage,
                    ),
                    if (_imageFile != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 12.0),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Image.file(_imageFile!, height: 100, fit: BoxFit.cover),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Fare and Confirmation
              if (_estimatedFare != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1E1E),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFF59E0B), width: 1.5),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Estimated Fare', style: TextStyle(color: Colors.white54, fontSize: 12)),
                          Text('CABI Package Express', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Text(
                        'KES ${_estimatedFare!.toStringAsFixed(0)}',
                        style: const TextStyle(
                          color: Color(0xFFF59E0B),
                          fontWeight: FontWeight.w900,
                          fontSize: 22,
                        ),
                      ),
                    ],
                  ),
                ),

              _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFF59E0B)),
                      ),
                    )
                  : ElevatedButton(
                      onPressed: _estimatedFare == null ? null : _submitRequest,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF59E0B),
                        foregroundColor: Colors.black,
                        disabledBackgroundColor: const Color(0xFF333333),
                        disabledForegroundColor: Colors.white30,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: const Text(
                        'FIND DELIVERY DRIVER',
                        style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, letterSpacing: 0.8),
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
