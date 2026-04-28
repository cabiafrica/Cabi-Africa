import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../utils/map_styles.dart';

// Mock DTOs - In a real app, these would be generated.
class RouteDetailsDto {
  final String polyline;
  RouteDetailsDto({required this.polyline});
}

// Mock Service
Future<RouteDetailsDto> fetchRouteDetails() async {
  await Future.delayed(const Duration(seconds: 1));
  // This is a mock encoded polyline for a route in New York City.
  return RouteDetailsDto(
    polyline: 'olpF|`|uM~AaAd@c@Xq@Xw@v@yB^y@f@k@d@W`@Kn@Qh@O|@Q\\E`@E`@?@?@?',
  );
}

class InAppNavigationScreen extends StatefulWidget {
  const InAppNavigationScreen({super.key});

  @override
  State<InAppNavigationScreen> createState() => _InAppNavigationScreenState();
}

class _InAppNavigationScreenState extends State<InAppNavigationScreen> {
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};

  static const CameraPosition _kInitialPosition = CameraPosition(
    target: LatLng(40.7128, -74.0060), // New York City
    zoom: 12,
  );

  @override
  void initState() {
    super.initState();
    _loadRoute();
  }

  void _loadRoute() async {
    final route = await fetchRouteDetails();
    final points = _decodePolyline(route.polyline);

    setState(() {
      _markers.add(const Marker(
        markerId: MarkerId('pickup'),
        position: LatLng(40.7484, -73.9857), // Empire State Building
        infoWindow: InfoWindow(title: 'Pickup'),
      ));
      _markers.add(const Marker(
        markerId: MarkerId('destination'),
        position: LatLng(40.6892, -74.0445), // Statue of Liberty
        infoWindow: InfoWindow(title: 'Destination'),
      ));
      _polylines.add(Polyline(
        polylineId: const PolylineId('route'),
        points: points,
        color: Colors.blue,
        width: 5,
      ));
    });
  }

  List<LatLng> _decodePolyline(String encoded) {
    List<LatLng> points = [];
    int index = 0, len = encoded.length;
    int lat = 0, lng = 0;

    while (index < len) {
      int b, shift = 0, result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.add(LatLng(lat / 1E5, lng / 1E5));
    }
    return points;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Navigation')),
      body: GoogleMap(
        initialCameraPosition: _kInitialPosition,
        markers: _markers,
        polylines: _polylines,
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
        style: Theme.of(context).brightness == Brightness.dark
            ? MapStyles.darkMapStyle
            : null,
        onMapCreated: (GoogleMapController controller) {
          // Controller initialization if needed
        },
      ),
    );
  }
}
