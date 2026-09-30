import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../providers/language_provider.dart';
import 'language_selection_screen.dart';
import 'privacy_settings_screen.dart';
import 'trusted_contacts_screen.dart';
import 'qr_test_screen.dart';
import 'package:passenger_app/theme/app_theme.dart';
import 'package:core_ui/core_ui.dart';
import '../services/audio_notification_service.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final backgroundColor = theme.scaffoldBackgroundColor;

    final themeProvider = Provider.of<ThemeProvider>(context);
    final languageProvider = Provider.of<LanguageProvider>(context);
    final currentLang = CabiLocalizations.getLanguage(languageProvider.languageCode);
    final l10n = CabiLocalizations.of(context);

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          l10n.settings.toUpperCase(),
          style: const TextStyle(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 14,
          ),
        ),
        iconTheme: const IconThemeData(color: AppTheme.primaryColor),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _buildSettingsSection(l10n.appearance.toUpperCase()),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: l10n.language,
            subtitle: '${currentLang.flag} ${currentLang.nativeName} (${currentLang.name})',
            icon: Icons.language_rounded,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const LanguageSelectionScreen(),
              ),
            ),
          ),
          const SizedBox(height: 12),
          _buildSwitchTile(
            context: context,
            title: l10n.darkMode,
            subtitle: 'Toggle premium dark aesthetic',
            icon: Icons.dark_mode_outlined,
            value: themeProvider.themeMode == ThemeMode.dark,
            onChanged: (isDark) => themeProvider.toggleTheme(isDark),
          ),
          const SizedBox(height: 32),
          _buildSettingsSection('NOTIFICATION SOUNDS & CHIMES'),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: 'Trip Audio Chimes',
            subtitle: 'Customize tones for requests, arrivals & trip milestones',
            icon: Icons.music_note_outlined,
            onTap: () => _showAudioSettingsModal(context),
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

  void _showAudioSettingsModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E1E1E),
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
                        'Trip Notification Audio & Chimes',
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
                  // Preset selector
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black26,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Tone Preset', style: TextStyle(color: Colors.white70, fontSize: 13)),
                        DropdownButton<String>(
                          value: service.preset,
                          dropdownColor: const Color(0xFF2A2A2A),
                          underline: const SizedBox(),
                          onChanged: (String? newPreset) {
                            if (newPreset != null) {
                              service.setPreset(newPreset);
                              setModalState(() {});
                            }
                          },
                          items: const [
                            DropdownMenuItem(value: 'modern', child: Text('Modern Chime', style: TextStyle(color: Colors.white))),
                            DropdownMenuItem(value: 'bell', child: Text('Soft Bell', style: TextStyle(color: Colors.white))),
                            DropdownMenuItem(value: 'digital', child: Text('Digital Pulse', style: TextStyle(color: Colors.white))),
                          ],
                        ),
                      ],
                    ),
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
                                activeColor: AppTheme.primaryColor,
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
}

