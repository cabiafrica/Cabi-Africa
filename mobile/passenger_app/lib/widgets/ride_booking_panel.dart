import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';

// A simple data class to hold information about each ride tier.
class RideTier {
  final String name;
  final String description;
  final IconData icon;
  final double estimatedFare;
  final String eta;

  RideTier({
    required this.name,
    required this.description,
    required this.icon,
    required this.estimatedFare,
    required this.eta,
  });
}

// Mock data for the available ride tiers.
// In a real app, this data would come from the backend.
final List<RideTier> mockTiers = [
  RideTier(
    name: 'Shared',
    description: 'Cheapest option, might pick up others.',
    icon: Icons.people,
    estimatedFare: 350.0,
    eta: '8-12 min',
  ),
  RideTier(
    name: 'Standard',
    description: 'Your own ride, right away.',
    icon: Icons.directions_car,
    estimatedFare: 500.0,
    eta: '5 min',
  ),
  RideTier(
    name: 'Premium',
    description: 'A more spacious, high-end car.',
    icon: Icons.workspace_premium,
    estimatedFare: 750.0,
    eta: '7 min',
  ),
];

class RideBookingPanel extends StatefulWidget {
  final String destinationAddress;
  // Callback returns the selected tier's name.
  final Function(String tierName) onConfirm;
  final VoidCallback onCancel;

  const RideBookingPanel({
    super.key,
    required this.destinationAddress,
    required this.onConfirm,
    required this.onCancel,
  });

  @override
  State<RideBookingPanel> createState() => _RideBookingPanelState();
}

class _RideBookingPanelState extends State<RideBookingPanel> {
  RideTier? _selectedTier;
  BookingType _selectedBookingType = BookingType.oneWay;
  int _waitTimeMinutes = 0;
  int _hourlyDuration = 2;
  String _rentalPackage = 'Half Day';

  @override
  void initState() {
    super.initState();
    // Pre-select the 'Standard' tier by default.
    _selectedTier = mockTiers.firstWhere((t) => t.name == 'Standard');
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceContainer : Colors.white,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
        border: Border(
          top: BorderSide(
            color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.45 : 0.16),
            blurRadius: 14,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Ride to ${widget.destinationAddress}',
            style: AppTheme.inter(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
            ),
            textAlign: TextAlign.center,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 16),

          // Booking Type Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: BookingType.values.map((type) {
                final isSelected = _selectedBookingType == type;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(type.displayName),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) setState(() => _selectedBookingType = type);
                    },
                    selectedColor: AppTheme.primaryColor,
                    backgroundColor: isDark
                        ? AppTheme.surfaceContainerHigh
                        : AppTheme.porcelainSurfaceContainer,
                    side: BorderSide(
                      color: isSelected
                          ? AppTheme.primaryColor
                          : (isDark
                              ? AppTheme.outlineBorder
                              : AppTheme.porcelainOutline),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    labelStyle: AppTheme.inter(
                      fontSize: 13,
                      color: isSelected
                          ? Colors.black
                          : (isDark
                              ? AppTheme.darkTextPrimary
                              : AppTheme.porcelainTextPrimary),
                      fontWeight:
                          isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),

          // Conditional Inputs
          if (_selectedBookingType == BookingType.roundTrip)
            Column(
              children: [
                DropdownButtonFormField<int>(
                  initialValue: _waitTimeMinutes,
                  decoration: const InputDecoration(
                      labelText: 'Wait Time at Destination',
                      border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 0, child: Text('No Wait')),
                    DropdownMenuItem(value: 15, child: Text('15 Minutes')),
                    DropdownMenuItem(value: 30, child: Text('30 Minutes')),
                    DropdownMenuItem(value: 60, child: Text('1 Hour')),
                    DropdownMenuItem(value: 120, child: Text('2 Hours')),
                  ],
                  onChanged: (val) => setState(() => _waitTimeMinutes = val!),
                ),
                const SizedBox(height: 12),
                // Story 85.3: Flight Number Input
                TextFormField(
                  decoration: const InputDecoration(
                    labelText: 'Flight Number (Optional)',
                    border: OutlineInputBorder(),
                    helperText: 'We will track your flight for delays',
                    prefixIcon: Icon(Icons.flight),
                  ),
                ),
                const SizedBox(height: 12),
                // Story 85.4: Pre-book checkbox
                CheckboxListTile(
                  title: const Text('Pre-book Guarantee'),
                  subtitle: const Text('Guaranteed pickup time (+KES 300)'),
                  value: false,
                  onChanged: (val) {},
                ),
              ],
            ),

          if (_selectedBookingType == BookingType.hourly)
            DropdownButtonFormField<int>(
              initialValue: _hourlyDuration,
              decoration: const InputDecoration(
                  labelText: 'Duration (Hours)', border: OutlineInputBorder()),
              items: [2, 3, 4, 5, 6, 7, 8]
                  .map((e) =>
                      DropdownMenuItem(value: e, child: Text('$e Hours')))
                  .toList(),
              onChanged: (val) => setState(() => _hourlyDuration = val!),
            ),

          if (_selectedBookingType == BookingType.rental)
            DropdownButtonFormField<String>(
              initialValue: _rentalPackage,
              decoration: const InputDecoration(
                  labelText: 'Rental Package', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(
                    value: 'Half Day', child: Text('Half Day (4 hrs)')),
                DropdownMenuItem(
                    value: 'Full Day', child: Text('Full Day (8 hrs)')),
              ],
              onChanged: (val) => setState(() => _rentalPackage = val!),
            ),

          if (_selectedBookingType != BookingType.oneWay)
            const SizedBox(height: 16),

          // List of selectable ride tiers
          SizedBox(
            height: 100, // Constrain the height of the tier list
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: mockTiers.length,
              separatorBuilder: (context, index) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final tier = mockTiers[index];
                final isSelected = _selectedTier?.name == tier.name;
                return GestureDetector(
                  onTap: () {
                    if (_selectedTier != tier) HapticFeedback.selectionClick();
                    setState(() => _selectedTier = tier);
                  },
                  child: _buildTierCard(tier, isSelected, isDark),
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          // Confirmation Button with Stitch Amber CTA
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              boxShadow: _selectedTier != null
                  ? [
                      BoxShadow(
                        color: AppTheme.primaryColor.withValues(alpha: 0.35),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : null,
            ),
            child: ElevatedButton(
              onPressed: _selectedTier == null
                  ? null
                  : () {
                      HapticFeedback.mediumImpact();
                      widget.onConfirm(
                          '${_selectedTier!.name} (${_selectedBookingType.displayName})');
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.black,
                disabledBackgroundColor: isDark
                    ? AppTheme.surfaceContainerHigh
                    : Colors.grey.shade300,
                disabledForegroundColor: Colors.grey.shade600,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                textStyle: AppTheme.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
              child: Text('Confirm ${_selectedTier?.name ?? ''}'),
            ),
          ),
          const SizedBox(height: 8),
          // Cancel Button
          TextButton(
            onPressed: widget.onCancel,
            child: Text(
              'Cancel',
              style: AppTheme.inter(
                color: isDark
                    ? AppTheme.darkTextSecondary
                    : AppTheme.porcelainTextSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTierCard(RideTier tier, bool isSelected, bool isDark) {
    const amberPrimary = AppTheme.primaryColor;

    return Container(
      width: 140,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: isSelected
            ? AppTheme.primaryContainer
            : (isDark
                ? AppTheme.surfaceContainerHigh
                : AppTheme.porcelainSurfaceContainer),
        border: Border.all(
          color: isSelected
              ? amberPrimary
              : (isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
          width: isSelected ? 1.8 : 1.0,
        ),
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: amberPrimary.withValues(alpha: 0.20),
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
              ]
            : null,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            tier.icon,
            size: 28,
            color: isSelected
                ? amberPrimary
                : (isDark
                    ? AppTheme.darkTextPrimary
                    : AppTheme.porcelainTextPrimary),
          ),
          const SizedBox(height: 4),
          Text(
            tier.name,
            style: AppTheme.inter(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              color: isDark
                  ? AppTheme.darkTextPrimary
                  : AppTheme.porcelainTextPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'KES ${tier.estimatedFare.toStringAsFixed(0)}',
            style: AppTheme.inter(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: isSelected
                  ? amberPrimary
                  : (isDark
                      ? AppTheme.darkTextPrimary
                      : AppTheme.porcelainTextPrimary),
            ),
          ),
          Text(
            tier.eta,
            style: AppTheme.inter(
              fontSize: 11,
              color: isDark
                  ? AppTheme.darkTextSecondary
                  : AppTheme.porcelainTextSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

// Added Booking Types
enum BookingType { oneWay, roundTrip, hourly, rental }

// Extension to get displayable names
extension BookingTypeExtension on BookingType {
  String get displayName {
    switch (this) {
      case BookingType.oneWay:
        return 'One-Way';
      case BookingType.roundTrip:
        return 'Round Trip';
      case BookingType.hourly:
        return 'Hourly';
      case BookingType.rental:
        return 'Rental';
    }
  }
}
