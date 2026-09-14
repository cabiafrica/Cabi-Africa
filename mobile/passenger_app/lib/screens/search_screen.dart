import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:geolocator/geolocator.dart';
import 'package:passenger_app/theme/app_theme.dart';
import 'map_pin_picker_screen.dart';

class SearchScreen extends StatefulWidget {
  final bool isPickup;
  final LatLng? userLocation;
  final String? currentAddress;

  const SearchScreen({
    super.key,
    this.isPickup = false,
    this.userLocation,
    this.currentAddress,
  });

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final GooglePlacesService _placesService = GooglePlacesService();
  final Distance _distanceCalc = const Distance();

  late final TextEditingController _pickupController;
  late final TextEditingController _dropoffController;
  final FocusNode _pickupFocusNode = FocusNode();
  final FocusNode _dropoffFocusNode = FocusNode();

  // Multi-stop controllers
  final List<TextEditingController> _stopControllers = [];
  final List<LatLng?> _stopCoords = [];
  final List<FocusNode> _stopFocusNodes = [];

  bool _isEditingPickup = false;
  int _activeField = 1; // 0 = pickup, 1 = dropoff, 2+ = extra stop index

  Timer? _debounce;
  List<Map<String, dynamic>> _onlineSuggestions = [];
  bool _isLoading = false;

  late LatLng _pickupCoords;
  LatLng? _dropoffCoords;

  // Previously visited destinations (from reference) + local landmark defaults
  late List<Map<String, dynamic>> _previouslyVisited;

  @override
  void initState() {
    super.initState();

    final defaultPickup = (widget.currentAddress != null &&
            widget.currentAddress!.isNotEmpty &&
            widget.currentAddress != 'Where to?' &&
            widget.currentAddress != 'Current Location')
        ? widget.currentAddress!
        : 'Epitome Lane 25';

    _pickupController = TextEditingController(text: defaultPickup);
    _dropoffController = TextEditingController();

    _pickupCoords = widget.userLocation ?? const LatLng(-1.286389, 36.817223);

    _isEditingPickup = widget.isPickup;
    _activeField = widget.isPickup ? 0 : 1;

    _initPreviouslyVisited();

    _pickupFocusNode.addListener(() {
      if (_pickupFocusNode.hasFocus) {
        setState(() {
          _isEditingPickup = true;
          _activeField = 0;
        });
      }
    });

    _dropoffFocusNode.addListener(() {
      if (_dropoffFocusNode.hasFocus) {
        setState(() {
          _activeField = 1;
        });
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.isPickup) {
        _pickupFocusNode.requestFocus();
      } else {
        _dropoffFocusNode.requestFocus();
      }
    });
  }

  void _initPreviouslyVisited() {
    _previouslyVisited = [
      {
        'name': 'Mirema Drive',
        'subtitle': 'Nairobi',
        'location': const LatLng(-1.2050, 36.8850),
        'distanceLabel': '<1 km',
      },
      {
        'name': 'Lumumba Drive',
        'subtitle': 'Nairobi',
        'location': const LatLng(-1.2160, 36.8920),
        'distanceLabel': '1.8 km',
      },
      {
        'name': 'Kahawa Sukari Kahawa Sukari',
        'subtitle': 'Thika',
        'location': const LatLng(-1.1890, 36.9380),
        'distanceLabel': '6.7 km',
      },
      {
        'name': 'Thika Road',
        'subtitle': 'Thika',
        'location': const LatLng(-1.1500, 36.9800),
        'distanceLabel': '7.4 km',
      },
      {
        'name': 'Baringo Road 002000',
        'subtitle': 'Nairobi',
        'location': const LatLng(-1.1980, 36.9150),
        'distanceLabel': '6.8 km',
      },
      {
        'name': 'Sarit Centre',
        'subtitle': 'Karuna Rd, Westlands, Nairobi',
        'location': const LatLng(-1.2618, 36.8042),
        'distanceLabel': '1.2 km',
      },
      {
        'name': 'Yaya Centre',
        'subtitle': 'Argwings Kodhek Rd, Kilimani, Nairobi',
        'location': const LatLng(-1.2933, 36.7872),
        'distanceLabel': '3.5 km',
      },
      {
        'name': 'Jomo Kenyatta International Airport (JKIA)',
        'subtitle': 'Airport North Rd, Embakasi, Nairobi',
        'location': const LatLng(-1.3192, 36.9275),
        'distanceLabel': '14.5 km',
      },
    ];

    // Compute and refine exact proximity relative to passenger location
    for (final item in _previouslyVisited) {
      final loc = item['location'] as LatLng?;
      if (loc != null) {
        final dist = _distanceCalc.as(LengthUnit.Kilometer, _pickupCoords, loc);
        if (dist < 1.0) {
          item['distanceLabel'] = '<1 km';
        } else {
          item['distanceLabel'] = '${dist.toStringAsFixed(1)} km';
        }
      }
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _pickupController.dispose();
    _dropoffController.dispose();
    _pickupFocusNode.dispose();
    _dropoffFocusNode.dispose();
    for (final c in _stopControllers) {
      c.dispose();
    }
    for (final f in _stopFocusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String _getActiveQuery() {
    if (_activeField == 0) return _pickupController.text.trim();
    if (_activeField == 1) return _dropoffController.text.trim();
    final stopIdx = _activeField - 2;
    if (stopIdx >= 0 && stopIdx < _stopControllers.length) {
      return _stopControllers[stopIdx].text.trim();
    }
    return '';
  }

  void _onActiveQueryChanged(String query) {
    _debounce?.cancel();
    final trimmed = query.trim();

    if (trimmed.isEmpty) {
      setState(() {
        _onlineSuggestions = [];
        _isLoading = false;
      });
      return;
    }

    setState(() => _isLoading = true);

    _debounce = Timer(const Duration(milliseconds: 300), () {
      _executeSearch(trimmed);
    });
  }

  Future<void> _executeSearch(String query) async {
    if (!mounted) return;

    try {
      final suggestions = await _placesService.autocomplete(
        query,
        userLocation: _pickupCoords,
        radiusMeters: 35000,
      );

      if (!mounted) return;

      final results = <Map<String, dynamic>>[];
      for (final s in suggestions) {
        double? dist = s.distanceKm;
        if (dist == null && s.location != null) {
          dist = _distanceCalc.as(LengthUnit.Kilometer, _pickupCoords, s.location!);
        }

        final distLabel = dist != null
            ? (dist < 1.0 ? '<1 km' : '${dist.toStringAsFixed(1)} km')
            : '';

        results.add({
          'name': s.mainText,
          'subtitle': s.secondaryText.isNotEmpty ? s.secondaryText : s.description,
          'location': s.location,
          'placeId': s.placeId,
          'distanceLabel': distLabel,
        });
      }

      setState(() {
        _onlineSuggestions = results;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  List<Map<String, dynamic>> _getDisplaySuggestions() {
    final query = _getActiveQuery().toLowerCase();

    if (query.isEmpty) {
      return _previouslyVisited;
    }

    // Filter matching previously visited places
    final localMatches = _previouslyVisited.where((item) {
      final name = (item['name'] as String).toLowerCase();
      final sub = (item['subtitle'] as String).toLowerCase();
      return name.contains(query) || sub.contains(query);
    }).toList();

    // Merge with online suggestions without duplicates
    final names = <String>{};
    final list = <Map<String, dynamic>>[];

    for (final item in localMatches) {
      names.add((item['name'] as String).toLowerCase());
      list.add(item);
    }

    for (final item in _onlineSuggestions) {
      final name = (item['name'] as String).toLowerCase();
      if (!names.contains(name)) {
        names.add(name);
        list.add(item);
      }
    }

    return list;
  }

  void _swapPickupAndDropoff() {
    setState(() {
      final tempText = _pickupController.text;
      _pickupController.text = _dropoffController.text;
      _dropoffController.text = tempText;

      final tempCoords = _pickupCoords;
      if (_dropoffCoords != null) {
        _pickupCoords = _dropoffCoords!;
        _dropoffCoords = tempCoords;
      }
    });
  }

  void _addStop() {
    if (_stopControllers.length >= 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Maximum 3 stops allowed.')),
      );
      return;
    }

    setState(() {
      final controller = TextEditingController();
      final focusNode = FocusNode();
      final stopIndex = _stopControllers.length;

      focusNode.addListener(() {
        if (focusNode.hasFocus) {
          setState(() {
            _activeField = 2 + stopIndex;
          });
        }
      });

      _stopControllers.add(controller);
      _stopCoords.add(null);
      _stopFocusNodes.add(focusNode);
      _activeField = 2 + stopIndex;
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_stopFocusNodes.isNotEmpty) {
        _stopFocusNodes.last.requestFocus();
      }
    });
  }

  void _removeStop(int index) {
    setState(() {
      _stopControllers[index].dispose();
      _stopFocusNodes[index].dispose();
      _stopControllers.removeAt(index);
      _stopCoords.removeAt(index);
      _stopFocusNodes.removeAt(index);
      _activeField = 1;
      _dropoffFocusNode.requestFocus();
    });
  }

  Future<void> _openMapPickerForPickup() async {
    final result = await Navigator.of(context).push<Map<String, dynamic>>(
      MaterialPageRoute(
        builder: (_) => MapPinPickerScreen(
          title: 'Set Pickup on Map',
          initialLocation: _pickupCoords,
          userLocation: widget.userLocation,
        ),
      ),
    );

    if (result != null && mounted) {
      setState(() {
        _pickupController.text = result['name'] ?? 'Selected Pickup';
        if (result['location'] != null) {
          _pickupCoords = result['location'] as LatLng;
        }
        _isEditingPickup = false;
        _activeField = 1;
      });
      _dropoffFocusNode.requestFocus();
    }
  }

  Future<void> _openMapPickerForStop(int index) async {
    final result = await Navigator.of(context).push<Map<String, dynamic>>(
      MaterialPageRoute(
        builder: (_) => MapPinPickerScreen(
          title: 'Set Stop ${index + 1} on Map',
          initialLocation: _stopCoords[index] ?? _pickupCoords,
          userLocation: widget.userLocation,
        ),
      ),
    );

    if (result != null && mounted) {
      setState(() {
        _stopControllers[index].text = result['name'] ?? 'Selected Stop ${index + 1}';
        if (result['location'] != null) {
          _stopCoords[index] = result['location'] as LatLng;
        }
      });
    }
  }

  Future<void> _openMapPickerForDropoff() async {
    final result = await Navigator.of(context).push<Map<String, dynamic>>(
      MaterialPageRoute(
        builder: (_) => MapPinPickerScreen(
          title: 'Set Dropoff on Map',
          initialLocation: _dropoffCoords ?? _pickupCoords,
          userLocation: widget.userLocation,
        ),
      ),
    );

    if (result != null && mounted) {
      setState(() {
        _dropoffController.text = result['name'] ?? 'Selected Dropoff';
        if (result['location'] != null) {
          _dropoffCoords = result['location'] as LatLng;
        }
      });
    }
  }

  void _moveStop(int oldIndex, int newIndex) {
    if (newIndex < 0 || newIndex >= _stopControllers.length) return;
    setState(() {
      final controller = _stopControllers.removeAt(oldIndex);
      final coord = _stopCoords.removeAt(oldIndex);
      final focus = _stopFocusNodes.removeAt(oldIndex);
      _stopControllers.insert(newIndex, controller);
      _stopCoords.insert(newIndex, coord);
      _stopFocusNodes.insert(newIndex, focus);
    });
  }

  void _swapStopWithDropoff(int stopIndex) {
    if (stopIndex < 0 || stopIndex >= _stopControllers.length) return;
    setState(() {
      final tempText = _stopControllers[stopIndex].text;
      final tempCoord = _stopCoords[stopIndex];

      _stopControllers[stopIndex].text = _dropoffController.text;
      _stopCoords[stopIndex] = _dropoffCoords;

      _dropoffController.text = tempText;
      _dropoffCoords = tempCoord;
    });
  }

  void _showReorganizeSheet(int stopIndex) {
    final hasPrev = stopIndex > 0;
    final hasNext = stopIndex < _stopControllers.length - 1;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.reorder_rounded, color: Color(0xFF0F7B55)),
                    const SizedBox(width: 8),
                    Text(
                      'Reorganize Stop ${stopIndex + 1}',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (hasPrev)
                  ListTile(
                    leading: const Icon(Icons.arrow_upward_rounded),
                    title: Text('Move up to Stop $stopIndex'),
                    onTap: () {
                      Navigator.pop(ctx);
                      _moveStop(stopIndex, stopIndex - 1);
                    },
                  ),
                if (hasNext)
                  ListTile(
                    leading: const Icon(Icons.arrow_downward_rounded),
                    title: Text('Move down to Stop ${stopIndex + 2}'),
                    onTap: () {
                      Navigator.pop(ctx);
                      _moveStop(stopIndex, stopIndex + 1);
                    },
                  ),
                ListTile(
                  leading: const Icon(Icons.swap_vert_rounded, color: Color(0xFF0F7B55)),
                  title: const Text('Swap with Dropoff location'),
                  onTap: () {
                    Navigator.pop(ctx);
                    _swapStopWithDropoff(stopIndex);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.delete_outline_rounded, color: Colors.red),
                  title: const Text('Remove this stop', style: TextStyle(color: Colors.red)),
                  onTap: () {
                    Navigator.pop(ctx);
                    _removeStop(stopIndex);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _confirmAndPopRoute() {
    final dropoffText = _dropoffController.text.trim().isNotEmpty
        ? _dropoffController.text.trim()
        : 'Destination';
    final dropoffCoord = _dropoffCoords ?? const LatLng(-1.2612, 36.8037);

    Navigator.of(context).pop({
      'type': 'route',
      'name': dropoffText,
      'latitude': dropoffCoord.latitude,
      'longitude': dropoffCoord.longitude,
      'pickup': {
        'name': _pickupController.text.isNotEmpty ? _pickupController.text : 'Current Location',
        'latitude': _pickupCoords.latitude,
        'longitude': _pickupCoords.longitude,
      },
      'dropoff': {
        'name': dropoffText,
        'latitude': dropoffCoord.latitude,
        'longitude': dropoffCoord.longitude,
      },
      'stops': [
        for (int i = 0; i < _stopControllers.length; i++)
          if (_stopControllers[i].text.isNotEmpty)
            {
              'name': _stopControllers[i].text,
              'latitude': _stopCoords[i]?.latitude ?? _pickupCoords.latitude,
              'longitude': _stopCoords[i]?.longitude ?? _pickupCoords.longitude,
            }
      ],
    });
  }

  void _onPlaceSelected(Map<String, dynamic> place) async {
    LatLng? location = place['location'] as LatLng?;

    if (location == null && place['placeId'] != null) {
      setState(() => _isLoading = true);
      location = await _placesService.getPlaceDetails(place['placeId'] as String);
      if (mounted) setState(() => _isLoading = false);
    }

    location ??= _pickupCoords;

    final placeName = place['name'] as String;

    if (_activeField == 0) {
      // Picked for Pickup field
      setState(() {
        _pickupController.text = placeName;
        _pickupCoords = location!;
        _isEditingPickup = false;
        _activeField = 1;
      });
      _dropoffFocusNode.requestFocus();
    } else if (_activeField == 1) {
      // Picked for Dropoff field
      setState(() {
        _dropoffController.text = placeName;
        _dropoffCoords = location;
      });

      // Complete route and pop back to HomeScreen
      if (!mounted) return;
      Navigator.of(context).pop({
        'type': 'route',
        'name': placeName,
        'latitude': location.latitude,
        'longitude': location.longitude,
        'pickup': {
          'name': _pickupController.text.isNotEmpty ? _pickupController.text : 'Current Location',
          'latitude': _pickupCoords.latitude,
          'longitude': _pickupCoords.longitude,
        },
        'dropoff': {
          'name': placeName,
          'latitude': location.latitude,
          'longitude': location.longitude,
        },
        'stops': [
          for (int i = 0; i < _stopControllers.length; i++)
            if (_stopControllers[i].text.isNotEmpty && _stopCoords[i] != null)
              {
                'name': _stopControllers[i].text,
                'latitude': _stopCoords[i]!.latitude,
                'longitude': _stopCoords[i]!.longitude,
              }
        ],
      });
    } else {
      // Picked for an intermediate stop
      final stopIdx = _activeField - 2;
      if (stopIdx >= 0 && stopIdx < _stopControllers.length) {
        setState(() {
          _stopControllers[stopIdx].text = placeName;
          _stopCoords[stopIdx] = location;
          _activeField = 1;
        });
        _dropoffFocusNode.requestFocus();
      }
    }
  }

  Future<void> _autoDetectCurrentLocationForPickup() async {
    setState(() => _isLoading = true);
    try {
      bool serviceEnabled = false;
      try {
        serviceEnabled = await Geolocator.isLocationServiceEnabled();
      } catch (_) {
        serviceEnabled = true;
      }

      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Please enable location settings on your device.'),
              action: SnackBarAction(
                label: 'Settings',
                textColor: const Color(0xFFFFD700),
                onPressed: () => Geolocator.openLocationSettings(),
              ),
            ),
          );
        }
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return;
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Location permission is denied. Open App Settings to enable it.'),
              action: SnackBarAction(
                label: 'Settings',
                textColor: const Color(0xFFFFD700),
                onPressed: () => Geolocator.openAppSettings(),
              ),
            ),
          );
        }
        return;
      }

      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 8),
      );

      final coords = LatLng(pos.latitude, pos.longitude);
      final address = await _placesService.reverseGeocode(coords);
      String cleanAddress = 'Current Location';
      if (address != null && address.isNotEmpty) {
        final parts = address.split(',');
        cleanAddress = parts.length > 2 ? '${parts[0].trim()}, ${parts[1].trim()}' : address.trim();
      }

      if (mounted) {
        setState(() {
          _pickupController.text = cleanAddress;
          _pickupCoords = coords;
          _isEditingPickup = false;
          _activeField = 1;
        });
        _dropoffFocusNode.requestFocus();
      }
    } catch (e) {
      debugPrint("Error detecting location for pickup: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Widget _buildMapIconBadge({required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        margin: const EdgeInsets.only(right: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFE2E8F0),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFCBD5E1), width: 0.8),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(height: 1, color: Colors.white.withValues(alpha: 0.8)),
                const SizedBox(height: 6),
                Container(height: 1, color: Colors.white.withValues(alpha: 0.8)),
              ],
            ),
            const Icon(
              Icons.location_on_rounded,
              color: Color(0xFF0F5132), // Dark green map pin
              size: 18,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final displaySuggestions = _getDisplaySuggestions();

    // Matching screenshot colors
    final scaffoldBg = isDark ? const Color(0xFF121212) : Colors.white;
    final containerBg = isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF1F3F5);
    final borderColor = const Color(0xFFFFD700); // Cabi Signature Gold

    return Scaffold(
      backgroundColor: scaffoldBg,
      body: SafeArea(
        child: Column(
          children: [
            // ── TOP BAR: Close & Route Title ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(
                      Icons.close_rounded,
                      size: 26,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Route',
                    style: GoogleFonts.outfit(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),

            // ── ROUTE INPUTS CONTAINER ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Left side fields column
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: containerBg,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // 1. Pickup Field
                          if (!_isEditingPickup)
                            // Default closed state (filled card with blue dot)
                            InkWell(
                              onTap: () {
                                setState(() {
                                  _isEditingPickup = true;
                                  _activeField = 0;
                                });
                                _pickupFocusNode.requestFocus();
                              },
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 12),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? const Color(0xFF2A2A2A)
                                      : const Color(0xFFE9ECEF),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  children: [
                                    // Blue location indicator dot
                                    Container(
                                      width: 20,
                                      height: 20,
                                      decoration: const BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: Color(0xFFDCE4FD),
                                      ),
                                      child: Center(
                                        child: Container(
                                          width: 10,
                                          height: 10,
                                          decoration: const BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: Color(0xFF4361EE),
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        _pickupController.text.isNotEmpty
                                            ? _pickupController.text
                                            : 'Epitome Lane 25',
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w500,
                                          color: isDark
                                              ? Colors.white
                                              : const Color(0xFF1E293B),
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          else
                            // Active editing state (looks like the empty field below with map icon)
                            Container(
                              height: 48,
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF181818) : Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: borderColor,
                                  width: 1.5,
                                ),
                              ),
                              child: Row(
                                children: [
                                  const SizedBox(width: 10),
                                  Icon(
                                    Icons.search_rounded,
                                    size: 22,
                                    color: isDark ? Colors.white70 : const Color(0xFF1E293B),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: TextField(
                                      controller: _pickupController,
                                      focusNode: _pickupFocusNode,
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w500,
                                        color: isDark ? Colors.white : Colors.black87,
                                      ),
                                      decoration: const InputDecoration(
                                        hintText: 'Pickup location',
                                        hintStyle: TextStyle(
                                          color: Color(0xFF94A3B8),
                                          fontSize: 15,
                                        ),
                                        border: InputBorder.none,
                                        isDense: true,
                                        contentPadding: EdgeInsets.symmetric(vertical: 10),
                                      ),
                                      onChanged: (q) => _onActiveQueryChanged(q),
                                    ),
                                  ),
                                  _buildMapIconBadge(
                                    onTap: _openMapPickerForPickup,
                                  ),
                                ],
                              ),
                            ),

                          // Intermediate Stops (if added via +)
                          for (int i = 0; i < _stopControllers.length; i++) ...[
                            const SizedBox(height: 8),
                            Container(
                              height: 48,
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF181818) : Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: const Color(0xFFE2E8F0),
                                  width: 1.2,
                                ),
                              ),
                              child: Row(
                                children: [
                                  const SizedBox(width: 8),
                                  GestureDetector(
                                    onTap: () => _showReorganizeSheet(i),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFE2E8F0),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(Icons.drag_indicator_rounded, size: 14, color: Colors.black54),
                                          const SizedBox(width: 2),
                                          Text(
                                            'Stop ${i + 1}',
                                            style: const TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.black87,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: TextField(
                                      controller: _stopControllers[i],
                                      focusNode: _stopFocusNodes[i],
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w500,
                                        color: isDark ? Colors.white : Colors.black87,
                                      ),
                                      decoration: const InputDecoration(
                                        hintText: 'Add stop destination',
                                        hintStyle: TextStyle(
                                          color: Color(0xFF94A3B8),
                                          fontSize: 15,
                                        ),
                                        border: InputBorder.none,
                                        isDense: true,
                                        contentPadding: EdgeInsets.symmetric(vertical: 10),
                                      ),
                                      onChanged: (q) => _onActiveQueryChanged(q),
                                    ),
                                  ),
                                  // Map icon to the right of stop search bar
                                  _buildMapIconBadge(
                                    onTap: () => _openMapPickerForStop(i),
                                  ),
                                  // Reorganize / Swap icon
                                  IconButton(
                                    icon: const Icon(Icons.swap_vert_rounded, size: 20, color: Color(0xFF64748B)),
                                    tooltip: 'Reorganize Stop',
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(minWidth: 26, minHeight: 26),
                                    onPressed: () => _showReorganizeSheet(i),
                                  ),
                                  // Remove stop
                                  IconButton(
                                    icon: const Icon(Icons.close_rounded, size: 18, color: Colors.grey),
                                    tooltip: 'Remove',
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(minWidth: 26, minHeight: 26),
                                    onPressed: () => _removeStop(i),
                                  ),
                                  const SizedBox(width: 4),
                                ],
                              ),
                            ),
                          ],

                          const SizedBox(height: 8),

                          // 2. Dropoff Field (Active green-bordered field with search & map thumbnail)
                          Container(
                            height: 48,
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF181818) : Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: borderColor,
                                width: 1.5,
                              ),
                            ),
                            child: Row(
                              children: [
                                const SizedBox(width: 10),
                                Icon(
                                  Icons.search_rounded,
                                  size: 22,
                                  color: isDark ? Colors.white70 : const Color(0xFF1E293B),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: TextField(
                                    controller: _dropoffController,
                                    focusNode: _dropoffFocusNode,
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w500,
                                      color: isDark ? Colors.white : Colors.black87,
                                    ),
                                    decoration: const InputDecoration(
                                      hintText: 'Dropoff location',
                                      hintStyle: TextStyle(
                                        color: Color(0xFF94A3B8),
                                        fontSize: 15,
                                      ),
                                      border: InputBorder.none,
                                      isDense: true,
                                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                                    ),
                                    onChanged: (q) => _onActiveQueryChanged(q),
                                  ),
                                ),
                                _buildMapIconBadge(
                                  onTap: _openMapPickerForDropoff,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(width: 12),

                  // Right side action buttons (+ and ⇅)
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Plus (+) button to add destination
                      IconButton(
                        icon: Icon(
                          Icons.add_rounded,
                          size: 28,
                          color: isDark ? Colors.white : const Color(0xFF1E293B),
                        ),
                        tooltip: 'Add Stop',
                        onPressed: _addStop,
                      ),
                      const SizedBox(height: 12),
                      // Swap (⇅) button
                      IconButton(
                        icon: Icon(
                          Icons.swap_vert_rounded,
                          size: 26,
                          color: isDark ? Colors.white : const Color(0xFF1E293B),
                        ),
                        tooltip: 'Swap Locations',
                        onPressed: _swapPickupAndDropoff,
                      ),
                    ],
                  ),
                ],
              ),
            ),

            if (_dropoffController.text.trim().isNotEmpty) ...[
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  width: double.infinity,
                  height: 48,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFFFD700).withValues(alpha: 0.35),
                        blurRadius: 14,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: ElevatedButton.icon(
                    onPressed: _confirmAndPopRoute,
                    icon: const Icon(Icons.check_circle_outline_rounded, size: 20, color: Colors.black),
                    label: Text(
                      _stopControllers.isNotEmpty
                          ? 'Confirm Route (${_stopControllers.length} stop${_stopControllers.length > 1 ? "s" : ""})'
                          : 'Confirm Route & View Rides',
                      style: GoogleFonts.outfit(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.2,
                        color: Colors.black,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFFD700),
                      foregroundColor: Colors.black,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 12),

            // Loading bar
            if (_isLoading)
              const LinearProgressIndicator(
                backgroundColor: Colors.transparent,
                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                minHeight: 2,
              ),

            // Thin divider below fields
            Divider(
              height: 1,
              color: isDark ? Colors.white12 : const Color(0xFFE2E8F0),
            ),

            if (_activeField == 0) ...[
              InkWell(
                onTap: _autoDetectCurrentLocationForPickup,
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFD700).withValues(alpha: isDark ? 0.15 : 0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFFFD700).withValues(alpha: 0.5),
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFD700).withValues(alpha: 0.25),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.my_location_rounded,
                          size: 18,
                          color: Color(0xFFD97706),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Use Current Location',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Auto-select using device GPS settings',
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark ? Colors.white60 : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 14,
                        color: Color(0xFFD97706),
                      ),
                    ],
                  ),
                ),
              ),
              Divider(
                height: 1,
                color: isDark ? Colors.white12 : const Color(0xFFE2E8F0),
              ),
            ],

            // ── PREVIOUSLY VISITED DESTINATIONS / SUGGESTIONS LIST ──
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(vertical: 4),
                itemCount: displaySuggestions.length,
                separatorBuilder: (context, index) => Divider(
                  height: 1,
                  indent: 64,
                  endIndent: 16,
                  color: isDark ? Colors.white10 : const Color(0xFFEDF2F7),
                ),
                itemBuilder: (context, index) {
                  final item = displaySuggestions[index];
                  final name = item['name'] as String;
                  final subtitle = (item['subtitle'] ?? '') as String;
                  final distanceLabel = (item['distanceLabel'] ?? '') as String;

                  return InkWell(
                    onTap: () => _onPlaceSelected(item),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        children: [
                          // Clock icon matching reference
                          Icon(
                            Icons.access_time_rounded,
                            size: 24,
                            color: isDark ? Colors.white54 : const Color(0xFF64748B),
                          ),
                          const SizedBox(width: 16),
                          // Destination text & region/city
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name,
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (subtitle.isNotEmpty) ...[
                                  const SizedBox(height: 2),
                                  Text(
                                    subtitle,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: isDark ? Colors.white38 : const Color(0xFF64748B),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ],
                            ),
                          ),
                          // Distance tag on the right (e.g. '<1 km', '1.8 km')
                          if (distanceLabel.isNotEmpty)
                            Text(
                              distanceLabel,
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark ? Colors.white54 : const Color(0xFF64748B),
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
