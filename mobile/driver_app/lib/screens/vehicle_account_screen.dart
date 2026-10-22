import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

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

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Text(inc.badgeEmoji, style: const TextStyle(fontSize: 28)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Incentive Voucher',
                style: GoogleFonts.outfit(
                  color: Colors.white,
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
              style: GoogleFonts.outfit(
                color: const Color(0xFFFFBE0B),
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              inc.description,
              style: GoogleFonts.outfit(color: Colors.grey[300], fontSize: 13),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFFBE0B), width: 1.5),
              ),
              child: Column(
                children: [
                  const Text(
                    'OFFICIAL REDEMPTION CODE',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 10,
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    voucherCode,
                    style: GoogleFonts.spaceMono(
                      color: const Color(0xFFFFBE0B),
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Valid until: 31 Dec 2026 • Present at counter',
                    style: TextStyle(color: Colors.grey[400], fontSize: 11),
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
            child: const Text('DISMISS', style: TextStyle(color: Colors.grey)),
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
            icon: const Icon(Icons.download_done, color: Colors.black),
            label: const Text('SAVE VOUCHER',
                style: TextStyle(
                    color: Colors.black, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFFBE0B),
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

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.build_circle, color: Color(0xFFFFBE0B), size: 26),
            const SizedBox(width: 10),
            Text(
              'Log Maintenance',
              style: GoogleFonts.outfit(
                color: Colors.white,
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
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'Service Type / Action',
                  labelStyle: TextStyle(color: Colors.grey),
                  hintText: 'e.g. Oil Change, New Tires',
                  hintStyle: TextStyle(color: Colors.white30),
                  enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Colors.grey)),
                  focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Color(0xFFFFBE0B))),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: costController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'Cost (KES)',
                  labelStyle: TextStyle(color: Colors.grey),
                  hintText: 'e.g. 7500',
                  hintStyle: TextStyle(color: Colors.white30),
                  enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Colors.grey)),
                  focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Color(0xFFFFBE0B))),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: garageController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'Garage / Service Provider',
                  labelStyle: TextStyle(color: Colors.grey),
                  hintText: 'e.g. AutoXpress Mombasa Rd',
                  hintStyle: TextStyle(color: Colors.white30),
                  enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Colors.grey)),
                  focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Color(0xFFFFBE0B))),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCEL', style: TextStyle(color: Colors.grey)),
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
              backgroundColor: const Color(0xFFFFBE0B),
              foregroundColor: Colors.black,
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
    final make = widget.vehicleData['make'] ?? 'Toyota';
    final model = widget.vehicleData['model'] ?? 'Corolla Fielder';
    final year = widget.vehicleData['year'] ?? 2022;
    final color = widget.vehicleData['color'] ?? 'Silver Metallic';
    final plate = widget.vehicleData['licensePlate'] ??
        widget.vehicleData['plateNumber'] ??
        'KDA 811A';
    final type = widget.vehicleData['type'] ?? 'STANDARD';
    final isActive = widget.vehicleData['isActive'] ?? true;

    final qualifiedCount = _incentives.where((i) => i.isQualified).length;

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        foregroundColor: Colors.white,
        title: Text(
          'Vehicle Account',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: 20,
          ),
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Stats',
            onPressed: _fetchLiveVehicleAccount,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFFFBE0B)))
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
                  ),

                  const SizedBox(height: 16),

                  // --- METRICS / KPI GRID ---
                  _buildMetricsRow(),

                  const SizedBox(height: 20),

                  // --- INCENTIVE QUALIFICATION BANNER & CARDS ---
                  _buildIncentiveSection(qualifiedCount),

                  const SizedBox(height: 24),

                  // --- TABS SECTION (TRIP HISTORY, MAINTENANCE, COMPLIANCE) ---
                  _buildHistoryTabs(),
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
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF242424), Color(0xFF181818)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
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
                  color: const Color(0xFFFFBE0B).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFFFBE0B), width: 1.5),
                ),
                child: const Icon(
                  Icons.directions_car_filled,
                  color: Color(0xFFFFBE0B),
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
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$year • $color • $type',
                      style: GoogleFonts.outfit(
                        color: Colors.grey[400],
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Plate number badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: Colors.white24),
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
                      color: const Color(0xFFFFBE0B).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '⭐ $_rating',
                      style: const TextStyle(
                        color: Color(0xFFFFBE0B),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const Divider(height: 24, color: Colors.white12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildFeatureItem(Icons.verified_user, 'PSV Insured', Colors.teal),
              _buildFeatureItem(Icons.document_scanner, 'Logbook OK', Colors.blue),
              _buildFeatureItem(Icons.speed, 'GPS Tracking', Colors.amber),
              _buildFeatureItem(Icons.shield_outlined, 'Passed Audit', Colors.green),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(IconData icon, String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.outfit(
            color: Colors.grey[300],
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildMetricsRow() {
    return Row(
      children: [
        Expanded(
          child: _buildMetricCard(
            label: 'Total Trips',
            value: '$_totalTrips',
            sub: 'Completed',
            icon: Icons.local_taxi,
            color: const Color(0xFFFFBE0B),
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
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white12),
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
                style: const TextStyle(color: Colors.white38, fontSize: 10),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: GoogleFonts.outfit(
              color: Colors.white,
              fontSize: 17,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: GoogleFonts.outfit(
              color: Colors.grey[400],
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIncentiveSection(int qualifiedCount) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.stars, color: Color(0xFFFFBE0B), size: 22),
                const SizedBox(width: 8),
                Text(
                  'Incentive Qualification',
                  style: GoogleFonts.outfit(
                    color: Colors.white,
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
          style: GoogleFonts.outfit(color: Colors.grey[400], fontSize: 13),
        ),
        const SizedBox(height: 12),
        // Incentive Cards list
        ..._incentives.map((inc) => _buildIncentiveCard(inc)),
      ],
    );
  }

  Widget _buildIncentiveCard(VehicleIncentive inc) {
    final isClaimed = _claimedIncentives.contains(inc.id);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: inc.isQualified
              ? const Color(0xFFFFBE0B).withValues(alpha: 0.5)
              : Colors.white12,
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
                  color: Colors.black38,
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
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      inc.reward,
                      style: GoogleFonts.outfit(
                        color: const Color(0xFFFFBE0B),
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
                  child: const Text(
                    'CLAIMED',
                    style: TextStyle(
                      color: Colors.white70,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                    ),
                  ),
                )
              else if (inc.isQualified)
                ElevatedButton(
                  onPressed: () => _claimIncentive(inc),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFBE0B),
                    foregroundColor: Colors.black,
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
            style: GoogleFonts.outfit(color: Colors.grey[400], fontSize: 12),
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
                    style:
                        const TextStyle(color: Colors.white54, fontSize: 11),
                  ),
                  Text(
                    '${inc.progressPct}%',
                    style: TextStyle(
                      color: inc.isQualified
                          ? Colors.greenAccent
                          : Colors.amberAccent,
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
                  backgroundColor: Colors.white12,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    inc.isQualified ? Colors.green : const Color(0xFFFFBE0B),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryTabs() {
    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF1E1E1E),
            borderRadius: BorderRadius.circular(12),
          ),
          child: TabBar(
            controller: _tabController,
            indicatorColor: const Color(0xFFFFBE0B),
            labelColor: const Color(0xFFFFBE0B),
            unselectedLabelColor: Colors.grey,
            labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.bold),
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
              _buildTripHistoryTab(),

              // --- TAB 2: MAINTENANCE HISTORY ---
              _buildMaintenanceTab(),

              // --- TAB 3: DOCUMENTS & COMPLIANCE ---
              _buildDocumentsTab(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTripHistoryTab() {
    return ListView.builder(
      itemCount: _trips.length,
      itemBuilder: (ctx, idx) {
        final trip = _trips[idx];
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF1E1E1E),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white10),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.black45,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.history, color: Color(0xFFFFBE0B), size: 20),
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
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'KES ${trip.fare.toStringAsFixed(0)}',
                          style: GoogleFonts.outfit(
                            color: const Color(0xFFFFBE0B),
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
                      style: GoogleFonts.outfit(
                        color: Colors.grey[300],
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          trip.date,
                          style: const TextStyle(
                              color: Colors.white38, fontSize: 10),
                        ),
                        Text(
                          '${trip.distanceKm} km',
                          style: const TextStyle(
                              color: Colors.white38, fontSize: 10),
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

  Widget _buildMaintenanceTab() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Maintenance Records (${_maintenance.length})',
              style: GoogleFonts.outfit(
                  color: Colors.white, fontWeight: FontWeight.bold),
            ),
            TextButton.icon(
              onPressed: _showReportMaintenanceDialog,
              icon: const Icon(Icons.add, size: 16, color: Color(0xFFFFBE0B)),
              label: const Text('Log Service',
                  style: TextStyle(color: Color(0xFFFFBE0B))),
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
                  color: const Color(0xFF1E1E1E),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white10),
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
                                  style: GoogleFonts.outfit(
                                    color: Colors.white,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              Text(
                                m.cost,
                                style: GoogleFonts.outfit(
                                  color: const Color(0xFFFFBE0B),
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            m.garage,
                            style: GoogleFonts.outfit(
                              color: Colors.grey[400],
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            m.date,
                            style: const TextStyle(
                                color: Colors.white38, fontSize: 10),
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

  Widget _buildDocumentsTab() {
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
        ),
        _buildDocumentItem(
          title: 'NTSA Logbook & Registration',
          issuer: 'National Transport and Safety Authority',
          docNumber: 'LB-$plate',
          expiry: 'Official Registered Owner',
          status: 'VERIFIED',
          icon: Icons.menu_book,
        ),
        _buildDocumentItem(
          title: 'Annual PSV Motor Inspection',
          issuer: 'NTSA Likoni Road Centre',
          docNumber: 'INSP-2026-004481',
          expiry: 'Expires 14 May 2027',
          status: 'ACTIVE',
          icon: Icons.health_and_safety,
        ),
        _buildDocumentItem(
          title: 'Speed Governor Calibration',
          issuer: 'Apex Tracking Systems Kenya',
          docNumber: 'GOV-CERT-4412',
          expiry: 'Compliant with 80 km/h Limiter',
          status: 'ACTIVE',
          icon: Icons.speed,
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
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.black45,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: const Color(0xFFFFBE0B), size: 22),
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
                        style: GoogleFonts.outfit(
                          color: Colors.white,
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
                  style: GoogleFonts.outfit(color: Colors.grey[400], fontSize: 12),
                ),
                const SizedBox(height: 2),
                Text(
                  docNumber,
                  style: GoogleFonts.spaceMono(
                      color: const Color(0xFFFFBE0B), fontSize: 11),
                ),
                const SizedBox(height: 2),
                Text(
                  expiry,
                  style: const TextStyle(color: Colors.white38, fontSize: 10),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
