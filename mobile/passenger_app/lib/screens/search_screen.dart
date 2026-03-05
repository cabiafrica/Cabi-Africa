import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  Timer? _debounce;
  List<Map<String, dynamic>> _suggestions = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Recent/saved places shown when search is empty
  final List<Map<String, dynamic>> _recentPlaces = [
    {
      'name': 'Home',
      'display_name': 'Set your home location',
      'icon': Icons.home_rounded,
      'lat': null,
      'lon': null,
    },
    {
      'name': 'Work',
      'display_name': 'Set your work location',
      'icon': Icons.work_rounded,
      'lat': null,
      'lon': null,
    },
  ];

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    if (query.trim().isEmpty) {
      setState(() {
        _suggestions = [];
        _isLoading = false;
        _errorMessage = null;
      });
      return;
    }

    setState(() => _isLoading = true);

    _debounce = Timer(const Duration(milliseconds: 500), () {
      _searchLocation(query.trim());
    });
  }

  Future<void> _searchLocation(String query) async {
    if (!mounted) return;

    try {
      final uri = Uri.parse('https://nominatim.openstreetmap.org/search'
          '?q=${Uri.encodeComponent(query)}'
          '&format=json'
          '&limit=8'
          '&countrycodes=ke'
          '&addressdetails=1');

      final response = await http.get(uri, headers: {
        'User-Agent': 'CabiGoApp/1.0',
        'Accept': 'application/json',
      });

      if (!mounted) return;

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _suggestions = data.map<Map<String, dynamic>>((item) {
            return {
              'name': item['display_name'] ?? '',
              'lat': item['lat'] ?? '',
              'lon': item['lon'] ?? '',
              'type': item['type'] ?? '',
              'class': item['class'] ?? '',
              'address': item['address'] ?? {},
            };
          }).toList();
          _isLoading = false;
          _errorMessage = null;
        });
      } else {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Could not search locations. Please try again.';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = 'Network error. Please check your connection.';
      });
    }
  }

  void _selectLocation(Map<String, dynamic> location) {
    final lat = double.tryParse(location['lat']?.toString() ?? '');
    final lon = double.tryParse(location['lon']?.toString() ?? '');

    if (lat == null || lon == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not get location coordinates')),
      );
      return;
    }

    // Build a short display name
    final String displayName = _buildShortName(location);

    Navigator.of(context).pop({
      'name': displayName,
      'latitude': lat,
      'longitude': lon,
    });
  }

  String _buildShortName(Map<String, dynamic> location) {
    final address = location['address'] as Map<String, dynamic>?;
    if (address == null) {
      final fullName = location['name'] as String;
      // Shorten long display names
      final parts = fullName.split(',');
      if (parts.length > 2) {
        return '${parts[0].trim()}, ${parts[1].trim()}';
      }
      return fullName;
    }

    // Build from address components
    final components = <String>[];
    final road = address['road'] ?? address['pedestrian'] ?? address['highway'];
    final suburb = address['suburb'] ?? address['neighbourhood'];
    final city = address['city'] ?? address['town'] ?? address['county'];

    if (road != null) components.add(road.toString());
    if (suburb != null) components.add(suburb.toString());
    if (city != null && components.length < 2) components.add(city.toString());

    if (components.isEmpty) {
      final fullName = location['name'] as String;
      final parts = fullName.split(',');
      return parts.length > 2
          ? '${parts[0].trim()}, ${parts[1].trim()}'
          : fullName;
    }

    return components.join(', ');
  }

  IconData _getLocationIcon(Map<String, dynamic> location) {
    final type = location['type']?.toString() ?? '';
    final cls = location['class']?.toString() ?? '';

    if (cls == 'amenity') return Icons.place_rounded;
    if (cls == 'highway' || type == 'road') return Icons.route_rounded;
    if (cls == 'building') return Icons.apartment_rounded;
    if (cls == 'shop') return Icons.store_rounded;
    if (type == 'suburb' || type == 'neighbourhood') {
      return Icons.location_city_rounded;
    }
    if (type == 'city' || type == 'town') return Icons.location_city_rounded;
    return Icons.location_on_rounded;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: 'Search for a destination...',
            hintStyle: TextStyle(
              color: Colors.grey.shade400,
              fontSize: 16,
              fontWeight: FontWeight.w400,
            ),
            border: InputBorder.none,
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: Icon(Icons.clear_rounded,
                        color: Colors.grey.shade500, size: 20),
                    onPressed: () {
                      _searchController.clear();
                      _onSearchChanged('');
                    },
                  )
                : null,
          ),
          style: const TextStyle(
              fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black),
          autofocus: true,
          onChanged: _onSearchChanged,
          textInputAction: TextInputAction.search,
        ),
      ),
      body: Column(
        children: [
          // Loading indicator
          if (_isLoading)
            const LinearProgressIndicator(
              backgroundColor: Colors.transparent,
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFFFD700)),
              minHeight: 2,
            ),

          Expanded(
            child: _buildBody(),
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    // Error state
    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.cloud_off_rounded,
                  size: 56, color: Colors.grey.shade300),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 15),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => _searchLocation(_searchController.text.trim()),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    // Search results
    if (_suggestions.isNotEmpty) {
      return ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: _suggestions.length,
        separatorBuilder: (_, __) =>
            Divider(height: 1, indent: 64, color: Colors.grey.shade200),
        itemBuilder: (context, index) {
          final suggestion = _suggestions[index];
          final fullName = suggestion['name'] as String;
          final parts = fullName.split(',');
          final title = parts.isNotEmpty ? parts[0].trim() : fullName;
          final subtitle =
              parts.length > 1 ? parts.sublist(1).join(',').trim() : '';

          return ListTile(
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                _getLocationIcon(suggestion),
                color: Colors.grey.shade700,
                size: 20,
              ),
            ),
            title: Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 15,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            subtitle: subtitle.isNotEmpty
                ? Text(
                    subtitle,
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  )
                : null,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            onTap: () => _selectLocation(suggestion),
          );
        },
      );
    }

    // Empty search - no query typed yet
    if (_searchController.text.isEmpty && !_isLoading) {
      return ListView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: [
          ListTile(
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(10),
              ),
              child:
                  const Icon(Icons.map_rounded, color: Colors.black, size: 20),
            ),
            title: const Text(
              'Set location on map',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
            ),
            onTap: () {
              Navigator.of(context).pop({'type': 'map_picker'});
            },
          ),
          const Divider(indent: 16, endIndent: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'SAVED PLACES',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                color: Colors.grey.shade500,
              ),
            ),
          ),
          ..._recentPlaces.map((place) => ListTile(
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(place['icon'] as IconData,
                      color: const Color(0xFFD4A017), size: 20),
                ),
                title: Text(
                  place['name'] as String,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 15),
                ),
                subtitle: Text(
                  place['display_name'] as String,
                  style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content: Text('${place['name']} location not set yet')),
                  );
                },
              )),
          const Divider(indent: 16, endIndent: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'TIP',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                color: Colors.grey.shade500,
              ),
            ),
          ),
          ListTile(
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.lightbulb_outline_rounded,
                  color: Colors.blue.shade400, size: 20),
            ),
            title: const Text(
              'Type a place name or address',
              style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
            ),
            subtitle: Text(
              'e.g. "Westlands", "JKIA", "Kenyatta Avenue"',
              style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
            ),
          ),
        ],
      );
    }

    // No results for query
    if (_searchController.text.isNotEmpty && !_isLoading) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.search_off_rounded,
                  size: 56, color: Colors.grey.shade300),
              const SizedBox(height: 16),
              Text(
                'No locations found',
                style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 16,
                    fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 4),
              Text(
                'Try a different search term',
                style: TextStyle(color: Colors.grey.shade400, fontSize: 14),
              ),
            ],
          ),
        ),
      );
    }

    return const SizedBox.shrink();
  }
}
