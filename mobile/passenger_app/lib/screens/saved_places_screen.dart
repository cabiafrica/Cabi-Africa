import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SavedPlaceItem {
  final String id;
  final String title;
  final String address;
  final String subAddress;
  final String tag;
  final IconData icon;
  final String? lastVisited;
  final String? avgFare;
  final bool isPrimary;

  const SavedPlaceItem({
    required this.id,
    required this.title,
    required this.address,
    required this.subAddress,
    required this.tag,
    required this.icon,
    this.lastVisited,
    this.avgFare,
    this.isPrimary = false,
  });
}

class SavedPlacesScreen extends StatefulWidget {
  const SavedPlacesScreen({super.key});

  @override
  State<SavedPlacesScreen> createState() => _SavedPlacesScreenState();
}

class _SavedPlacesScreenState extends State<SavedPlacesScreen> {
  final TextEditingController _searchController = TextEditingController();
  bool _morningCommuteEnabled = true;

  final List<SavedPlaceItem> _primarySanctuaries = [
    const SavedPlaceItem(
      id: 'home',
      title: 'Home Sanctuary',
      address: 'Villa Rosa Kempinski Residences',
      subAddress: 'Westlands, Nairobi',
      tag: 'Default',
      icon: Icons.home_rounded,
      isPrimary: true,
    ),
    const SavedPlaceItem(
      id: 'hq',
      title: 'Headquarters',
      address: 'Delta Corner Tower B',
      subAddress: 'Chiromo Rd, Nairobi',
      tag: 'HQ Hub',
      icon: Icons.corporate_fare_rounded,
      isPrimary: true,
    ),
  ];

  final List<SavedPlaceItem> _frequentEscapes = [
    const SavedPlaceItem(
      id: 'sarit',
      title: 'Sarit Centre',
      address: 'Gate 2 Executive Drop',
      subAddress: 'Westlands, Karuna Road',
      tag: 'Executive Drop',
      icon: Icons.shopping_bag_rounded,
      lastVisited: 'Yesterday',
      avgFare: 'KES 520 avg',
    ),
    const SavedPlaceItem(
      id: 'muthaiga',
      title: 'Muthaiga Country Club',
      address: 'Main Pavilion',
      subAddress: 'Muthaiga Rd, Nairobi',
      tag: 'Pavilion',
      icon: Icons.sports_golf_rounded,
      lastVisited: '3 days ago',
      avgFare: 'KES 850 avg',
    ),
    const SavedPlaceItem(
      id: 'jkia',
      title: 'JKIA VIP Terminal',
      address: 'Presidential Pavilion',
      subAddress: 'Jomo Kenyatta Intl Airport, Embakasi',
      tag: 'Presidential',
      icon: Icons.flight_takeoff_rounded,
      lastVisited: 'Last Sunday',
      avgFare: 'KES 3,200 avg',
    ),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _triggerChauffeurBooking(String destination) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: isDark ? const Color(0xFF1E1E24) : AppTheme.porcelainSurfaceHigh,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline),
        ),
        content: Row(
          children: [
            Icon(Icons.directions_car_rounded, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Chauffeur booking initiated for $destination',
                style: AppTheme.outfit(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openAddPlaceModal() {
    final titleController = TextEditingController();
    final addressController = TextEditingController();
    String selectedTag = 'Sanctuary';
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
            top: 24,
            left: 20,
            right: 20,
          ),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF141416) : AppTheme.porcelainSurface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border(
              top: BorderSide(
                color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline,
                width: 1.5,
              ),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : AppTheme.porcelainOutline,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze.withValues(alpha: 0.4)),
                        ),
                        child: Icon(
                          Icons.add_location_alt_rounded,
                          color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Save VIP Destination',
                        style: AppTheme.outfit(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: Icon(Icons.close_rounded, color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                'DESTINATION LABEL',
                style: AppTheme.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: titleController,
                style: TextStyle(color: isDark ? Colors.white : AppTheme.porcelainTextPrimary),
                decoration: InputDecoration(
                  hintText: 'e.g. Golf Villa, Embassy, Private Hangar',
                  hintStyle: TextStyle(color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary),
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1F1F24) : AppTheme.porcelainSurfaceContainer,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'FULL ADDRESS / LANDMARK',
                style: AppTheme.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: addressController,
                style: TextStyle(color: isDark ? Colors.white : AppTheme.porcelainTextPrimary),
                decoration: InputDecoration(
                  hintText: 'Enter street, building or coordinates',
                  hintStyle: TextStyle(color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary),
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1F1F24) : AppTheme.porcelainSurfaceContainer,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () {
                    if (titleController.text.trim().isNotEmpty) {
                      setState(() {
                        _frequentEscapes.insert(
                          0,
                          SavedPlaceItem(
                            id: DateTime.now().millisecondsSinceEpoch.toString(),
                            title: titleController.text.trim(),
                            address: addressController.text.trim().isEmpty
                                ? 'Nairobi, Kenya'
                                : addressController.text.trim(),
                            subAddress: 'Custom Sanctuary',
                            tag: selectedTag,
                            icon: Icons.star_rounded,
                            lastVisited: 'Just added',
                          ),
                        );
                      });
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Destination saved to VIP sanctuaries')),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                    foregroundColor: isDark ? Colors.black : Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 4,
                  ),
                  child: Text(
                    'Save to Sanctuaries',
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
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0D0D0E) : AppTheme.porcelainCanvas,
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF121215) : AppTheme.porcelainSurface,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: isDark ? Colors.white : AppTheme.porcelainTextPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Saved Locations',
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
              color: (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze.withValues(alpha: 0.35)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.security_rounded, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, size: 14),
                const SizedBox(width: 4),
                Text(
                  'VIP Safe',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            margin: const EdgeInsets.only(right: 16),
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              gradient: isDark
                  ? AppTheme.goldGradient
                  : const LinearGradient(colors: [Color(0xFFE2B755), AppTheme.aurumBronze]),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze).withValues(alpha: 0.3),
                  blurRadius: 8,
                ),
              ],
            ),
            child: Icon(Icons.person_rounded, color: isDark ? Colors.black : Colors.white, size: 20),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Banner
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PRESTIGE MOBILITY',
                      style: AppTheme.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Saved Destinations',
                      style: AppTheme.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1B1B20) : AppTheme.porcelainSurfaceContainer,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.stars_rounded, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        'VIP Tier',
                        style: AppTheme.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Instant one-touch chauffeur dispatches for your everyday sanctuaries.',
              style: AppTheme.inter(
                fontSize: 13,
                fontWeight: FontWeight.w400,
                color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
              ),
            ),
            const SizedBox(height: 20),

            // Search Bar with Pin Drop Trigger
            Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF151518) : AppTheme.porcelainSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
              ),
              child: Row(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: Icon(Icons.search_rounded, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, size: 22),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: TextStyle(color: isDark ? Colors.white : AppTheme.porcelainTextPrimary, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Search Nairobi address or drop pin...',
                        hintStyle: TextStyle(color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary, fontSize: 13),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  Container(
                    margin: const EdgeInsets.all(6),
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Pin map opened for coordinate selection')),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? const Color(0xFF222228) : AppTheme.porcelainSurfaceContainer,
                        foregroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                          side: BorderSide(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze.withValues(alpha: 0.4)),
                        ),
                      ),
                      icon: const Icon(Icons.location_on_rounded, size: 16),
                      label: Text(
                        'Pin',
                        style: AppTheme.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Section 1: Primary Sanctuaries
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'PRIMARY SANCTUARIES',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                    letterSpacing: 1.1,
                  ),
                ),
                GestureDetector(
                  onTap: () {},
                  child: Row(
                    children: [
                      Text(
                        'Organize',
                        style: AppTheme.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(Icons.tune_rounded, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, size: 14),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Grid / Cards for Primary Sanctuaries
            ..._primarySanctuaries.map((item) => _buildPrimaryCard(item, isDark)),

            const SizedBox(height: 20),

            // Mini Live Fleet Radar Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: isDark
                    ? const LinearGradient(
                        colors: [Color(0xFF141A1E), Color(0xFF10161C)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : const LinearGradient(
                        colors: [Color(0xFFECFDF5), AppTheme.porcelainSurface],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? const Color(0x3310B981) : const Color(0x4D10B981)),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x1A10B981),
                    blurRadius: 16,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: AppTheme.successGreen,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.successGreen,
                          blurRadius: 8,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Cabi VIP Fleet: 14 Sedans Available Nearby',
                          style: AppTheme.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Average dispatch time: 3.2 minutes in Westlands',
                          style: AppTheme.inter(
                            fontSize: 11,
                            color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.successGreen.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppTheme.successGreen.withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      'LIVE RADAR',
                      style: AppTheme.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.successGreen,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Section 2: Frequent VIP Escapes
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'FREQUENT VIP ESCAPES',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                    letterSpacing: 1.1,
                  ),
                ),
                Text(
                  '${_frequentEscapes.length} Active Routes',
                  style: AppTheme.inter(
                    fontSize: 11,
                    color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            ..._frequentEscapes.map((item) => _buildFrequentItem(item, isDark)),

            const SizedBox(height: 24),

            // Section 3: Intelligent Automations
            Text(
              'INTELLIGENT AUTOMATIONS',
              style: AppTheme.inter(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 12),

            // Commute Routine Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
              ),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze.withValues(alpha: 0.35)),
                    ),
                    child: Icon(
                      Icons.alarm_on_rounded,
                      color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Morning Commute',
                              style: AppTheme.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: AppTheme.successGreen,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Delta Towers Chiromo • Mon - Fri at 07:45 AM',
                          style: AppTheme.inter(
                            fontSize: 12,
                            color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Auto-prompt chauffeur 10 mins prior',
                          style: AppTheme.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch.adaptive(
                    value: _morningCommuteEnabled,
                    activeThumbColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                    activeTrackColor: (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze).withValues(alpha: 0.3),
                    inactiveTrackColor: isDark ? Colors.white12 : Colors.black12,
                    onChanged: (val) {
                      setState(() => _morningCommuteEnabled = val);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Add Custom Preset Tile
            GestureDetector(
              onTap: _openAddPlaceModal,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF111114) : AppTheme.porcelainSurface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze).withValues(alpha: 0.3),
                    style: BorderStyle.solid,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze).withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                        border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze.withValues(alpha: 0.35)),
                      ),
                      child: Icon(
                        Icons.add_rounded,
                        color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Add Custom Favorite',
                          style: AppTheme.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Gym, Diplomatic Residences, Helipad',
                          style: AppTheme.inter(
                            fontSize: 12,
                            color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF111114) : AppTheme.porcelainSurface,
          border: Border(top: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline)),
        ),
        child: SizedBox(
          width: double.infinity,
          height: 54,
          child: ElevatedButton(
            onPressed: _openAddPlaceModal,
            style: ElevatedButton.styleFrom(
              backgroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
              foregroundColor: isDark ? Colors.black : Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.bookmark_add_rounded, color: isDark ? Colors.black : Colors.white, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Add New Saved Place',
                  style: AppTheme.outfit(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.black : Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPrimaryCard(SavedPlaceItem item, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze.withValues(alpha: 0.35)),
                ),
                child: Icon(item.icon, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, size: 22),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withValues(alpha: 0.06) : AppTheme.porcelainSurfaceContainer,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
                ),
                child: Text(
                  item.tag,
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            item.title,
            style: AppTheme.outfit(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            item.address,
            style: AppTheme.inter(
              fontSize: 13,
              color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            item.subAddress,
            style: AppTheme.inter(
              fontSize: 11,
              color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.8),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton.icon(
              onPressed: () => _triggerChauffeurBooking(item.title),
              style: ElevatedButton.styleFrom(
                backgroundColor: isDark ? const Color(0xFF1F1F26) : AppTheme.porcelainSurfaceContainer,
                foregroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze.withValues(alpha: 0.4)),
                ),
              ),
              icon: const Icon(Icons.directions_car_rounded, size: 18),
              label: Text(
                'REQUEST CHAUFFEUR',
                style: AppTheme.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFrequentItem(SavedPlaceItem item, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isDark ? Colors.white.withValues(alpha: 0.06) : AppTheme.porcelainSurfaceContainer,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
            ),
            child: Icon(item.icon, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        item.title,
                        style: AppTheme.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white.withValues(alpha: 0.06) : AppTheme.porcelainSurfaceContainer,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        item.address,
                        style: AppTheme.inter(
                          fontSize: 10,
                          color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  item.subAddress,
                  style: AppTheme.inter(
                    fontSize: 12,
                    color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    if (item.lastVisited != null) ...[
                      Icon(Icons.history_rounded, size: 12, color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary),
                      const SizedBox(width: 4),
                      Text(
                        item.lastVisited!,
                        style: AppTheme.inter(fontSize: 11, color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary),
                      ),
                      const SizedBox(width: 10),
                    ],
                    if (item.avgFare != null) ...[
                      Icon(Icons.payments_rounded, size: 12, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze),
                      const SizedBox(width: 4),
                      Text(
                        item.avgFare!,
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () => _triggerChauffeurBooking(item.title),
            style: ElevatedButton.styleFrom(
              backgroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
              foregroundColor: isDark ? Colors.black : Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              minimumSize: Size.zero,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              elevation: 0,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Book',
                  style: AppTheme.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.black : Colors.white,
                  ),
                ),
                const SizedBox(width: 2),
                Icon(Icons.arrow_forward_rounded, size: 14, color: isDark ? Colors.black : Colors.white),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
