import 'package:flutter/material.dart';

// Mock service to simulate saving the preference
class DriverPreferencesService {
  Future<void> updateLongTripPreference(bool prefersLongTrips) async {
    // In a real app, this would make an API call to the backend.
    await Future.delayed(const Duration(milliseconds: 500));
    print('Driver preference for long trips set to: $prefersLongTrips');
  }
}

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _prefersLongTrips = false;
  bool _isLoading = false;
  final _preferencesService = DriverPreferencesService();

  void _onLongTripPreferenceChanged(bool value) {
    setState(() {
      _isLoading = true;
      _prefersLongTrips = value;
    });

    _preferencesService.updateLongTripPreference(value).then((_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Preference saved!')));
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          const ListTile(
            leading: Icon(Icons.person_outline),
            title: Text('Edit Profile'),
          ),
          const ListTile(
            leading: Icon(Icons.security_outlined),
            title: Text('Security'),
          ),
          SwitchListTile(
            title: const Text('Prefers Long Trips'),
            subtitle: const Text('Get prioritized for longer-distance rides.'),
            value: _prefersLongTrips,
            onChanged: _isLoading ? null : _onLongTripPreferenceChanged,
            secondary: _isLoading
                ? const CircularProgressIndicator()
                : const Icon(Icons.route_outlined),
          ),
        ],
      ),
    );
  }
}
