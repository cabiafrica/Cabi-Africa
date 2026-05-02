import 'package:flutter/material.dart';

class TemperaturePreferenceWidget extends StatefulWidget {
  final Function(String?) onPreferenceChanged;
  final String? initialPreference;

  const TemperaturePreferenceWidget({
    super.key,
    required this.onPreferenceChanged,
    this.initialPreference,
  });

  @override
  State<TemperaturePreferenceWidget> createState() =>
      _TemperaturePreferenceWidgetState();
}

class _TemperaturePreferenceWidgetState
    extends State<TemperaturePreferenceWidget> {
  String? _selectedPreference;

  @override
  void initState() {
    super.initState();
    _selectedPreference = widget.initialPreference;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.thermostat, color: Colors.blue.shade700),
                const SizedBox(width: 8),
                const Text(
                  'Temperature Preference',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Let your driver know your comfort preference',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildPreferenceOption(
                    'COOL',
                    'Cool',
                    Icons.ac_unit,
                    Colors.blue,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildPreferenceOption(
                    'COMFORTABLE',
                    'Comfortable',
                    Icons.check_circle_outline,
                    Colors.green,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildPreferenceOption(
                    'WARM',
                    'Warm',
                    Icons.wb_sunny,
                    Colors.orange,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPreferenceOption(
    String value,
    String label,
    IconData icon,
    Color color,
  ) {
    final isSelected = _selectedPreference == value;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedPreference = isSelected ? null : value;
        });
        widget.onPreferenceChanged(_selectedPreference);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color:
              isSelected ? color.withValues(alpha: 0.1) : Colors.grey.shade100,
          border: Border.all(
            color: isSelected ? color : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? color : Colors.grey.shade600,
              size: 32,
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? color : Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class TemperaturePreferenceDisplay extends StatelessWidget {
  final String preference;

  const TemperaturePreferenceDisplay({
    super.key,
    required this.preference,
  });

  @override
  Widget build(BuildContext context) {
    final info = _getPreferenceInfo(preference);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: info['color'].withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: info['color'].withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            info['icon'],
            color: info['color'],
            size: 18,
          ),
          const SizedBox(width: 6),
          Text(
            'Prefers ${info['label']}',
            style: TextStyle(
              color: info['color'],
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Map<String, dynamic> _getPreferenceInfo(String pref) {
    switch (pref) {
      case 'COOL':
        return {
          'label': 'Cool',
          'icon': Icons.ac_unit,
          'color': Colors.blue,
        };
      case 'WARM':
        return {
          'label': 'Warm',
          'icon': Icons.wb_sunny,
          'color': Colors.orange,
        };
      case 'COMFORTABLE':
      default:
        return {
          'label': 'Comfortable',
          'icon': Icons.check_circle,
          'color': Colors.green,
        };
    }
  }
}

