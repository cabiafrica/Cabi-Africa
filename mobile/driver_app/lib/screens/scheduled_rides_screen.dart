import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

// Adaptive Imperial Design Tokens (Obsidian Dark & Daytime Porcelain)
class _SchedColors {
  final bool isDark;
  const _SchedColors(this.isDark);

  Color get canvas => isDark ? const Color(0xFF0D0D0E) : AppTheme.porcelainCanvas;
  Color get surface => isDark ? const Color(0xFF141416) : AppTheme.porcelainSurface;
  Color get card => isDark ? const Color(0xFF1F1F23) : AppTheme.porcelainSurface;
  Color get cardContainer => isDark ? const Color(0xFF1F1F23) : AppTheme.porcelainSurfaceContainer;
  Color get gold => isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze;
  Color get goldBorder => (isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze).withValues(alpha: isDark ? 0.2 : 0.35);
  Color get goldBg => (isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze).withValues(alpha: isDark ? 0.1 : 0.12);
  Color get goldBg15 => (isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze).withValues(alpha: 0.18);
  Color get emerald => const Color(0xFF10B981);
  Color get emeraldBg => const Color(0x1A10B981);
  Color get danger => const Color(0xFFEF4444);
  Color get dangerBg => const Color(0x1AEF4444);
  Color get muted => isDark ? const Color(0xFF8E8E93) : AppTheme.porcelainTextSecondary;
  Color get divider => isDark ? const Color(0xFF2A2A2E) : AppTheme.porcelainOutline;
  Color get white => isDark ? const Color(0xFFF5F5F7) : AppTheme.porcelainTextPrimary;
}

const _kDanger = Color(0xFFEF4444);
const _kEmerald = Color(0xFF10B981);

class _ScheduledRide {
  final String id;
  final String dateChip;
  final String timeWindow;
  final String pickup;
  final String pickupSub;
  final String dropoff;
  final String dropoffSub;
  final String fare;
  final String distance;
  final String eta;
  final String passengerTag;
  final String? flightCode;
  final bool isSurge;
  bool accepted = false;

  _ScheduledRide({
    required this.id,
    required this.dateChip,
    required this.timeWindow,
    required this.pickup,
    required this.pickupSub,
    required this.dropoff,
    required this.dropoffSub,
    required this.fare,
    required this.distance,
    required this.eta,
    required this.passengerTag,
    this.flightCode,
    this.isSurge = false,
  });
}

class ScheduledRidesScreen extends StatefulWidget {
  const ScheduledRidesScreen({super.key});

  @override
  State<ScheduledRidesScreen> createState() => _ScheduledRidesScreenState();
}

class _ScheduledRidesScreenState extends State<ScheduledRidesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedTab = 0;

  final List<_ScheduledRide> _opportunities = [
    _ScheduledRide(
      id: 'sched-001',
      dateChip: 'TOMORROW - SAT 18 OCT',
      timeWindow: '08:00 AM - 08:25 AM',
      pickup: 'Westlands Interchange',
      pickupSub: 'Ring Road, Near Sarit Centre',
      dropoff: 'JKIA - VIP Terminal',
      dropoffSub: 'Jomo Kenyatta International',
      fare: 'KES 1,500',
      distance: '18 km',
      eta: '~22 min drive',
      passengerTag: 'Business Class Traveler',
      flightCode: 'KQ 102',
      isSurge: true,
    ),
    _ScheduledRide(
      id: 'sched-002',
      dateChip: 'TOMORROW - SAT 18 OCT',
      timeWindow: '05:30 PM - 05:45 PM',
      pickup: 'Upper Hill, Nairobi',
      pickupSub: 'Upperhill Rd, Off Hospital Rd',
      dropoff: 'Lavington Estate',
      dropoffSub: 'Valley Rd, Lavington',
      fare: 'KES 800',
      distance: '6 km',
      eta: '~12 min drive',
      passengerTag: 'Executive Commuter',
    ),
    _ScheduledRide(
      id: 'sched-003',
      dateChip: 'WED 22 OCT',
      timeWindow: '07:00 AM - 07:15 AM',
      pickup: 'Kilimani, Nairobi',
      pickupSub: 'Argwings Kodhek Rd',
      dropoff: 'Nairobi CBD',
      dropoffSub: 'Kenyatta Ave, City Centre',
      fare: 'KES 600',
      distance: '4 km',
      eta: '~10 min drive',
      passengerTag: 'Morning Commuter',
    ),
  ];

  List<_ScheduledRide> get _mySchedule =>
      _opportunities.where((r) => r.accepted).toList();
  List<_ScheduledRide> get _available =>
      _opportunities.where((r) => !r.accepted).toList();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this)
      ..addListener(() {
        if (_tabController.indexIsChanging) {
          setState(() => _selectedTab = _tabController.index);
        }
      });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _acceptRide(_ScheduledRide ride) {
    setState(() => ride.accepted = true);
    _showToast('Assignment reserved - added to My Schedule', _kEmerald);
  }

  void _cancelRide(_ScheduledRide ride) {
    setState(() => ride.accepted = false);
    _showToast('Assignment cancelled', _kDanger);
  }

  void _showToast(String msg, Color color) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg,
            style: GoogleFonts.inter(
                color: Colors.white, fontWeight: FontWeight.w500, fontSize: 13)),
        backgroundColor: color.withValues(alpha: 0.95),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = _SchedColors(isDark);

    return Scaffold(
      backgroundColor: c.canvas,
      appBar: _buildAppBar(c),
      body: Column(
        children: [
          _buildSegmentedTabs(c, isDark),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildOpportunitiesTab(c),
                _buildMyScheduleTab(c),
              ],
            ),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(_SchedColors c) {
    return AppBar(
      backgroundColor: c.surface,
      elevation: 0,
      scrolledUnderElevation: 0,
      leading: IconButton(
        icon: Icon(Icons.arrow_back_ios_new_rounded, color: c.gold, size: 20),
        onPressed: () => Navigator.of(context).pop(),
      ),
      title: Column(
        children: [
          Text('SCHEDULED RIDES',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: c.gold,
                letterSpacing: 2.5,
              )),
          Text('Advance Assignment Board',
              style: GoogleFonts.inter(fontSize: 10, color: c.muted)),
        ],
      ),
      centerTitle: true,
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: c.goldBg,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: c.goldBorder),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.calendar_month_rounded, color: c.gold, size: 12),
                const SizedBox(width: 4),
                Text('${_available.length} OPEN',
                    style: GoogleFonts.inter(
                        color: c.gold,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.8)),
              ],
            ),
          ),
        ),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: c.divider),
      ),
    );
  }

  Widget _buildSegmentedTabs(_SchedColors c, bool isDark) {
    return Container(
      color: c.surface,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Container(
        height: 44,
        decoration: BoxDecoration(
          color: c.cardContainer,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: c.divider),
        ),
        child: TabBar(
          controller: _tabController,
          onTap: (i) => setState(() => _selectedTab = i),
          indicator: BoxDecoration(
            color: c.gold,
            borderRadius: BorderRadius.circular(10),
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          indicatorPadding: const EdgeInsets.all(3),
          dividerColor: Colors.transparent,
          labelColor: isDark ? Colors.black : Colors.white,
          unselectedLabelColor: c.muted,
          labelStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 0.5),
          unselectedLabelStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500),
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.bolt_rounded, size: 14),
                  const SizedBox(width: 6),
                  const Text('Opportunities'),
                  const SizedBox(width: 4),
                  if (_available.isNotEmpty)
                    _TabBadge(count: _available.length, selected: _selectedTab == 0),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.calendar_today_rounded, size: 13),
                  const SizedBox(width: 6),
                  const Text('My Schedule'),
                  const SizedBox(width: 4),
                  if (_mySchedule.isNotEmpty)
                    _TabBadge(count: _mySchedule.length, selected: _selectedTab == 1),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOpportunitiesTab(_SchedColors c) {
    if (_available.isEmpty) {
      return _buildEmptyState(
        c: c,
        icon: Icons.bolt_rounded,
        title: 'No Open Opportunities',
        subtitle: 'All available scheduled rides have been accepted.\nCheck back soon for new assignments.',
        actionLabel: 'VIEW MY SCHEDULE',
        onAction: () => _tabController.animateTo(1),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      itemCount: _available.length,
      itemBuilder: (ctx, i) => _OpportunityCard(ride: _available[i], onAccept: _acceptRide),
    );
  }

  Widget _buildMyScheduleTab(_SchedColors c) {
    if (_mySchedule.isEmpty) {
      return _buildEmptyState(
        c: c,
        icon: Icons.calendar_month_rounded,
        title: 'No Rides Scheduled',
        subtitle: 'Accept opportunities to see them here.\nYour confirmed assignments will appear on this board.',
        actionLabel: 'BROWSE OPPORTUNITIES',
        onAction: () => _tabController.animateTo(0),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      itemCount: _mySchedule.length,
      itemBuilder: (ctx, i) => _ScheduledCard(ride: _mySchedule[i], onCancel: _cancelRide),
    );
  }

  Widget _buildEmptyState({
    required _SchedColors c,
    required IconData icon,
    required String title,
    required String subtitle,
    required String actionLabel,
    required VoidCallback onAction,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: c.goldBg,
                shape: BoxShape.circle,
                border: Border.all(color: c.goldBorder),
              ),
              child: Icon(icon, color: c.gold, size: 32),
            ),
            const SizedBox(height: 20),
            Text(title,
                style: GoogleFonts.inter(
                    color: c.white, fontSize: 17, fontWeight: FontWeight.w700),
                textAlign: TextAlign.center),
            const SizedBox(height: 10),
            Text(subtitle,
                style: GoogleFonts.inter(color: c.muted, fontSize: 13, height: 1.6),
                textAlign: TextAlign.center),
            const SizedBox(height: 28),
            GestureDetector(
              onTap: onAction,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: c.gold,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(actionLabel,
                    style: GoogleFonts.inter(
                        color: c.isDark ? Colors.black : Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TabBadge extends StatelessWidget {
  final int count;
  final bool selected;
  const _TabBadge({required this.count, required this.selected});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = _SchedColors(isDark);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: selected
            ? (isDark ? Colors.black.withValues(alpha: 0.25) : Colors.white.withValues(alpha: 0.25))
            : c.goldBg15,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text('$count',
          style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: selected ? (isDark ? Colors.black : Colors.white) : c.gold)),
    );
  }
}

class _OpportunityCard extends StatefulWidget {
  final _ScheduledRide ride;
  final void Function(_ScheduledRide) onAccept;
  const _OpportunityCard({required this.ride, required this.onAccept});

  @override
  State<_OpportunityCard> createState() => _OpportunityCardState();
}

class _OpportunityCardState extends State<_OpportunityCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _pressCtrl;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _pressCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 100));
    _scale = Tween(begin: 1.0, end: 0.97).animate(_pressCtrl);
  }

  @override
  void dispose() {
    _pressCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ride = widget.ride;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = _SchedColors(isDark);

    return AnimatedBuilder(
      animation: _scale,
      builder: (_, child) => Transform.scale(scale: _scale.value, child: child),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: c.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: ride.isSurge ? c.emerald.withValues(alpha: 0.35) : c.goldBorder,
          ),
          boxShadow: [
            BoxShadow(
              color: isDark ? const Color(0x14000000) : Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 14, 0),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _DateChip(label: ride.dateChip),
                        const SizedBox(height: 4),
                        Text(ride.timeWindow,
                            style: GoogleFonts.inter(
                                color: c.white, fontSize: 15, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(ride.fare,
                          style: GoogleFonts.inter(
                              color: c.gold, fontSize: 20, fontWeight: FontWeight.w800)),
                      if (ride.isSurge)
                        Container(
                          margin: const EdgeInsets.only(top: 3),
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: c.emeraldBg,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: c.emerald.withValues(alpha: 0.5)),
                          ),
                          child: Text('SURGE',
                              style: GoogleFonts.inter(
                                  color: c.emerald,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1)),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Container(height: 1, color: c.divider),
            ),
            _RouteTimeline(
              pickup: ride.pickup,
              pickupSub: ride.pickupSub,
              dropoff: ride.dropoff,
              dropoffSub: ride.dropoffSub,
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: Row(
                children: [
                  _InfoChip(icon: Icons.straighten_rounded, label: ride.distance),
                  const SizedBox(width: 8),
                  _InfoChip(icon: Icons.access_time_rounded, label: ride.eta),
                  const Spacer(),
                  if (ride.flightCode != null)
                    _InfoChip(icon: Icons.flight_rounded, label: ride.flightCode!, goldBorder: true),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Row(
                children: [
                  Icon(Icons.person_rounded, color: c.muted, size: 13),
                  const SizedBox(width: 6),
                  Text(ride.passengerTag,
                      style: GoogleFonts.inter(
                          color: c.muted, fontSize: 12, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: GestureDetector(
                onTapDown: (_) => _pressCtrl.forward(),
                onTapUp: (_) {
                  _pressCtrl.reverse();
                  widget.onAccept(ride);
                },
                onTapCancel: () => _pressCtrl.reverse(),
                child: Container(
                  width: double.infinity,
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: isDark
                        ? const LinearGradient(
                            colors: [Color(0xFFF0D278), Color(0xFFD4AF37), Color(0xFFB89028)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          )
                        : const LinearGradient(
                            colors: [Color(0xFFE2B755), AppTheme.aurumBronze, Color(0xFF705514)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: c.gold.withValues(alpha: isDark ? 0.30 : 0.20),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check_circle_rounded, color: isDark ? Colors.black : Colors.white, size: 16),
                      const SizedBox(width: 8),
                      Text('ACCEPT ASSIGNMENT',
                          style: GoogleFonts.inter(
                              color: isDark ? Colors.black : Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.5)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScheduledCard extends StatelessWidget {
  final _ScheduledRide ride;
  final void Function(_ScheduledRide) onCancel;
  const _ScheduledCard({required this.ride, required this.onCancel});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = _SchedColors(isDark);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: c.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: c.goldBorder),
        boxShadow: [
          BoxShadow(
            color: isDark ? const Color(0x14000000) : Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 14, 0),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _DateChip(label: ride.dateChip),
                      const SizedBox(height: 4),
                      Text(ride.timeWindow,
                          style: GoogleFonts.inter(
                              color: c.white, fontSize: 15, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                  decoration: BoxDecoration(
                    color: c.emeraldBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: c.emerald.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.verified_rounded, color: c.emerald, size: 11),
                      const SizedBox(width: 4),
                      Text('RESERVED',
                          style: GoogleFonts.inter(
                              color: c.emerald,
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Container(height: 1, color: c.divider),
          ),
          _RouteTimeline(
            pickup: ride.pickup,
            pickupSub: ride.pickupSub,
            dropoff: ride.dropoff,
            dropoffSub: ride.dropoffSub,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
            child: Row(
              children: [
                _InfoChip(icon: Icons.straighten_rounded, label: ride.distance),
                const SizedBox(width: 8),
                _InfoChip(icon: Icons.access_time_rounded, label: ride.eta),
                const Spacer(),
                Text(ride.fare,
                    style: GoogleFonts.inter(
                        color: c.gold, fontSize: 18, fontWeight: FontWeight.w800)),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: c.goldBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: c.goldBorder),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.calendar_today_rounded, color: c.gold, size: 14),
                        const SizedBox(width: 6),
                        Text('ADD TO CALENDAR',
                            style: GoogleFonts.inter(
                                color: c.gold,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.8)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: () => onCancel(ride),
                  child: Container(
                    height: 44,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: c.dangerBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: c.danger.withValues(alpha: 0.5)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.cancel_outlined, color: c.danger, size: 14),
                        const SizedBox(width: 6),
                        Text('CANCEL',
                            style: GoogleFonts.inter(
                                color: c.danger,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.8)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RouteTimeline extends StatelessWidget {
  final String pickup;
  final String pickupSub;
  final String dropoff;
  final String dropoffSub;

  const _RouteTimeline({
    required this.pickup,
    required this.pickupSub,
    required this.dropoff,
    required this.dropoffSub,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = _SchedColors(isDark);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: c.gold,
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: c.gold.withValues(alpha: 0.5), blurRadius: 6)],
                ),
              ),
              SizedBox(
                width: 2,
                height: 36,
                child: CustomPaint(painter: _DottedLinePainter(c.gold.withValues(alpha: 0.35))),
              ),
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: c.emerald,
                  borderRadius: BorderRadius.circular(2),
                  boxShadow: [BoxShadow(color: c.emerald.withValues(alpha: 0.5), blurRadius: 6)],
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(pickup,
                    style: GoogleFonts.inter(
                        color: c.white, fontSize: 13, fontWeight: FontWeight.w600)),
                Text(pickupSub,
                    style: GoogleFonts.inter(color: c.muted, fontSize: 11, height: 1.4)),
                const SizedBox(height: 20),
                Text(dropoff,
                    style: GoogleFonts.inter(
                        color: c.white, fontSize: 13, fontWeight: FontWeight.w600)),
                Text(dropoffSub,
                    style: GoogleFonts.inter(color: c.muted, fontSize: 11, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DottedLinePainter extends CustomPainter {
  final Color dotColor;
  _DottedLinePainter(this.dotColor);

  @override
  void paint(Canvas canvas, Size size) {
    const dashHeight = 4.0;
    const dashSpace = 3.0;
    final paint = Paint()
      ..color = dotColor
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round;
    double y = 0;
    while (y < size.height) {
      canvas.drawLine(
        Offset(size.width / 2, y),
        Offset(size.width / 2, (y + dashHeight).clamp(0, size.height)),
        paint,
      );
      y += dashHeight + dashSpace;
    }
  }

  @override
  bool shouldRepaint(covariant _DottedLinePainter oldDelegate) => oldDelegate.dotColor != dotColor;
}

class _DateChip extends StatelessWidget {
  final String label;
  const _DateChip({required this.label});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = _SchedColors(isDark);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: c.goldBg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: c.goldBorder),
      ),
      child: Text(label,
          style: GoogleFonts.inter(
              color: c.gold, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool goldBorder;

  const _InfoChip({required this.icon, required this.label, this.goldBorder = false});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = _SchedColors(isDark);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: goldBorder ? c.goldBg : (isDark ? const Color(0xFF28282E) : c.cardContainer),
        borderRadius: BorderRadius.circular(8),
        border: goldBorder ? Border.all(color: c.goldBorder) : Border.all(color: c.divider),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: goldBorder ? c.gold : c.muted, size: 11),
          const SizedBox(width: 4),
          Text(label,
              style: GoogleFonts.inter(
                  color: goldBorder ? c.gold : c.muted, fontSize: 11, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
