import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';

class PassengerScheduledRide {
  final String id;
  final String destination;
  final String pickupLocation;
  final DateTime scheduledTime;
  final String tier;
  final double fareKES;
  final String? assignedChauffeur;
  final String? vehicleInfo;
  final double? rating;
  final String status;

  const PassengerScheduledRide({
    required this.id,
    required this.destination,
    required this.pickupLocation,
    required this.scheduledTime,
    required this.tier,
    required this.fareKES,
    this.assignedChauffeur,
    this.vehicleInfo,
    this.rating,
    this.status = 'CONFIRMED',
  });
}

class ScheduledRidesScreen extends ConsumerStatefulWidget {
  const ScheduledRidesScreen({super.key});

  @override
  ConsumerState<ScheduledRidesScreen> createState() => _ScheduledRidesScreenState();
}

class _ScheduledRidesScreenState extends ConsumerState<ScheduledRidesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<PassengerScheduledRide> _upcomingRides = [
    PassengerScheduledRide(
      id: 'SCH-8821',
      pickupLocation: 'Villa Rosa Kempinski Residences, Westlands',
      destination: 'JKIA VIP Presidential Terminal, Embakasi',
      scheduledTime: DateTime.now().add(const Duration(hours: 4, minutes: 30)),
      tier: 'CABI EXEC',
      fareKES: 3200.0,
      assignedChauffeur: 'Samuel Mwangi',
      vehicleInfo: 'Mercedes-Benz E200 · KDA 482B',
      rating: 4.98,
      status: 'CHAUFFEUR ASSIGNED',
    ),
    PassengerScheduledRide(
      id: 'SCH-8902',
      pickupLocation: 'Delta Corner Tower B, Chiromo Rd',
      destination: 'Muthaiga Country Club, Main Pavilion',
      scheduledTime: DateTime.now().add(const Duration(days: 1, hours: 2)),
      tier: 'CABI COMFORT',
      fareKES: 950.0,
      assignedChauffeur: 'Patrick Koech',
      vehicleInfo: 'Toyota Camry Hybrid · KDD 193A',
      rating: 4.95,
      status: 'CONFIRMED',
    ),
  ];

  final List<PassengerScheduledRide> _historyRides = [
    PassengerScheduledRide(
      id: 'SCH-7719',
      pickupLocation: 'Nairobi Serena Hotel',
      destination: 'Sarit Centre Gate 2',
      scheduledTime: DateTime.now().subtract(const Duration(days: 3)),
      tier: 'CABI EXEC',
      fareKES: 1200.0,
      assignedChauffeur: 'Joseph Ndungu',
      vehicleInfo: 'BMW 5 Series · KCS 772Z',
      rating: 5.0,
      status: 'COMPLETED',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _formatDateTime(DateTime dt) {
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    final hour = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
    final ampm = dt.hour >= 12 ? 'PM' : 'AM';
    final minuteStr = dt.minute.toString().padLeft(2, '0');
    return '${months[dt.month - 1]} ${dt.day}, $hour:$minuteStr $ampm';
  }

  void _cancelRide(PassengerScheduledRide ride, {required bool isDark}) {
    final surfaceColor = isDark ? const Color(0xFF18181E) : AppTheme.porcelainSurface;
    final borderColor = isDark ? AppTheme.outlineGold : AppTheme.aurumBronze;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;
    final keepBtnColor = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: surfaceColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: borderColor),
        ),
        title: Text(
          'Cancel Scheduled Ride?',
          style: AppTheme.outfit(color: textPrimary, fontWeight: FontWeight.w700),
        ),
        content: Text(
          'Are you sure you want to cancel ride #${ride.id} to ${ride.destination}? No cancellation fee applies 2+ hours prior.',
          style: AppTheme.inter(color: textSecondary, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Keep Ride', style: TextStyle(color: keepBtnColor)),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _upcomingRides.removeWhere((r) => r.id == ride.id);
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Reservation cancelled.')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.errorRed),
            child: const Text('Cancel Ride', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gold = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final canvasColor = isDark ? const Color(0xFF0D0D0E) : AppTheme.porcelainCanvas;
    final appBarColor = isDark ? const Color(0xFF121215) : AppTheme.porcelainSurface;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final bottomSheetColor = isDark ? const Color(0xFF121216) : AppTheme.porcelainSurface;
    final bottomBorderColor = isDark ? Colors.white12 : AppTheme.porcelainOutline;

    return Scaffold(
      backgroundColor: canvasColor,
      appBar: AppBar(
        backgroundColor: appBarColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Scheduled Chauffeurs',
          style: AppTheme.outfit(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: gold.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.verified_user_rounded, color: gold, size: 14),
                const SizedBox(width: 4),
                Text(
                  'Guaranteed Lock',
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
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: gold,
          labelColor: gold,
          unselectedLabelColor: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
          labelStyle: AppTheme.inter(fontSize: 13, fontWeight: FontWeight.w700),
          tabs: [
            Tab(text: 'Upcoming (${_upcomingRides.length})'),
            const Tab(text: 'History'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildRidesList(_upcomingRides, isUpcoming: true, isDark: isDark),
          _buildRidesList(_historyRides, isUpcoming: false, isDark: isDark),
        ],
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
          color: bottomSheetColor,
          border: Border(top: BorderSide(color: bottomBorderColor)),
        ),
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context); // Go to main booking
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: gold,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: 4,
            ),
            icon: const Icon(Icons.calendar_month_rounded, size: 20, color: Colors.black),
            label: Text(
              'Schedule New Executive Ride',
              style: AppTheme.outfit(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Colors.black,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRidesList(List<PassengerScheduledRide> rides, {required bool isUpcoming, required bool isDark}) {
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final gold = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;

    if (rides.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calendar_today_rounded, size: 64, color: isDark ? Colors.white24 : AppTheme.porcelainOutline),
            const SizedBox(height: 16),
            Text(
              isUpcoming ? 'No upcoming scheduled rides' : 'No past scheduled rides',
              style: AppTheme.outfit(fontSize: 16, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary),
            ),
            const SizedBox(height: 6),
            Text(
              'Reserve an executive chauffeur in advance',
              style: AppTheme.inter(fontSize: 12, color: isDark ? Colors.white38 : AppTheme.porcelainOutline),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 90),
      itemCount: rides.length,
      itemBuilder: (context, index) {
        final ride = rides[index];
        return _buildRideCard(ride, isUpcoming: isUpcoming, isDark: isDark, gold: gold, textPrimary: textPrimary);
      },
    );
  }

  Widget _buildRideCard(PassengerScheduledRide ride, {
    required bool isUpcoming,
    required bool isDark,
    required Color gold,
    required Color textPrimary,
  }) {
    final cardColor = isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface;
    final cardBorderColor = isDark ? AppTheme.outlineGold : AppTheme.aurumBronze;
    final textSecondary = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;
    final dividerColor = isDark ? Colors.white24 : AppTheme.porcelainOutline;
    final chauffeurCardColor = isDark ? const Color(0xFF1B1B22) : AppTheme.porcelainSurfaceContainer;
    final chauffeurBorderColor = isDark ? Colors.white10 : AppTheme.porcelainOutline;
    final chauffeurAvatarBg = isDark ? const Color(0xFF26262E) : AppTheme.porcelainSurfaceContainer;
    final fareLabel = isDark ? Colors.white38 : AppTheme.porcelainTextSecondary;
    final calendarBg = isDark ? const Color(0xFF22222A) : AppTheme.porcelainSurfaceContainer;
    final calendarBorder = isDark ? AppTheme.outlineGold : AppTheme.aurumBronze;
    final statusAssignedBg = ride.status == 'CHAUFFEUR ASSIGNED'
        ? AppTheme.successGreen.withValues(alpha: 0.15)
        : (isDark ? Colors.white.withValues(alpha: 0.08) : AppTheme.porcelainSurfaceContainer);
    final statusAssignedBorder = ride.status == 'CHAUFFEUR ASSIGNED'
        ? AppTheme.successGreen.withValues(alpha: 0.4)
        : (isDark ? Colors.white12 : AppTheme.porcelainOutline);
    final statusAssignedText = ride.status == 'CHAUFFEUR ASSIGNED'
        ? AppTheme.successGreen
        : (isDark ? Colors.white70 : AppTheme.porcelainTextSecondary);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cardBorderColor),
        boxShadow: const [
          BoxShadow(
            color: Color(0x14000000),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  gradient: AppTheme.goldGradient,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  ride.tier,
                  style: AppTheme.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: Colors.black,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusAssignedBg,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: statusAssignedBorder),
                ),
                child: Text(
                  ride.status,
                  style: AppTheme.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: statusAssignedText,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Date & Time Banner
          Row(
            children: [
              Icon(Icons.schedule_rounded, color: gold, size: 18),
              const SizedBox(width: 8),
              Text(
                _formatDateTime(ride.scheduledTime),
                style: AppTheme.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Origin and Destination Nodes
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: gold,
                      shape: BoxShape.circle,
                    ),
                  ),
                  Container(width: 2, height: 26, color: dividerColor),
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppTheme.successGreen,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ride.pickupLocation,
                      style: AppTheme.inter(
                        fontSize: 12,
                        color: textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      ride.destination,
                      style: AppTheme.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Chauffeur Allocation Info
          if (ride.assignedChauffeur != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: chauffeurCardColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: chauffeurBorderColor),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: gold),
                      color: chauffeurAvatarBg,
                    ),
                    child: Icon(Icons.person_rounded, color: gold, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          ride.assignedChauffeur!,
                          style: AppTheme.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: textPrimary,
                          ),
                        ),
                        if (ride.vehicleInfo != null)
                          Text(
                            ride.vehicleInfo!,
                            style: AppTheme.inter(fontSize: 11, color: textSecondary),
                          ),
                      ],
                    ),
                  ),
                  if (ride.rating != null)
                    Row(
                      children: [
                        Icon(Icons.star_rounded, color: gold, size: 14),
                        const SizedBox(width: 2),
                        Text(
                          ride.rating!.toStringAsFixed(2),
                          style: AppTheme.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: gold,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],

          // Upfront Lock Fare and Actions
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'LOCKED UPFRONT FARE',
                    style: AppTheme.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: fareLabel,
                    ),
                  ),
                  Text(
                    'KES ${ride.fareKES.toStringAsFixed(0)}',
                    style: AppTheme.montserrat(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: gold,
                    ),
                  ),
                ],
              ),
              if (isUpcoming)
                Row(
                  children: [
                    OutlinedButton(
                      onPressed: () => _cancelRide(ride, isDark: isDark),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.errorRed,
                        side: const BorderSide(color: Color(0x66EF4444)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        minimumSize: Size.zero,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text('Cancel', style: AppTheme.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Reservation added to calendar')),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: calendarBg,
                        foregroundColor: gold,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        minimumSize: Size.zero,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                          side: BorderSide(color: calendarBorder),
                        ),
                      ),
                      icon: const Icon(Icons.event_available_rounded, size: 14),
                      label: Text('Calendar', style: AppTheme.inter(fontSize: 12, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}
