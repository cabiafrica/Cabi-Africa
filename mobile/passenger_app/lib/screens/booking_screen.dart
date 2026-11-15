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

  final List<String> _waypoints = [];

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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gold = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF18181E) : AppTheme.porcelainSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline),
        ),
        title: Text(
          'Add Itinerary Stop',
          style: AppTheme.outfit(
            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        content: TextField(
          controller: _stopController,
          style: TextStyle(color: isDark ? Colors.white : AppTheme.porcelainTextPrimary),
          decoration: InputDecoration(
            hintText: 'e.g. Gigiri Embassy compound or Nairobi Club',
            hintStyle: TextStyle(
              color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary,
              fontSize: 13,
            ),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: gold)),
            focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: gold, width: 2)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Cancel',
              style: TextStyle(color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary),
            ),
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
            style: ElevatedButton.styleFrom(
              backgroundColor: gold,
              foregroundColor: isDark ? Colors.black : Colors.white,
            ),
            child: Text(
              'Add Stop',
              style: TextStyle(
                color: isDark ? Colors.black : Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _confirmBooking() {
    final duration = _durations[_selectedDurationIndex];
    final vehicle = _vehicleClasses[_selectedVehicleIndex];
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gold = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF16161C) : AppTheme.porcelainSurface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline, width: 1.5)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.stars_rounded, color: gold, size: 24),
                const SizedBox(width: 10),
                Text(
                  'Reservation Confirmed',
                  style: AppTheme.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              'Your dedicated ${vehicle.name} chauffeur has been locked for ${duration.durationStr} (${duration.includedKm} km included). SACCO VIP occurrence log initialized.',
              style: AppTheme.inter(
                fontSize: 13,
                color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E1E26) : AppTheme.porcelainSurfaceContainer,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Estimated Locked Total',
                    style: AppTheme.inter(
                      color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
                      fontSize: 13,
                    ),
                  ),
                  Text(
                    'KES ${_totalFare.toStringAsFixed(0)}',
                    style: AppTheme.montserrat(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: gold,
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
                  backgroundColor: gold,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: Text(
                  'Return to Cockpit',
                  style: AppTheme.outfit(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.black : Colors.white,
                  ),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gold = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0D0D0E) : AppTheme.porcelainCanvas,
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF121215) : AppTheme.porcelainSurface,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Hourly Chauffeur Hire',
          style: AppTheme.outfit(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: gold.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? AppTheme.outlineGold : gold.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.verified_user_rounded, color: gold, size: 14),
                const SizedBox(width: 4),
                Text(
                  'VIP Safe',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: gold,
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
                color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? const Color(0x18000000) : const Color(0x0A000000),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.stars_rounded, color: gold, size: 18),
                      const SizedBox(width: 6),
                      Text(
                        'CABI BLACK LABEL',
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: gold,
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
                      color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'White-glove executive mobility for boardroom meetings, diplomatic visits & bespoke city tours.',
                    style: AppTheme.inter(
                      fontSize: 13,
                      color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
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
                    color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                    letterSpacing: 1.1,
                  ),
                ),
                Text(
                  'Unlimited stops included',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: gold,
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
                            ? gold
                            : (isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected
                              ? gold
                              : (isDark ? Colors.white12 : AppTheme.porcelainOutline),
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
                                  color: isSelected
                                      ? (isDark ? Colors.black : Colors.white)
                                      : (isDark ? Colors.white70 : AppTheme.porcelainTextPrimary),
                                ),
                              ),
                              if (dur.badge != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? (isDark ? Colors.black : Colors.white)
                                        : gold,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    dur.badge!,
                                    style: AppTheme.inter(
                                      fontSize: 8,
                                      fontWeight: FontWeight.w900,
                                      color: isSelected
                                          ? gold
                                          : (isDark ? Colors.black : Colors.white),
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
                              color: isSelected
                                  ? (isDark ? Colors.black : Colors.white)
                                  : (isDark ? Colors.white : AppTheme.porcelainTextPrimary),
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
                    color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                    letterSpacing: 1.1,
                  ),
                ),
                Text(
                  'Flexible sequencing',
                  style: AppTheme.inter(
                    fontSize: 11,
                    color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
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
                              color: isFirst ? gold : AppTheme.successGreen,
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
                                    color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.7),
                                    letterSpacing: 0.8,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  point,
                                  style: AppTheme.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (!isFirst)
                            IconButton(
                              icon: Icon(
                                Icons.close_rounded,
                                color: isDark ? Colors.white30 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.5),
                                size: 16,
                              ),
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
                  Divider(color: isDark ? Colors.white10 : AppTheme.porcelainOutline, height: 16),
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
                              Icon(Icons.add_circle_outline_rounded, color: gold, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                'Add Destination Stop',
                                style: AppTheme.outfit(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: gold,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.white.withValues(alpha: 0.06) : AppTheme.porcelainSurfaceContainer,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Included',
                              style: AppTheme.inter(
                                fontSize: 10,
                                color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                              ),
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
                color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
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
                    color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? gold : (isDark ? Colors.white12 : AppTheme.porcelainOutline),
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
                              ? gold.withValues(alpha: 0.15)
                              : (isDark ? Colors.white.withValues(alpha: 0.06) : AppTheme.porcelainSurfaceContainer),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected
                                ? (isDark ? AppTheme.outlineGold : gold.withValues(alpha: 0.3))
                                : (isDark ? Colors.white10 : AppTheme.porcelainOutline),
                          ),
                        ),
                        child: Icon(
                          vc.icon,
                          color: isSelected
                              ? gold
                              : (isDark ? Colors.white70 : AppTheme.porcelainTextSecondary),
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
                                color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              vc.models,
                              style: AppTheme.inter(
                                fontSize: 12,
                                color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                        color: isSelected
                            ? gold
                            : (isDark ? Colors.white30 : AppTheme.porcelainOutline),
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
                color: isDark ? const Color(0xFF1B1B22) : AppTheme.porcelainSurfaceContainer,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isDark ? Colors.white10 : AppTheme.porcelainOutline),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildAmenity(Icons.local_drink_rounded, 'Mineral Water', gold, isDark),
                  _buildAmenity(Icons.wifi_rounded, '5G Onboard', gold, isDark),
                  _buildAmenity(Icons.battery_charging_full_rounded, 'USB Fast-Charge', gold, isDark),
                  _buildAmenity(Icons.verified_rounded, 'SACCO Vetted', gold, isDark),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF121216) : AppTheme.porcelainSurface,
          border: Border(top: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline)),
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
                    color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary,
                  ),
                ),
                Text(
                  'KES ${_totalFare.toStringAsFixed(0)}',
                  style: AppTheme.montserrat(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: gold,
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
                    backgroundColor: gold,
                    foregroundColor: isDark ? Colors.black : Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 4,
                  ),
                  child: Text(
                    'Confirm Chauffeur',
                    style: AppTheme.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: isDark ? Colors.black : Colors.white,
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

  Widget _buildAmenity(IconData icon, String label, Color gold, bool isDark) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: gold, size: 18),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTheme.inter(
            fontSize: 10,
            color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
          ),
        ),
      ],
    );
  }
}
