import 'package:flutter/material.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:latlong2/latlong.dart';

void main() {
  runApp(const CabiPassengerApp());
}

class CabiPassengerApp extends StatelessWidget {
  const CabiPassengerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cabi - Book a Ride',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const PassengerMapView(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class PassengerMapView extends StatefulWidget {
  const PassengerMapView({super.key});

  @override
  State<PassengerMapView> createState() => _PassengerMapViewState();
}

class _PassengerMapViewState extends State<PassengerMapView> {
  final LatLng _passengerLocation =
      const LatLng(-1.286389, 36.817223); // Westlands
  LatLng? _pickupLocation;
  LatLng? _dropoffLocation;
  bool _isBooking = false;

  // Mock nearby drivers
  final List<Map<String, dynamic>> _nearbyDrivers = [
    {
      'id': 'drv-001',
      'name': 'John K.',
      'location': const LatLng(-1.288000, 36.815000),
      'rating': 4.8,
      'eta': '2 min',
    },
    {
      'id': 'drv-002',
      'name': 'Mary N.',
      'location': const LatLng(-1.284000, 36.820000),
      'rating': 4.9,
      'eta': '3 min',
    },
    {
      'id': 'drv-003',
      'name': 'Peter M.',
      'location': const LatLng(-1.290000, 36.818000),
      'rating': 4.7,
      'eta': '4 min',
    },
  ];

  List<CabiMapMarker> _getMarkers() {
    final markers = <CabiMapMarker>[];

    // Passenger location
    markers.add(CabiMapMarker.passenger(
      position: _passengerLocation,
    ));

    // Nearby drivers
    for (var driver in _nearbyDrivers) {
      markers.add(CabiMapMarker.driver(
        position: driver['location'] as LatLng,
        driverId: driver['id'],
        isOnline: true,
      ));
    }

    // Pickup location if set
    if (_pickupLocation != null) {
      markers.add(CabiMapMarker.pickup(position: _pickupLocation!));
    }

    // Dropoff location if set
    if (_dropoffLocation != null) {
      markers.add(CabiMapMarker.dropoff(position: _dropoffLocation!));
    }

    return markers;
  }

  List<LatLng>? _getRoute() {
    if (_pickupLocation != null && _dropoffLocation != null) {
      return [_pickupLocation!, _dropoffLocation!];
    }
    return null;
  }

  void _setPickup() {
    setState(() {
      _pickupLocation = _passengerLocation;
    });
  }

  void _setDropoff() {
    // Simulate setting a dropoff location (JKIA)
    setState(() {
      _dropoffLocation = const LatLng(-1.319167, 36.928611);
    });
  }

  void _bookRide() {
    if (_pickupLocation == null || _dropoffLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please set pickup and dropoff locations'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isBooking = true;
    });

    // Simulate booking
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isBooking = false;
        });
        _showDriverFound();
      }
    });
  }

  void _showDriverFound() {
    final driver = _nearbyDrivers.first;
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.check_circle,
              color: Colors.green,
              size: 60,
            ),
            const SizedBox(height: 16),
            const Text(
              'Driver Found!',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                const CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.blue,
                  child: Icon(Icons.person, size: 30, color: Colors.white),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        driver['name'],
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Row(
                        children: [
                          const Icon(Icons.star, color: Colors.amber, size: 16),
                          const SizedBox(width: 4),
                          Text('${driver['rating']}'),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'Toyota Corolla',
                      style: TextStyle(fontSize: 14),
                    ),
                    Text(
                      'KCA 123X',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.access_time, color: Colors.blue),
                  const SizedBox(width: 8),
                  Text(
                    'Arriving in ${driver['eta']}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Colors.blue,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // Close Driver Found sheet
                  _startTrip();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                // Simulate "Meet Driver" or simple demo flow
                child: const Text('Simulate Boarding & Start Trip'),
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() {
                  _pickupLocation = null;
                  _dropoffLocation = null;
                });
              },
              child: const Text('Cancel Ride'),
            ),
          ],
        ),
      ),
    );
  }

  void _startTrip() {
    // Show ongoing trip sheet
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const LinearProgressIndicator(),
          const SizedBox(height: 20),
          const Text(
            'Trip in Progress',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 10),
          const Text('Heading to your destination...'),
          const SizedBox(height: 30),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _endTrip();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('End Trip'),
            ),
          )
        ]),
      ),
    );
  }

  void _endTrip() {
    // Show Receipt
    _showReceipt();
  }

  void _showReceipt() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Center(child: Text('Trip Receipt')),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Center(
              child: Text(
                'KSh 350.00',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Trip Fare'),
                Text('KSh 350.00'),
              ],
            ),
            const Divider(),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('KSh 350.00',
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 20),
            const Text(
              'Payment Method',
              style: TextStyle(color: Colors.grey),
            ),
            const Row(
              children: [
                Icon(Icons.money, size: 20),
                SizedBox(width: 8),
                Text('Cash'),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              setState(() {
                _pickupLocation = null;
                _dropoffLocation = null;
              });
            },
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(
                color: Colors.blue,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: Colors.white,
                    child: Icon(Icons.person, size: 40, color: Colors.blue),
                  ),
                  SizedBox(height: 10),
                  Text(
                    'Passenger Name',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                    ),
                  ),
                  Text(
                    'passenger@example.com',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.history),
              title: const Text('Your Trips'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.payment),
              title: const Text('Payment'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Settings'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
      body: Stack(
        children: [
          // Map
          CabiMap(
            initialCenter: _passengerLocation,
            initialZoom: 14.0,
            markers: _getMarkers(),
            routePoints: _getRoute(),
            showUserLocation: true,
          ),

          // Top Search Bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Builder(
                      builder: (context) => IconButton(
                        icon: const Icon(Icons.menu, color: Colors.grey),
                        onPressed: () {
                          Scaffold.of(context).openDrawer();
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.search, color: Colors.grey),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Where to?',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Booking Card (Scrollable Sheet)
          DraggableScrollableSheet(
            initialChildSize: 0.45,
            minChildSize: 0.2,
            maxChildSize: 0.8,
            builder: (context, scrollController) {
              return Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(20)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 10,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Handle Bar
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Saved Locations / Quick Access
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildQuickAccessItem(Icons.home, 'Home'),
                          const SizedBox(width: 16),
                          _buildQuickAccessItem(Icons.work, 'Work'),
                          const SizedBox(width: 16),
                          _buildQuickAccessItem(Icons.star, 'Saved'),
                          const SizedBox(width: 16),
                          _buildQuickAccessItem(Icons.history, 'Recent'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Recent Trips List
                    const Text(
                      'Recent Trips',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildRecentTripItem('Westgate Mall', 'Mar 15, 14:30'),
                    _buildRecentTripItem('Nairobi Hospital', 'Mar 12, 09:15'),
                    const SizedBox(height: 24),

                    // Choose a ride
                    const Text(
                      'Choose a ride',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildRideOption(
                      'CabiX',
                      'Affordable rides',
                      'KSh 250-350',
                      '2 min',
                      Icons.local_taxi,
                      Colors.blue,
                    ),
                    const SizedBox(height: 12),
                    _buildRideOption(
                      'CabiXL',
                      'Spacious rides for groups',
                      'KSh 450-600',
                      '4 min',
                      Icons.airport_shuttle,
                      Colors.black87,
                    ),
                    const SizedBox(height: 12),
                    _buildRideOption(
                      'CabiMoto',
                      'Fast & affordable moto rides',
                      'KSh 100-200',
                      '1 min',
                      Icons.two_wheeler,
                      Colors.orange,
                    ),

                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _setPickup,
                            icon: Icon(
                              Icons.circle,
                              size: 12,
                              color: _pickupLocation != null
                                  ? Colors.green
                                  : Colors.grey,
                            ),
                            label: Text(_pickupLocation != null
                                ? 'Pickup Set'
                                : 'Pickup'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _setDropoff,
                            icon: Icon(
                              Icons.location_on,
                              size: 12,
                              color: _dropoffLocation != null
                                  ? Colors.red
                                  : Colors.grey,
                            ),
                            label: Text(_dropoffLocation != null
                                ? 'Dropoff Set'
                                : 'Dropoff'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isBooking ? null : _bookRide,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: _isBooking
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.white),
                                ),
                              )
                            : const Text(
                                'Book Ride',
                                style: TextStyle(
                                    fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAccessItem(IconData icon, String label) {
    return Column(
      children: [
        CircleAvatar(
          radius: 24,
          backgroundColor: Colors.grey[100],
          child: Icon(icon, color: Colors.black87),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildRecentTripItem(String location, String date) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const Icon(Icons.history, color: Colors.grey),
      title: Text(location),
      subtitle: Text(date),
      onTap: () {
        // Handle recent trip tap
      },
      trailing:
          const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
    );
  }

  Widget _buildRideOption(
    String name,
    String description,
    String price,
    String eta,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: color.withValues(alpha: 0.1),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                price,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              Text(
                eta,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
