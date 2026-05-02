import 'package:flutter/material.dart';

class DashboardStatCard extends StatelessWidget {
  final String title;
  final String value;
  final String? subtitle;
  final IconData? icon;
  final Color? iconColor;
  final String? statusLabel;
  final Color? statusColor;
  final VoidCallback? onTap;

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
  });

  @override
  Widget build(BuildContext context) {
    // Determine if it's dark mode based on theme or context
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark
              ? const Color(0xFF2C3E50)
              : Colors.white, // Dark slate for dark mode cards
          borderRadius: BorderRadius.circular(12),
          border:
              Border.all(color: isDark ? Colors.white10 : Colors.grey.shade200),
          boxShadow: [
            if (!isDark)
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? Colors.white70 : Colors.grey[600],
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (icon != null)
                  Icon(icon,
                      size: 16,
                      color: isDark ? Colors.white54 : Colors.grey[400]),
                // Arrow right usually
              ],
            ),
            const SizedBox(height: 12),
            if (icon != null && subtitle == null && statusLabel == null) ...[
              // Layout where icon is prominent? No, screenshot shows text
            ],
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    subtitle!,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white38 : Colors.grey[500],
                    ),
                  ),
                ],
                if (statusLabel != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor ?? Colors.red,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      statusLabel!,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  )
                ]
              ],
            ),
          ],
        ),
      ),
    );
  }
}

