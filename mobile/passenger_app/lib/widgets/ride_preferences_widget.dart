import 'package:flutter/material.dart';

class RidePreferencesWidget extends StatefulWidget {
  final Function(Map<String, dynamic>) onPreferencesChanged;
  
  const RidePreferencesWidget({
    super.key,
    required this.onPreferencesChanged,
  });

  @override
  State<RidePreferencesWidget> createState() => _RidePreferencesWidgetState();
}

class _RidePreferencesWidgetState extends State<RidePreferencesWidget> {
  bool _quietRide = false;
  bool _petFriendly = false;
  bool _luggageAssist = false;
  String _temperature = 'comfortable';
  String _music = 'driver_choice';

  void _updatePreferences() {
    widget.onPreferencesChanged({
      'quietRide': _quietRide,
      'petFriendly': _petFriendly,
      'luggageAssist': _luggageAssist,
      'temperature': _temperature,
      'music': _music,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.tune, size: 20),
              SizedBox(width: 8),
              Text('Ride Preferences', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 16),
          
          // Quiet Ride Toggle
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Quiet Ride'),
            subtitle: const Text('Prefer minimal conversation', style: TextStyle(fontSize: 12)),
            value: _quietRide,
            onChanged: (value) {
              setState(() => _quietRide = value);
              _updatePreferences();
            },
            secondary: Icon(
              _quietRide ? Icons.volume_off : Icons.volume_up,
              color: _quietRide ? Colors.blue : Colors.grey,
            ),
          ),
          
          const Divider(),
          
          // Pet Friendly
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Traveling with Pet'),
            subtitle: const Text('Let driver know you have a pet', style: TextStyle(fontSize: 12)),
            value: _petFriendly,
            onChanged: (value) {
              setState(() => _petFriendly = value);
              _updatePreferences();
            },
            secondary: Icon(
              Icons.pets,
              color: _petFriendly ? Colors.blue : Colors.grey,
            ),
          ),
          
          const Divider(),

          // Luggage Assistance (Story 85.8)
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Luggage Assistance'),
            subtitle: const Text('Need help with bags?'),
            value: _luggageAssist,
            onChanged: (value) {
              setState(() => _luggageAssist = value);
              _updatePreferences();
            },
            secondary: Icon(
              Icons.luggage,
              color: _luggageAssist ? Colors.blue : Colors.grey,
            ),
          ),
          const Divider(),
          
          // Temperature Preference
          const Text('Temperature', style: TextStyle(fontWeight: FontWeight.w500)),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildChip('Cool', 'cool', Icons.ac_unit),
              const SizedBox(width: 8),
              _buildChip('Comfortable', 'comfortable', Icons.thermostat),
              const SizedBox(width: 8),
              _buildChip('Warm', 'warm', Icons.local_fire_department),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Music Preference
          const Text('Music', style: TextStyle(fontWeight: FontWeight.w500)),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildMusicChip('Off', 'off'),
              const SizedBox(width: 8),
              _buildMusicChip('Driver\'s Choice', 'driver_choice'),
            ],
          ),
          
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, size: 16, color: Colors.blue[700]),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'These are preferences, not requirements',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String label, String value, IconData icon) {
    final isSelected = _temperature == value;
    return Expanded(
      child: InkWell(
        onTap: () {
          setState(() => _temperature = value);
          _updatePreferences();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? Colors.blue : Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? Colors.blue : Colors.grey[300]!,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, size: 20, color: isSelected ? Colors.white : Colors.grey),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  color: isSelected ? Colors.white : Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMusicChip(String label, String value) {
    final isSelected = _music == value;
    return Expanded(
      child: InkWell(
        onTap: () {
          setState(() => _music = value);
          _updatePreferences();
        },
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isSelected ? Colors.blue : Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? Colors.blue : Colors.grey[300]!,
            ),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: isSelected ? Colors.white : Colors.black87,
            ),
          ),
        ),
      ),
    );
  }
}
