import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Obsidian Imperial Design Tokens
const _kCanvas = Color(0xFF0D0D0E);
const _kSurface = Color(0xFF141416);
const _kCard = Color(0xFF1F1F23);
const _kGold = Color(0xFFD4AF37);
const _kGoldBorder = Color(0x33D4AF37);
const _kGoldBg = Color(0x1AD4AF37);
const _kGoldBg15 = Color(0x26D4AF37);
const _kEmerald = Color(0xFF10B981);
const _kEmeraldBg = Color(0x1A10B981);
const _kDanger = Color(0xFFEF4444);
const _kDangerBg = Color(0x1AEF4444);
const _kMuted = Color(0xFF8E8E93);
const _kDivider = Color(0xFF2A2A2E);
const _kWhite = Color(0xFFF5F5F7);

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
  bool accepted;

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
    this.accepted = false,
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
    return Scaffold(
      backgroundColor: _kCanvas,
      appBar: _buildAppBar(),
      body: Column(
        children: [
          _buildSegmentedTabs(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildOpportunitiesTab(),
                _buildMyScheduleTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: _kSurface,
      elevation: 0,
      scrolledUnderElevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded, color: _kGold, size: 20),
        onPressed: () => Navigator.of(context).pop(),
      ),
      title: Column(
        children: [
          Text('SCHEDULED RIDES',
              style: GoogleFonts.montserrat(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: _kGold,
                letterSpacing: 2.5,
              )),
          Text('Advance Assignment Board',
              style: GoogleFonts.inter(fontSize: 10, color: _kMuted)),
        ],
      ),
      centerTitle: true,
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _kGoldBg,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: _kGoldBorder),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.calendar_month_rounded, color: _kGold, size: 12),
                const SizedBox(width: 4),
                Text('${_available.length} OPEN',
                    style: GoogleFonts.inter(
                        color: _kGold,
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
        child: Container(height: 1, color: _kDivider),
      ),
    );
  }

  Widget _buildSegmentedTabs() {
    return Container(
      color: _kSurface,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Container(
        height: 44,
        decoration: BoxDecoration(
          color: _kCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _kDivider),
        ),
        child: TabBar(
          controller: _tabController,
          onTap: (i) => setState(() => _selectedTab = i),
          indicator: BoxDecoration(
            color: _kGold,
            borderRadius: BorderRadius.circular(10),
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          indicatorPadding: const EdgeInsets.all(3),
          dividerColor: Colors.transparent,
          labelColor: Colors.black,
          unselectedLabelColor: _kMuted,
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

  Widget _buildOpportunitiesTab() {
    if (_available.isEmpty) {
      return _buildEmptyState(
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

  Widget _buildMyScheduleTab() {
    if (_mySchedule.isEmpty) {
      return _buildEmptyState(
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
                color: _kGoldBg,
                shape: BoxShape.circle,
                border: Border.all(color: _kGoldBorder),
              ),
              child: Icon(icon, color: _kGold, size: 32),
            ),
            const SizedBox(height: 20),
            Text(title,
                style: GoogleFonts.montserrat(
                    color: _kWhite, fontSize: 17, fontWeight: FontWeight.w700),
                textAlign: TextAlign.center),
            const SizedBox(height: 10),
            Text(subtitle,
                style: GoogleFonts.inter(color: _kMuted, fontSize: 13, height: 1.6),
                textAlign: TextAlign.center),
            const SizedBox(height: 28),
            GestureDetector(
              onTap: onAction,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: _kGold,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(actionLabel,
                    style: GoogleFonts.inter(
                        color: Colors.black,
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
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: selected ? Colors.black.withValues(alpha: 0.25) : _kGoldBg15,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text('$count',
          style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: selected ? Colors.black : _kGold)),
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
    return AnimatedBuilder(
      animation: _scale,
      builder: (_, child) => Transform.scale(scale: _scale.value, child: child),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: _kCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: ride.isSurge ? _kEmerald.withValues(alpha: 0.35) : _kGoldBorder,
          ),
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
                            style: GoogleFonts.montserrat(
                                color: _kWhite, fontSize: 15, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(ride.fare,
                          style: GoogleFonts.montserrat(
                              color: _kGold, fontSize: 20, fontWeight: FontWeight.w800)),
                      if (ride.isSurge)
                        Container(
                          margin: const EdgeInsets.only(top: 3),
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: _kEmeraldBg,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: _kEmerald.withValues(alpha: 0.5)),
                          ),
                          child: Text('SURGE',
                              style: GoogleFonts.inter(
                                  color: _kEmerald,
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
              child: Container(height: 1, color: _kDivider),
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
                  const Icon(Icons.person_rounded, color: _kMuted, size: 13),
                  const SizedBox(width: 6),
                  Text(ride.passengerTag,
                      style: GoogleFonts.inter(
                          color: _kMuted, fontSize: 12, fontWeight: FontWeight.w500)),
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
                    gradient: const LinearGradient(
                      colors: [Color(0xFFF0D278), _kGold, Color(0xFFB89028)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: _kGold.withValues(alpha: 0.30),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Colors.black, size: 16),
                      const SizedBox(width: 8),
                      Text('ACCEPT ASSIGNMENT',
                          style: GoogleFonts.inter(
                              color: Colors.black,
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
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _kGoldBorder),
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
                          style: GoogleFonts.montserrat(
                              color: _kWhite, fontSize: 15, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                  decoration: BoxDecoration(
                    color: _kEmeraldBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _kEmerald.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.verified_rounded, color: _kEmerald, size: 11),
                      const SizedBox(width: 4),
                      Text('RESERVED',
                          style: GoogleFonts.inter(
                              color: _kEmerald,
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
            child: Container(height: 1, color: _kDivider),
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
                    style: GoogleFonts.montserrat(
                        color: _kGold, fontSize: 18, fontWeight: FontWeight.w800)),
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
                      color: _kGoldBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _kGoldBorder),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.calendar_today_rounded, color: _kGold, size: 14),
                        const SizedBox(width: 6),
                        Text('ADD TO CALENDAR',
                            style: GoogleFonts.inter(
                                color: _kGold,
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
                      color: _kDangerBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _kDanger.withValues(alpha: 0.5)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.cancel_outlined, color: _kDanger, size: 14),
                        const SizedBox(width: 6),
                        Text('CANCEL',
                            style: GoogleFonts.inter(
                                color: _kDanger,
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
                  color: _kGold,
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: _kGold.withValues(alpha: 0.5), blurRadius: 6)],
                ),
              ),
              SizedBox(
                width: 2,
                height: 36,
                child: CustomPaint(painter: _DottedLinePainter()),
              ),
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: _kEmerald,
                  borderRadius: BorderRadius.circular(2),
                  boxShadow: [BoxShadow(color: _kEmerald.withValues(alpha: 0.5), blurRadius: 6)],
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
                        color: _kWhite, fontSize: 13, fontWeight: FontWeight.w600)),
                Text(pickupSub,
                    style: GoogleFonts.inter(color: _kMuted, fontSize: 11, height: 1.4)),
                const SizedBox(height: 20),
                Text(dropoff,
                    style: GoogleFonts.inter(
                        color: _kWhite, fontSize: 13, fontWeight: FontWeight.w600)),
                Text(dropoffSub,
                    style: GoogleFonts.inter(color: _kMuted, fontSize: 11, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DottedLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    const dashHeight = 4.0;
    const dashSpace = 3.0;
    final paint = Paint()
      ..color = _kGold.withValues(alpha: 0.35)
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
  bool shouldRepaint(_) => false;
}

class _DateChip extends StatelessWidget {
  final String label;
  const _DateChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: _kGoldBg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: _kGoldBorder),
      ),
      child: Text(label,
          style: GoogleFonts.inter(
              color: _kGold, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
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
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: goldBorder ? _kGoldBg : const Color(0xFF28282E),
        borderRadius: BorderRadius.circular(8),
        border: goldBorder ? Border.all(color: _kGoldBorder) : Border.all(color: _kDivider),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: goldBorder ? _kGold : _kMuted, size: 11),
          const SizedBox(width: 4),
          Text(label,
              style: GoogleFonts.inter(
                  color: goldBorder ? _kGold : _kMuted, fontSize: 11, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
