import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/providers/theme_provider.dart';
import 'package:driver_app/providers/map_provider.dart';
import 'package:driver_app/theme/app_theme.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);
    final themeNotifier = ref.read(themeProvider.notifier);
    final mapType = ref.watch(mapProvider);
    final mapNotifier = ref.read(mapProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          const SizedBox(height: 16),
          _buildSectionHeader(context, 'Display'),
          ListTile(
            leading: const Icon(Icons.brightness_6),
            title: const Text('Theme'),
            subtitle: Text(_getThemeText(themeMode)),
            trailing: DropdownButton<ThemeMode>(
              value: themeMode,
              underline: const SizedBox(),
              onChanged: (ThemeMode? newValue) {
                if (newValue != null) {
                  themeNotifier.setTheme(newValue);
                }
              },
              items: const [
                DropdownMenuItem(
                  value: ThemeMode.system,
                  child: Text('System'),
                ),
                DropdownMenuItem(
                  value: ThemeMode.light,
                  child: Text('Light'),
                ),
                DropdownMenuItem(
                  value: ThemeMode.dark,
                  child: Text('Dark'),
                ),
              ],
            ),
          ),
          const Divider(),
          _buildSectionHeader(context, 'Navigation & Maps'),
          ListTile(
            leading: const Icon(Icons.layers_outlined),
            title: const Text('Map Provider'),
            subtitle: Text(mapType.displayName),
            trailing: DropdownButton<MapType>(
              value: mapType,
              underline: const SizedBox(),
              onChanged: (MapType? newType) {
                if (newType != null) {
                  mapNotifier.setMapType(newType);
                }
              },
              items: const [
                DropdownMenuItem(
                  value: MapType.google,
                  child: Text('Google Maps'),
                ),
                DropdownMenuItem(
                  value: MapType.cabi,
                  child: Text('Cabi Africa Maps'),
                ),
              ],
            ),
          ),
          Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
            child: Text(
              mapType == MapType.google
                  ? 'Google Maps Platform: Official global road network, live routing, and satellite view.'
                  : 'Cabi Africa Maps: High-contrast Africa road network with detailed local landmarks and low data usage.',
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: Colors.grey),
            ),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('About App'),
            subtitle: const Text('Version 1.1.0+6'),
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    // Check brightness to ensure contrast. If Light mode, use dark gold or black. If Dark mode, Gold is fine.
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: isDark
              ? AppTheme.primaryColor
              : Colors.black87, // Gold on Black, Black on White
          fontWeight: FontWeight.bold,
          fontSize: 12,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  String _getThemeText(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.system:
        return 'System Default';
      case ThemeMode.light:
        return 'Light Mode';
      case ThemeMode.dark:
        return 'Dark Mode';
    }
  }
}
