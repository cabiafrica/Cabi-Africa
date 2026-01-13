import 'package:flutter/material.dart';

// Mock DTOs - In a real app, these would be generated.
class LocationInfo {
  final String address;
  LocationInfo({required this.address});
}

class SavedRouteDto {
  final String id;
  final String name;
  final LocationInfo origin;
  final LocationInfo destination;

  SavedRouteDto({
    required this.id,
    required this.name,
    required this.origin,
    required this.destination,
  });
}

class SavedRoutesScreen extends StatefulWidget {
  const SavedRoutesScreen({super.key});

  @override
  State<SavedRoutesScreen> createState() => _SavedRoutesScreenState();
}

class _SavedRoutesScreenState extends State<SavedRoutesScreen> {
  late Future<List<SavedRouteDto>> _savedRoutesFuture;

  @override
  void initState() {
    super.initState();
    _savedRoutesFuture = _fetchSavedRoutes();
  }

  Future<List<SavedRouteDto>> _fetchSavedRoutes() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));
    return [
      SavedRouteDto(
        id: 'route-1',
        name: 'Morning Commute',
        origin: LocationInfo(address: '123 Home St'),
        destination: LocationInfo(address: '456 Work Ave'),
      ),
      SavedRouteDto(
        id: 'route-2',
        name: 'Gym',
        origin: LocationInfo(address: '123 Home St'),
        destination: LocationInfo(address: '789 Fitness Blvd'),
      ),
    ];
  }

  void _useRoute(SavedRouteDto route) {
    // Mock action to pre-fill booking screen
    debugPrint('Using route: ${route.name}');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Booking screen pre-filled for ${route.name}')),
    );
    // In a real app, you would navigate to the booking screen with initial data.
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Saved Routes')),
      body: FutureBuilder<List<SavedRouteDto>>(
        future: _savedRoutesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError ||
              !snapshot.hasData ||
              snapshot.data!.isEmpty) {
            return const Center(child: Text('No saved routes yet.'));
          }

          return ListView.builder(
            itemCount: snapshot.data!.length,
            itemBuilder: (context, index) {
              final route = snapshot.data![index];
              return ListTile(
                leading: const Icon(Icons.route),
                title: Text(route.name),
                subtitle: Text(
                  'From: ${route.origin.address}\nTo: ${route.destination.address}',
                ),
                onTap: () => _useRoute(route),
              );
            },
          );
        },
      ),
    );
  }
}
