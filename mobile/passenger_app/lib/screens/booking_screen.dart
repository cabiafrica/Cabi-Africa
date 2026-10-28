import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class HourlyDurationOption {
  final String label;
  final String durationStr;
  final double fareKES;
  final int includedKm;
  final String? badge;

  const HourlyDurationOption({
    required this.label,
    required this.durationStr,
    required this.fareKES,
    required this.includedKm,
    this.badge,
  });
}

class ExecutiveVehicleClass {
  final String id;
  final String name;
  final String models;
  final double multiplier;
  final IconData icon;

  const ExecutiveVehicleClass({
    required this.id,
    required this.name,
    required this.models,
    required this.multiplier,
    required this.icon,
  });
}

class BookingScreen extends StatefulWidget {
  final String? initialPickup;
  final String? initialDestination;

  const BookingScreen({
    super.key,
    this.initialPickup,
    this.initialDestination,
  });

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final List<HourlyDurationOption> _durations = const [
    HourlyDurationOption(
      label: '2 Hours',
      durationStr: '2 Hours',
      fareKES: 3600,
      includedKm: 40,
    ),
    HourlyDurationOption(
      label: '4 Hours',
      durationStr: '4 Hours',
      fareKES: 6800,
      includedKm: 80,
      badge: 'Popular',
    ),
    HourlyDurationOption(
      label: '8 Hours Full Day',
      durationStr: '8 Hours',
      fareKES: 12500,
      includedKm: 160,
      badge: 'VIP Value',
    ),
    HourlyDurationOption(
      label: 'Custom',
      durationStr: 'Custom',
      fareKES: 18000,
      includedKm: 250,
      badge: 'Bespoke',
    ),
  ];

  final List<ExecutiveVehicleClass> _vehicleClasses = const [
    ExecutiveVehicleClass(
      id: 'exec_sedan',
      name: 'Cabi Black Exec',
      models: 'Mercedes E-Class · BMW 5 Series',
      multiplier: 1.0,
      icon: Icons.directions_car_rounded,
    ),
    ExecutiveVehicleClass(
      id: 'prestige_suv',
      name: 'Prestige SUV',
      models: 'Range Rover · Toyota Land Cruiser 300',
      multiplier: 1.4,
      icon: Icons.airport_shuttle_rounded,
    ),
    ExecutiveVehicleClass(
      id: 'vip_lounge',
      name: 'VIP Executive Lounge',
      models: 'Toyota Alphard VIP 6-Seater',
      multiplier: 1.6,
      icon: Icons.airline_seat_recline_extra_rounded,
    ),
  ];

  late int _selectedDurationIndex;
  late int _selectedVehicleIndex;

  final List<String> _waypoints = [
    'Villa Rosa Kempinski, Westlands (Lobby Gate)',
    'State House Rd Offices (Wait time: ~45 mins)',
    'Two Rivers Mall Meeting Lounge (Valet Bay 2)',
  ];

  final TextEditingController _stopController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedDurationIndex = 1; // 4 Hours default
    _selectedVehicleIndex = 0; // Black Exec default
  }

  @override
  void dispose() {
    _stopController.dispose();
    super.dispose();
  }

  double get _totalFare {
    final baseFare = _durations[_selectedDurationIndex].fareKES;
    final mult = _vehicleClasses[_selectedVehicleIndex].multiplier;
    return baseFare * mult;
  }

  void _addWaypointDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF18181E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppTheme.outlineGold),
        ),
        title: Text(
          'Add Itinerary Stop',
          style: AppTheme.outfit(color: Colors.white, fontWeight: FontWeight.w700),
        ),
        content: TextField(
          controller: _stopController,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'e.g. Gigiri Embassy compound or Nairobi Club',
            hintStyle: TextStyle(color: Colors.white38, fontSize: 13),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppTheme.primaryColor)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            onPressed: () {
              if (_stopController.text.trim().isNotEmpty) {
                setState(() {
                  _waypoints.add(_stopController.text.trim());
                });
                _stopController.clear();
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
            child: const Text('Add Stop', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _confirmBooking() {
    final duration = _durations[_selectedDurationIndex];
    final vehicle = _vehicleClasses[_selectedVehicleIndex];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Color(0xFF16161C),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: AppTheme.outlineGold, width: 1.5)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.stars_rounded, color: AppTheme.primaryColor, size: 24),
                const SizedBox(width: 10),
                Text(
                  'Reservation Confirmed',
                  style: AppTheme.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              'Your dedicated ${vehicle.name} chauffeur has been locked for ${duration.durationStr} (${duration.includedKm} km included). SACCO VIP occurrence log initialized.',
              style: AppTheme.inter(fontSize: 13, color: Colors.white70, height: 1.4),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E26),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Estimated Locked Total', style: AppTheme.inter(color: Colors.white70, fontSize: 13)),
                  Text(
                    'KES ${_totalFare.toStringAsFixed(0)}',
                    style: AppTheme.montserrat(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Chauffeur mission dispatched.')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: Text(
                  'Return to Cockpit',
                  style: AppTheme.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.black),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF121215),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Hourly Chauffeur Hire',
          style: AppTheme.outfit(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.outlineGold),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.verified_user_rounded, color: AppTheme.primaryColor, size: 14),
                const SizedBox(width: 4),
                Text(
                  'VIP Safe',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Hero Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF141418),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.outlineGold),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x18000000),
                    blurRadius: 14,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.stars_rounded, color: AppTheme.primaryColor, size: 18),
                      const SizedBox(width: 6),
                      Text(
                        'CABI BLACK LABEL',
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primaryColor,
                          letterSpacing: 1.1,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Dedicated Chauffeur by the Hour',
                    style: AppTheme.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'White-glove executive mobility for boardroom meetings, diplomatic visits & bespoke city tours.',
                    style: AppTheme.inter(
                      fontSize: 13,
                      color: Colors.white60,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Section 1: Duration Selector
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'SELECT DURATION',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: Colors.white54,
                    letterSpacing: 1.1,
                  ),
                ),
                Text(
                  'Unlimited stops included',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Horizontal Duration Chips
            SizedBox(
              height: 78,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _durations.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (context, index) {
                  final dur = _durations[index];
                  final isSelected = _selectedDurationIndex == index;

                  return GestureDetector(
                    onTap: () => setState(() => _selectedDurationIndex = index),
                    child: Container(
                      width: 120,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppTheme.primaryColor
                            : const Color(0xFF141418),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? AppTheme.primaryColor : Colors.white12,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                dur.label,
                                style: AppTheme.inter(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: isSelected ? Colors.black : Colors.white70,
                                ),
                              ),
                              if (dur.badge != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: isSelected ? Colors.black : AppTheme.primaryColor,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    dur.badge!,
                                    style: AppTheme.inter(
                                      fontSize: 8,
                                      fontWeight: FontWeight.w900,
                                      color: isSelected ? AppTheme.primaryColor : Colors.black,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          Text(
                            'KES ${dur.fareKES.toStringAsFixed(0)}',
                            style: AppTheme.montserrat(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: isSelected ? Colors.black : Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            // Section 2: Mission Waypoints
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'MISSION WAYPOINTS',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: Colors.white54,
                    letterSpacing: 1.1,
                  ),
                ),
                Text(
                  'Flexible sequencing',
                  style: AppTheme.inter(fontSize: 11, color: Colors.white38),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF141418),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                children: [
                  ..._waypoints.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final point = entry.value;
                    final isFirst = idx == 0;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            margin: const EdgeInsets.only(top: 4),
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: isFirst ? AppTheme.primaryColor : AppTheme.successGreen,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isFirst ? 'PICKUP POINT' : 'STOP $idx',
                                  style: AppTheme.inter(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white38,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  point,
                                  style: AppTheme.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (!isFirst)
                            IconButton(
                              icon: const Icon(Icons.close_rounded, color: Colors.white30, size: 16),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                              onPressed: () {
                                setState(() => _waypoints.removeAt(idx));
                              },
                            ),
                        ],
                      ),
                    );
                  }),
                  const Divider(color: Colors.white10, height: 16),
                  InkWell(
                    onTap: _addWaypointDialog,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.add_circle_outline_rounded, color: AppTheme.primaryColor, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                'Add Destination Stop',
                                style: AppTheme.outfit(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.primaryColor,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.06),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Included',
                              style: AppTheme.inter(fontSize: 10, color: Colors.white54),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Section 3: Vehicle Class
            Text(
              'SELECT VEHICLE CLASS',
              style: AppTheme.inter(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: Colors.white54,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 12),

            ..._vehicleClasses.asMap().entries.map((entry) {
              final idx = entry.key;
              final vc = entry.value;
              final isSelected = _selectedVehicleIndex == idx;

              return GestureDetector(
                onTap: () => setState(() => _selectedVehicleIndex = idx),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF141418),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? AppTheme.primaryColor : Colors.white12,
                      width: isSelected ? 1.5 : 1.0,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppTheme.primaryColor.withValues(alpha: 0.15)
                              : Colors.white.withValues(alpha: 0.06),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? AppTheme.outlineGold : Colors.white10,
                          ),
                        ),
                        child: Icon(
                          vc.icon,
                          color: isSelected ? AppTheme.primaryColor : Colors.white70,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              vc.name,
                              style: AppTheme.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              vc.models,
                              style: AppTheme.inter(
                                fontSize: 12,
                                color: Colors.white60,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                        color: isSelected ? AppTheme.primaryColor : Colors.white30,
                        size: 20,
                      ),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 20),

            // Amenities Included
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1B1B22),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildAmenity(Icons.local_drink_rounded, 'Mineral Water'),
                  _buildAmenity(Icons.wifi_rounded, '5G Onboard'),
                  _buildAmenity(Icons.battery_charging_full_rounded, 'USB Fast-Charge'),
                  _buildAmenity(Icons.verified_rounded, 'SACCO Vetted'),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: const BoxDecoration(
          color: Color(0xFF121216),
          border: Border(top: BorderSide(color: Colors.white12)),
        ),
        child: Row(
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'UPFRONT ESTIMATE',
                  style: AppTheme.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: Colors.white38,
                  ),
                ),
                Text(
                  'KES ${_totalFare.toStringAsFixed(0)}',
                  style: AppTheme.montserrat(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: _confirmBooking,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 4,
                  ),
                  child: Text(
                    'Confirm Chauffeur',
                    style: AppTheme.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAmenity(IconData icon, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: AppTheme.primaryColor, size: 18),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTheme.inter(fontSize: 10, color: Colors.white70),
        ),
      ],
    );
  }
}
