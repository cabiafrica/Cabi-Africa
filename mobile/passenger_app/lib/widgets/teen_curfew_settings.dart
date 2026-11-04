import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class TeenCurfewSettings extends StatefulWidget {
  final String teenName;
  final TimeOfDay? curfewStart;
  final TimeOfDay? curfewEnd;
  final bool isCurfewEnabled;
  final ValueChanged<Map<String, dynamic>> onSave;

  const TeenCurfewSettings({
    super.key,
    required this.teenName,
    this.curfewStart,
    this.curfewEnd,
    this.isCurfewEnabled = false,
    required this.onSave,
  });

  @override
  State<TeenCurfewSettings> createState() => _TeenCurfewSettingsState();
}

class _TeenCurfewSettingsState extends State<TeenCurfewSettings> {
  late bool _isEnabled;
  late TimeOfDay _startTime;
  late TimeOfDay _endTime;
  bool _geoFenceEnabled = false;
  double _maxDistanceMiles = 15.0;

  @override
  void initState() {
    super.initState();
    _isEnabled = widget.isCurfewEnabled;
    _startTime =
        widget.curfewStart ?? const TimeOfDay(hour: 22, minute: 0); // 10 PM
    _endTime = widget.curfewEnd ?? const TimeOfDay(hour: 6, minute: 0); // 6 AM
  }

  Future<void> _selectTime(bool isStart) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: isStart ? _startTime : _endTime,
      builder: (context, child) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Theme(
          data: (isDark ? ThemeData.dark() : ThemeData.light()).copyWith(
            colorScheme: isDark
                ? const ColorScheme.dark(
                    primary: Color(0xFFFBBF24),
                    onPrimary: Colors.black,
                    surface: Color(0xFF1E1E2E),
                    onSurface: Colors.white,
                  )
                : const ColorScheme.light(
                    primary: Color(0xFFFBBF24),
                    onPrimary: Colors.black,
                    surface: Colors.white,
                    onSurface: Colors.black,
                  ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _startTime = picked;
        } else {
          _endTime = picked;
        }
      });
    }
  }

  void _save() {
    widget.onSave({
      'enabled': _isEnabled,
      'startTime': _startTime,
      'endTime': _endTime,
      'geoFenceEnabled': _geoFenceEnabled,
      'maxDistance': _maxDistanceMiles,
    });
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)],
              ),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.access_time_filled, color: Colors.black),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Safety Rules for ${widget.teenName}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                ),
              ],
            ),
          ),

          Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Curfew Section
                Row(
                  children: [
                    const Icon(Icons.nights_stay,
                        color: Colors.indigo, size: 20),
                    const SizedBox(width: 8),
                    const Text(
                      'Curfew',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Spacer(),
                    Switch(
                      value: _isEnabled,
                      onChanged: (val) {
                        setState(() {
                          _isEnabled = val;
                        });
                      },
                      activeTrackColor: const Color(0xFFFBBF24),
                    ),
                  ],
                ),

                if (_isEnabled) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.surfaceContainer : Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: isDark ? AppTheme.outlineBorder : Colors.grey.shade200),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildTimeButton('Start', _startTime, true, isDark: isDark),
                        Icon(Icons.arrow_forward,
                            color: isDark ? Colors.white38 : Colors.grey),
                        _buildTimeButton('End', _endTime, false, isDark: isDark),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Rides will be blocked between ${_startTime.format(context)} and ${_endTime.format(context)}.',
                    style: TextStyle(
                        color: isDark ? Colors.white54 : Colors.grey.shade600,
                        fontSize: 12),
                  ),
                ],

                const Divider(height: 32),

                // Geofence Section
                Row(
                  children: [
                    const Icon(Icons.map, color: Colors.green, size: 20),
                    const SizedBox(width: 8),
                    const Text(
                      'Distance Limit',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Spacer(),
                    Switch(
                      value: _geoFenceEnabled,
                      onChanged: (val) {
                        setState(() {
                          _geoFenceEnabled = val;
                        });
                      },
                      activeTrackColor: const Color(0xFFFBBF24),
                    ),
                  ],
                ),

                if (_geoFenceEnabled) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Max ${_maxDistanceMiles.round()} miles from home',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Slider(
                    value: _maxDistanceMiles,
                    min: 5,
                    max: 50,
                    divisions: 9,
                    activeColor: const Color(0xFFF59E0B),
                    onChanged: (val) {
                      setState(() {
                        _maxDistanceMiles = val;
                      });
                    },
                  ),
                  Text(
                    'Rides ending further than ${_maxDistanceMiles.round()} miles from your home address will be blocked.',
                    style: TextStyle(
                        color: isDark ? Colors.white54 : Colors.grey.shade600,
                        fontSize: 12),
                  ),
                ],

                const SizedBox(height: 24),

                // Buttons
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: Text(
                          'Cancel',
                          style: TextStyle(
                              color:
                                  isDark ? Colors.grey : AppTheme.porcelainTextSecondary),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _save,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isDark ? Colors.black : AppTheme.porcelainTextPrimary,
                          foregroundColor: const Color(0xFFFBBF24),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text('Save Rules'),
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
  }

  Widget _buildTimeButton(String label, TimeOfDay time, bool isStart,
      {bool isDark = false}) {
    return GestureDetector(
      onTap: () => _selectTime(isStart),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? Colors.white54 : Colors.grey,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.surfaceContainerHigh : Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                  color: isDark ? AppTheme.outlineBorder : Colors.grey.shade300),
            ),
            child: Text(
              time.format(context),
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
