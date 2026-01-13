// ignore_for_file: deprecated_member_use
import 'package:flutter/material.dart';

// Mock DTOs - In a real app, these would be generated.
enum TemperaturePreference { cool, warm, noPreference }

class RidePreferencesDto {
  bool isQuietRide;
  TemperaturePreference temperature;

  RidePreferencesDto({required this.isQuietRide, required this.temperature});
}

class RidePreferencesScreen extends StatefulWidget {
  const RidePreferencesScreen({super.key});

  @override
  State<RidePreferencesScreen> createState() => _RidePreferencesScreenState();
}

class _RidePreferencesScreenState extends State<RidePreferencesScreen> {
  late Future<RidePreferencesDto> _preferencesFuture;
  RidePreferencesDto? _currentPreferences;

  @override
  void initState() {
    super.initState();
    _preferencesFuture = _fetchPreferences();
  }

  Future<RidePreferencesDto> _fetchPreferences() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));
    final prefs = RidePreferencesDto(
      isQuietRide: false,
      temperature: TemperaturePreference.noPreference,
    );
    _currentPreferences = prefs;
    return prefs;
  }

  Future<void> _updatePreference() async {
    if (_currentPreferences == null) return;
    // Mock API call
    // Mock API call
    // debugPrint(
    //   'Updating preferences: Quiet Ride=${_currentPreferences!.isQuietRide}, Temp=${_currentPreferences!.temperature}',
    // );
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Preferences saved!')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ride Preferences')),
      body: FutureBuilder<RidePreferencesDto>(
        future: _preferencesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Could not load preferences.'));
          }

          return ListView(
            padding: const EdgeInsets.all(8.0),
            children: [
              SwitchListTile(
                title: const Text('Quiet Ride'),
                subtitle: const Text('Prefer a conversation-free ride.'),
                value: _currentPreferences!.isQuietRide,
                onChanged: (value) {
                  setState(() => _currentPreferences!.isQuietRide = value);
                  _updatePreference();
                },
              ),
              const Divider(),
              const ListTile(title: Text('Temperature')),
              Column(
                children: [
                  RadioListTile<TemperaturePreference>(
                    title: const Text('Cool'),
                    value: TemperaturePreference.cool,
                    groupValue: _currentPreferences!.temperature,
                    onChanged: (value) {
                      setState(() => _currentPreferences!.temperature = value!);
                      _updatePreference();
                    },
                  ),
                  RadioListTile<TemperaturePreference>(
                    title: const Text('Warm'),
                    value: TemperaturePreference.warm,
                    groupValue: _currentPreferences!.temperature,
                    onChanged: (value) {
                      setState(() => _currentPreferences!.temperature = value!);
                      _updatePreference();
                    },
                  ),
                  RadioListTile<TemperaturePreference>(
                    title: const Text('No Preference'),
                    value: TemperaturePreference.noPreference,
                    groupValue: _currentPreferences!.temperature,
                    onChanged: (value) {
                      setState(() => _currentPreferences!.temperature = value!);
                      _updatePreference();
                    },
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}
