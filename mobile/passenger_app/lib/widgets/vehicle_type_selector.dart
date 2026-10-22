import 'package:flutter/material.dart';

// Obsidian Gold palette (matches Stitch design system)
const _kObsidian = Color(0xFF0A0A0B);
const _kObsidianSurface = Color(0xFF1A1A1D);
const _kObsidianCard = Color(0xFF1E1E22);
const _kGold = Color(0xFFD4AF37);
const _kGoldDeep = Color(0xFFB8860B);
const _kEmerald = Color(0xFF10B981);
const _kRed = Color(0xFFEF4444);

class VehicleTypeSelector extends StatefulWidget {
  final String? selectedType;
  final Function(String?) onTypeSelected;
  final int? nearbyDriversCount;

  const VehicleTypeSelector({
    super.key,
    required this.selectedType,
    required this.onTypeSelected,
    this.nearbyDriversCount,
  });

  @override
  State<VehicleTypeSelector> createState() => _VehicleTypeSelectorState();
}

class _VehicleTypeSelectorState extends State<VehicleTypeSelector>
    with TickerProviderStateMixin {
  late final AnimationController _shimmerCtrl;
  late final AnimationController _pulseCtrl;

  @override
  void initState() {
    super.initState();
    _shimmerCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _shimmerCtrl.dispose();
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final vehicleTypes = [
      _VehicleOption(
        type: 'STANDARD',
        name: 'Standard',
        subtitle: '4 seats • Saloon',
        icon: Icons.directions_car_rounded,
        badge: null,
        priceRange: 'KES 200–400',
        eta: '3 min',
      ),
      _VehicleOption(
        type: 'PREMIUM',
        name: 'Premium',
        subtitle: 'Executive • Luxury ride',
        icon: Icons.car_rental_rounded,
        badge: 'POPULAR',
        priceRange: 'KES 450–700',
        eta: '5 min',
      ),
      _VehicleOption(
        type: 'XL',
        name: 'XL',
        subtitle: '6+ seats • Group travel',
        icon: Icons.airport_shuttle_rounded,
        badge: null,
        priceRange: 'KES 500–800',
        eta: '6 min',
      ),
      _VehicleOption(
        type: 'BODA',
        name: 'Boda',
        subtitle: 'Motorcycle • Beat traffic',
        icon: Icons.two_wheeler_rounded,
        badge: 'FASTEST',
        priceRange: 'KES 80–200',
        eta: '2 min',
      ),
    ];

    return Container(
      decoration: BoxDecoration(
        color: _kObsidian,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: _kGold.withValues(alpha: 0.25), width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.6),
            blurRadius: 24,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Drag Handle ──
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 4),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Header Row ──
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'CHOOSE RIDE TYPE',
                          style: TextStyle(
                            color: _kGold,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Select your preferred vehicle',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.55),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    if (widget.nearbyDriversCount != null)
                      _NearbyBadge(
                        count: widget.nearbyDriversCount!,
                        pulseCtrl: _pulseCtrl,
                      ),
                  ],
                ),
                const SizedBox(height: 16),

                // ── Vehicle Options ──
                ...vehicleTypes.map((v) {
                  final isSelected = widget.selectedType == v.type;
                  return _VehicleCard(
                    vehicle: v,
                    isSelected: isSelected,
                    shimmerCtrl: _shimmerCtrl,
                    onTap: () => widget.onTypeSelected(
                        isSelected ? null : v.type),
                  );
                }),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Nearby pulsing badge ─────────────────────────────────────────────────────
class _NearbyBadge extends StatelessWidget {
  final int count;
  final AnimationController pulseCtrl;
  const _NearbyBadge({required this.count, required this.pulseCtrl});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: pulseCtrl,
      builder: (_, __) {
        final glow =
            (_kEmerald).withValues(alpha: 0.12 + pulseCtrl.value * 0.15);
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: _kEmerald.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _kEmerald.withValues(alpha: 0.4)),
            boxShadow: [
              BoxShadow(color: glow, blurRadius: 10, spreadRadius: 1),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: _kEmerald,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '$count nearby',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: _kEmerald,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── Single vehicle card ──────────────────────────────────────────────────────
class _VehicleCard extends StatelessWidget {
  final _VehicleOption vehicle;
  final bool isSelected;
  final AnimationController shimmerCtrl;
  final VoidCallback onTap;

  const _VehicleCard({
    required this.vehicle,
    required this.isSelected,
    required this.shimmerCtrl,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? _kGold.withValues(alpha: 0.06)
              : _kObsidianCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? _kGold.withValues(alpha: 0.6)
                : Colors.white.withValues(alpha: 0.07),
            width: isSelected ? 1.5 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: _kGold.withValues(alpha: 0.15),
                    blurRadius: 12,
                    offset: const Offset(0, 2),
                  )
                ]
              : [],
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
          child: Row(
            children: [
              // Icon container
              AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isSelected
                      ? _kGold.withValues(alpha: 0.15)
                      : Colors.white.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected
                        ? _kGold.withValues(alpha: 0.4)
                        : Colors.white.withValues(alpha: 0.08),
                  ),
                ),
                child: Icon(
                  vehicle.icon,
                  color: isSelected ? _kGold : Colors.white54,
                  size: 24,
                ),
              ),
              const SizedBox(width: 14),

              // Name + subtitle
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          vehicle.name,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: isSelected ? _kGold : Colors.white,
                          ),
                        ),
                        if (vehicle.badge != null) ...[
                          const SizedBox(width: 8),
                          _BadgePill(
                            label: vehicle.badge!,
                            color: vehicle.badge == 'FASTEST'
                                ? _kEmerald
                                : _kGoldDeep,
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      vehicle.subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withValues(alpha: 0.45),
                      ),
                    ),
                  ],
                ),
              ),

              // ETA + Price column
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    vehicle.priceRange,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? _kGold : Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.schedule_rounded,
                        size: 11,
                        color: Colors.white.withValues(alpha: 0.4),
                      ),
                      const SizedBox(width: 3),
                      Text(
                        vehicle.eta,
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.white.withValues(alpha: 0.4),
                        ),
                      ),
                    ],
                  ),
                  if (isSelected) ...[
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: _kGold,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        '✓ SELECTED',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: Colors.black,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BadgePill extends StatelessWidget {
  final String label;
  final Color color;
  const _BadgePill({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.w900,
          color: color,
          letterSpacing: 0.6,
        ),
      ),
    );
  }
}

// ── Data model ───────────────────────────────────────────────────────────────
class _VehicleOption {
  final String type;
  final String name;
  final String subtitle;
  final IconData icon;
  final String? badge;
  final String priceRange;
  final String eta;

  const _VehicleOption({
    required this.type,
    required this.name,
    required this.subtitle,
    required this.icon,
    required this.badge,
    required this.priceRange,
    required this.eta,
  });
}
