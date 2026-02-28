import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import 'privacy_settings_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFFFFD700); // Prestige Gold
    const backgroundColor = Color(0xFF0A0A0A); // Deep Black

    final themeProvider = Provider.of<ThemeProvider>(context);

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'SETTINGS',
          style: TextStyle(
            color: primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 14,
          ),
        ),
        iconTheme: const IconThemeData(color: primaryColor),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _buildSettingsSection('APPEARANCE'),
          const SizedBox(height: 12),
          _buildSwitchTile(
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
            title: 'Privacy & Data',
            subtitle: 'Control your prestige data footprint',
            icon: Icons.shield_moon_outlined,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => const PrivacySettingsScreen()),
            ),
          ),
          const SizedBox(height: 40),
          const Center(
            child: Text(
              'CABI AFRICA v1.0.4\nPRESTIGE EDITION',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white12,
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
        style: const TextStyle(
          color: Color(0xFFFFD700),
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    const primaryColor = Color(0xFFFFD700);
    const surfaceColor = Color(0xFF141414);

    return Container(
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: SwitchListTile(
        value: value,
        onChanged: onChanged,
        activeColor: primaryColor,
        activeTrackColor: primaryColor.withValues(alpha: 0.2),
        inactiveTrackColor: Colors.white10,
        secondary: Icon(icon, color: primaryColor, size: 20),
        title: Text(title,
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14)),
        subtitle: Text(subtitle,
            style: const TextStyle(color: Colors.white38, fontSize: 11)),
      ),
    );
  }

  Widget _buildNavigationTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    const primaryColor = Color(0xFFFFD700);
    const surfaceColor = Color(0xFF141414);

    return Container(
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: primaryColor, size: 20),
        title: Text(title,
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14)),
        subtitle: Text(subtitle,
            style: const TextStyle(color: Colors.white38, fontSize: 11)),
        trailing:
            const Icon(Icons.chevron_right_rounded, color: Colors.white24),
      ),
    );
  }
}
