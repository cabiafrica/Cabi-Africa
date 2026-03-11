import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:latlong2/latlong.dart';
import 'package:driver_app/widgets/back_to_back_offer_widget.dart';
import 'package:driver_app/widgets/swipeable_action_button.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:driver_app/services/ride_service.dart';

class TripInProgressScreen extends StatefulWidget {
  final String? rideId;
  final String? driverId;
  final RideService? rideService; // optional for testing
  const TripInProgressScreen({super.key, this.rideId, this.driverId, this.rideService});

  @override
  State<TripInProgressScreen> createState() => _TripInProgressScreenState();
}

class _TripInProgressScreenState extends State<TripInProgressScreen> {
  bool _showOffer = false;
  Timer? _tripTimer;
  double _currentFare = 150.0; // Base fare start
  double _distanceKm = 0.0;
  int _durationSeconds = 0;
  bool _isTripEnded = false;
  late final RideService _rideService;

  // Mock Locations
  LatLng _driverLocation = const LatLng(-1.286389, 36.817223); // CBD
  final LatLng _passengerLocation = const LatLng(-1.2921, 36.8219); // Near CBD

  @override
  void initState() {
    super.initState();
    _rideService = widget.rideService ?? RideService();
    _startBackendTrip();
    _startTripSimulation();
  }

  Future<void> _startBackendTrip() async {
    if (widget.rideId != null) {
      await _rideService.startTrip(widget.rideId!);
    }
  }

  @override
  void dispose() {
    _tripTimer?.cancel();
    super.dispose();
  }
  void _startTripSimulation() {
    _tripTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_isTripEnded) {
        timer.cancel();
        return;
      }
      setState(() {
        _durationSeconds++;
        // Simulate movement: every 5 seconds, add 0.1km
        if (_durationSeconds % 5 == 0) {
          _distanceKm += 0.1;
          // Simulate fare calculation: KES 30/km + KES 5/min
          _currentFare += (0.1 * 30) + (5 / 60 * 5);
        }

        // Move 2% closer to destination every second
        final double latDiff =
            _passengerLocation.latitude - _driverLocation.latitude;
        final double lngDiff =
            _passengerLocation.longitude - _driverLocation.longitude;
        if (latDiff.abs() > 0.0001 || lngDiff.abs() > 0.0001) {
          _driverLocation = LatLng(_driverLocation.latitude + (latDiff * 0.02),
              _driverLocation.longitude + (lngDiff * 0.02));

          // Send update to backend
          if (widget.driverId != null) {
            _rideService.updateDriverLocation(widget.driverId!,
                _driverLocation.latitude, _driverLocation.longitude);
          }
        }
      });
    });
  }

  void _handleOfferAccepted() {
    setState(() => _showOffer = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Next trip accepted!')),
    );
  }

  void _handleOfferDeclined() {
    setState(() => _showOffer = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Trip offer declined.')),
    );
  }

  String _formatDuration(int seconds) {
    final int minutes = seconds ~/ 60;
    final int remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  void _showWaybill() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateBottom) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Waybill Breakdown', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text('Base Fare: KES ${_currentFare.toStringAsFixed(2)}'),
                  Text('Distance: ${_distanceKm.toStringAsFixed(2)} km'),
                  Text('Duration: ${_formatDuration(_durationSeconds)}'),
                  const Divider(),
                  Text('Total Fare: KES ${_currentFare.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Align(
                    alignment: Alignment.centerRight,
                    child: ElevatedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Close'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('On Trip', style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: Container(
          margin: const EdgeInsets.all(8),
          decoration:
              const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
          child: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black),
            onPressed: () => Navigator.pop(context),
          ),
        ),
      ),
      body: Stack(
        children: [
          // 1. Full Screen Map
          CabiMap(
            initialCenter: _driverLocation,
            initialZoom: 15.0,
            markers: [
              CabiMapMarker.driver(
                  position: _driverLocation, driverId: 'me', isOnline: true),
              CabiMapMarker.dropoff(position: _passengerLocation),
            ],
            routePoints: [_driverLocation, _passengerLocation],
            showUserLocation: true,
          ),

          // Debug/Simulation Controls
          Positioned(
            top: 100,
            right: 20,
            child: FloatingActionButton.small(
              heroTag: 'sim_offer',
              onPressed: () => setState(() => _showOffer = true),
              backgroundColor: Colors.white,
              child:
                  const Icon(Icons.notifications_active, color: Colors.orange),
            ),
          ),

          // Bottom Trip Card
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF212121), // Dark Premium Background
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  )
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Passenger Info Header
                  Row(
                    children: [
                      const CircleAvatar(
                        radius: 20,
                        backgroundImage: NetworkImage(
                            'https://i.pravatar.cc/150?u=passenger_sarah'),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Sarah M.',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16),
                            ),
                            Text(
                              'Dropoff: Westlands',
                              style: TextStyle(
                                  color: Colors.white70, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color.fromARGB(255, 66, 66, 66),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          _formatDuration(_durationSeconds),
                          style: const TextStyle(
                              color: Color(0xFFFFD700),
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: Colors.white24, height: 24),

                  // Main Fare Display
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Current Fare',
                        style: TextStyle(color: Colors.white54, fontSize: 14),
                      ),
                      Text(
                        'KES ${_currentFare.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: Color(0xFFFFD700), // Taxi Gold
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _showWaybill,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white30),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('Waybill'),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        flex: 2,
                        child: SwipeableActionButton(
                            label: 'Slide to End Trip',
                            color: AppTheme.errorRed,
                            icon: Icons.flag,
                            onAction: () async {
                              if (widget.rideId != null) {
                                try {
                                  await _rideService
                                      .completeTrip(widget.rideId!);
                                } catch (e) {
                                  debugPrint('Error completing trip: $e');
                                }
                              }
                              setState(() => _isTripEnded = true);
                              _showWaybill(); // Show final bill
                            }),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          if (_showOffer)
            BackToBackOfferWidget(
              onAccept: _handleOfferAccepted,
              onDecline: _handleOfferDeclined,
            ),
        ],
      ),
    );
  }
}
