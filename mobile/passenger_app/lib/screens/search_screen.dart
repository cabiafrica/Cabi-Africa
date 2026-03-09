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

  // Dark theme colors
  static const _bgColor = Color(0xFF0D0D0D);
  static const _cardColor = Color(0xFF181818);
  static const _dividerColor = Color(0xFF2A2A2A);
  static const _goldColor = Color(0xFFFFD700);

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

    _debounce = Timer(const Duration(milliseconds: 400), () {
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
      final parts = fullName.split(',');
      if (parts.length > 2) {
        return '${parts[0].trim()}, ${parts[1].trim()}';
      }
      return fullName;
    }

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
      backgroundColor: _bgColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: 'Search for a destination...',
            hintStyle: const TextStyle(
              color: Colors.black38,
              fontSize: 16,
              fontWeight: FontWeight.w400,
            ),
            border: InputBorder.none,
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear_rounded,
                        color: Colors.black38, size: 20),
                    onPressed: () {
                      _searchController.clear();
                      _onSearchChanged('');
                    },
                  )
                : null,
          ),
          style: const TextStyle(
              fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black),
          autofocus: true,
          onChanged: _onSearchChanged,
          textInputAction: TextInputAction.search,
          cursorColor: Colors.black,
        ),
      ),
      body: Column(
        children: [
          // Gold loading bar
          if (_isLoading)
            const LinearProgressIndicator(
              backgroundColor: Colors.transparent,
              valueColor: AlwaysStoppedAnimation<Color>(_goldColor),
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
              const Icon(Icons.cloud_off_rounded,
                  size: 56, color: Colors.white24),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white54, fontSize: 15),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => _searchLocation(_searchController.text.trim()),
                child: const Text('Retry', style: TextStyle(color: _goldColor)),
              ),
            ],
          ),
        ),
      );
    }

    // Search results with quick-pick top chip
    if (_suggestions.isNotEmpty) {
      return ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: _suggestions.length,
        itemBuilder: (context, index) {
          final suggestion = _suggestions[index];
          final fullName = suggestion['name'] as String;
          final parts = fullName.split(',');
          final title = parts.isNotEmpty ? parts[0].trim() : fullName;
          final subtitle =
              parts.length > 1 ? parts.sublist(1).join(',').trim() : '';
          final isFirst = index == 0;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Quick-pick chip for first result
              if (isFirst)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                  child: GestureDetector(
                    onTap: () => _selectLocation(suggestion),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: _goldColor.withValues(alpha: 0.08),
                        border: Border.all(
                            color: _goldColor.withValues(alpha: 0.5)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.flash_on_rounded,
                              color: _goldColor, size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Quick Pick',
                                    style: TextStyle(
                                        color: _goldColor,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 0.8)),
                                const SizedBox(height: 2),
                                Text(title,
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                          const Icon(Icons.arrow_forward_ios_rounded,
                              color: _goldColor, size: 14),
                        ],
                      ),
                    ),
                  ),
                ),

              // Regular item
              Container(
                color: index == 0 ? Colors.transparent : null,
                child: ListTile(
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: _cardColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      _getLocationIcon(suggestion),
                      color: Colors.white54,
                      size: 20,
                    ),
                  ),
                  title: Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: subtitle.isNotEmpty
                      ? Text(
                          subtitle,
                          style: const TextStyle(
                              color: Colors.white38, fontSize: 13),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        )
                      : null,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  onTap: () => _selectLocation(suggestion),
                ),
              ),
              if (index < _suggestions.length - 1)
                const Divider(height: 1, indent: 64, color: _dividerColor),
            ],
          );
        },
      );
    }

    // Empty — no query typed yet
    if (_searchController.text.isEmpty && !_isLoading) {
      return ListView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: [
          ListTile(
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _cardColor,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.map_rounded,
                  color: Colors.white70, size: 20),
            ),
            title: const Text(
              'Set location on map',
              style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 15),
            ),
            onTap: () {
              Navigator.of(context).pop({'type': 'map_picker'});
            },
          ),
          const Divider(indent: 16, endIndent: 16, color: _dividerColor),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'SAVED PLACES',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                color: Colors.white38,
              ),
            ),
          ),
          ..._recentPlaces.map((place) => ListTile(
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: _goldColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(place['icon'] as IconData,
                      color: _goldColor, size: 20),
                ),
                title: Text(
                  place['name'] as String,
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 15),
                ),
                subtitle: Text(
                  place['display_name'] as String,
                  style: const TextStyle(color: Colors.white38, fontSize: 13),
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
          const Divider(indent: 16, endIndent: 16, color: _dividerColor),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: const Text(
              'TIP',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                color: Colors.white38,
              ),
            ),
          ),
          ListTile(
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.blue.shade900.withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.lightbulb_outline_rounded,
                  color: Colors.blue.shade300, size: 20),
            ),
            title: const Text(
              'Type a place name or address',
              style: TextStyle(
                  color: Colors.white70,
                  fontWeight: FontWeight.w500,
                  fontSize: 14),
            ),
            subtitle: const Text(
              'e.g. "Westlands", "JKIA", "Kenyatta Avenue"',
              style: TextStyle(color: Colors.white38, fontSize: 13),
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
              const Icon(Icons.search_off_rounded,
                  size: 56, color: Colors.white24),
              const SizedBox(height: 16),
              const Text(
                'No locations found',
                style: TextStyle(
                    color: Colors.white60,
                    fontSize: 16,
                    fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 4),
              const Text(
                'Try a different search term',
                style: TextStyle(color: Colors.white38, fontSize: 14),
              ),
            ],
          ),
        ),
      );
    }

    return const SizedBox.shrink();
  }
}
