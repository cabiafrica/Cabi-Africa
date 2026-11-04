import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class InspectionItem {
  final String id;
  final String title;
  final IconData icon;
  bool isPassed;

  InspectionItem({
    required this.id,
    required this.title,
    required this.icon,
    this.isPassed = true,
  });
}

class InspectionCategory {
  final String name;
  final IconData categoryIcon;
  final List<InspectionItem> items;

  InspectionCategory({
    required this.name,
    required this.categoryIcon,
    required this.items,
  });
}

class PreShiftInspectionScreen extends StatefulWidget {
  final String? vehicleInfo;

  const PreShiftInspectionScreen({
    super.key,
    this.vehicleInfo,
  });

  @override
  State<PreShiftInspectionScreen> createState() => _PreShiftInspectionScreenState();
}

class _PreShiftInspectionScreenState extends State<PreShiftInspectionScreen> {
  late List<InspectionCategory> _categories;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _categories = [
      InspectionCategory(
        name: '1. Ambience',
        categoryIcon: Icons.thermostat_rounded,
        items: [
          InspectionItem(
            id: 'ac',
            title: 'Climate (21°C calibrated)',
            icon: Icons.ac_unit_rounded,
            isPassed: true,
          ),
          InspectionItem(
            id: 'fragrance',
            title: 'Cedarwood Fragrance Infused',
            icon: Icons.spa_rounded,
            isPassed: true,
          ),
          InspectionItem(
            id: 'leather',
            title: 'Conditioned Leather Treatment',
            icon: Icons.airline_seat_recline_extra_rounded,
            isPassed: true,
          ),
          InspectionItem(
            id: 'lighting',
            title: 'Executive Ambient Lighting (Warm 2700K)',
            icon: Icons.light_mode_rounded,
            isPassed: true,
          ),
        ],
      ),
      InspectionCategory(
        name: '2. Amenities',
        categoryIcon: Icons.room_service_rounded,
        items: [
          InspectionItem(
            id: 'water',
            title: 'Mount Kenya Waters (2 Chilled)',
            icon: Icons.water_drop_rounded,
            isPassed: true,
          ),
          InspectionItem(
            id: 'cable',
            title: 'Braided Multi-Cable (Lightning, Type-C)',
            icon: Icons.cable_rounded,
            isPassed: true,
          ),
          InspectionItem(
            id: 'tissue',
            title: 'Concealed Tissue Dispenser Stocked',
            icon: Icons.layers_rounded,
            isPassed: true,
          ),
        ],
      ),
      InspectionCategory(
        name: '3. Mechanical & Safety',
        categoryIcon: Icons.build_circle_rounded,
        items: [
          InspectionItem(
            id: 'brakes',
            title: 'Brake Fluid & Pressure Certified',
            icon: Icons.speed_rounded,
            isPassed: true,
          ),
          InspectionItem(
            id: 'tires',
            title: 'Tire Tread Depth (>3.5mm) & Pressure',
            icon: Icons.tire_repair_rounded,
            isPassed: true,
          ),
          InspectionItem(
            id: 'lights',
            title: 'Headlamps, Indicators & Hazard Beacons',
            icon: Icons.highlight_rounded,
            isPassed: true,
          ),
          InspectionItem(
            id: 'obook',
            title: 'Digital Occurrence Log Book Connected',
            icon: Icons.menu_book_rounded,
            isPassed: true,
          ),
        ],
      ),
      InspectionCategory(
        name: '4. Sanitization & Exterior',
        categoryIcon: Icons.clean_hands_rounded,
        items: [
          InspectionItem(
            id: 'exterior',
            title: 'Pristine Washed Exterior & Rims',
            icon: Icons.directions_car_rounded,
            isPassed: true,
          ),
          InspectionItem(
            id: 'interior',
            title: 'Vacuumed Floor Carpets & Seats Sanitized',
            icon: Icons.cleaning_services_rounded,
            isPassed: true,
          ),
        ],
      ),
    ];
  }

  int get _totalItems => _categories.fold(0, (sum, cat) => sum + cat.items.length);
  int get _passedItems => _categories.fold(0, (sum, cat) => sum + cat.items.where((i) => i.isPassed).length);
  bool get _isAllPassed => _passedItems == _totalItems;

  void _submitInspection() async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: isDark ? const Color(0xFF1E1E24) : AppTheme.porcelainSurface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline),
          ),
          content: Row(
            children: [
              Icon(Icons.verified_rounded, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Pre-shift inspection approved. Cockpit status ONLINE.',
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
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final goldAccent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final vehicle = widget.vehicleInfo ?? 'Mercedes-Benz E200 · KDA 482B';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0D0D0E) : AppTheme.porcelainCanvas,
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF141416) : AppTheme.porcelainSurface,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: isDark ? Colors.white : AppTheme.porcelainTextPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Pre-Shift Vehicle Inspection',
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
              color: goldAccent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? AppTheme.outlineGold : goldAccent.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.verified_rounded, color: goldAccent, size: 14),
                const SizedBox(width: 4),
                Text(
                  'SACCO Standard',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: goldAccent,
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
            // Vehicle & Compliance Header
            Container(
              padding: const EdgeInsets.all(18),
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
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: goldAccent.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(Icons.directions_car_rounded, color: goldAccent, size: 20),
                          ),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                vehicle,
                                style: AppTheme.outfit(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                                ),
                              ),
                              Text(
                                'Executive Chauffeur Fleet',
                                style: AppTheme.inter(
                                  fontSize: 11,
                                  color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _isAllPassed
                              ? AppTheme.successGreen.withValues(alpha: 0.15)
                              : const Color(0x26EAB308),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _isAllPassed
                                ? AppTheme.successGreen.withValues(alpha: 0.4)
                                : const Color(0x66EAB308),
                          ),
                        ),
                        child: Text(
                          '$_passedItems/$_totalItems PASSED',
                          style: AppTheme.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: _isAllPassed ? AppTheme.successGreen : const Color(0xFFEAB308),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: _totalItems > 0 ? _passedItems / _totalItems : 1.0,
                      backgroundColor: isDark ? Colors.white12 : AppTheme.porcelainOutline.withValues(alpha: 0.5),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        _isAllPassed ? AppTheme.successGreen : goldAccent,
                      ),
                      minHeight: 6,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Inspection Checklist Blocks
            ..._categories.map((cat) => _buildCategoryBlock(cat, isDark, goldAccent)),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
          border: Border(top: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline)),
        ),
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: _isSubmitting ? null : _submitInspection,
            style: ElevatedButton.styleFrom(
              backgroundColor: _isAllPassed
                  ? goldAccent
                  : (isDark ? const Color(0xFF2C2C34) : AppTheme.porcelainSurfaceContainer),
              foregroundColor: _isAllPassed
                  ? (isDark ? Colors.black : Colors.white)
                  : (isDark ? Colors.white60 : AppTheme.porcelainTextSecondary),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: _isAllPassed ? 4 : 0,
            ),
            child: _isSubmitting
                ? SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: isDark ? Colors.black : Colors.white,
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.verified_rounded,
                        color: _isAllPassed
                            ? (isDark ? Colors.black : Colors.white)
                            : (isDark ? Colors.white60 : AppTheme.porcelainTextSecondary),
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Pass Inspection & Go Online',
                        style: AppTheme.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: _isAllPassed
                              ? (isDark ? Colors.black : Colors.white)
                              : (isDark ? Colors.white60 : AppTheme.porcelainTextSecondary),
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryBlock(InspectionCategory category, bool isDark, Color goldAccent) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(category.categoryIcon, color: goldAccent, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    category.name.toUpperCase(),
                    style: AppTheme.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withValues(alpha: 0.06) : AppTheme.porcelainSurfaceContainer,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '${category.items.where((i) => i.isPassed).length}/${category.items.length} Items',
                  style: AppTheme.inter(
                    fontSize: 10,
                    color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...category.items.map((item) {
            final activeColor = item.isPassed ? goldAccent : (isDark ? Colors.white38 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.5));
            return InkWell(
              onTap: () {
                setState(() => item.isPassed = !item.isPassed);
              },
              borderRadius: BorderRadius.circular(10),
              child: Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1B1B22) : AppTheme.porcelainSurfaceContainer,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: item.isPassed
                        ? (isDark ? AppTheme.outlineGold.withValues(alpha: 0.4) : goldAccent.withValues(alpha: 0.4))
                        : (isDark ? Colors.white10 : AppTheme.porcelainOutline.withValues(alpha: 0.5)),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      item.icon,
                      color: activeColor,
                      size: 18,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        item.title,
                        style: AppTheme.inter(
                          fontSize: 13,
                          fontWeight: item.isPassed ? FontWeight.w600 : FontWeight.w400,
                          color: item.isPassed
                              ? (isDark ? Colors.white : AppTheme.porcelainTextPrimary)
                              : (isDark ? Colors.white54 : AppTheme.porcelainTextSecondary),
                        ),
                      ),
                    ),
                    Icon(
                      item.isPassed ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                      color: item.isPassed ? goldAccent : (isDark ? Colors.white30 : AppTheme.porcelainOutline),
                      size: 20,
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

