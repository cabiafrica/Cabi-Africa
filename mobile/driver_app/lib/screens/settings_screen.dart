import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:driver_app/providers/theme_provider.dart';
import 'package:driver_app/providers/map_provider.dart';
import 'package:driver_app/providers/language_provider.dart';
import 'package:driver_app/screens/language_selection_screen.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:core_ui/core_ui.dart';
import '../services/audio_notification_service.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _allowBackToBack = true;

  @override
  void initState() {
    super.initState();
    _loadB2B();
  }

  Future<void> _loadB2B() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (mounted) {
        setState(() {
          _allowBackToBack = prefs.getBool('cabi_driver_back_to_back') ?? true;
        });
      }
    } catch (e) {
      debugPrint('[SETTINGS] Error loading back-to-back: $e');
    }
  }

  Future<void> _setB2B(bool val) async {
    setState(() => _allowBackToBack = val);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('cabi_driver_back_to_back', val);
    } catch (e) {
      debugPrint('[SETTINGS] Error saving back-to-back: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeProvider);
    final themeNotifier = ref.read(themeProvider.notifier);
    final mapType = ref.watch(mapProvider);
    final mapNotifier = ref.read(mapProvider.notifier);

    final currentLocale = ref.watch(languageProvider);
    final currentLang = CabiLocalizations.getLanguage(currentLocale.languageCode);
    final l10n = CabiLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.settings),
      ),
      body: ListView(
        children: [
          const SizedBox(height: 16),
          _buildSectionHeader(context, l10n.appearance),
          ListTile(
            leading: const Icon(Icons.translate_rounded, color: AppTheme.primaryColor),
            title: Text(l10n.language),
            subtitle: Text('${currentLang.flag} ${currentLang.nativeName} (${currentLang.name})'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const LanguageSelectionScreen(),
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.brightness_6),
            title: Text(l10n.appearance),
            subtitle: Text(_getThemeText(themeMode)),
            trailing: DropdownButton<ThemeMode>(
              value: themeMode,
              underline: const SizedBox(),
              onChanged: (ThemeMode? newValue) {
                if (newValue != null) {
                  themeNotifier.setTheme(newValue);
                }
              },
              items: [
                DropdownMenuItem(
                  value: ThemeMode.system,
                  child: Text(l10n.systemMode),
                ),
                DropdownMenuItem(
                  value: ThemeMode.light,
                  child: Text(l10n.lightMode),
                ),
                DropdownMenuItem(
                  value: ThemeMode.dark,
                  child: Text(l10n.darkMode),
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
          _buildSectionHeader(context, 'Trip & Dispatch Preferences'),
          SwitchListTile(
            secondary: const Icon(Icons.queue_play_next_rounded, color: AppTheme.primaryColor),
            title: const Text('Back-to-Back Trip Requests'),
            subtitle: const Text('Receive upcoming ride offers before finishing your active trip'),
            activeThumbColor: AppTheme.primaryColor,
            value: _allowBackToBack,
            onChanged: (bool val) => _setB2B(val),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
            child: Text(
              _allowBackToBack
                  ? 'Continuous dispatch: Back-to-back offers minimize idle wait between trips.'
                  : 'Paused dispatch: You will only receive offers after completing your current ride.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey),
            ),
          ),
          const Divider(),
          _buildSectionHeader(context, 'Notification Sounds & Chimes'),
          ListTile(
            leading: const Icon(Icons.music_note_outlined, color: AppTheme.primaryColor),
            title: const Text('Sound Preset'),
            subtitle: const Text('Choose your preferred tone character'),
            trailing: DropdownButton<String>(
              value: AudioNotificationService.instance.preset,
              underline: const SizedBox(),
              onChanged: (String? newPreset) {
                if (newPreset != null) {
                  AudioNotificationService.instance.setPreset(newPreset);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Tone preset changed to $newPreset')),
                  );
                }
              },
              items: const [
                DropdownMenuItem(value: 'modern', child: Text('Modern Chime')),
                DropdownMenuItem(value: 'bell', child: Text('Soft Bell')),
                DropdownMenuItem(value: 'digital', child: Text('Digital Pulse')),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.volume_up_outlined, color: AppTheme.primaryColor),
            title: const Text('Customize 12 Event Audio Alerts'),
            subtitle: const Text('Configure individual trip lifecycle chimes'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14),
            onTap: () => _showAudioSettingsModal(context),
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

  void _showAudioSettingsModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.darkSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final service = AudioNotificationService.instance;
            return Container(
              height: MediaQuery.of(context).size.height * 0.75,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Notification Audio & Chimes',
                        style: TextStyle(
                          color: AppTheme.primaryColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white70),
                        onPressed: () => Navigator.pop(modalContext),
                      ),
                    ],
                  ),
                  const Text(
                    'Customize individual trip sounds and test audio triggers.',
                    style: TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: ListView.separated(
                      itemCount: NotificationEvent.values.length,
                      separatorBuilder: (_, __) => const Divider(color: Colors.white12, height: 1),
                      itemBuilder: (context, index) {
                        final ev = NotificationEvent.values[index];
                        final isEnabled = service.isEventEnabled(ev.key);
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(ev.title, style: const TextStyle(color: Colors.white, fontSize: 14)),
                          subtitle: Text(ev.description, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.volume_up, color: AppTheme.primaryColor, size: 20),
                                onPressed: () => service.play(ev.key),
                              ),
                              Switch(
                                value: isEnabled,
                                activeThumbColor: AppTheme.primaryColor,
                                onChanged: (val) async {
                                  await service.setEventEnabled(ev.key, val);
                                  setModalState(() {});
                                },
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
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
