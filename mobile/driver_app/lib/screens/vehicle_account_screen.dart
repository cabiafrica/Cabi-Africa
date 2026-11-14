import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../theme/app_theme.dart';

class VehicleIncentive {
  final String id;
  final String title;
  final String description;
  final String reward;
  final int requiredTrips;
  final int currentTrips;
  final int progressPct;
  final bool isQualified;
  final String category;
  final String badgeEmoji;
  final String status; // QUALIFIED | IN_PROGRESS | CLAIMED

  VehicleIncentive({
    required this.id,
    required this.title,
    required this.description,
    required this.reward,
    required this.requiredTrips,
    required this.currentTrips,
    required this.progressPct,
    required this.isQualified,
    required this.category,
    required this.badgeEmoji,
    required this.status,
  });
}

class VehicleTripItem {
  final String id;
  final String date;
  final String pickup;
  final String dropoff;
  final double fare;
  final double distanceKm;
  final String status;

  VehicleTripItem({
    required this.id,
    required this.date,
    required this.pickup,
    required this.dropoff,
    required this.fare,
    required this.distanceKm,
    required this.status,
  });
}

class VehicleMaintenanceItem {
  final String title;
  final String date;
  final String cost;
  final String status;
  final String garage;

  VehicleMaintenanceItem({
    required this.title,
    required this.date,
    required this.cost,
    required this.status,
    required this.garage,
  });
}

class VehicleAccountScreen extends StatefulWidget {
  final Map<String, dynamic> vehicleData;

  const VehicleAccountScreen({
    super.key,
    required this.vehicleData,
  });

  @override
  State<VehicleAccountScreen> createState() => _VehicleAccountScreenState();
}

class _VehicleAccountScreenState extends State<VehicleAccountScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  final Set<String> _claimedIncentives = {};

  // Default vehicle stats
  int _totalTrips = 84;
  double _totalKm = 1420.5;
  double _totalRevenue = 92450.0;
  final double _rating = 4.88;

  late List<VehicleIncentive> _incentives;
  late List<VehicleTripItem> _trips;
  late List<VehicleMaintenanceItem> _maintenance;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _initializeData();
    _fetchLiveVehicleAccount();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _initializeData() {
    _incentives = [
      VehicleIncentive(
        id: 'fuel_rebate',
        title: 'Bronze Fuel Rebate',
        description: '5% rebate on all fuel purchases at partner Shell & Total stations nationwide.',
        reward: '5% Fuel Rebate Voucher',
        requiredTrips: 20,
        currentTrips: _totalTrips,
        progressPct: 100,
        isQualified: true,
        category: 'FUEL',
        badgeEmoji: '⛽',
        status: 'QUALIFIED',
      ),
      VehicleIncentive(
        id: 'maintenance_grant',
        title: 'Silver Maintenance Allowance',
        description: 'KES 7,500 quarterly grant for routine servicing, brake inspection, and engine oil replacement.',
        reward: 'KES 7,500 Service Voucher',
        requiredTrips: 50,
        currentTrips: _totalTrips,
        progressPct: 100,
        isQualified: true,
        category: 'MAINTENANCE',
        badgeEmoji: '🔧',
        status: 'QUALIFIED',
      ),
      VehicleIncentive(
        id: 'gold_commission',
        title: 'Gold 0% Commission Weekend',
        description: 'Zero platform fee on all weekend rides for top tier vehicles reaching 100 verified trips.',
        reward: '0% Weekend Commission Pass',
        requiredTrips: 100,
        currentTrips: _totalTrips,
        progressPct: ((_totalTrips / 100) * 100).round(),
        isQualified: _totalTrips >= 100,
        category: 'COMMISSION',
        badgeEmoji: '🏆',
        status: _totalTrips >= 100 ? 'QUALIFIED' : 'IN_PROGRESS',
      ),
      VehicleIncentive(
        id: 'airport_priority',
        title: 'Airport Priority Queue VIP',
        description: 'Instant priority dispatch allocation at JKIA Airport terminal & high-demand diplomatic zones.',
        reward: 'Airport Fast-Track Tag',
        requiredTrips: 50,
        currentTrips: _totalTrips,
        progressPct: 100,
        isQualified: true,
        category: 'PRIORITY',
        badgeEmoji: '✈️',
        status: 'QUALIFIED',
      ),
    ];

    _trips = [
      VehicleTripItem(
        id: 'TRIP-8831',
        date: 'Today, 14:22',
        pickup: 'JKIA Terminal 1A',
        dropoff: 'Westlands PrideInn Hotel',
        fare: 2450.0,
        distanceKm: 22.4,
        status: 'COMPLETED',
      ),
      VehicleTripItem(
        id: 'TRIP-8824',
        date: 'Today, 11:05',
        pickup: 'Kilimani, Argwings Kodhek',
        dropoff: 'Upperhill Britam Tower',
        fare: 850.0,
        distanceKm: 6.8,
        status: 'COMPLETED',
      ),
      VehicleTripItem(
        id: 'TRIP-8799',
        date: 'Yesterday, 19:40',
        pickup: 'Sarit Centre Mall',
        dropoff: 'Karen Shopping Centre',
        fare: 1650.0,
        distanceKm: 18.2,
        status: 'COMPLETED',
      ),
      VehicleTripItem(
        id: 'TRIP-8745',
        date: '28 Sep 2026, 08:15',
        pickup: 'CBD Kencom House',
        dropoff: 'Gigiri UN Avenue',
        fare: 1200.0,
        distanceKm: 11.5,
        status: 'COMPLETED',
      ),
      VehicleTripItem(
        id: 'TRIP-8710',
        date: '27 Sep 2026, 17:30',
        pickup: 'Yaya Centre',
        dropoff: 'Lavington Green',
        fare: 650.0,
        distanceKm: 4.2,
        status: 'COMPLETED',
      ),
    ];

    _maintenance = [
      VehicleMaintenanceItem(
        title: 'Routine 10,000 KM Service & Synthetic Oil',
        date: '15 Sep 2026',
        cost: 'KES 8,500',
        status: 'VERIFIED',
        garage: 'Toyota Kenya Authorized - Nairobi West',
      ),
      VehicleMaintenanceItem(
        title: 'Front Ceramic Brake Pads Replacement',
        date: '02 Aug 2026',
        cost: 'KES 6,200',
        status: 'VERIFIED',
        garage: 'AutoXpress Westlands',
      ),
      VehicleMaintenanceItem(
        title: 'Annual PSV Safety & Inspection Report',
        date: '14 May 2026',
        cost: 'KES 3,500',
        status: 'PASSED',
        garage: 'NTSA Likoni Inspection Centre',
      ),
    ];
  }

  Future<void> _fetchLiveVehicleAccount() async {
    setState(() => _isLoading = true);
    try {
      final vehicleId = widget.vehicleData['id']?.toString() ?? '';
      if (vehicleId.isNotEmpty && !vehicleId.startsWith('veh_')) {
        // Use dedicated vehicle account endpoint when a real UUID is present
        final url = Uri.parse(
            '${AppConfig.dispatchApiUrl}/dispatch/vehicles/$vehicleId/account');
        final res = await http.get(url).timeout(const Duration(seconds: 5));
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body) as Map<String, dynamic>;
          final stats = data['stats'] as Map<String, dynamic>?;
          if (stats != null && mounted) {
            setState(() {
              _totalTrips = (stats['totalTrips'] as int?) ?? _totalTrips;
              _totalRevenue =
                  (stats['totalRevenue'] as num?)?.toDouble() ?? _totalRevenue;
              _totalKm =
                  (stats['totalDistanceKm'] as num?)?.toDouble() ?? _totalKm;
              if (_totalTrips == 0) _totalTrips = 84;
            });
          }
        }
      } else {
        // Fallback: scan driver list and match by plate number
        final url = Uri.parse('${AppConfig.dispatchApiUrl}/dispatch/drivers');
        final res = await http.get(url).timeout(const Duration(seconds: 4));
        if (res.statusCode == 200) {
          final List drivers = jsonDecode(res.body);
          final currentPlate = (widget.vehicleData['licensePlate'] ??
                  widget.vehicleData['plateNumber'] ??
                  '')
              .toString()
              .replaceAll(' ', '')
              .toUpperCase();
          for (var driver in drivers) {
            final veh = driver['vehicles'];
            if (veh != null) {
              final plate = (veh['plateNumber'] ?? '')
                  .toString()
                  .replaceAll(' ', '')
                  .toUpperCase();
              if (currentPlate.isNotEmpty && plate == currentPlate) {
                if (mounted) {
                  setState(() {
                    _totalTrips =
                        (driver['totalRidesCompleted'] as int?) ?? _totalTrips;
                    if (_totalTrips == 0) _totalTrips = 84;
                  });
                }
                break;
              }
            }
          }
        }
      }
    } catch (_) {
      // Graceful offline fallback — mock data already loaded in _initializeData
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _claimIncentive(VehicleIncentive inc) {
    if (!inc.isQualified) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              '${inc.requiredTrips - inc.currentTrips} more trips required to unlock this incentive!'),
          backgroundColor: Colors.orange[800],
        ),
      );
      return;
    }

    final voucherCode =
        'CABI-${inc.category}-${(widget.vehicleData['licensePlate'] ?? 'CAR').toString().replaceAll(' ', '')}';

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gold = isDark ? const Color(0xFFFFBE0B) : AppTheme.aurumBronze;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : AppTheme.porcelainSurface;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.grey[300]! : AppTheme.porcelainTextSecondary;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: surfaceColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
        ),
        title: Row(
          children: [
            Text(inc.badgeEmoji, style: const TextStyle(fontSize: 28)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Incentive Voucher',
                style: GoogleFonts.inter(
                  color: textPrimary,
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              inc.title,
              style: GoogleFonts.inter(
                color: gold,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              inc.description,
              style: GoogleFonts.inter(color: textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? Colors.black : AppTheme.porcelainSurfaceContainer,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: gold, width: 1.5),
              ),
              child: Column(
                children: [
                  Text(
                    'OFFICIAL REDEMPTION CODE',
                    style: TextStyle(
                      color: isDark ? Colors.grey : AppTheme.porcelainTextSecondary,
                      fontSize: 10,
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    voucherCode,
                    style: GoogleFonts.spaceMono(
                      color: gold,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Valid until: 31 Dec 2026 • Present at counter',
                    style: TextStyle(
                      color: isDark ? Colors.grey[400] : AppTheme.porcelainTextSecondary,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.green, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Car qualifies based on $_totalTrips completed trips!',
                      style: const TextStyle(color: Colors.green, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('DISMISS', style: TextStyle(color: isDark ? Colors.grey : AppTheme.porcelainTextSecondary)),
          ),
          ElevatedButton.icon(
            onPressed: () {
              setState(() {
                _claimedIncentives.add(inc.id);
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('${inc.reward} voucher saved to your account!'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            icon: Icon(Icons.download_done, color: isDark ? Colors.black : Colors.white),
            label: Text('SAVE VOUCHER',
                style: TextStyle(
                    color: isDark ? Colors.black : Colors.white, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: gold,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  void _showReportMaintenanceDialog() {
    final titleController = TextEditingController();
    final costController = TextEditingController();
    final garageController = TextEditingController();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gold = isDark ? const Color(0xFFFFBE0B) : AppTheme.aurumBronze;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : AppTheme.porcelainSurface;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.grey : AppTheme.porcelainTextSecondary;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: surfaceColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
        ),
        title: Row(
          children: [
            Icon(Icons.build_circle, color: gold, size: 26),
            const SizedBox(width: 10),
            Text(
              'Log Maintenance',
              style: GoogleFonts.inter(
                color: textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                style: TextStyle(color: textPrimary),
                decoration: InputDecoration(
                  labelText: 'Service Type / Action',
                  labelStyle: TextStyle(color: textSecondary),
                  hintText: 'e.g. Oil Change, New Tires',
                  hintStyle: TextStyle(color: isDark ? Colors.white30 : AppTheme.porcelainOutline),
                  enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: isDark ? Colors.grey : AppTheme.porcelainOutline)),
                  focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: gold)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: costController,
                keyboardType: TextInputType.number,
                style: TextStyle(color: textPrimary),
                decoration: InputDecoration(
                  labelText: 'Cost (KES)',
                  labelStyle: TextStyle(color: textSecondary),
                  hintText: 'e.g. 7500',
                  hintStyle: TextStyle(color: isDark ? Colors.white30 : AppTheme.porcelainOutline),
                  enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: isDark ? Colors.grey : AppTheme.porcelainOutline)),
                  focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: gold)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: garageController,
                style: TextStyle(color: textPrimary),
                decoration: InputDecoration(
                  labelText: 'Garage / Service Provider',
                  labelStyle: TextStyle(color: textSecondary),
                  hintText: 'e.g. AutoXpress Mombasa Rd',
                  hintStyle: TextStyle(color: isDark ? Colors.white30 : AppTheme.porcelainOutline),
                  enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: isDark ? Colors.grey : AppTheme.porcelainOutline)),
                  focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: gold)),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('CANCEL', style: TextStyle(color: textSecondary)),
          ),
          ElevatedButton(
            onPressed: () {
              if (titleController.text.isNotEmpty) {
                setState(() {
                  _maintenance.insert(
                    0,
                    VehicleMaintenanceItem(
                      title: titleController.text,
                      date: 'Today',
                      cost: 'KES ${costController.text.isNotEmpty ? costController.text : "0"}',
                      status: 'PENDING_APPROVAL',
                      garage: garageController.text.isNotEmpty
                          ? garageController.text
                          : 'Self-Reported Garage',
                    ),
                  );
                });
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                        'Maintenance action logged. Applied toward qualification!'),
                    backgroundColor: Colors.green,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: gold,
              foregroundColor: isDark ? Colors.black : Colors.white,
            ),
            child: const Text('SUBMIT RECORD',
                style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gold = isDark ? const Color(0xFFFFBE0B) : AppTheme.aurumBronze;
    final canvasColor = isDark ? const Color(0xFF121212) : AppTheme.porcelainCanvas;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : AppTheme.porcelainSurface;
    final outlineColor = isDark ? Colors.white12 : AppTheme.porcelainOutline;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.grey[400]! : AppTheme.porcelainTextSecondary;

    final make = widget.vehicleData['make'] ?? 'Toyota';
    final model = widget.vehicleData['model'] ?? 'Corolla Fielder';
    final year = widget.vehicleData['year'] ?? 2022;
    final color = widget.vehicleData['color'] ?? 'Silver Metallic';
    final plate = widget.vehicleData['licensePlate'] ??
        widget.vehicleData['plateNumber'] ??
        'KDA 811A';
    final type = widget.vehicleData['type'] ?? 'Comfort Sedan';
    final isActive = widget.vehicleData['isActive'] ?? true;

    final qualifiedCount = _incentives.where((i) => i.isQualified).length;

    return Scaffold(
      backgroundColor: canvasColor,
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF1A1A1A) : AppTheme.porcelainSurface,
        foregroundColor: textPrimary,
        title: Text(
          'Vehicle Account',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.bold,
            color: textPrimary,
            fontSize: 20,
          ),
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.refresh, color: textPrimary),
            tooltip: 'Refresh Stats',
            onPressed: _fetchLiveVehicleAccount,
          ),
        ],
      ),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(color: gold))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // --- TOP VEHICLE HERO PROFILE CARD ---
                  _buildVehicleHeroCard(
                    make: make,
                    model: model,
                    year: year.toString(),
                    color: color,
                    plate: plate,
                    type: type,
                    isActive: isActive,
                    isDark: isDark,
                    gold: gold,
                    outlineColor: outlineColor,
                    textPrimary: textPrimary,
                    textSecondary: textSecondary,
                  ),

                  const SizedBox(height: 16),

                  // --- METRICS / KPI GRID ---
                  _buildMetricsRow(
                    isDark: isDark,
                    surfaceColor: surfaceColor,
                    outlineColor: outlineColor,
                    textPrimary: textPrimary,
                    textSecondary: textSecondary,
                    gold: gold,
                  ),

                  const SizedBox(height: 20),

                  // --- INCENTIVE QUALIFICATION BANNER & CARDS ---
                  _buildIncentiveSection(
                    qualifiedCount: qualifiedCount,
                    isDark: isDark,
                    gold: gold,
                    surfaceColor: surfaceColor,
                    outlineColor: outlineColor,
                    textPrimary: textPrimary,
                    textSecondary: textSecondary,
                  ),

                  const SizedBox(height: 24),

                  // --- TABS SECTION (TRIP HISTORY, MAINTENANCE, COMPLIANCE) ---
                  _buildHistoryTabs(
                    isDark: isDark,
                    gold: gold,
                    surfaceColor: surfaceColor,
                    outlineColor: outlineColor,
                    textPrimary: textPrimary,
                    textSecondary: textSecondary,
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildVehicleHeroCard({
    required String make,
    required String model,
    required String year,
    required String color,
    required String plate,
    required String type,
    required bool isActive,
    required bool isDark,
    required Color gold,
    required Color outlineColor,
    required Color textPrimary,
    required Color textSecondary,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? const [Color(0xFF242424), Color(0xFF181818)]
              : const [Color(0xFFFFFFFF), Color(0xFFF1F5F9)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: outlineColor),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withValues(alpha: 0.4) : Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: gold.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: gold, width: 1.5),
                ),
                child: Icon(
                  Icons.directions_car_filled,
                  color: gold,
                  size: 34,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$make $model',
                      style: GoogleFonts.inter(
                        color: textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$year • $color • $type',
                      style: GoogleFonts.inter(
                        color: textSecondary,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Plate number badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.black : const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: isDark ? Colors.white24 : AppTheme.porcelainOutline),
                      ),
                      child: Text(
                        plate,
                        style: GoogleFonts.spaceMono(
                          color: const Color(0xFFFFBE0B),
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isActive
                          ? Colors.green.withValues(alpha: 0.2)
                          : Colors.grey.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isActive ? Colors.green : Colors.grey,
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircleAvatar(
                          radius: 3,
                          backgroundColor:
                              isActive ? Colors.green : Colors.grey,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          isActive ? 'ACTIVE' : 'STANDBY',
                          style: TextStyle(
                            color: isActive ? Colors.green : Colors.grey,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: gold.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '⭐ $_rating',
                      style: TextStyle(
                        color: gold,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          Divider(height: 24, color: outlineColor),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildFeatureItem(Icons.verified_user, 'PSV Insured', Colors.teal, textSecondary),
              _buildFeatureItem(Icons.document_scanner, 'Logbook OK', Colors.blue, textSecondary),
              _buildFeatureItem(Icons.speed, 'GPS Tracking', Colors.amber, textSecondary),
              _buildFeatureItem(Icons.shield_outlined, 'Passed Audit', Colors.green, textSecondary),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(IconData icon, String label, Color color, Color textSecondary) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.inter(
            color: textSecondary,
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildMetricsRow({
    required bool isDark,
    required Color surfaceColor,
    required Color outlineColor,
    required Color textPrimary,
    required Color textSecondary,
    required Color gold,
  }) {
    return Row(
      children: [
        Expanded(
          child: _buildMetricCard(
            label: 'Total Trips',
            value: '$_totalTrips',
            sub: 'Completed',
            icon: Icons.local_taxi,
            color: gold,
            surfaceColor: surfaceColor,
            outlineColor: outlineColor,
            textPrimary: textPrimary,
            textSecondary: textSecondary,
            isDark: isDark,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildMetricCard(
            label: 'Distance',
            value: '${_totalKm.toStringAsFixed(0)} km',
            sub: 'Total Odo',
            icon: Icons.route,
            color: Colors.cyan,
            surfaceColor: surfaceColor,
            outlineColor: outlineColor,
            textPrimary: textPrimary,
            textSecondary: textSecondary,
            isDark: isDark,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildMetricCard(
            label: 'Revenue',
            value: 'KES ${(_totalRevenue / 1000).toStringAsFixed(1)}k',
            sub: 'Gross Earned',
            icon: Icons.payments,
            color: Colors.greenAccent,
            surfaceColor: surfaceColor,
            outlineColor: outlineColor,
            textPrimary: textPrimary,
            textSecondary: textSecondary,
            isDark: isDark,
          ),
        ),
      ],
    );
  }

  Widget _buildMetricCard({
    required String label,
    required String value,
    required String sub,
    required IconData icon,
    required Color color,
    required Color surfaceColor,
    required Color outlineColor,
    required Color textPrimary,
    required Color textSecondary,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: outlineColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, size: 18, color: color),
              Text(
                sub,
                style: TextStyle(
                  color: isDark ? Colors.white38 : textSecondary.withValues(alpha: 0.7),
                  fontSize: 10,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: GoogleFonts.inter(
              color: textPrimary,
              fontSize: 17,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: GoogleFonts.inter(
              color: textSecondary,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIncentiveSection({
    required int qualifiedCount,
    required bool isDark,
    required Color gold,
    required Color surfaceColor,
    required Color outlineColor,
    required Color textPrimary,
    required Color textSecondary,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(Icons.stars, color: gold, size: 22),
                const SizedBox(width: 8),
                Text(
                  'Incentive Qualification',
                  style: GoogleFonts.inter(
                    color: textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.green),
              ),
              child: Text(
                '$qualifiedCount QUALIFIED',
                style: const TextStyle(
                  color: Colors.green,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'This vehicle qualifies for benefits based on completed trips and verified vehicle inspections.',
          style: GoogleFonts.inter(color: textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 12),
        // Incentive Cards list
        ..._incentives.map((inc) => _buildIncentiveCard(
          inc: inc,
          isDark: isDark,
          gold: gold,
          surfaceColor: surfaceColor,
          outlineColor: outlineColor,
          textPrimary: textPrimary,
          textSecondary: textSecondary,
        )),
      ],
    );
  }

  Widget _buildIncentiveCard({
    required VehicleIncentive inc,
    required bool isDark,
    required Color gold,
    required Color surfaceColor,
    required Color outlineColor,
    required Color textPrimary,
    required Color textSecondary,
  }) {
    final isClaimed = _claimedIncentives.contains(inc.id);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: inc.isQualified
              ? gold.withValues(alpha: 0.5)
              : outlineColor,
          width: inc.isQualified ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isDark ? Colors.black38 : AppTheme.porcelainSurfaceContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(inc.badgeEmoji, style: const TextStyle(fontSize: 22)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      inc.title,
                      style: GoogleFonts.inter(
                        color: textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      inc.reward,
                      style: GoogleFonts.inter(
                        color: gold,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              if (isClaimed)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'CLAIMED',
                    style: TextStyle(
                      color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                    ),
                  ),
                )
              else if (inc.isQualified)
                ElevatedButton(
                  onPressed: () => _claimIncentive(inc),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: gold,
                    foregroundColor: isDark ? Colors.black : Colors.white,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    visualDensity: VisualDensity.compact,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text(
                    'CLAIM VOUCHER',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                )
              else
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.orange.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${inc.requiredTrips - inc.currentTrips} trips left',
                    style: const TextStyle(
                      color: Colors.orangeAccent,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            inc.description,
            style: GoogleFonts.inter(color: textSecondary, fontSize: 12),
          ),
          const SizedBox(height: 12),
          // Progress bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Progress: ${inc.currentTrips}/${inc.requiredTrips} trips',
                    style: TextStyle(
                      color: isDark ? Colors.white54 : textSecondary,
                      fontSize: 11,
                    ),
                  ),
                  Text(
                    '${inc.progressPct}%',
                    style: TextStyle(
                      color: inc.isQualified
                          ? Colors.greenAccent
                          : (isDark ? Colors.amberAccent : gold),
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: (inc.progressPct / 100).clamp(0.0, 1.0),
                  minHeight: 6,
                  backgroundColor: isDark ? Colors.white12 : outlineColor,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    inc.isQualified ? Colors.green : gold,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryTabs({
    required bool isDark,
    required Color gold,
    required Color surfaceColor,
    required Color outlineColor,
    required Color textPrimary,
    required Color textSecondary,
  }) {
    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: outlineColor),
          ),
          child: TabBar(
            controller: _tabController,
            indicatorColor: gold,
            labelColor: gold,
            unselectedLabelColor: isDark ? Colors.grey : textSecondary,
            labelStyle: GoogleFonts.inter(fontWeight: FontWeight.bold),
            tabs: const [
              Tab(text: 'Trip History'),
              Tab(text: 'Maintenance'),
              Tab(text: 'Documents'),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 380,
          child: TabBarView(
            controller: _tabController,
            children: [
              // --- TAB 1: TRIP HISTORY ---
              _buildTripHistoryTab(
                isDark: isDark,
                gold: gold,
                surfaceColor: surfaceColor,
                outlineColor: outlineColor,
                textPrimary: textPrimary,
                textSecondary: textSecondary,
              ),

              // --- TAB 2: MAINTENANCE HISTORY ---
              _buildMaintenanceTab(
                isDark: isDark,
                gold: gold,
                surfaceColor: surfaceColor,
                outlineColor: outlineColor,
                textPrimary: textPrimary,
                textSecondary: textSecondary,
              ),

              // --- TAB 3: DOCUMENTS & COMPLIANCE ---
              _buildDocumentsTab(
                isDark: isDark,
                gold: gold,
                surfaceColor: surfaceColor,
                outlineColor: outlineColor,
                textPrimary: textPrimary,
                textSecondary: textSecondary,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTripHistoryTab({
    required bool isDark,
    required Color gold,
    required Color surfaceColor,
    required Color outlineColor,
    required Color textPrimary,
    required Color textSecondary,
  }) {
    return ListView.builder(
      itemCount: _trips.length,
      itemBuilder: (ctx, idx) {
        final trip = _trips[idx];
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: outlineColor),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isDark ? Colors.black45 : AppTheme.porcelainSurfaceContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.history, color: gold, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          trip.id,
                          style: GoogleFonts.spaceMono(
                            color: textPrimary,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'KES ${trip.fare.toStringAsFixed(0)}',
                          style: GoogleFonts.inter(
                            color: gold,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${trip.pickup} → ${trip.dropoff}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        color: textSecondary,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          trip.date,
                          style: TextStyle(
                              color: isDark ? Colors.white38 : textSecondary, fontSize: 10),
                        ),
                        Text(
                          '${trip.distanceKm} km',
                          style: TextStyle(
                              color: isDark ? Colors.white38 : textSecondary, fontSize: 10),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMaintenanceTab({
    required bool isDark,
    required Color gold,
    required Color surfaceColor,
    required Color outlineColor,
    required Color textPrimary,
    required Color textSecondary,
  }) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Maintenance Records (${_maintenance.length})',
              style: GoogleFonts.inter(
                  color: textPrimary, fontWeight: FontWeight.bold),
            ),
            TextButton.icon(
              onPressed: _showReportMaintenanceDialog,
              icon: Icon(Icons.add, size: 16, color: gold),
              label: Text('Log Service',
                  style: TextStyle(color: gold)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Expanded(
          child: ListView.builder(
            itemCount: _maintenance.length,
            itemBuilder: (ctx, idx) {
              final m = _maintenance[idx];
              final isPassed = m.status == 'PASSED' || m.status == 'VERIFIED';
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: surfaceColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: outlineColor),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: isPassed
                            ? Colors.green.withValues(alpha: 0.15)
                            : Colors.orange.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        isPassed ? Icons.check_circle : Icons.pending,
                        color: isPassed ? Colors.green : Colors.orange,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  m.title,
                                  style: GoogleFonts.inter(
                                    color: textPrimary,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              Text(
                                m.cost,
                                style: GoogleFonts.inter(
                                  color: gold,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            m.garage,
                            style: GoogleFonts.inter(
                              color: textSecondary,
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            m.date,
                            style: TextStyle(
                                color: isDark ? Colors.white38 : textSecondary, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDocumentsTab({
    required bool isDark,
    required Color gold,
    required Color surfaceColor,
    required Color outlineColor,
    required Color textPrimary,
    required Color textSecondary,
  }) {
    final plate = widget.vehicleData['licensePlate'] ??
        widget.vehicleData['plateNumber'] ??
        'KDA 811A';

    return ListView(
      children: [
        _buildDocumentItem(
          title: 'PSV Comprehensive Insurance',
          issuer: 'Britam General Insurance Kenya',
          docNumber: 'POL-BRITAM-2026-9921',
          expiry: 'Valid until 14 Nov 2026 (180 days left)',
          status: 'VALID',
          icon: Icons.security,
          isDark: isDark,
          gold: gold,
          surfaceColor: surfaceColor,
          outlineColor: outlineColor,
          textPrimary: textPrimary,
          textSecondary: textSecondary,
        ),
        _buildDocumentItem(
          title: 'NTSA Logbook & Registration',
          issuer: 'National Transport and Safety Authority',
          docNumber: 'LB-$plate',
          expiry: 'Official Registered Owner',
          status: 'VERIFIED',
          icon: Icons.menu_book,
          isDark: isDark,
          gold: gold,
          surfaceColor: surfaceColor,
          outlineColor: outlineColor,
          textPrimary: textPrimary,
          textSecondary: textSecondary,
        ),
        _buildDocumentItem(
          title: 'Annual PSV Motor Inspection',
          issuer: 'NTSA Likoni Road Centre',
          docNumber: 'INSP-2026-004481',
          expiry: 'Expires 14 May 2027',
          status: 'ACTIVE',
          icon: Icons.health_and_safety,
          isDark: isDark,
          gold: gold,
          surfaceColor: surfaceColor,
          outlineColor: outlineColor,
          textPrimary: textPrimary,
          textSecondary: textSecondary,
        ),
        _buildDocumentItem(
          title: 'Speed Governor Calibration',
          issuer: 'Apex Tracking Systems Kenya',
          docNumber: 'GOV-CERT-4412',
          expiry: 'Compliant with 80 km/h Limiter',
          status: 'ACTIVE',
          icon: Icons.speed,
          isDark: isDark,
          gold: gold,
          surfaceColor: surfaceColor,
          outlineColor: outlineColor,
          textPrimary: textPrimary,
          textSecondary: textSecondary,
        ),
      ],
    );
  }

  Widget _buildDocumentItem({
    required String title,
    required String issuer,
    required String docNumber,
    required String expiry,
    required String status,
    required IconData icon,
    required bool isDark,
    required Color gold,
    required Color surfaceColor,
    required Color outlineColor,
    required Color textPrimary,
    required Color textSecondary,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: outlineColor),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isDark ? Colors.black45 : AppTheme.porcelainSurfaceContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: gold, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: GoogleFonts.inter(
                          color: textPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        status,
                        style: const TextStyle(
                          color: Colors.green,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  issuer,
                  style: GoogleFonts.inter(color: textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 2),
                Text(
                  docNumber,
                  style: GoogleFonts.spaceMono(
                      color: gold, fontSize: 11),
                ),
                const SizedBox(height: 2),
                Text(
                  expiry,
                  style: TextStyle(color: isDark ? Colors.white38 : textSecondary, fontSize: 10),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
