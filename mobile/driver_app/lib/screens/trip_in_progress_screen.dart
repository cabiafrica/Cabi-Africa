import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:driver_app/providers/map_provider.dart';
import 'package:driver_app/widgets/back_to_back_offer_widget.dart';
import 'package:driver_app/widgets/swipeable_action_button.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:driver_app/services/ride_service.dart';
import 'rate_passenger_screen.dart';
import '../services/audio_notification_service.dart';

class TripInProgressScreen extends StatefulWidget {
  final String? rideId;
  final String? driverId;
  final String? passengerName;
  final String? tripCode;
  final RideService? rideService; 
  final bool isExtendedPickup;
  final double? subsidyAmount;

  const TripInProgressScreen({
    super.key,
    this.rideId,
    this.driverId,
    this.passengerName,
    this.tripCode,
    this.rideService,
    this.isExtendedPickup = false,
    this.subsidyAmount,
  });

  @override
  State<TripInProgressScreen> createState() => _TripInProgressScreenState();
}

class _TripInProgressScreenState extends State<TripInProgressScreen> {
  bool _showOffer = false;
  bool _allowBackToBack = true;
  Timer? _tripTimer;
  double _currentFare = 150.0; 
  double _distanceKm = 0.0;
  int _durationSeconds = 0;
  bool _isTripEnded = false;
  late final RideService _rideService;

  LatLng _driverLocation = const LatLng(-1.286389, 36.817223); 
  final LatLng _passengerLocation = const LatLng(-1.2921, 36.8219); 

  @override
  void initState() {
    super.initState();
    _rideService = widget.rideService ?? RideService();
    _loadBackToBackPreference();
    _startBackendTrip();
    _startTripSimulation();
  }

  Future<void> _loadBackToBackPreference() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (mounted) {
        setState(() {
          _allowBackToBack = prefs.getBool('cabi_driver_back_to_back') ?? true;
        });
      }
    } catch (e) {
      debugPrint('[B2B] Error loading back-to-back: $e');
    }
  }

  Future<void> _startBackendTrip() async {
    if (widget.rideId != null) {
      await _rideService.startTrip(widget.rideId!);
      AudioNotificationService.instance.play('trip_started');
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
      if (mounted) {
        setState(() {
          _durationSeconds++;
          if (_durationSeconds % 5 == 0) {
            _distanceKm += 0.1;
            _currentFare += (0.1 * 30) + (5 / 60 * 5);
          }

          final double latDiff =
              _passengerLocation.latitude - _driverLocation.latitude;
          final double lngDiff =
              _passengerLocation.longitude - _driverLocation.longitude;
          if (latDiff.abs() > 0.0001 || lngDiff.abs() > 0.0001) {
            _driverLocation = LatLng(_driverLocation.latitude + (latDiff * 0.02),
                _driverLocation.longitude + (lngDiff * 0.02));

            if (widget.driverId != null) {
              _rideService.updateDriverLocation(widget.driverId!,
                  _driverLocation.latitude, _driverLocation.longitude);
            }
          }
        });
      }
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
        return Container(
          decoration: const BoxDecoration(
            color: AppTheme.darkSurface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('TRIP SUMMARY', style: TextStyle(color: AppTheme.primaryColor, fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
              const SizedBox(height: 24),
              _buildBillRow('Base Fare', 'KES 150.00'),
              _buildBillRow('Distance (${_distanceKm.toStringAsFixed(2)} km)', 'KES ${(_distanceKm * 30).toStringAsFixed(2)}'),
              _buildBillRow('Duration (${_formatDuration(_durationSeconds)})', 'KES ${(_durationSeconds / 60 * 5).toStringAsFixed(2)}'),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Divider(color: Colors.white10),
              ),
              _buildBillRow('Total Fare', 'KES ${_currentFare.toStringAsFixed(2)}', isTotal: true),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    if (_isTripEnded && widget.rideId != null) {
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                          builder: (_) => RatePassengerScreen(
                            rideId: widget.rideId!,
                            passengerName: widget.passengerName ?? 'Passenger',
                            finalFare: _currentFare,
                          ),
                        ),
                      );
                    } else if (_isTripEnded) {
                      Navigator.of(context).pushReplacementNamed('/home');
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(_isTripEnded ? 'CONFIRM PAYMENT' : 'CLOSE', style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBillRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: isTotal ? Colors.white : AppTheme.darkTextSecondary, fontWeight: isTotal ? FontWeight.bold : FontWeight.normal)),
          Text(value, style: TextStyle(color: isTotal ? AppTheme.primaryColor : Colors.white, fontWeight: FontWeight.bold, fontSize: isTotal ? 18 : 14)),
        ],
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('ON TRIP', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 14)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: Container(
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.5), shape: BoxShape.circle),
          child: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
        ),
      ),
      body: Stack(
        children: [
          Consumer(
            builder: (context, ref, _) {
              final mapType = ref.watch(mapProvider);
              return CabiMap(
                key: ValueKey('trip_map_${mapType.name}'),
                initialCenter: _driverLocation,
                initialZoom: 15.0,
                theme: CabiMapTheme.dark,
                mapSource: mapType == MapType.google
                    ? CabiMapSource.googleMaps
                    : CabiMapSource.cabiAfrica,
                markers: [
                  CabiMapMarker.driver(
                      position: _driverLocation, driverId: 'me', isOnline: true),
                  CabiMapMarker.dropoff(position: _passengerLocation),
                ],
                routePoints: [_driverLocation, _passengerLocation],
                showUserLocation: true,
              );
            },
          ),

          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.darkSurface, 
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.4),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  )
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (widget.isExtendedPickup) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD4AF37).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.4)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.bolt_rounded, color: Color(0xFFD4AF37), size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Extended Pickup (+KES ${(widget.subsidyAmount ?? 60.0).toStringAsFixed(0)} System Subsidy) • Contact passenger to coordinate',
                              style: const TextStyle(
                                color: Color(0xFFD4AF37),
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.phone, color: Color(0xFFD4AF37), size: 16),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Calling passenger...')),
                              );
                            },
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            icon: const Icon(Icons.message, color: Color(0xFFD4AF37), size: 16),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Opening chat with passenger...')),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                  if (widget.tripCode != null) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFD4AF37), width: 1.2),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.qr_code_2_rounded, color: Color(0xFFD4AF37), size: 18),
                              const SizedBox(width: 8),
                              Text(
                                'TRIP CODE: ${widget.tripCode}',
                                style: const TextStyle(
                                  color: Color(0xFFD4AF37),
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.5,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.black45,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'VERIFY PIN',
                              style: TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle),
                        child: const CircleAvatar(
                          radius: 18,
                          backgroundColor: AppTheme.darkBackground,
                          child: Icon(Icons.person, color: AppTheme.primaryColor, size: 18),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'PASSENGER',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  letterSpacing: 1),
                            ),
                            Text(
                              'DESTINATION: WESTLANDS',
                              style: TextStyle(
                                  color: AppTheme.darkTextSecondary, fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          _formatDuration(_durationSeconds),
                          style: const TextStyle(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: Colors.white10, height: 32),

                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'CURRENT FARE',
                        style: TextStyle(color: AppTheme.darkTextSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                      Text(
                        'KES ${_currentFare.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: AppTheme.primaryColor,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _showWaybill,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('WAYBILL', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1, fontSize: 12)),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        flex: 2,
                        child: SwipeableActionButton(
                            label: 'END TRIP',
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
                              AudioNotificationService.instance.play('trip_ended');
                              setState(() => _isTripEnded = true);
                              _showWaybill(); 
                            }),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          if (_showOffer && _allowBackToBack)
            BackToBackOfferWidget(
              onAccept: _handleOfferAccepted,
              onDecline: _handleOfferDeclined,
            ),
        ],
      ),
    );
  }
}

