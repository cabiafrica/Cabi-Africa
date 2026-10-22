import 'package:flutter/material.dart';
import 'package:driver_app/theme/app_theme.dart';

/// Obsidian Gold stat card used in the driver dashboard grid.
/// Matches Stitch project 5681992570744779348 bento-stack design.
class DashboardStatCard extends StatelessWidget {
  final String title;
  final String value;
  final String? subtitle;
  final IconData? icon;
  final Color? iconColor;
  final String? statusLabel;
  final Color? statusColor;
  final VoidCallback? onTap;
  final bool highlight; // gold-border emphasis mode

  const DashboardStatCard({
    super.key,
    required this.title,
    required this.value,
    this.subtitle,
    this.icon,
    this.iconColor,
    this.statusLabel,
    this.statusColor,
    this.onTap,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    final accent = iconColor ?? AppTheme.primaryColor;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1D),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: highlight
                ? AppTheme.primaryColor.withValues(alpha: 0.5)
                : Colors.white.withValues(alpha: 0.06),
            width: highlight ? 1.5 : 1.0,
          ),
          boxShadow: [
            if (highlight)
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.12),
                blurRadius: 16,
                spreadRadius: 1,
              ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.35),
              blurRadius: 8,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // ── Top row: label + icon ──
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.7,
                      color: Colors.white.withValues(alpha: 0.42),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (icon != null) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.all(5),
                    decoration: BoxDecoration(
                      color: accent.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon, size: 14, color: accent),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 10),

            // ── Value ──
            Text(
              value,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: highlight ? AppTheme.primaryColor : Colors.white,
                height: 1.0,
              ),
            ),

            // ── Subtitle ──
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(
                subtitle!,
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.white.withValues(alpha: 0.38),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],

            // ── Status pill ──
            if (statusLabel != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: (statusColor ?? AppTheme.errorRed)
                      .withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: (statusColor ?? AppTheme.errorRed)
                        .withValues(alpha: 0.4),
                    width: 0.8,
                  ),
                ),
                child: Text(
                  statusLabel!,
                  style: TextStyle(
                    color: statusColor ?? AppTheme.errorRed,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
