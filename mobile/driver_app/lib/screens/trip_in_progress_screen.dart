import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:driver_app/providers/map_provider.dart';
import 'package:driver_app/widgets/back_to_back_offer_widget.dart';
import 'package:driver_app/widgets/swipeable_action_button.dart';
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
  final String? serviceCategory; // e.g. 'BODA', 'BASIC', 'STANDARD', 'XL', 'PREMIUM'

  const TripInProgressScreen({
    super.key,
    this.rideId,
    this.driverId,
    this.passengerName,
    this.tripCode,
    this.rideService,
    this.isExtendedPickup = false,
    this.subsidyAmount,
    this.serviceCategory = 'STANDARD',
  });

  @override
  State<TripInProgressScreen> createState() => _TripInProgressScreenState();
}

class _TripInProgressScreenState extends State<TripInProgressScreen> {
  bool _showOffer = false;
  bool _allowBackToBack = true;
  Timer? _tripTimer;

  // Real-time Meter Metrics
  double _distanceKm = 0.0;
  int _durationSeconds = 0;
  double _currentFare = 150.0;
  double _unroundedFare = 150.0;

  // Category Pricing & Rounding Configurations (Dynamically loaded from Admin panel)
  String _category = 'STANDARD';
  String _categoryDisplayName = 'Standard Sedan';
  double _baseFare = 150.0;
  double _perKmRate = 45.0;
  double _perMinuteRate = 5.0;
  double _minimumFare = 150.0;
  int _roundingStep = 50; // nearest 10 for Boda, 25 for Basic, 50 for Standard

  // Stitch Obsidian Navigation State
  bool _isPassengerDetailsExpanded = true;
  bool _voiceNavEnabled = true;
  bool _trafficLayerEnabled = false;

  bool _isTripEnded = false;
  late final RideService _rideService;

  LatLng _driverLocation = const LatLng(-1.286389, 36.817223); 
  final LatLng _passengerLocation = const LatLng(-1.2921, 36.8219); 

  @override
  void initState() {
    super.initState();
    _rideService = widget.rideService ?? RideService();
    _loadBackToBackPreference();
    _loadCategoryPricing();
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

  Future<void> _loadCategoryPricing() async {
    try {
      final categories = await _rideService.getPricingCategories();
      final requestedCat = (widget.serviceCategory ?? 'STANDARD').trim().toUpperCase();

      final match = categories.firstWhere(
        (c) => (c['category'] ?? '').toString().toUpperCase() == requestedCat,
        orElse: () => categories.firstWhere(
          (c) => (c['category'] ?? '').toString().toUpperCase() == 'STANDARD',
          orElse: () => categories.isNotEmpty ? categories.first : {},
        ),
      );

      if (match.isNotEmpty && mounted) {
        setState(() {
          _category = (match['category'] ?? 'STANDARD').toString().toUpperCase();
          _categoryDisplayName = match['displayName'] ?? _category;
          _baseFare = (match['baseFare'] as num?)?.toDouble() ?? 150.0;
          _perKmRate = (match['perKmRate'] as num?)?.toDouble() ?? 45.0;
          _perMinuteRate = (match['perMinuteRate'] as num?)?.toDouble() ?? 5.0;
          _minimumFare = (match['minimumFare'] as num?)?.toDouble() ?? 150.0;
          _roundingStep = (match['roundingStep'] as num?)?.toInt() ?? 50;
          _recalculateFare();
        });
      }
    } catch (e) {
      debugPrint('[Pricing] Error loading category rules: $e');
      _recalculateFare();
    }
  }

  void _recalculateFare() {
    final double distanceCost = _distanceKm * _perKmRate;
    final double timeCost = (_durationSeconds / 60.0) * _perMinuteRate;
    final double rawTotal = _baseFare + distanceCost + timeCost;
    
    // Apply minimum floor
    _unroundedFare = rawTotal < _minimumFare ? _minimumFare : rawTotal;

    // Apply mathematical rounding to nearest configured step
    final int step = _roundingStep > 0 ? _roundingStep : 1;
    _currentFare = (_unroundedFare / step).round() * step.toDouble();
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

          // Every 3 seconds in simulation, driver moves ~60 meters (0.06 km)
          if (_durationSeconds % 3 == 0) {
            _distanceKm += 0.06;
          }

          // Realtime fare update
          _recalculateFare();

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
            color: Color(0xFF141416),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            border: Border(
              top: BorderSide(color: Color(0xFFD4AF37), width: 1.2),
            ),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'ITEMIZED TAXIMETER WAYBILL',
                    style: TextStyle(
                      color: Color(0xFFD4AF37),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      _category,
                      style: const TextStyle(
                        color: Color(0xFFD4AF37),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              _buildBillRow('Service Category', _categoryDisplayName),
              _buildBillRow('Base Pickup Fare', 'KES ${_baseFare.toStringAsFixed(2)}'),
              _buildBillRow(
                'Distance (${_distanceKm.toStringAsFixed(2)} km @ KES ${_perKmRate.toStringAsFixed(0)}/km)',
                'KES ${(_distanceKm * _perKmRate).toStringAsFixed(2)}',
              ),
              _buildBillRow(
                'Trip Time (${_formatDuration(_durationSeconds)} @ KES ${_perMinuteRate.toStringAsFixed(0)}/min)',
                'KES ${((_durationSeconds / 60.0) * _perMinuteRate).toStringAsFixed(2)}',
              ),
              _buildBillRow('Minimum Fare Floor', 'KES ${_minimumFare.toStringAsFixed(2)}'),
              _buildBillRow('Raw Meter Subtotal', 'KES ${_unroundedFare.toStringAsFixed(2)}'),
              _buildBillRow(
                'Admin Rounding Rule',
                'Nearest KES $_roundingStep (${_currentFare >= _unroundedFare ? "+KES " : "-KES "}${(_currentFare - _unroundedFare).abs().toStringAsFixed(2)})',
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 14),
                child: Divider(color: Colors.white10),
              ),
              _buildBillRow(
                'FINAL FARE DUE',
                'KES ${_currentFare.toStringAsFixed(2)}',
                isTotal: true,
              ),
              const SizedBox(height: 28),
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(
                    colors: [Color(0xFFD4AF37), Color(0xFFFFDF00)],
                  ),
                ),
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
                    backgroundColor: Colors.transparent,
                    foregroundColor: Colors.black,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text(
                    _isTripEnded ? 'COLLECT FARE & RATE' : 'CLOSE WAYBILL',
                    style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.5, fontSize: 15),
                  ),
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
      padding: const EdgeInsets.symmetric(vertical: 3.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                color: isTotal ? Colors.white : Colors.white60,
                fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
                fontSize: isTotal ? 14 : 12,
              ),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              color: isTotal ? const Color(0xFFD4AF37) : Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: isTotal ? 18 : 13,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0E0E0F),
      body: Stack(
        children: [
          // ── 1. FULLSCREEN MAP BACKGROUND ──
          Positioned.fill(
            child: Consumer(
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
          ),

          // ── 2. TOP FLOATING NAVIGATION HUD (TURN-BY-TURN & LIVE METER) ──
          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Turn Guidance Bar
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF141416).withValues(alpha: 0.94),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.3)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.6),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          // Turn Direction Icon Box
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: const Color(0xFFD4AF37),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.turn_right_rounded, color: Colors.black, size: 24),
                          ),
                          const SizedBox(width: 12),
                          // Next instruction
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Text(
                                      '350m',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: -0.5,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'TURN RIGHT',
                                      style: TextStyle(
                                        color: const Color(0xFFD4AF37).withValues(alpha: 0.9),
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 0.8,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                const Text(
                                  'Ring Road Kilimani • Heading to Destination',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Speed Indicator & Limit Pill
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.white12),
                                ),
                                child: const Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '48',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w900,
                                        height: 1,
                                      ),
                                    ),
                                    Text(
                                      'KM/H',
                                      style: TextStyle(
                                        color: Colors.white54,
                                        fontSize: 7,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.red.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.redAccent.withValues(alpha: 0.5)),
                                ),
                                child: const Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '50',
                                      style: TextStyle(
                                        color: Colors.redAccent,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w900,
                                        height: 1,
                                      ),
                                    ),
                                    Text(
                                      'LIMIT',
                                      style: TextStyle(
                                        color: Colors.redAccent,
                                        fontSize: 7,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 6),

                    // Live Taximeter Telemetry Pill
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF141416).withValues(alpha: 0.94),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.4),
                            blurRadius: 12,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Live Indicator
                          Row(
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF10B981),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Text(
                                'LIVE METER',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.8,
                                ),
                              ),
                              if (widget.tripCode != null) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: Colors.black54,
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.4)),
                                  ),
                                  child: Text(
                                    widget.tripCode!,
                                    style: const TextStyle(
                                      color: Color(0xFFD4AF37),
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),

                          // Live Telemetry Values
                          Row(
                            children: [
                              Text(
                                '${_distanceKm.toStringAsFixed(2)} km',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              const Text(' • ', style: TextStyle(color: Colors.white30, fontSize: 12)),
                              Text(
                                _formatDuration(_durationSeconds),
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              const Text(' • ', style: TextStyle(color: Colors.white30, fontSize: 12)),
                              Text(
                                'KES ${_currentFare.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  color: Color(0xFFD4AF37),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w900,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── 3. FLOATING MAP CONTROLS (RIGHT EDGE) & ETA CHIP (CENTER) ──
          Positioned(
            right: 16,
            top: 155,
            child: Column(
              children: [
                _buildMapControlBtn(
                  icon: _voiceNavEnabled ? Icons.volume_up_rounded : Icons.volume_off_rounded,
                  isActive: _voiceNavEnabled,
                  onTap: () => setState(() => _voiceNavEnabled = !_voiceNavEnabled),
                ),
                const SizedBox(height: 8),
                _buildMapControlBtn(
                  icon: Icons.traffic_rounded,
                  isActive: _trafficLayerEnabled,
                  onTap: () => setState(() => _trafficLayerEnabled = !_trafficLayerEnabled),
                ),
                const SizedBox(height: 8),
                _buildMapControlBtn(
                  icon: Icons.my_location_rounded,
                  isActive: true,
                  onTap: () {},
                ),
              ],
            ),
          ),

          // Floating ETA Pill
          Positioned(
            left: 0,
            right: 0,
            bottom: _isPassengerDetailsExpanded ? 310 : 185,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                decoration: BoxDecoration(
                  color: const Color(0xFF141416).withValues(alpha: 0.92),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.5),
                      blurRadius: 12,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '~${((8.0 - _distanceKm) / 0.4).clamp(3, 45).round()} min',
                      style: const TextStyle(
                        color: Color(0xFF10B981),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Text(' • ', style: TextStyle(color: Colors.white30, fontSize: 11)),
                    Text(
                      '${(8.0 - _distanceKm).clamp(0.2, 50.0).toStringAsFixed(1)} km',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Text(' • ', style: TextStyle(color: Colors.white30, fontSize: 11)),
                    const Text(
                      'On Optimal Route',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── 4. BOTTOM FLOATING LUXURY SHEET (PASSENGER & SLIDE TO COMPLETE) ──
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              margin: const EdgeInsets.fromLTRB(14, 0, 14, 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF141416).withValues(alpha: 0.96),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.35), width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.8),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Collapse / Expand Pill Handle
                  GestureDetector(
                    onTap: () => setState(() => _isPassengerDetailsExpanded = !_isPassengerDetailsExpanded),
                    behavior: HitTestBehavior.opaque,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Column(
                        children: [
                          Container(
                            width: 36,
                            height: 4,
                            decoration: BoxDecoration(
                              color: Colors.white24,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _isPassengerDetailsExpanded ? 'HIDE DETAILS' : 'SHOW DETAILS',
                                style: const TextStyle(
                                  color: Colors.white38,
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.8,
                                ),
                              ),
                              Icon(
                                _isPassengerDetailsExpanded ? Icons.keyboard_arrow_down_rounded : Icons.keyboard_arrow_up_rounded,
                                color: Colors.white38,
                                size: 14,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Collapsed Mini Header (when hidden)
                  if (!_isPassengerDetailsExpanded) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(2),
                              decoration: const BoxDecoration(color: Color(0xFFD4AF37), shape: BoxShape.circle),
                              child: const CircleAvatar(
                                radius: 14,
                                backgroundColor: Color(0xFF1E1E1E),
                                child: Icon(Icons.person, color: Color(0xFFD4AF37), size: 14),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              widget.passengerName ?? 'Passenger',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'VIP',
                                style: TextStyle(color: Color(0xFFD4AF37), fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        Text(
                          'KES ${_currentFare.toStringAsFixed(0)}',
                          style: const TextStyle(
                            color: Color(0xFFD4AF37),
                            fontWeight: FontWeight.w900,
                            fontSize: 16,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],

                  // Expanded Details Body
                  if (_isPassengerDetailsExpanded) ...[
                    // Passenger Information Header
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(2),
                          decoration: const BoxDecoration(
                            color: Color(0xFFD4AF37),
                            shape: BoxShape.circle,
                          ),
                          child: const CircleAvatar(
                            radius: 18,
                            backgroundColor: Color(0xFF1E1E1E),
                            child: Icon(Icons.person, color: Color(0xFFD4AF37), size: 18),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    widget.passengerName ?? 'PASSENGER',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                      letterSpacing: 0.3,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.3)),
                                    ),
                                    child: const Text(
                                      'VIP',
                                      style: TextStyle(
                                        color: Color(0xFFD4AF37),
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  const Icon(Icons.star_rounded, color: Colors.amber, size: 14),
                                  const SizedBox(width: 3),
                                  const Text(
                                    '4.98',
                                    style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    _categoryDisplayName,
                                    style: const TextStyle(color: Colors.white38, fontSize: 10),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'KES ${_currentFare.toStringAsFixed(0)}',
                              style: const TextStyle(
                                color: Color(0xFFD4AF37),
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                fontFamily: 'monospace',
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                'M-PESA / LOCKED',
                                style: TextStyle(
                                  color: Color(0xFF10B981),
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // Destination Address Box
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.04),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.location_on_rounded, color: Color(0xFF10B981), size: 16),
                          SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'DROP-OFF LOCATION',
                                  style: TextStyle(
                                    color: Colors.white38,
                                    fontSize: 8.5,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                Text(
                                  'Kilimani, Argwings Kodhek Rd',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Extended pickup fuel subsidy notification
                    if (widget.isExtendedPickup) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD4AF37).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.35)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.bolt_rounded, size: 14, color: Color(0xFFD4AF37)),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                '+KES ${(widget.subsidyAmount ?? 60.0).toStringAsFixed(0)} Extended Pickup Fuel Subsidy Active',
                                style: const TextStyle(
                                  color: Color(0xFFD4AF37),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 12),

                    // Quick Action Buttons Row (Call, Text, Share, Safety)
                    Row(
                      children: [
                        _buildQuickActionBtn(
                          icon: Icons.phone_rounded,
                          label: 'Call',
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Calling passenger...')),
                            );
                          },
                        ),
                        const SizedBox(width: 8),
                        _buildQuickActionBtn(
                          icon: Icons.chat_bubble_rounded,
                          label: 'Text',
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Opening live chat with passenger...')),
                            );
                          },
                        ),
                        const SizedBox(width: 8),
                        _buildQuickActionBtn(
                          icon: Icons.share_location_rounded,
                          label: 'Share',
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Trip status shared with emergency contacts!')),
                            );
                          },
                        ),
                        const SizedBox(width: 8),
                        _buildQuickActionBtn(
                          icon: Icons.shield_rounded,
                          label: 'Safety',
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Cabi 24/7 Safety & SOS Toolkit ready.')),
                            );
                          },
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),
                  ],

                  // Actions Row: Waybill & Slide to Complete
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _showWaybill,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white12),
                            backgroundColor: Colors.white.withValues(alpha: 0.04),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: const Text(
                            'WAYBILL',
                            style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.8, fontSize: 11),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 2,
                        child: SwipeableActionButton(
                          label: 'SLIDE TO COMPLETE',
                          color: const Color(0xFFEF4444),
                          icon: Icons.flag_rounded,
                          onAction: () async {
                            if (widget.rideId != null) {
                              try {
                                final finalSettledFare = await _rideService.completeTrip(
                                  widget.rideId!,
                                  distanceKm: _distanceKm,
                                  durationMinutes: _durationSeconds / 60.0,
                                );
                                if (finalSettledFare > 0 && mounted) {
                                  setState(() => _currentFare = finalSettledFare);
                                }
                              } catch (e) {
                                debugPrint('Error completing trip: $e');
                              }
                            }
                            AudioNotificationService.instance.play('trip_ended');
                            if (mounted) {
                              setState(() => _isTripEnded = true);
                              _showWaybill();
                            }
                          },
                        ),
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

  Widget _buildMapControlBtn({required IconData icon, required bool isActive, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: const Color(0xFF141416).withValues(alpha: 0.92),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isActive ? const Color(0xFFD4AF37).withValues(alpha: 0.4) : Colors.white12,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.4),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(
          icon,
          color: isActive ? const Color(0xFFD4AF37) : Colors.white60,
          size: 18,
        ),
      ),
    );
  }

  Widget _buildQuickActionBtn({required IconData icon, required String label, required VoidCallback onTap}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white10),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: Colors.white70, size: 16),
              const SizedBox(height: 3),
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
