import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

// Mock DTO - In a real app, this would be generated.
class DriverHomeStatusDto {
  final bool isOnline;
  DriverHomeStatusDto({required this.isOnline});
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<DriverHomeStatusDto> _statusFuture;
  bool _isOnline = false;

  static const CameraPosition _kInitialPosition = CameraPosition(
    target: LatLng(40.7128, -74.0060), // New York City
    zoom: 14,
  );

  @override
  void initState() {
    super.initState();
    _statusFuture = _fetchStatus();
  }

  Future<DriverHomeStatusDto> _fetchStatus() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));
    final status = DriverHomeStatusDto(isOnline: false);
    setState(() {
      _isOnline = status.isOnline;
    });
    return status;
  }

  Future<void> _toggleOnlineStatus(bool newStatus) async {
    // Mock API call
    print('Setting online status to: $newStatus');
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() {
      _isOnline = newStatus;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        actions: [
          IconButton(icon: const Icon(Icons.account_circle), onPressed: () {}),
          IconButton(icon: const Icon(Icons.attach_money), onPressed: () {}),
        ],
      ),
      body: FutureBuilder<DriverHomeStatusDto>(
        future: _statusFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          return Stack(
            children: [
              const GoogleMap(
                initialCameraPosition: _kInitialPosition,
                myLocationEnabled: true,
                myLocationButtonEnabled: true,
              ),
              Positioned(
                bottom: 20,
                left: 20,
                right: 20,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isOnline ? Colors.red : Colors.green,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: () => _toggleOnlineStatus(!_isOnline),
                  child: Text(_isOnline ? 'Go Offline' : 'Go Online'),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
