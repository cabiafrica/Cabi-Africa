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
import 'package:driver_app/services/trip_communication_service.dart';
import 'package:driver_app/widgets/in_app_call_modal.dart';
import 'package:driver_app/widgets/trip_chat_modal.dart';
import 'rate_passenger_screen.dart';
import '../services/audio_notification_service.dart';
import '../theme/app_theme.dart';

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

enum TripPhase {
  headingToPickup,
  arrivedAtPickup,
  tripActive,
  completed,
}

class _TripInProgressScreenState extends State<TripInProgressScreen> {
  TripPhase _tripPhase = TripPhase.headingToPickup;
  int _waitingSeconds = 0;
  bool _passengerNotified = false;

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
  StreamSubscription<VoipCallState>? _callStateSubscription;

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

    // Init cross-app communication channel
    final tripId = widget.tripCode ?? 'CABI-982';
    final pName = widget.passengerName ?? 'Passenger';
    TripCommunicationService.instance.init(
      tripId: tripId,
      role: MessageRole.driver,
      myName: 'James Mwangi',
      peerName: pName,
      peerVehicle: widget.serviceCategory ?? 'Standard',
    );

    // Auto-show incoming call modal when passenger initiates a call
    _callStateSubscription = TripCommunicationService.instance.callStateStream.listen((state) {
      if (state == VoipCallState.incomingRinging && mounted) {
        InAppCallModal.show(
          context,
          peerName: pName,
          peerRole: 'PASSENGER',
          peerVehicle: widget.serviceCategory ?? 'Standard',
        );
      }
    });
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

  void _onDriverArrived({bool autoDetected = false}) {
    if (_tripPhase != TripPhase.headingToPickup) return;
    setState(() {
      _tripPhase = TripPhase.arrivedAtPickup;
      _passengerNotified = true;
    });
    AudioNotificationService.instance.play('driver_arrived');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.notifications_active_rounded, color: Color(0xFFD4AF37), size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  autoDetected
                      ? 'Arrived at pickup! Passenger automatically notified.'
                      : 'Arrival confirmed! Passenger notified.',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFF1C1B1B),
          duration: const Duration(seconds: 4),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  void _startActiveTrip() async {
    setState(() {
      _tripPhase = TripPhase.tripActive;
    });
    if (widget.rideId != null) {
      try {
        await _rideService.startTrip(widget.rideId!);
      } catch (e) {
        debugPrint('[Trip] startTrip handled: $e');
      }
    }
    AudioNotificationService.instance.play('trip_started');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.play_circle_fill_rounded, color: Color(0xFF10B981), size: 18),
              SizedBox(width: 8),
              Text(
                'Passenger onboard! Taximeter activated.',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ],
          ),
          backgroundColor: const Color(0xFF1C1B1B),
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  Future<void> _startBackendTrip() async {
    // Backend trip is started once the passenger is onboard via _startActiveTrip()
  }

  @override
  void dispose() {
    _tripTimer?.cancel();
    _callStateSubscription?.cancel();
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
          if (_tripPhase == TripPhase.headingToPickup) {
            _durationSeconds++;
            // Auto-trigger arrival after 5 seconds if driver hasn't tapped arrived
            if (_durationSeconds >= 5) {
              _onDriverArrived(autoDetected: true);
            }
          } else if (_tripPhase == TripPhase.arrivedAtPickup) {
            // Arrival wait timer ticks
            _waitingSeconds++;
          } else if (_tripPhase == TripPhase.tripActive) {
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
            color: AppTheme.surfaceContainer,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            border: Border(
              top: BorderSide(color: AppTheme.primaryColor, width: 1.2),
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
                'Round Off',
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
                  borderRadius: BorderRadius.circular(12),
                  gradient: AppTheme.goldGradient,
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
                            tipAmount: 100.0,
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
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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

  // ──────────────────── Passenger Cancellation & Standby Protection ────────────────────

  void _simulatePassengerCancellation() {
    final bool afterArrival = (_tripPhase == TripPhase.arrivedAtPickup);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surfaceContainer,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: const [
            Icon(Icons.person_remove_rounded, color: Color(0xFFEF4444), size: 20),
            SizedBox(width: 8),
            Text(
              'Simulate Rider Cancel',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Text(
          afterArrival
              ? 'Simulate ${widget.passengerName ?? "Sarah Jenkins"} cancelling while captain is waiting at pickup.\n\nSacco Standby Protection Fee (KES 100.00) will be credited to driver wallet from passenger escrow.'
              : 'Simulate ${widget.passengerName ?? "Sarah Jenkins"} cancelling while captain is en route to pickup (within initial grace period).',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Back', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _handlePassengerCancellation();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Simulate Cancel', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _handlePassengerCancellation() async {
    _tripTimer?.cancel();
    final bool afterArrival = (_tripPhase == TripPhase.arrivedAtPickup);
    final double compensation = afterArrival ? 100.0 : 0.0;
    final double driverNet = afterArrival ? 85.0 : 0.0;
    final double saccoWelfare = afterArrival ? 15.0 : 0.0;

    AudioNotificationService.instance.play('passenger_cancelled');

    if (widget.rideId != null) {
      await _rideService.processPassengerCancellation(
        widget.rideId!,
        afterArrival: afterArrival,
        waitSeconds: _waitingSeconds,
      );
    }

    if (!mounted) return;

    if (!afterArrival) {
      // Grace period cancellation
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppTheme.surfaceContainer,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: const [
              Icon(Icons.info_outline_rounded, color: Color(0xFFD4AF37), size: 22),
              SizedBox(width: 8),
              Text('Rider Cancelled', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Text(
            '${widget.passengerName ?? "Sarah Jenkins"} cancelled the ride while en route within the initial grace window.\n\nNo cancellation fee applies.',
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD4AF37),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Return to Radar', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
      return;
    }

    // Driver arrived: Sacco Standby Protection Fee Credited!
    _showCancellationManifestSheet(compensation, driverNet, saccoWelfare);
  }

  void _showCancellationManifestSheet(double compensation, double driverNet, double saccoWelfare) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF141416) : AppTheme.porcelainSurface;
    final cardBg = isDark ? const Color(0xFF1C1B1B) : AppTheme.porcelainSurfaceContainer;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textDim = isDark ? Colors.white54 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.7);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: false,
      isDismissible: false,
      builder: (ctx) {
        return Container(
          decoration: BoxDecoration(
            color: bg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4), width: 1.2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.6),
                blurRadius: 24,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Pull indicator handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Amber / Crimson cancellation banner
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.cancel_rounded, color: Color(0xFFEF4444), size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'RIDER CANCELLED AFTER ARRIVAL',
                          style: TextStyle(
                            color: Color(0xFFEF4444),
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.8,
                          ),
                        ),
                        Text(
                          'Sacco Captain Standby Protection Active',
                          style: TextStyle(color: textDim, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Standby Protection Settlement Hero Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF10B981).withValues(alpha: 0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'STANDBY COMPENSATION',
                              style: TextStyle(
                                color: textDim,
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Credited to M-Pesa Escrow',
                              style: TextStyle(
                                color: AppTheme.successGreen,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          '+KES ${compensation.toStringAsFixed(0)}/-',
                          style: const TextStyle(
                            color: AppTheme.successGreen,
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Divider(color: Colors.white10, height: 1),
                    ),
                    _buildCancellationDetailRow('Captain Standby Net (85%)', 'KES ${driverNet.toStringAsFixed(2)}', AppTheme.successGreen, isDark),
                    const SizedBox(height: 6),
                    _buildCancellationDetailRow('Sacco Welfare & Fuel Pool (15%)', 'KES ${saccoWelfare.toStringAsFixed(2)}', textDim, isDark),
                    const SizedBox(height: 6),
                    _buildCancellationDetailRow('Arrival Wait Elapsed', _formatDuration(_waitingSeconds), const Color(0xFFD4AF37), isDark),
                    const SizedBox(height: 6),
                    _buildCancellationDetailRow('Passenger', widget.passengerName ?? 'Sarah Jenkins', textPrimary, isDark),
                    const SizedBox(height: 6),
                    _buildCancellationDetailRow('Policy Rule', 'Sacco By-Law §14.2 (Arrival Guarantee)', textDim, isDark),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // CTA: Return to Dispatch Radar
              SizedBox(
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
                  },
                  icon: const Icon(Icons.radar_rounded, color: Colors.black, size: 20),
                  label: const Text(
                    'ACCEPT COMPENSATION & RETURN ONLINE',
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.6,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD4AF37),
                    foregroundColor: Colors.black,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCancellationDetailRow(String label, String value, Color valueColor, bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
            fontSize: 11.5,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: valueColor,
            fontSize: 11.5,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze;
    final overlayBg = isDark
        ? const Color(0xFF141416).withValues(alpha: 0.94)
        : AppTheme.porcelainSurface.withValues(alpha: 0.96);
    final sheetBg = isDark
        ? const Color(0xFF141416).withValues(alpha: 0.96)
        : AppTheme.porcelainSurface.withValues(alpha: 0.98);
    final outline = isDark ? Colors.white12 : AppTheme.porcelainOutline;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;
    final textDim = isDark ? Colors.white54 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.7);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0E0E0F) : AppTheme.porcelainCanvas,
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
                        color: overlayBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isDark ? const Color(0xFFD4AF37).withValues(alpha: 0.3) : outline),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: isDark ? 0.6 : 0.08),
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
                              color: _tripPhase == TripPhase.arrivedAtPickup ? AppTheme.successGreen : accent,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              _tripPhase == TripPhase.arrivedAtPickup
                                  ? Icons.pin_drop_rounded
                                  : (_tripPhase == TripPhase.headingToPickup
                                      ? Icons.near_me_rounded
                                      : Icons.turn_right_rounded),
                              color: isDark ? Colors.black : Colors.white,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          // Next instruction
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      _tripPhase == TripPhase.arrivedAtPickup
                                          ? 'AT PICKUP'
                                          : (_tripPhase == TripPhase.headingToPickup ? '150m' : '350m'),
                                      style: TextStyle(
                                        color: textPrimary,
                                        fontSize: 15,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: -0.5,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      _tripPhase == TripPhase.arrivedAtPickup
                                          ? 'WAITING'
                                          : (_tripPhase == TripPhase.headingToPickup
                                              ? 'PICKUP EN ROUTE'
                                              : 'TURN RIGHT'),
                                      style: TextStyle(
                                        color: _tripPhase == TripPhase.arrivedAtPickup ? AppTheme.successGreen : accent,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 0.8,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  _tripPhase == TripPhase.arrivedAtPickup
                                      ? 'Passenger Notified • Wait: ${_formatDuration(_waitingSeconds)}'
                                      : (_tripPhase == TripPhase.headingToPickup
                                          ? 'Westlands Commercial Centre • ${widget.passengerName ?? "Sarah Jenkins"}'
                                          : 'Ring Road Kilimani • Heading to Destination'),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: textSecondary,
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
                                  color: isDark ? Colors.white.withValues(alpha: 0.08) : AppTheme.porcelainSurfaceContainer,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: outline),
                                ),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '48',
                                      style: TextStyle(
                                        color: textPrimary,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w900,
                                        height: 1,
                                      ),
                                    ),
                                    Text(
                                      'KM/H',
                                      style: TextStyle(
                                        color: textDim,
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
                        color: overlayBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: outline),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.06),
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
                              Text(
                                'LIVE METER',
                                style: TextStyle(
                                  color: textSecondary,
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
                                    color: isDark ? Colors.black54 : AppTheme.porcelainSurfaceHigh,
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(color: accent.withValues(alpha: 0.4)),
                                  ),
                                  child: Text(
                                    widget.tripCode!,
                                    style: TextStyle(
                                      color: accent,
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
                                style: TextStyle(
                                  color: textPrimary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              Text(' • ', style: TextStyle(color: isDark ? Colors.white30 : AppTheme.porcelainOutline, fontSize: 12)),
                              Text(
                                _formatDuration(_durationSeconds),
                                style: TextStyle(
                                  color: textSecondary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              Text(' • ', style: TextStyle(color: isDark ? Colors.white30 : AppTheme.porcelainOutline, fontSize: 12)),
                              Text(
                                'KES ${_currentFare.toStringAsFixed(0)}',
                                style: TextStyle(
                                  color: accent,
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
                const SizedBox(height: 8),
                _buildMapControlBtn(
                  icon: Icons.person_remove_rounded,
                  isActive: false,
                  onTap: _simulatePassengerCancellation,
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
                  color: overlayBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: outline),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.08),
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
                    Text(' • ', style: TextStyle(color: isDark ? Colors.white30 : AppTheme.porcelainOutline, fontSize: 11)),
                    Text(
                      '${(8.0 - _distanceKm).clamp(0.2, 50.0).toStringAsFixed(1)} km',
                      style: TextStyle(
                        color: textPrimary,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(' • ', style: TextStyle(color: isDark ? Colors.white30 : AppTheme.porcelainOutline, fontSize: 11)),
                    Text(
                      'On Optimal Route',
                      style: TextStyle(
                        color: textDim,
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
                color: sheetBg,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: isDark ? const Color(0xFFD4AF37).withValues(alpha: 0.35) : outline, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.8 : 0.1),
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
                              style: TextStyle(color: textPrimary, fontWeight: FontWeight.bold, fontSize: 14),
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
                        color: isDark ? Colors.white.withValues(alpha: 0.04) : AppTheme.porcelainSurfaceContainer,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: outline),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _tripPhase == TripPhase.tripActive
                                ? Icons.location_on_rounded
                                : Icons.near_me_rounded,
                            color: const Color(0xFF10B981),
                            size: 16,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _tripPhase == TripPhase.tripActive
                                      ? 'DROP-OFF LOCATION'
                                      : 'PICKUP LOCATION',
                                  style: TextStyle(
                                    color: textDim,
                                    fontSize: 8.5,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                Text(
                                  _tripPhase == TripPhase.tripActive
                                      ? 'Kilimani, Argwings Kodhek Rd'
                                      : 'Westlands Commercial Centre, Ring Rd',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: textPrimary,
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

                    if (_tripPhase == TripPhase.arrivedAtPickup) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.35)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.timer_outlined, size: 16, color: Color(0xFF10B981)),
                                const SizedBox(width: 8),
                                Text(
                                  _passengerNotified
                                      ? 'Passenger Notified • Waiting at Pickup'
                                      : 'Waiting at Pickup',
                                  style: TextStyle(
                                    color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              _formatDuration(_waitingSeconds),
                              style: const TextStyle(
                                color: Color(0xFF10B981),
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

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
                            final pName = widget.passengerName ?? 'Passenger';
                            TripCommunicationService.instance.startCall();
                            InAppCallModal.show(
                              context,
                              peerName: pName,
                              peerRole: 'PASSENGER',
                              peerVehicle: widget.serviceCategory ?? 'Standard',
                            );
                          },
                        ),
                        const SizedBox(width: 8),
                        _buildQuickActionBtn(
                          icon: Icons.chat_bubble_rounded,
                          label: 'Text',
                          onTap: () {
                            final pName = widget.passengerName ?? 'Passenger';
                            TripChatModal.show(
                              context,
                              peerName: pName,
                              peerRole: 'PASSENGER',
                              peerVehicle: widget.serviceCategory ?? 'Standard',
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

                  // Actions Row: Waybill & Dynamic Action Button
                  SizedBox(
                    height: 48,
                    child: Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 48,
                            child: OutlinedButton(
                              onPressed: _showWaybill,
                              style: OutlinedButton.styleFrom(
                                foregroundColor: textPrimary,
                                side: BorderSide(color: outline),
                                backgroundColor: isDark ? Colors.white.withValues(alpha: 0.04) : AppTheme.porcelainSurfaceHigh,
                                padding: EdgeInsets.zero,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: const Text(
                                'WAYBILL',
                                style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.8, fontSize: 11),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        if (_tripPhase == TripPhase.headingToPickup)
                          Expanded(
                            flex: 2,
                            child: SizedBox(
                              height: 48,
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFFD4AF37), Color(0xFFFFDF00)],
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFFD4AF37).withValues(alpha: 0.35),
                                      blurRadius: 10,
                                      offset: const Offset(0, 3),
                                    ),
                                  ],
                                ),
                                child: ElevatedButton.icon(
                                  onPressed: () => _onDriverArrived(autoDetected: false),
                                  icon: const Icon(Icons.pin_drop_rounded, color: Colors.black, size: 18),
                                  label: const Text(
                                    'ARRIVED AT PICKUP',
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 12,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.transparent,
                                    shadowColor: Colors.transparent,
                                    padding: EdgeInsets.zero,
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          )
                        else if (_tripPhase == TripPhase.arrivedAtPickup)
                          Expanded(
                            flex: 2,
                            child: SizedBox(
                              height: 48,
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFF10B981), Color(0xFF059669)],
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF10B981).withValues(alpha: 0.35),
                                      blurRadius: 10,
                                      offset: const Offset(0, 3),
                                    ),
                                  ],
                                ),
                                child: ElevatedButton.icon(
                                  onPressed: _startActiveTrip,
                                  icon: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 20),
                                  label: const Text(
                                    'START TRIP',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 13,
                                      letterSpacing: 0.6,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.transparent,
                                    shadowColor: Colors.transparent,
                                    padding: EdgeInsets.zero,
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          )
                        else
                          Expanded(
                            flex: 2,
                            child: SizedBox(
                              height: 48,
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
                                    setState(() {
                                      _isTripEnded = true;
                                      _tripPhase = TripPhase.completed;
                                    });
                                    _showWaybill();
                                  }
                                },
                              ),
                            ),
                          ),
                      ],
                    ),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze;
    final btnBg = isDark ? const Color(0xFF141416).withValues(alpha: 0.92) : AppTheme.porcelainSurface;
    final outline = isDark ? Colors.white12 : AppTheme.porcelainOutline;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: btnBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isActive ? accent.withValues(alpha: 0.4) : outline,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.08),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(
          icon,
          color: isActive ? accent : (isDark ? Colors.white60 : AppTheme.porcelainTextSecondary),
          size: 18,
        ),
      ),
    );
  }

  Widget _buildQuickActionBtn({required IconData icon, required String label, required VoidCallback onTap}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final btnBg = isDark ? Colors.white.withValues(alpha: 0.05) : AppTheme.porcelainSurfaceContainer;
    final outline = isDark ? Colors.white10 : AppTheme.porcelainOutline;
    final textSecondary = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;

    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: btnBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: outline),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: textSecondary, size: 16),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  color: textSecondary,
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
