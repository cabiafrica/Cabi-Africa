import '../theme/app_theme.dart';
import 'package:flutter/material.dart';

class IncognitoModeWidget extends StatelessWidget {
  final bool isIncognito;
  final ValueChanged<bool> onChanged;

  const IncognitoModeWidget({
    super.key,
    required this.isIncognito,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isIncognito
        ? (isDark ? const Color(0xFF141418) : const Color(0xFF0F172A))
        : (isDark ? const Color(0xFF16161A) : AppTheme.porcelainSurface);
    final borderColor = isIncognito
        ? const Color(0xFF0F9B8E)
        : (isDark ? Colors.white12 : AppTheme.porcelainOutline);
    final titleColor = isIncognito
        ? Colors.white
        : (isDark ? Colors.white : AppTheme.porcelainTextPrimary);
    final subtitleColor = isIncognito
        ? Colors.white70
        : (isDark ? Colors.white60 : AppTheme.porcelainTextSecondary);
    final iconColor = isIncognito
        ? const Color(0xFF0F9B8E)
        : (isDark ? Colors.white60 : AppTheme.porcelainTextSecondary);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: isIncognito ? 4 : 0,
      color: cardBg,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: borderColor, width: isIncognito ? 1.5 : 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.visibility_off,
                  color: iconColor,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Incognito Mode',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: titleColor,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isIncognito
                            ? 'This trip will be hidden from your history'
                            : 'Take a private trip',
                        style: TextStyle(
                          fontSize: 13,
                          color: subtitleColor,
                        ),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: isIncognito,
                  onChanged: onChanged,
                  activeTrackColor: const Color(0xFF1A3A3A),
                  activeThumbColor: const Color(0xFF0F9B8E),
                ),
              ],
            ),
            if (isIncognito) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.05)
                      : Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isDark ? Colors.white12 : Colors.white24,
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline,
                        color: Color(0xFF0F9B8E), size: 20),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Trip will be saved for billing & safety but hidden from your main history',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white70,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
