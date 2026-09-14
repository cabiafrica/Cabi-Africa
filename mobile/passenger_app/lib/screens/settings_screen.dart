import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import 'privacy_settings_screen.dart';
import 'trusted_contacts_screen.dart';
import 'qr_test_screen.dart';
import 'package:passenger_app/theme/app_theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final backgroundColor = theme.scaffoldBackgroundColor;

    final themeProvider = Provider.of<ThemeProvider>(context);

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'SETTINGS',
          style: TextStyle(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 14,
          ),
        ),
        iconTheme: IconThemeData(color: AppTheme.primaryColor),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _buildSettingsSection('APPEARANCE'),
          const SizedBox(height: 12),
          _buildSwitchTile(
            context: context,
            title: 'Dark Mode',
            subtitle: 'Toggle premium dark aesthetic',
            icon: Icons.dark_mode_outlined,
            value: themeProvider.themeMode == ThemeMode.dark,
            onChanged: (isDark) => themeProvider.toggleTheme(isDark),
          ),
          const SizedBox(height: 32),
          _buildSettingsSection('PRIVACY & SECURITY'),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: 'Privacy & Data',
            subtitle: 'Control your prestige data footprint',
            icon: Icons.shield_moon_outlined,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => const PrivacySettingsScreen()),
            ),
          ),
          const SizedBox(height: 32),
          _buildSettingsSection('SAFETY'),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: 'Trusted Contacts',
            subtitle: 'Share your prestige trips with loved ones',
            icon: Icons.people_outline_rounded,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => const TrustedContactsScreen()),
            ),
          ),
          const SizedBox(height: 32),
          _buildSettingsSection('DIAGNOSTICS'),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: 'QR Integration Test',
            subtitle: 'Verify identity & referral QR systems',
            icon: Icons.qr_code_2_rounded,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => const QrTestScreen()),
            ),
          ),
          const SizedBox(height: 40),
          Center(
            child: Text(
              'CABI AFRICA v1.1.0+6\nPRESTIGE EDITION',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.3) ?? Colors.white12,
                fontSize: 10,
                letterSpacing: 2,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSection(String label) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        label,
        style: TextStyle(
          color: AppTheme.primaryColor,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    final theme = Theme.of(context);
    final surfaceColor = theme.cardTheme.color ?? theme.colorScheme.surface;
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final subtitleColor = theme.textTheme.bodyMedium?.color ?? Colors.white38;
    final borderColor = theme.dividerColor;

    return Container(
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: SwitchListTile(
        value: value,
        onChanged: onChanged,
        activeThumbColor: AppTheme.primaryColor,
        activeTrackColor: AppTheme.primaryColor.withValues(alpha: 0.2),
        inactiveTrackColor: theme.colorScheme.onSurface.withValues(alpha: 0.1),
        secondary: Icon(icon, color: AppTheme.primaryColor, size: 20),
        title: Text(title,
            style: TextStyle(
                color: textColor,
                fontWeight: FontWeight.bold,
                fontSize: 14)),
        subtitle: Text(subtitle,
            style: TextStyle(color: subtitleColor, fontSize: 11)),
      ),
    );
  }

  Widget _buildNavigationTile({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    final surfaceColor = theme.cardTheme.color ?? theme.colorScheme.surface;
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final subtitleColor = theme.textTheme.bodyMedium?.color ?? Colors.white38;
    final borderColor = theme.dividerColor;

    return Container(
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: AppTheme.primaryColor, size: 20),
        title: Text(title,
            style: TextStyle(
                color: textColor,
                fontWeight: FontWeight.bold,
                fontSize: 14)),
        subtitle: Text(subtitle,
            style: TextStyle(color: subtitleColor, fontSize: 11)),
        trailing:
            Icon(Icons.chevron_right_rounded, color: subtitleColor.withValues(alpha: 0.5)),
      ),
    );
  }
}

