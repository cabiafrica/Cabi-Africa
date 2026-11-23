import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'package:driver_app/theme/app_theme.dart';
import '../providers/ride_request_provider.dart';
import '../widgets/ride_request_modal.dart';
import '../providers/auth_provider.dart';
import '../providers/map_provider.dart';
import '../providers/theme_provider.dart';
import '../widgets/face_verification_modal.dart';
import '../widgets/swipeable_online_button.dart';
import '../widgets/sos_button.dart';
import '../providers/providers.dart';
import '../services/audio_notification_service.dart';
import '../services/floating_bubble_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'profile_screen.dart';
import 'settings_screen.dart';
import 'document_submission_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with WidgetsBindingObserver {
  bool _isOnline = false;
  bool _isLoading = false;
  bool _isFaceVerified = false;
  bool _isVerificationInProgress = false;
  double _tripRadiusKm = 5.0; // Max radius 5.0 km
  bool _isRadiusSliderOpen = false; // Collapsible radius slider
  bool _allowBackToBack = true; // Back-to-back trip requests toggle
  LatLng _driverLocation =
      const LatLng(-1.286389, 36.817223); // Nairobi default
  CabiMapController? _mapController;
  StreamSubscription<Position>? _locationSubscription;
  Timer? _ridePollingTimer;

  // ──────────────────── Favourite Places ────────────────────
  // Each entry: {'label': ..., 'address': ..., 'lat': ..., 'lng': ..., 'icon': ...}
  List<Map<String, dynamic>> _favouritePlaces = [];
  static const String _kFavPlacesKey = 'cabi_driver_fav_places';

  // ──────────────────── Floating HUD Overlay ────────────────────
  OverlayEntry? _hudOverlay;
  // Draggable position (right edge, vertical fraction)

  void showAutoOfflineNotice() {
    if (!mounted) return;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF1E1B15) : AppTheme.porcelainSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: isDark ? AppTheme.primaryColor : AppTheme.porcelainOutline, width: 0.8),
        ),
        title: Row(
          children: [
            const Icon(Icons.pause_circle_outline_rounded, color: Colors.orange, size: 28),
            const SizedBox(width: 10),
            Text(
              'Switched Offline',
              style: GoogleFonts.inter(color: isDark ? Colors.white : AppTheme.porcelainTextPrimary, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Text(
          'You were automatically set offline after missing 3 consecutive qualifying trip requests in your pickup zone.\n\nNon-qualifying trips (outside radius or unaligned destinations) did not count against your record.\n\nSwipe online whenever you are ready to receive passenger trips.',
          style: GoogleFonts.inter(color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary, fontSize: 13, height: 1.4),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
              foregroundColor: isDark ? Colors.black : Colors.white,
            ),
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text('Understood', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  bool _isFullScreenMap = false;
  bool _showDemandHotspots = true;
  List<Map<String, dynamic>> _demandHotspots = [];
  Timer? _hotspotsRefreshTimer;

  // Driver Route Preferences (Destination Mode & Excluded Zones)
  String? _preferredDestinationName;
  LatLng? _preferredDestinationLatLng;
  bool _isDestinationModeActive = false;
  final Set<String> _excludedZones = {};

  void _updateState(VoidCallback fn) {
    if (mounted) setState(fn);
  }

  double _calculateZoomForRadius(double radiusKm) {
    final clamped = radiusKm.clamp(1.0, 5.0);
    // Nairobi Web Mercator calculation for ~320px screen diameter:
    return 14.612 - (math.log(clamped) / math.ln2);
  }

  void _onRadiusChanged(double val) {
    setState(() {
      _tripRadiusKm = val;
    });
    _mapController?.animateCamera(
      _driverLocation,
      zoom: _calculateZoomForRadius(val),
    );
  }

  Future<void> _fetchDemandHotspots() async {
    try {
      final rideService = ref.read(rideServiceProvider);
      final hotspots = await rideService.getDemandHotspots();
      if (mounted && hotspots.isNotEmpty) {
        setState(() {
          _demandHotspots = hotspots;
        });
      }
    } catch (e) {
      debugPrint('[HOTSPOTS] Error fetching demand hotspots: $e');
    }
  }

  Future<void> _saveDriverPreferences() async {
    final authState = ref.read(authProvider);
    if (authState is! Authenticated) return;
    final driverProfile = authState.user?['driverProfile'];
    final driverId = driverProfile?['id'] ?? authState.userId;
    if (driverId == null) return;

    final rideService = ref.read(rideServiceProvider);
    Map<String, dynamic>? prefDest;
    if (_isDestinationModeActive && _preferredDestinationLatLng != null) {
      prefDest = {
        'name': _preferredDestinationName ?? 'Custom Destination',
        'lat': _preferredDestinationLatLng!.latitude,
        'lng': _preferredDestinationLatLng!.longitude,
        'active': true,
      };
    } else {
      prefDest = {'active': false};
    }

    final zonesList = _excludedZones
        .map((z) => {
              'name': z,
              'active': true,
            })
        .toList();

    final success = await rideService.updateDriverPreferences(
      driverId,
      preferredDestination: prefDest,
      excludedZones: zonesList,
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 2),
          content: Text(success
              ? 'Driver route preferences synced with dispatch!'
              : 'Failed to update preferences on dispatch server.'),
        ),
      );
    }
  }

  void _updateDriverLocationOnServer(LatLng loc) {
    if (!_isOnline) return;
    final authState = ref.read(authProvider);
    if (authState is! Authenticated) return;
    final driverProfile = authState.user?['driverProfile'];
    if (driverProfile == null) return;
    final driverId = driverProfile['id'];
    if (driverId == null) return;
    final rideService = ref.read(rideServiceProvider);
    rideService.updateDriverLocation(driverId, loc.latitude, loc.longitude);
  }

  void _startRidePolling() {
    _ridePollingTimer?.cancel();
    debugPrint('[DRIVER_POLL] Starting ride polling every 3 seconds...');
    _updateDriverLocationOnServer(_driverLocation);
    _ridePollingTimer = Timer.periodic(const Duration(seconds: 3), (_) async {
      if (!_isOnline || !mounted) return;
      final authState = ref.read(authProvider);
      if (authState is! Authenticated) return;
      final driverProfile = authState.user?['driverProfile'];
      if (driverProfile == null) return;
      final driverId = driverProfile['id'];
      
      // Keep backend location current so matching engine finds this driver
      _updateDriverLocationOnServer(_driverLocation);

      final rideReqProvider = legacy_provider.Provider.of<RideRequestProvider>(context, listen: false);
      if (rideReqProvider.currentRideRequest != null) return;

      final rideService = ref.read(rideServiceProvider);
      try {
        final currentRide = await rideService.getCurrentRide(driverId, 'DRIVER');
        if (currentRide != null && mounted) {
          final status = currentRide['status'];
          if (status == 'DRIVER_ASSIGNED' || status == 'REQUESTED') {
            if (rideReqProvider.currentRideRequest == null) {
              debugPrint('[DRIVER_POLL] Incoming ride detected: ${currentRide['id']} (status: $status)');
              final pickup = currentRide['pickupLocation'];
              final dropoff = currentRide['dropoffLocation'];
              final passenger = currentRide['passenger'];

              final formattedRequest = {
                'rideId': currentRide['id'],
                'tripCode': currentRide['tripCode'] ?? 'CB-XXXX',
                'pickupAddress': (pickup is Map && pickup['address'] != null)
                    ? pickup['address']
                    : (currentRide['pickupAddress'] ?? 'Kenyatta Ave, Nairobi'),
                'dropoffAddress': (dropoff is Map && dropoff['address'] != null)
                    ? dropoff['address']
                    : (currentRide['dropoffAddress'] ?? 'Westlands, Nairobi'),
                'distanceToPickup': '1.5 km',
                'fare': currentRide['fare']?.toString() ?? '350',
                'passengerRating': passenger?['averageRating']?.toString() ?? '5.0',
                'isVerifiedPassenger': passenger?['isVerifiedPassenger'] ?? true,
                'passengerName': passenger?['fullName'] ?? 'Guest Passenger',
              };
              AudioNotificationService.instance.play('driver_request_incoming');
              // Launch driver app into foreground when incoming ride arrives
              FloatingBubbleService.instance.bringToForeground();
              rideReqProvider.setRideRequest(
                formattedRequest,
                onTimeout: () {
                  debugPrint('[DRIVER_POLL] 20 seconds expired without response. Auto-passing ride ${currentRide['id']} to next driver...');
                  AudioNotificationService.instance.play('trip_passed');
                  rideService.passRide(currentRide['id'], driverId, 'Timeout - 20s expired');
                },
              );
            }
          }
        }
      } catch (e) {
        debugPrint('[DRIVER_POLL] Polling error: $e');
      }
    });
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = ref.read(authProvider);
      if (authState is! Authenticated) {
        if (mounted) {
          Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
        }
        return;
      }
      final driverProfile = authState.user?['driverProfile'];
      if (driverProfile == null) {
        if (mounted) {
          Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
        }
        return;
      }

      if (mounted) {
        setState(() {
          if (driverProfile['isOnline'] == true) {
            _isOnline = true;
            _updateDriverLocationOnServer(_driverLocation);
            _startRidePolling();
          }
          if (driverProfile['isBiometricVerified'] == true) {
            _isFaceVerified = true;
          }
        });
      }
      _initLocation();
      _loadBackToBackPreference();
      _loadFavouritePlaces();
      _fetchDemandHotspots();
      _hotspotsRefreshTimer = Timer.periodic(
        const Duration(seconds: 30),
        (_) => _fetchDemandHotspots(),
      );
      // Ensure native floating bubble is hidden while driver app is in foreground
      FloatingBubbleService.instance.hideBubble();
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      // Driver app launched / in foreground -> do not show floating icon
      FloatingBubbleService.instance.hideBubble();
    } else if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      // Driver app minimized / driver using other apps -> show floating bubble if online
      if (_isOnline) {
        FloatingBubbleService.instance.showBubble();
      } else {
        FloatingBubbleService.instance.hideBubble();
      }
    }
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
      debugPrint('[B2B] Error loading back-to-back preference: $e');
    }
  }

  Future<void> _toggleBackToBack() async {
    final nextState = !_allowBackToBack;
    setState(() {
      _allowBackToBack = nextState;
    });
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('cabi_driver_back_to_back', nextState);
    } catch (e) {
      debugPrint('[B2B] Error saving back-to-back preference: $e');
    }
    if (mounted) {
      final isDark = Theme.of(context).brightness == Brightness.dark;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 3),
          backgroundColor: isDark ? const Color(0xFF1E1E1E) : AppTheme.porcelainSurfaceHigh,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
            side: BorderSide(color: isDark ? Colors.transparent : AppTheme.porcelainOutline, width: 0.8),
          ),
          content: Row(
            children: [
              Icon(
                nextState ? Icons.check_circle : Icons.pause_circle_outline,
                color: nextState ? const Color(0xFF10B981) : Colors.orangeAccent,
                size: 20,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  nextState
                      ? 'Back-to-Back Requests ON: You can receive incoming trips before completing current ride'
                      : 'Back-to-Back Requests OFF: No incoming trip offers until you finish your ride',
                  style: TextStyle(color: isDark ? Colors.white : AppTheme.porcelainTextPrimary, fontSize: 13),
                ),
              ),
            ],
          ),
        ),
      );
    }
  }

  Future<void> _initLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    try {
      final pos = await Geolocator.getCurrentPosition();
      if (mounted) {
        setState(() {
          _driverLocation = LatLng(pos.latitude, pos.longitude);
        });
        if (_isOnline) {
          _updateDriverLocationOnServer(_driverLocation);
        }
        // Offset slightly so driver vehicle marker sits in upper open area above selection sheet
        final cameraFocus = LatLng(_driverLocation.latitude - 0.006, _driverLocation.longitude);
        _mapController?.animateCamera(cameraFocus, zoom: 15.0);
      }
    } catch (_) {}

    _locationSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    ).listen((pos) {
      if (mounted) {
        final newLoc = LatLng(pos.latitude, pos.longitude);
        setState(() {
          _driverLocation = newLoc;
        });
        if (_isOnline) {
          _updateDriverLocationOnServer(newLoc);
          _mapController?.moveCamera(
            _driverLocation,
            zoom: _mapController?.zoom ?? _calculateZoomForRadius(_tripRadiusKm),
          );
        }
      }
    });
  }

  Future<void> _toggleOnline() async {
    final authState = ref.read(authProvider);
    if (authState is! Authenticated) {
      if (mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
      }
      return;
    }
    
    var driverProfile = authState.user?['driverProfile'];
    if (driverProfile == null) {
      setState(() => _isLoading = true);
      final authService = ref.read(authServiceProvider);
      final res = await authService.getMe(authState.token);
      if (!mounted) return;
      setState(() => _isLoading = false);
      if (res.user != null) {
        ref.read(authProvider.notifier).updateUser(res.user!);
        driverProfile = res.user!['driverProfile'];
      }
    }

    if (driverProfile == null) {
      if (!mounted) return;
      Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
      return;
    }
    final driverId = (driverProfile['id'] ?? authState.user?['id'])?.toString() ?? '';

    final status = (driverProfile['status'] ?? authState.user?['status'])?.toString().toUpperCase();
    if (!_isOnline && (status == 'PENDING' || status == 'PENDING_APPROVAL')) {
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: const Color(0xFF1C1B1B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(
              children: [
                Icon(Icons.hourglass_top_rounded, color: Color(0xFFD4AF37), size: 24),
                SizedBox(width: 10),
                Text('Verification Pending', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            content: const Text(
              'Your PSV license and verification documents are currently being audited by the Cabi operations team. You cannot go online until your credentials have been verified.',
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('DISMISS', style: TextStyle(color: Colors.white38)),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const DocumentSubmissionScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD4AF37),
                  foregroundColor: Colors.black,
                ),
                child: const Text('REVIEW DOCUMENTS', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      }
      return;
    }
    
    final rideService = ref.read(rideServiceProvider);

    if (!_isOnline) {
      if (kIsWeb || !kReleaseMode) {
        _isFaceVerified = true;
      }
      if (!_isFaceVerified) {
        setState(() => _isVerificationInProgress = true);
        await _showFaceVerificationModal();
        if (!_isFaceVerified) {
          setState(() => _isVerificationInProgress = false);
          return; 
        }
        setState(() => _isVerificationInProgress = false);
      }
    }

    setState(() => _isLoading = true);
    
    try {
      final success = await rideService.toggleOnlineStatus(driverId, !_isOnline);
      if (!success) {
        if (mounted) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to update online status on dispatch server.'),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
        return;
      }

      if (mounted) {
        setState(() {
          _isOnline = !_isOnline;
          _isLoading = false;
        });
        if (_isOnline) {
          AudioNotificationService.instance.play('driver_online');
          _updateDriverLocationOnServer(_driverLocation);
          _mapController?.animateCamera(
            _driverLocation,
            zoom: _calculateZoomForRadius(_tripRadiusKm),
          );
          _startRidePolling();
          FloatingBubbleService.instance.checkPermission().then((granted) {
            if (!granted) {
              FloatingBubbleService.instance.requestPermission();
            }
          });
        } else {
          AudioNotificationService.instance.play('driver_offline');
          _ridePollingTimer?.cancel();
          FloatingBubbleService.instance.hideBubble();
        }
        _refreshHud(); // keep HUD in sync
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to toggle status: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  void _triggerSimulatedRideRequest() {
    AudioNotificationService.instance.play('ride_request');
    setState(() {
      _isOnline = true;
    });

    final mockRequest = {
      'rideId': 'sim-trip-${DateTime.now().millisecondsSinceEpoch}',
      'tripCode': 'CABI-982',
      'passengerName': 'Sarah Jenkins',
      'pickupAddress': 'Westlands Commercial Centre, Nairobi',
      'destination': 'KICC, Harambee Avenue, Nairobi',
      'dropoffAddress': 'KICC, Harambee Avenue, Nairobi',
      'fare': 350.0,
      'amount': 350.0,
      'estimatedFare': 350.0,
      'distanceKm': 4.2,
      'vehicleType': 'EXECUTIVE',
      'serviceCategory': 'EXECUTIVE',
      'paymentMethod': 'CASH',
      'isExtendedPickup': false,
      'passenger': {
        'fullName': 'Sarah Jenkins',
        'nickname': 'Sarah',
        'rating': 4.95,
        'passportPhotoUrl': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      },
    };

    FloatingBubbleService.instance.bringToForeground();
    legacy_provider.Provider.of<RideRequestProvider>(context, listen: false)
        .setRideRequest(mockRequest);
  }

  Future<void> _showFaceVerificationModal() async {
    final authState = ref.read(authProvider);
    final driverId = (authState is Authenticated) ? authState.userId : 'unknown';
    final authService = ref.read(authServiceProvider);

    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return FaceVerificationModal(
          userId: driverId ?? 'unknown',
          authService: authService,
          onVerified: () {
            setState(() {
              _isFaceVerified = true;
            });
          },
        );
      },
    );
  }

  Map<String, dynamic> _getServiceDetails(String? rawType) {
    final type = (rawType ?? 'STANDARD').toUpperCase();
    switch (type) {
      case 'PREMIUM':
        return {
          'badge': 'CABI COMFORT',
          'name': 'Cabi Comfort',
          'category': 'Executive Air-Conditioned',
          'capacity': '4 Passengers',
          'subtitle': 'Executive Air-Conditioned Rides',
          'baseFare': 'KES 250',
          'perKm': 'KES 45/km',
          'icon': Icons.stars_rounded,
        };
      case 'XL':
        return {
          'badge': 'CABI XL',
          'name': 'Cabi XL',
          'category': '6-Seater Van / High Capacity',
          'capacity': '6 Passengers',
          'subtitle': 'Spacious Vans & Extra Luggage',
          'baseFare': 'KES 350',
          'perKm': 'KES 60/km',
          'icon': Icons.airport_shuttle_rounded,
        };
      case 'BODA':
        return {
          'badge': 'CABI BODA',
          'name': 'Cabi Boda',
          'category': 'Motorcycle Ride & Courier',
          'capacity': '1 Passenger',
          'subtitle': 'Quick Motorcycle Commutes & Express Delivery',
          'baseFare': 'KES 80',
          'perKm': 'KES 25/km',
          'icon': Icons.two_wheeler_rounded,
        };
      case 'STANDARD':
      default:
        return {
          'badge': 'CABI STANDARD',
          'name': 'Cabi Ride (Standard)',
          'category': 'Standard Passenger Mobility',
          'capacity': '4 Passengers',
          'subtitle': 'Affordable Everyday City Rides',
          'baseFare': 'KES 180',
          'perKm': 'KES 35/km',
          'icon': Icons.directions_car_rounded,
        };
    }
  }

  // ──────────────────── Favourite Places Persistence ────────────────────
  Future<void> _loadFavouritePlaces() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_kFavPlacesKey);
      if (raw != null && mounted) {
        final List<dynamic> decoded = jsonDecode(raw) as List<dynamic>;
        setState(() {
          _favouritePlaces = decoded
              .map((e) => Map<String, dynamic>.from(e as Map))
              .toList();
        });
      }
    } catch (e) {
      debugPrint('[FAV_PLACES] Load error: $e');
    }
  }

  Future<void> _saveFavouritePlaces() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kFavPlacesKey, jsonEncode(_favouritePlaces));
    } catch (e) {
      debugPrint('[FAV_PLACES] Save error: $e');
    }
  }

  void _showAddFavouriteDialog({Map<String, dynamic>? existing, int? index}) {
    final labelCtrl = TextEditingController(text: existing?['label'] ?? '');
    final addrCtrl = TextEditingController(text: existing?['address'] ?? '');
    String selectedIcon = existing?['icon'] ?? 'home';

    final iconOptions = [
      ('home', Icons.home_outlined, 'Home'),
      ('work', Icons.work_outline, 'Work'),
      ('school', Icons.school_outlined, 'School'),
      ('hospital', Icons.local_hospital_outlined, 'Hospital'),
      ('market', Icons.shopping_cart_outlined, 'Market'),
      ('other', Icons.location_on_outlined, 'Other'),
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return StatefulBuilder(
          builder: (ctx, setModal) => Container(
            padding: EdgeInsets.only(
              left: 20, right: 20, top: 20,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 28,
            ),
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              border: Border.all(color: isDark ? Colors.transparent : AppTheme.porcelainOutline, width: 0.8),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 38, height: 4,
                    margin: const EdgeInsets.only(bottom: 14),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white24 : AppTheme.porcelainOutline,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                Text(
                  existing == null ? 'Add Favourite Place' : 'Edit Favourite Place',
                  style: GoogleFonts.inter(
                    fontSize: 18, fontWeight: FontWeight.bold,
                    color: Theme.of(context).textTheme.titleLarge?.color,
                  ),
                ),
                const SizedBox(height: 16),
                // Icon picker
                Wrap(
                  spacing: 10,
                  children: iconOptions.map((opt) {
                    final (key, icon, _) = opt;
                    final isSel = selectedIcon == key;
                    return GestureDetector(
                      onTap: () => setModal(() => selectedIcon = key),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isSel
                              ? (isDark ? AppTheme.primaryColor.withValues(alpha: 0.15) : AppTheme.aurumBronze.withValues(alpha: 0.15))
                              : (isDark ? Colors.white.withValues(alpha: 0.06) : AppTheme.porcelainSurfaceContainer),
                          shape: BoxShape.circle,
                          border: isSel
                              ? Border.all(color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, width: 2)
                              : Border.all(color: isDark ? Colors.transparent : AppTheme.porcelainOutline, width: 1),
                        ),
                        child: Icon(icon,
                            color: isSel
                                ? (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze)
                                : (isDark ? Colors.white54 : AppTheme.porcelainTextSecondary),
                            size: 22),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: labelCtrl,
                  decoration: InputDecoration(
                    labelText: 'Place Name (e.g. Home)',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: addrCtrl,
                  decoration: InputDecoration(
                    labelText: 'Address',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                      foregroundColor: isDark ? Colors.black : Colors.white,
                      minimumSize: const Size.fromHeight(48),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  onPressed: () {
                    final label = labelCtrl.text.trim();
                    final addr = addrCtrl.text.trim();
                    if (label.isEmpty || addr.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please fill in all fields.')),
                      );
                      return;
                    }
                    final entry = {
                      'label': label,
                      'address': addr,
                      'icon': selectedIcon,
                    };
                    setState(() {
                      if (index != null) {
                        _favouritePlaces[index] = entry;
                      } else {
                        _favouritePlaces.add(entry);
                      }
                    });
                    _saveFavouritePlaces();
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('"$label" saved to favourites.')),
                    );
                  },
                  child: Text(existing == null ? 'Save Place' : 'Update Place'),
                ),
              ),
            ],
          ),
        ),
        );
      },
    );
  }

  void _deleteFavouritePlace(int index) {
    final label = _favouritePlaces[index]['label'];
    setState(() => _favouritePlaces.removeAt(index));
    _saveFavouritePlaces();
    if (mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('"$label" removed.')));
    }
  }

  IconData _iconDataForKey(String key) {
    switch (key) {
      case 'work': return Icons.work_outline;
      case 'school': return Icons.school_outlined;
      case 'hospital': return Icons.local_hospital_outlined;
      case 'market': return Icons.shopping_cart_outlined;
      case 'home': return Icons.home_outlined;
      default: return Icons.location_on_outlined;
    }
  }

  // ──────────────────── Floating HUD Overlay ────────────────────

  void _refreshHud() {
    // Kept for backward compatibility
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    FloatingBubbleService.instance.hideBubble();
    _hudOverlay?.remove();
    _hudOverlay = null;
    _hotspotsRefreshTimer?.cancel();
    _ridePollingTimer?.cancel();
    _locationSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final mapType = ref.watch(mapProvider);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          CabiMap(
            key: ValueKey('cabi_driver_map_${mapType.name}'),
            initialCenter: _driverLocation,
            initialZoom: _calculateZoomForRadius(_tripRadiusKm),
            theme: isDark ? CabiMapTheme.dark : CabiMapTheme.light,
            mapSource: mapType == MapType.google
                ? CabiMapSource.googleMaps
                : CabiMapSource.cabiAfrica,
            markers: [
              CabiMapMarker.driver(
                position: _driverLocation,
                driverId: 'me',
                isOnline: _isOnline,
                showRadar: _isOnline,
                radiusKm: _tripRadiusKm,
              ),
              if (_isDestinationModeActive && _preferredDestinationLatLng != null)
                CabiMapMarker.dropoff(
                  position: _preferredDestinationLatLng!,
                ),
              if (_showDemandHotspots)
                ..._demandHotspots.map((h) {
                  final lat = (h['lat'] as num?)?.toDouble() ?? 0.0;
                  final lng = (h['lng'] as num?)?.toDouble() ?? 0.0;
                  return CabiMapMarker.hotspot(
                    position: LatLng(lat, lng),
                    name: h['name'] ?? 'Hotspot',
                    multiplier: (h['baseMultiplier'] as num?)?.toDouble() ?? 1.2,
                    activeRequests: (h['activeRequests'] as num?)?.toInt() ?? 10,
                    onTap: () => _showHotspotDetails(context, h),
                  );
                }),
            ],
            showUserLocation: true,
            onMapCreated: (c) {
              _mapController = c;
              _mapController?.moveCamera(
                _driverLocation,
                zoom: _calculateZoomForRadius(_tripRadiusKm),
              );
            },
          ),

          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            left: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: (isDark ? AppTheme.surfaceContainer : Colors.white).withValues(alpha: 0.94),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? AppTheme.primaryColor.withValues(alpha: 0.35) : AppTheme.porcelainOutline,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _isOnline ? const Color(0xFF10B981) : const Color(0xFF9E9E9E),
                      shape: BoxShape.circle,
                      boxShadow: _isOnline
                          ? [
                              BoxShadow(
                                color: const Color(0xFF10B981).withValues(alpha: 0.6),
                                blurRadius: 6,
                                spreadRadius: 1,
                              ),
                            ]
                          : null,
                    ),
                  ),
                  const SizedBox(width: 7),
                  Text(
                    _isOnline ? 'ONLINE' : 'STANDBY',
                    style: GoogleFonts.inter(
                      color: _isOnline ? const Color(0xFF10B981) : (isDark ? Colors.white70 : AppTheme.porcelainTextSecondary),
                      fontSize: 10.5,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    width: 1,
                    height: 10,
                    color: isDark ? Colors.white24 : Colors.black12,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '2NK Sacco',
                    style: GoogleFonts.inter(
                      color: isDark ? AppTheme.primaryLight : AppTheme.aurumBronze,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.4,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Top-Most Right: User Avatar & "Hi, {username}"
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            right: 16,
            child: Consumer(
              builder: (context, ref, _) {
                final authState = ref.watch(authProvider);
                final user = (authState is Authenticated) ? authState.user : null;
                final rawName = (user?['preferredPublicName'] ?? user?['nickname'] ?? user?['firstName'] ?? user?['name'] ?? 'Driver').toString();
                final username = rawName.trim().isNotEmpty ? rawName.trim().split(' ').first : 'Driver';
                final profilePic = (user?['profilePicture'] ?? user?['avatarUrl'] ?? user?['avatar'])?.toString() ??
                    'https://i.pravatar.cc/150?u=${user?['id'] ?? 'driver'}';

                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ProfileScreen()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(10, 4, 4, 4),
                    decoration: BoxDecoration(
                      color: (isDark ? AppTheme.surfaceContainer : Colors.white).withValues(alpha: 0.94),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isDark ? AppTheme.primaryColor.withValues(alpha: 0.35) : AppTheme.porcelainOutline,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.08),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Hi, $username',
                          style: GoogleFonts.inter(
                            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: _isOnline ? const Color(0xFF10B981) : (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze),
                              width: 1.5,
                            ),
                          ),
                          child: ClipOval(
                            child: Image.network(
                              profilePic,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                color: AppTheme.primaryColor.withValues(alpha: 0.2),
                                alignment: Alignment.center,
                                child: Text(
                                  username.isNotEmpty ? username[0].toUpperCase() : 'D',
                                  style: TextStyle(
                                    color: isDark ? AppTheme.primaryLight : AppTheme.aurumBronze,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Restricted Mode Banner for Pending Drivers
          Consumer(
            builder: (context, ref, _) {
              final authState = ref.watch(authProvider);
              final user = (authState is Authenticated) ? authState.user : null;
              final driverProfile = user?['driverProfile'];
              final status = (driverProfile?['status'] ?? user?['status'])?.toString().toUpperCase();
              if (status != 'PENDING' && status != 'PENDING_APPROVAL') {
                return const SizedBox.shrink();
              }
              return Positioned(
                top: MediaQuery.of(context).padding.top + 54,
                left: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1708),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.6)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.4),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.shield_outlined, color: Color(0xFFD4AF37), size: 20),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'VERIFICATION IN PROGRESS',
                              style: TextStyle(
                                color: Color(0xFFD4AF37),
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                                letterSpacing: 0.5,
                              ),
                            ),
                            Text(
                              'PSV credentials under review. Going online is restricted.',
                              style: TextStyle(color: Colors.white70, fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const DocumentSubmissionScreen()),
                          );
                        },
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text(
                          'DOCS',
                          style: TextStyle(
                            color: Color(0xFFD4AF37),
                            fontWeight: FontWeight.w900,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          // Main Map Right-Hand Side Options (Vertical Dock)
          Positioned(
            top: MediaQuery.of(context).padding.top + 54,
            right: 16,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _MapButton(
                  icon: Icons.layers_outlined,
                  tooltip: 'Change Map Provider',
                  onTap: () => _showMapSelectionSheet(context, mapType),
                ),
                const SizedBox(height: 7),
                _MapButton(
                  icon: Icons.my_location,
                  tooltip: 'Recenter GPS',
                  onTap: () {
                    _mapController?.animateCamera(
                      _driverLocation,
                      zoom: _calculateZoomForRadius(_tripRadiusKm),
                    );
                  },
                ),
                const SizedBox(height: 7),
                // Right-hand shift options: simple intuitive icons
                _MapButton(
                  icon: Icons.radar_rounded,
                  iconColor: _isRadiusSliderOpen
                      ? AppTheme.primaryColor
                      : (isDark ? Colors.white70 : Colors.black87),
                  badgeText: '${_tripRadiusKm.toStringAsFixed(1)}k',
                  tooltip: 'Pick-up Radius (${_tripRadiusKm.toStringAsFixed(1)} km)',
                  onTap: () {
                    setState(() {
                      _isRadiusSliderOpen = !_isRadiusSliderOpen;
                    });
                  },
                ),
                const SizedBox(height: 7),
                _MapButton(
                  icon: Icons.local_fire_department_rounded,
                  iconColor: _showDemandHotspots
                      ? const Color(0xFFFF5722)
                      : (isDark ? Colors.white54 : AppTheme.porcelainTextSecondary),
                  tooltip: _showDemandHotspots ? 'Demand Hotspots Active' : 'Demand Hotspots Off',
                  onTap: () {
                    setState(() {
                      _showDemandHotspots = !_showDemandHotspots;
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        duration: const Duration(seconds: 2),
                        content: Text(_showDemandHotspots
                            ? '🔥 High-demand heatmap hotspots enabled'
                            : 'Demand hotspots hidden'),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 7),
                _MapButton(
                  icon: Icons.queue_play_next_rounded,
                  iconColor: _allowBackToBack
                      ? const Color(0xFF10B981)
                      : (isDark ? Colors.white54 : AppTheme.porcelainTextSecondary),
                  tooltip: _allowBackToBack ? 'Back-to-Back Trips: ON' : 'Back-to-Back Trips: OFF',
                  onTap: _toggleBackToBack,
                ),
                const SizedBox(height: 7),
                _MapButton(
                  icon: Icons.alt_route_rounded,
                  iconColor: (_isDestinationModeActive || _excludedZones.isNotEmpty)
                      ? (isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze)
                      : (isDark ? Colors.white54 : AppTheme.porcelainTextSecondary),
                  tooltip: 'Route Preferences (Destination & Avoid Zones)',
                  onTap: () => _showRoutePreferencesSheet(context),
                ),
                const SizedBox(height: 7),
                _MapButton(
                  icon: Icons.settings_rounded,
                  iconColor: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
                  tooltip: 'Settings',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SettingsScreen()),
                  ),
                ),
                const SizedBox(height: 10),
                const SosButton(size: 42),
              ],
            ),
          ),

          if (_isDestinationModeActive && _preferredDestinationName != null)
            Positioned(
              top: MediaQuery.of(context).padding.top + 58,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E1B18) : AppTheme.porcelainSurface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze, width: 1.2),
                  boxShadow: [
                    BoxShadow(
                      color: isDark ? Colors.black.withValues(alpha: 0.4) : Colors.black.withValues(alpha: 0.08),
                      blurRadius: 8,
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.navigation_rounded, color: isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      'Heading: $_preferredDestinationName',
                      style: TextStyle(color: isDark ? Colors.white : AppTheme.porcelainTextPrimary, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 6),
                    GestureDetector(
                      onTap: () {
                        setState(() => _isDestinationModeActive = false);
                        _saveDriverPreferences();
                      },
                      child: Icon(Icons.close, color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary, size: 14),
                    ),
                  ],
                ),
              ),
            ),

          if (_isFullScreenMap)
            _buildFullScreenMapOverlay(context, theme, isDark)
          else
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: EdgeInsets.fromLTRB(
                  20, 16, 20, MediaQuery.of(context).padding.bottom + 16),
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(28)),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black.withValues(alpha: 0.5) : Colors.black.withValues(alpha: 0.1),
                    blurRadius: 24,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Drag Handle
                  Container(
                    width: 38,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withValues(alpha: 0.18) : AppTheme.porcelainOutline,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Captain Vehicle & Trust Dignity Banner (Zero Earnings)
                  Consumer(
                    builder: (context, ref, child) {
                      final authState = ref.watch(authProvider);
                      final user = (authState is Authenticated) ? authState.user : null;
                      final driverProfile = user?['driverProfile'];
                      final vehicle = driverProfile?['vehicles'];
                      final service = _getServiceDetails(vehicle?['type']);
                      final rating = (user?['rating'] ?? 4.95).toDouble();
                      final trips = (user?['tripsCount'] ?? 2410).toInt();

                      final vehicleTitle = vehicle != null
                          ? "${vehicle['make']} ${vehicle['model']} • ${vehicle['plateNumber']}"
                          : "Toyota Axio • KDA 892J";

                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white.withValues(alpha: 0.05) : AppTheme.porcelainSurfaceContainer,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark ? AppTheme.primaryColor.withValues(alpha: 0.25) : AppTheme.porcelainOutline,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: AppTheme.primaryColor.withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                                border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.35)),
                              ),
                              child: const Icon(Icons.directions_car_rounded, color: AppTheme.primaryColor, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          vehicleTitle,
                                          style: GoogleFonts.inter(
                                            color: theme.textTheme.bodyLarge?.color,
                                            fontSize: 13,
                                            fontWeight: FontWeight.w700,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppTheme.primaryColor.withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(6),
                                          border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.4)),
                                        ),
                                        child: Text(
                                          service['badge'] as String,
                                          style: GoogleFonts.inter(
                                            color: AppTheme.primaryColor,
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Row(
                                    children: [
                                      const Icon(Icons.star_rounded, color: Color(0xFFD4AF37), size: 14),
                                      const SizedBox(width: 3),
                                      Text(
                                        rating.toStringAsFixed(2),
                                        style: GoogleFonts.inter(
                                          color: theme.textTheme.bodyMedium?.color,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        "•",
                                        style: TextStyle(color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.5)),
                                      ),
                                      const SizedBox(width: 8),
                                      const Icon(Icons.verified_outlined, color: Color(0xFF10B981), size: 13),
                                      const SizedBox(width: 3),
                                      Text(
                                        "$trips Trips",
                                        style: GoogleFonts.inter(
                                          color: theme.textTheme.bodyMedium?.color,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 12),

                  // Dispatch Console Status Headline
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _isOnline ? const Color(0xFF10B981) : const Color(0xFF9E9E9E),
                                  boxShadow: _isOnline
                                      ? [
                                          BoxShadow(
                                            color: const Color(0xFF10B981).withValues(alpha: 0.6),
                                            blurRadius: 6,
                                            spreadRadius: 1,
                                          ),
                                        ]
                                      : null,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                _isOnline ? 'Online • Ready for Rides' : 'Offline',
                                style: GoogleFonts.inter(
                                  color: theme.textTheme.bodyLarge?.color,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _isOnline
                                ? 'Scanning ${_tripRadiusKm.toStringAsFixed(1)} km radius for trips'
                                : 'Slide below to start receiving passenger requests',
                            style: GoogleFonts.inter(
                              color: theme.textTheme.bodyMedium?.color ?? AppTheme.darkTextSecondary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () {
                          setState(() {
                            _isFullScreenMap = !_isFullScreenMap;
                          });
                        },
                        icon: Icon(
                          _isFullScreenMap ? Icons.fullscreen_exit_rounded : Icons.fullscreen_rounded,
                          color: isDark ? AppTheme.primaryLight : AppTheme.aurumBronze,
                        ),
                        tooltip: 'Expand Map',
                      ),
                    ],
                  ),

                  // Simulation Quick Action Bar
                  Container(
                    margin: const EdgeInsets.only(top: 12),
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton.icon(
                      onPressed: _triggerSimulatedRideRequest,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? AppTheme.primaryColor : const Color(0xFFD4AF37),
                        foregroundColor: const Color(0xFF1E1602),
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: const Icon(Icons.flash_on_rounded, size: 20, color: Color(0xFF1E1602)),
                      label: Text(
                        "Simulate Incoming Ride Dispatch",
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.4,
                          color: const Color(0xFF1E1602),
                        ),
                      ),
                    ),
                  ),

                  // Expandable Radius Range Controller
                  if (_isRadiusSliderOpen) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1A1916) : AppTheme.porcelainSurfaceContainer,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isDark ? AppTheme.primaryColor.withValues(alpha: 0.25) : AppTheme.porcelainOutline,
                        ),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Dispatch Radius Range',
                                style: GoogleFonts.inter(
                                  color: theme.textTheme.bodyMedium?.color,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                '${_tripRadiusKm.toStringAsFixed(1)} km (Max 5.0 km)',
                                style: GoogleFonts.inter(
                                  color: AppTheme.primaryColor,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                          SliderTheme(
                            data: SliderTheme.of(context).copyWith(
                              activeTrackColor: AppTheme.primaryColor,
                              inactiveTrackColor: isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1),
                              thumbColor: AppTheme.primaryColor,
                              overlayColor: AppTheme.primaryColor.withValues(alpha: 0.2),
                              trackHeight: 3.5,
                              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                            ),
                            child: Slider(
                              value: _tripRadiusKm,
                              min: 1.0,
                              max: 5.0,
                              divisions: 8,
                              onChanged: _onRadiusChanged,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  if (!_isOnline) ...[
                    const SizedBox(height: 12),
                    _buildFavouritePlacesRow(isDark, theme),
                  ],

                  const SizedBox(height: 16),

                  // Swipeable Luxury Slider Button
                  SwipeableOnlineButton(
                    isOnline: _isOnline,
                    isLoading: _isLoading || _isVerificationInProgress,
                    onStatusChanged: (newOnlineStatus) {
                      if (!_isLoading && !_isVerificationInProgress) {
                        _toggleOnline();
                      }
                    },
                  ),
                ],
              ),
            ),
          ),
          
          legacy_provider.Consumer<RideRequestProvider>(
            builder: (context, rideProvider, _) {
              if (rideProvider.currentRideRequest != null) {
                final authState = ref.read(authProvider);
                final driverId = (authState is Authenticated) ? (authState.userId ?? 'unknown') : 'unknown';
                
                return RideRequestModal(
                  requestData: rideProvider.currentRideRequest!,
                  driverId: driverId,
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
    );
  }

  void _showMapSelectionSheet(BuildContext context, MapType currentMapType) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border.all(color: isDark ? Colors.transparent : AppTheme.porcelainOutline, width: 0.8),
            boxShadow: [
              BoxShadow(
                color: isDark ? Colors.black.withValues(alpha: 0.5) : Colors.black.withValues(alpha: 0.08),
                blurRadius: 20,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white24 : AppTheme.porcelainOutline,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Icon(Icons.layers_outlined, color: AppTheme.primaryColor, size: 22),
                    const SizedBox(width: 10),
                    Text(
                      'SELECT NAVIGATION MAP',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                        color: theme.textTheme.titleLarge?.color,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Choose your preferred mapping provider for dispatch & live driving',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: isDark ? Colors.white60 : Colors.black54,
                  ),
                ),
                const SizedBox(height: 20),
                _buildMapOption(
                  context: ctx,
                  type: MapType.google,
                  title: 'Google Maps',
                  subtitle: 'Official Google Maps Platform with high precision satellite & road network',
                  badgeText: 'GLOBAL MAPS',
                  icon: Icons.public,
                  isSelected: currentMapType == MapType.google,
                  onTap: () {
                    ref.read(mapProvider.notifier).setMapType(MapType.google);
                    Navigator.pop(ctx);
                  },
                ),
                const SizedBox(height: 12),
                _buildMapOption(
                  context: ctx,
                  type: MapType.cabi,
                  title: 'Cabi Africa Maps',
                  subtitle: 'Optimized African local roads, informal routes & low data consumption',
                  badgeText: 'LOCAL AFRICA',
                  icon: Icons.explore,
                  isSelected: currentMapType == MapType.cabi,
                  onTap: () {
                    ref.read(mapProvider.notifier).setMapType(MapType.cabi);
                    Navigator.pop(ctx);
                  },
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildMapOption({
    required BuildContext context,
    required MapType type,
    required String title,
    required String subtitle,
    required String badgeText,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.primaryColor.withValues(alpha: 0.12)
              : (isDark ? Colors.white.withValues(alpha: 0.04) : Colors.black.withValues(alpha: 0.03)),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? AppTheme.primaryColor
                : (isDark ? Colors.white12 : Colors.black12),
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isSelected
                    ? AppTheme.primaryColor.withValues(alpha: 0.2)
                    : (isDark ? Colors.white10 : Colors.black12),
              ),
              child: Icon(
                icon,
                color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.white70 : Colors.black54),
                size: 24,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? AppTheme.primaryColor : null,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppTheme.primaryColor.withValues(alpha: 0.2)
                              : (isDark ? Colors.white12 : Colors.black12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          badgeText,
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.white60 : Colors.black54),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white60 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(
              isSelected ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
              color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.white24 : Colors.black26),
              size: 22,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFullScreenMapOverlay(BuildContext context, ThemeData theme, bool isDark) {
    return Positioned(
      bottom: MediaQuery.of(context).padding.bottom + 16,
      left: 16,
      right: 16,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF141311).withValues(alpha: 0.94) : Colors.white.withValues(alpha: 0.96),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: _isOnline ? const Color(0xFF10B981) : (isDark ? Colors.white24 : AppTheme.porcelainOutline),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withValues(alpha: 0.5) : Colors.black.withValues(alpha: 0.08),
              blurRadius: 18,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isOnline ? const Color(0xFF10B981) : Colors.grey,
                boxShadow: _isOnline
                    ? [
                        BoxShadow(
                          color: const Color(0xFF10B981).withValues(alpha: 0.6),
                          blurRadius: 8,
                          spreadRadius: 2,
                        ),
                      ]
                    : null,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _isOnline ? 'Online • Full Screen Map' : 'Offline • Full Screen Map',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: theme.textTheme.bodyLarge?.color,
                    ),
                  ),
                  Text(
                    _isOnline
                        ? 'Monitoring trips (${_tripRadiusKm.toStringAsFixed(1)} km radius)'
                        : 'Explore Nairobi hotspots & traffic flow',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
            ElevatedButton.icon(
              onPressed: () {
                setState(() {
                  _isFullScreenMap = false;
                });
              },
              icon: const Icon(Icons.fullscreen_exit_rounded, size: 16),
              label: const Text('Exit', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                foregroundColor: isDark ? Colors.black : Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showHotspotDetails(BuildContext context, Map<String, dynamic> hotspot) {
    final name = hotspot['name'] ?? 'Demand Hotspot';
    final multiplier = (hotspot['baseMultiplier'] as num?)?.toDouble() ?? 1.2;
    final requests = hotspot['activeRequests'] ?? 10;
    final peakHours = hotspot['peakHours'] ?? 'Peak Rush Hours';
    final peakDays = (hotspot['peakDays'] as List?)?.join(', ') ?? 'Thurs - Sat';
    final category = hotspot['category'] ?? 'Surge Zone';

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border.all(color: isDark ? Colors.transparent : AppTheme.porcelainOutline, width: 0.8),
            boxShadow: [
              BoxShadow(
                color: isDark ? Colors.black.withValues(alpha: 0.5) : Colors.black.withValues(alpha: 0.08),
                blurRadius: 20,
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.local_fire_department, color: Color(0xFFFF5722), size: 24),
                        const SizedBox(width: 8),
                        Text(
                          name,
                          style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF5722).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFF5722)),
                      ),
                      child: Text(
                        '${multiplier.toStringAsFixed(1)}x Surge',
                        style: const TextStyle(color: Color(0xFFFF5722), fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'High passenger activity detected ($requests live requests)',
                  style: const TextStyle(color: Colors.grey, fontSize: 13),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withValues(alpha: 0.05) : AppTheme.porcelainSurfaceContainer,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isDark ? Colors.transparent : AppTheme.porcelainOutline, width: 0.8),
                  ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Zone Type', style: TextStyle(color: Colors.grey)),
                        Text(category, style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Peak Hours', style: TextStyle(color: Colors.grey)),
                        Text(peakHours, style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Peak Days', style: TextStyle(color: Colors.grey)),
                        Text(peakDays, style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    final lat = (hotspot['lat'] as num?)?.toDouble() ?? _driverLocation.latitude;
                    final lng = (hotspot['lng'] as num?)?.toDouble() ?? _driverLocation.longitude;
                    _mapController?.animateCamera(LatLng(lat, lng), zoom: 15.0);
                  },
                  icon: const Icon(Icons.navigation_rounded),
                  label: const Text('Focus Map on Zone'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).brightness == Brightness.dark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                    foregroundColor: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ),
        );
      },
    );
  }

  void _showRoutePreferencesSheet(BuildContext context) {
    final nairobiAreas = [
      {'name': 'Nairobi CBD', 'lat': -1.286389, 'lng': 36.817223},
      {'name': 'Westlands', 'lat': -1.2655, 'lng': 36.8048},
      {'name': 'Kilimani / Yaya', 'lat': -1.2921, 'lng': 36.7865},
      {'name': 'Karen / Langata', 'lat': -1.3197, 'lng': 36.7065},
      {'name': 'Upper Hill', 'lat': -1.2985, 'lng': 36.8142},
      {'name': 'Gigiri / UN', 'lat': -1.2333, 'lng': 36.8055},
      {'name': 'JKIA Airport', 'lat': -1.3192, 'lng': 36.9275},
      {'name': 'Kasarani / Thika Rd', 'lat': -1.2223, 'lng': 36.8967},
    ];

    final avoidAreas = [
      'Eastleigh',
      'Kayole / Komarock',
      'Industrial Area Heavy Traffic',
      'Dandora',
      'CBD Congestion',
      'Githurai 45',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final theme = Theme.of(context);
            final isDark = theme.brightness == Brightness.dark;
            return Container(
              height: MediaQuery.of(context).size.height * 0.75,
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                border: Border.all(color: isDark ? Colors.transparent : AppTheme.porcelainOutline, width: 0.8),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.08),
                    blurRadius: 24,
                  ),
                ],
              ),
              child: SafeArea(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white24 : AppTheme.porcelainOutline,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Icon(Icons.alt_route_rounded, color: isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze, size: 24),
                        const SizedBox(width: 10),
                        Text(
                          'DRIVER ROUTE PREFERENCES',
                          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.1),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Prioritize trips heading towards your destination and avoid unwanted zones.',
                      style: TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: ListView(
                        children: [
                          // Destination Mode Section
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.white.withValues(alpha: 0.04) : AppTheme.porcelainSurfaceContainer,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: _isDestinationModeActive
                                    ? (isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze)
                                    : (isDark ? Colors.white12 : AppTheme.porcelainOutline),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(Icons.home_rounded, color: isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze, size: 18),
                                        const SizedBox(width: 8),
                                        const Text(
                                          'Destination Mode ("Heading Home")',
                                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                        ),
                                      ],
                                    ),
                                    Switch(
                                      value: _isDestinationModeActive,
                                      activeThumbColor: isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze,
                                      onChanged: (val) {
                                        setModalState(() {
                                          _isDestinationModeActive = val;
                                        });
                                        setState(() {
                                          _isDestinationModeActive = val;
                                        });
                                      },
                                    ),
                                  ],
                                ),
                                const Text(
                                  'Only match rides whose drop-off direction aligns with your destination.',
                                  style: TextStyle(color: Colors.grey, fontSize: 11),
                                ),
                                const SizedBox(height: 12),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: nairobiAreas.map((area) {
                                    final name = area['name'] as String;
                                    final isSelected = _preferredDestinationName == name;
                                    return ChoiceChip(
                                      label: Text(name),
                                      selected: isSelected,
                                      selectedColor: isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze,
                                      labelStyle: TextStyle(
                                        color: isSelected ? (isDark ? Colors.black : Colors.white) : (isDark ? Colors.white : AppTheme.porcelainTextPrimary),
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                        fontSize: 12,
                                      ),
                                      onSelected: (selected) {
                                        setModalState(() {
                                          if (selected) {
                                            _preferredDestinationName = name;
                                            _preferredDestinationLatLng = LatLng(
                                              (area['lat'] as num).toDouble(),
                                              (area['lng'] as num).toDouble(),
                                            );
                                            _isDestinationModeActive = true;
                                          } else {
                                            _preferredDestinationName = null;
                                            _preferredDestinationLatLng = null;
                                          }
                                        });
                                        setState(() {});
                                      },
                                    );
                                  }).toList(),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 18),

                          // Excluded Zones Section
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.white.withValues(alpha: 0.04) : AppTheme.porcelainSurfaceContainer,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: _excludedZones.isNotEmpty
                                    ? Colors.redAccent.withValues(alpha: 0.5)
                                    : (isDark ? Colors.white12 : AppTheme.porcelainOutline),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Row(
                                  children: [
                                    Icon(Icons.do_not_disturb_on_rounded, color: Colors.redAccent, size: 18),
                                    SizedBox(width: 8),
                                    Text(
                                      'Excluded Zones (Areas to Avoid)',
                                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Cabi dispatch will skip matching you to trips with drop-offs inside these zones.',
                                  style: TextStyle(color: Colors.grey, fontSize: 11),
                                ),
                                const SizedBox(height: 12),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: avoidAreas.map((zone) {
                                    final isExcluded = _excludedZones.contains(zone);
                                    return FilterChip(
                                      label: Text(zone),
                                      selected: isExcluded,
                                      selectedColor: Colors.redAccent.withValues(alpha: 0.8),
                                      checkmarkColor: Colors.white,
                                      labelStyle: TextStyle(
                                        color: isExcluded ? Colors.white : (isDark ? Colors.white70 : AppTheme.porcelainTextPrimary),
                                        fontWeight: isExcluded ? FontWeight.bold : FontWeight.normal,
                                        fontSize: 12,
                                      ),
                                      onSelected: (selected) {
                                        setModalState(() {
                                          if (selected) {
                                            _excludedZones.add(zone);
                                          } else {
                                            _excludedZones.remove(zone);
                                          }
                                        });
                                        setState(() {});
                                      },
                                    );
                                  }).toList(),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _saveDriverPreferences();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                          foregroundColor: isDark ? Colors.black : Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Save Route Preferences', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _MapButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final Color? iconColor;
  final String? tooltip;
  final String? badgeText;

  const _MapButton({
    required this.icon,
    required this.onTap,
    this.iconColor,
    this.tooltip,
    this.badgeText,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    Widget btn = GestureDetector(
      onTap: onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          ClipOval(
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1C1A17) : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(
                  color: iconColor != null
                      ? iconColor!.withValues(alpha: 0.5)
                      : (isDark ? Colors.white.withValues(alpha: 0.14) : AppTheme.porcelainOutline),
                  width: 1.2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.08),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: Icon(
                  icon,
                  color: iconColor ?? (isDark ? Colors.white70 : AppTheme.porcelainTextSecondary),
                  size: 19,
                ),
              ),
            ),
          ),
          if (badgeText != null)
            Positioned(
              top: -3,
              right: -3,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1.5),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 4,
                    ),
                  ],
                ),
                child: Text(
                  badgeText!,
                  style: const TextStyle(
                    color: Color(0xFF1E1602),
                    fontSize: 8.5,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
        ],
      ),
    );

    if (tooltip != null) {
      return Tooltip(message: tooltip!, child: btn);
    }
    return btn;
  }
}

// ════════════════════════════════════════════════════════════
// Favourite Places Row (extension on _HomeScreenState)
// ════════════════════════════════════════════════════════════
extension _FavouritePlacesUI on _HomeScreenState {
  Widget _buildFavouritePlacesRow(bool isDark, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.star_rounded, color: AppTheme.primaryColor, size: 16),
            const SizedBox(width: 6),
            Text(
              'Favourite Places',
              style: GoogleFonts.inter(
                color: theme.textTheme.bodyLarge?.color,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
            const Spacer(),
            GestureDetector(
              onTap: () => _showAddFavouriteDialog(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: AppTheme.primaryColor.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.add, color: AppTheme.primaryColor, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      'Add',
                      style: GoogleFonts.inter(
                        color: AppTheme.primaryColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        if (_favouritePlaces.isEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Text(
              'Save your home, work or frequent spots for fast destination setting.',
              style: GoogleFonts.inter(
                color: isDark ? Colors.white38 : Colors.black38,
                fontSize: 12,
              ),
            ),
          )
        else
          Column(
            children: [
              SizedBox(
                height: 70,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _favouritePlaces.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (context, i) {
                    final place = _favouritePlaces[i];
                    final label = place['label'] as String? ?? 'Place';
                    final address = place['address'] as String? ?? '';
                    final iconKey = place['icon'] as String? ?? 'other';
                    final isActive = _isDestinationModeActive &&
                        _preferredDestinationName == label;
                    return GestureDetector(
                      onLongPress: () {
                        showModalBottomSheet(
                          context: context,
                          backgroundColor: Colors.transparent,
                          builder: (ctx) => Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: theme.scaffoldBackgroundColor,
                              borderRadius: const BorderRadius.vertical(
                                  top: Radius.circular(20)),
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(label,
                                    style: GoogleFonts.inter(
                                        fontSize: 17,
                                        fontWeight: FontWeight.bold,
                                        color: theme
                                            .textTheme.titleLarge?.color)),
                                const SizedBox(height: 6),
                                Text(address,
                                    style: GoogleFonts.inter(
                                        color: isDark
                                            ? Colors.white54
                                            : Colors.black54,
                                        fontSize: 13)),
                                const SizedBox(height: 18),
                                ListTile(
                                  leading: const Icon(Icons.edit_outlined,
                                      color: AppTheme.primaryColor),
                                  title: const Text('Edit Place'),
                                  onTap: () {
                                    Navigator.pop(ctx);
                                    _showAddFavouriteDialog(
                                        existing: place, index: i);
                                  },
                                ),
                                ListTile(
                                  leading: const Icon(Icons.delete_outline,
                                      color: Colors.redAccent),
                                  title: const Text('Remove',
                                      style: TextStyle(
                                          color: Colors.redAccent)),
                                  onTap: () {
                                    Navigator.pop(ctx);
                                    _deleteFavouritePlace(i);
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                      onTap: () {
                        if (isActive) {
                          _updateState(() {
                            _isDestinationModeActive = false;
                            _preferredDestinationName = null;
                            _preferredDestinationLatLng = null;
                          });
                        } else {
                          _updateState(() {
                            _isDestinationModeActive = true;
                            _preferredDestinationName = label;
                            _preferredDestinationLatLng = null;
                          });
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('📍 Heading to: $label'),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        }
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 220),
                        width: 110,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: isActive
                              ? (isDark ? AppTheme.primaryColor.withValues(alpha: 0.18) : AppTheme.aurumBronze.withValues(alpha: 0.18))
                              : (isDark
                                  ? Colors.white.withValues(alpha: 0.05)
                                  : AppTheme.porcelainSurfaceContainer),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isActive
                                ? (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze)
                                : (isDark
                                    ? Colors.white12
                                    : AppTheme.porcelainOutline),
                            width: isActive ? 1.5 : 1.0,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(_iconDataForKey(iconKey),
                                color: isActive
                                    ? (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze)
                                    : (isDark
                                        ? Colors.white60
                                        : AppTheme.porcelainTextPrimary),
                                size: 18),
                            const SizedBox(height: 4),
                            Text(
                              label,
                              style: GoogleFonts.inter(
                                color: isActive
                                    ? (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze)
                                    : theme.textTheme.bodyLarge?.color,
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              address,
                              style: GoogleFonts.inter(
                                color: isDark
                                    ? Colors.white38
                                    : AppTheme.porcelainTextSecondary,
                                fontSize: 10,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
      ],
    );
  }
}

// ════════════════════════════════════════════════════════════
// Floating HUD Widget (rendered via Overlay — stays on top of all screens)
// ════════════════════════════════════════════════════════════
class _HudWidget extends StatefulWidget {
  final bool isOnline;
  final double topFraction;
  final bool minimised;
  final ValueChanged<double> onDrag;
  final VoidCallback onToggleOnline;
  final VoidCallback onToggleMinimise;

  const _HudWidget({
    required this.isOnline,
    required this.topFraction,
    required this.minimised,
    required this.onDrag,
    required this.onToggleOnline,
    required this.onToggleMinimise,
  });

  @override
  State<_HudWidget> createState() => _HudWidgetState();
}

class _HudWidgetState extends State<_HudWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulse;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenH = MediaQuery.of(context).size.height;
    final top =
        (screenH * widget.topFraction).clamp(60.0, screenH - 120.0);
    final onlineColor =
        widget.isOnline ? const Color(0xFF10B981) : Colors.orangeAccent;

    return Positioned(
      top: top,
      right: 0,
      child: GestureDetector(
        onVerticalDragUpdate: (d) {
          final newFrac =
              ((top + d.delta.dy) / screenH).clamp(0.07, 0.88);
          widget.onDrag(newFrac);
        },
        child: AnimatedBuilder(
          animation: _pulse,
          builder: (ctx, _) {
            final glowOpacity =
                widget.isOnline ? 0.3 + _pulse.value * 0.4 : 0.15;
            final isDark = Theme.of(context).brightness == Brightness.dark;
            return Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F0E0C) : AppTheme.porcelainSurface,
                borderRadius: const BorderRadius.horizontal(
                    left: Radius.circular(18)),
                border: Border.all(
                    color: onlineColor.withValues(alpha: 0.55),
                    width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: onlineColor.withValues(alpha: glowOpacity),
                    blurRadius: 14,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: widget.minimised
                  ? _MinimisedHud(
                      onlineColor: onlineColor,
                      isOnline: widget.isOnline,
                      onExpand: widget.onToggleMinimise,
                    )
                  : _ExpandedHud(
                      onlineColor: onlineColor,
                      isOnline: widget.isOnline,
                      onToggleOnline: widget.onToggleOnline,
                      onMinimise: widget.onToggleMinimise,
                    ),
            );
          },
        ),
      ),
    );
  }
}

class _MinimisedHud extends StatelessWidget {
  final Color onlineColor;
  final bool isOnline;
  final VoidCallback onExpand;

  const _MinimisedHud({
    required this.onlineColor,
    required this.isOnline,
    required this.onExpand,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onExpand,
      child: Container(
        width: 42,
        height: 56,
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isOnline ? Icons.wifi_tethering : Icons.wifi_tethering_off,
              color: onlineColor,
              size: 22,
            ),
            const SizedBox(height: 2),
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: onlineColor,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ExpandedHud extends StatelessWidget {
  final Color onlineColor;
  final bool isOnline;
  final VoidCallback onToggleOnline;
  final VoidCallback onMinimise;

  const _ExpandedHud({
    required this.onlineColor,
    required this.isOnline,
    required this.onToggleOnline,
    required this.onMinimise,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Minimise handle
          GestureDetector(
            onTap: onMinimise,
            child: Container(
              width: 28,
              height: 3,
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: Theme.of(context).brightness == Brightness.dark ? Colors.white24 : AppTheme.porcelainOutline,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          // Status dot + label
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: onlineColor,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                isOnline ? 'ONLINE' : 'OFFLINE',
                style: GoogleFonts.inter(
                  color: onlineColor,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Quick-toggle button
          GestureDetector(
            onTap: onToggleOnline,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: onlineColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
                border:
                    Border.all(color: onlineColor.withValues(alpha: 0.5)),
              ),
              child: Text(
                isOnline ? 'Go Offline' : 'Go Online',
                style: GoogleFonts.inter(
                  color: onlineColor,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
