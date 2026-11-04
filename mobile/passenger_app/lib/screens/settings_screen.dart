import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../providers/language_provider.dart';
import 'language_selection_screen.dart';
import 'privacy_settings_screen.dart';
import 'trusted_contacts_screen.dart';
import 'safety_center_screen.dart';
import 'qr_test_screen.dart';
import 'package:passenger_app/theme/app_theme.dart';
import 'package:core_ui/core_ui.dart';
import '../services/audio_notification_service.dart';
import '../services/passenger_biometric_service.dart';
import '../widgets/security_verification_modal.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _biometricStatus = 'Loading...';
  String _activeMethod = 'FACE_RECOGNITION';

  @override
  void initState() {
    super.initState();
    _loadBiometricSettings();
  }

  Future<void> _loadBiometricSettings() async {
    final configured = await PassengerBiometricService.isConfigured();
    final method = await PassengerBiometricService.getPreferredMethod();
    if (mounted) {
      setState(() {
        _activeMethod = method;
        _biometricStatus = configured
            ? 'Active: ${PassengerBiometricService.methodDisplayName(method)}'
            : 'One-time setup pending';
      });
    }
  }

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
          style: TextStyle(
            color: Theme.of(context).brightness == Brightness.dark
                ? AppTheme.primaryColor
                : AppTheme.aurumBronze,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 14,
          ),
        ),
        iconTheme: IconThemeData(
          color: Theme.of(context).brightness == Brightness.dark
              ? AppTheme.primaryColor
              : AppTheme.aurumBronze,
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _buildSettingsSection(l10n.appearance.toUpperCase(), isDark: theme.brightness == Brightness.dark),
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
          _buildSettingsSection('NOTIFICATION SOUNDS & CHIMES', isDark: theme.brightness == Brightness.dark),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: 'Trip Audio Chimes',
            subtitle: 'Customize tones for requests, arrivals & trip milestones',
            icon: Icons.music_note_outlined,
            onTap: () => _showAudioSettingsModal(context),
          ),
          const SizedBox(height: 32),
          _buildSettingsSection('PRIVACY & SECURITY', isDark: theme.brightness == Brightness.dark),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: 'Biometric & Identity Verification',
            subtitle: _biometricStatus,
            icon: Icons.fingerprint_rounded,
            onTap: () => _showBiometricSettingsModal(context),
          ),
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
          _buildSettingsSection('SAFETY', isDark: theme.brightness == Brightness.dark),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: 'Safety Command Center',
            subtitle: '24/7 patrol, 3s tactical SOS & in-transit telemetry',
            icon: Icons.shield_rounded,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => const SafetyCenterScreen()),
            ),
          ),
          const SizedBox(height: 8),
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
          _buildSettingsSection('DIAGNOSTICS', isDark: theme.brightness == Brightness.dark),
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

  Widget _buildSettingsSection(String label, {bool isDark = true}) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        label,
        style: TextStyle(
          color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final surfaceColor = isDark
        ? (Theme.of(context).cardTheme.color ?? Theme.of(context).colorScheme.surface)
        : AppTheme.porcelainSurface;
    final textColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subtitleColor = isDark ? Colors.white38 : AppTheme.porcelainTextSecondary;
    final borderColor = isDark ? Theme.of(context).dividerColor : AppTheme.porcelainOutline;

    return Container(
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: SwitchListTile(
        value: value,
        onChanged: onChanged,
        activeThumbColor: accent,
        activeTrackColor: accent.withValues(alpha: 0.2),
        inactiveTrackColor: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.1),
        secondary: Icon(icon, color: accent, size: 20),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final surfaceColor = isDark
        ? (Theme.of(context).cardTheme.color ?? Theme.of(context).colorScheme.surface)
        : AppTheme.porcelainSurface;
    final textColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subtitleColor = isDark ? Colors.white38 : AppTheme.porcelainTextSecondary;
    final borderColor = isDark ? Theme.of(context).dividerColor : AppTheme.porcelainOutline;

    return Container(
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: accent, size: 20),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : AppTheme.porcelainSurface;
    final textColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subColor = isDark ? Colors.white54 : AppTheme.porcelainTextSecondary;
    final outlineColor = isDark ? Colors.white12 : AppTheme.porcelainOutline;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: surfaceColor,
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
                      Text(
                        'Trip Notification Audio & Chimes',
                        style: TextStyle(
                          color: accent,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      IconButton(
                        icon: Icon(Icons.close, color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary),
                        onPressed: () => Navigator.pop(modalContext),
                      ),
                    ],
                  ),
                  Text(
                    'Customize individual trip sounds and test audio triggers.',
                    style: TextStyle(color: subColor, fontSize: 12),
                  ),
                  const SizedBox(height: 12),
                  // Preset selector
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.black26 : AppTheme.porcelainSurfaceContainer,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: outlineColor),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Tone Preset', style: TextStyle(color: subColor, fontSize: 13)),
                        DropdownButton<String>(
                          value: service.preset,
                          dropdownColor: isDark ? const Color(0xFF2A2A2A) : AppTheme.porcelainSurface,
                          underline: const SizedBox(),
                          onChanged: (String? newPreset) {
                            if (newPreset != null) {
                              service.setPreset(newPreset);
                              setModalState(() {});
                            }
                          },
                          items: [
                            DropdownMenuItem(value: 'modern', child: Text('Modern Chime', style: TextStyle(color: textColor))),
                            DropdownMenuItem(value: 'bell', child: Text('Soft Bell', style: TextStyle(color: textColor))),
                            DropdownMenuItem(value: 'digital', child: Text('Digital Pulse', style: TextStyle(color: textColor))),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: ListView.separated(
                      itemCount: NotificationEvent.values.length,
                      separatorBuilder: (_, __) => Divider(color: outlineColor, height: 1),
                      itemBuilder: (context, index) {
                        final ev = NotificationEvent.values[index];
                        final isEnabled = service.isEventEnabled(ev.key);
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(ev.title, style: TextStyle(color: textColor, fontSize: 14)),
                          subtitle: Text(ev.description, style: TextStyle(color: subColor, fontSize: 11)),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: Icon(Icons.volume_up, color: accent, size: 20),
                                onPressed: () => service.play(ev.key),
                              ),
                              Switch(
                                value: isEnabled,
                                activeThumbColor: accent,
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

  void _showBiometricSettingsModal(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : AppTheme.porcelainSurface;
    final subColor = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                border: Border(
                  top: BorderSide(color: accent, width: 1.2),
                ),
              ),
              child: SafeArea(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: accent.withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(Icons.fingerprint_rounded, color: accent, size: 22),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Biometric & Verification',
                              style: TextStyle(
                                color: accent,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: Icon(Icons.close, color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary),
                          onPressed: () => Navigator.pop(modalContext),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Choose your default identity verification method for Cabi ride requests.',
                      style: TextStyle(color: subColor, fontSize: 12),
                    ),
                    const SizedBox(height: 20),
                    _buildMethodChoiceTile(
                      title: 'Face Recognition Scan',
                      subtitle: 'Passive scan via camera reticle • No photo saved',
                      icon: Icons.face_retouching_natural_rounded,
                      methodKey: 'FACE_RECOGNITION',
                      setSheetState: setSheetState,
                      modalContext: modalContext,
                      isDark: isDark,
                      accent: accent,
                    ),
                    const SizedBox(height: 10),
                    _buildMethodChoiceTile(
                      title: 'Fingerprint Biometrics',
                      subtitle: 'Hardware fingerprint sensor / Touch ID',
                      icon: Icons.fingerprint_rounded,
                      methodKey: 'FINGERPRINT',
                      setSheetState: setSheetState,
                      modalContext: modalContext,
                      isDark: isDark,
                      accent: accent,
                    ),
                    const SizedBox(height: 10),
                    _buildMethodChoiceTile(
                      title: 'SMS OTP Verification',
                      subtitle: '6-digit SMS verification code',
                      icon: Icons.sms_rounded,
                      methodKey: 'OTP',
                      setSheetState: setSheetState,
                      modalContext: modalContext,
                      isDark: isDark,
                      accent: accent,
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        icon: Icon(Icons.face_retouching_natural_rounded, color: accent, size: 18),
                        label: Text(
                          'RUN PASSIVE FACE SCAN NOW',
                          style: TextStyle(
                            color: accent,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            letterSpacing: 1,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: accent),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          Navigator.pop(modalContext);
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (bCtx) => SecurityVerificationModal(
                              isFirstTimeSetup: false,
                              onVerified: () {
                                _loadBiometricSettings();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Face recognition scan verified and saved!'),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildMethodChoiceTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required String methodKey,
    required StateSetter setSheetState,
    required BuildContext modalContext,
    required bool isDark,
    required Color accent,
  }) {
    final isSelected = _activeMethod == methodKey;
    final textColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subColor = isDark ? Colors.white38 : AppTheme.porcelainTextSecondary;

    return InkWell(
      onTap: () async {
        final messenger = ScaffoldMessenger.of(context);
        final nav = Navigator.of(modalContext);
        await PassengerBiometricService.saveSettings(method: methodKey, isConfigured: true);
        await _loadBiometricSettings();
        setSheetState(() {});
        if (!mounted) return;
        nav.pop();
        messenger.showSnackBar(
          SnackBar(
            content: Text(
              'Preferred verification set to $title',
              style: TextStyle(color: isDark ? Colors.white : AppTheme.porcelainTextPrimary),
            ),
            backgroundColor: isDark ? const Color(0xFF1E1E1E) : AppTheme.porcelainSurface,
            duration: const Duration(seconds: 2),
          ),
        );
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? accent.withValues(alpha: 0.12)
              : (isDark
                  ? Colors.white.withValues(alpha: 0.04)
                  : AppTheme.porcelainSurfaceContainer),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected
                ? accent
                : (isDark
                    ? Colors.white.withValues(alpha: 0.08)
                    : AppTheme.porcelainOutline),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? accent
                  : (isDark ? Colors.white60 : AppTheme.porcelainTextSecondary),
              size: 24,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: isSelected ? accent : textColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: isSelected
                          ? (isDark ? Colors.white70 : AppTheme.porcelainTextSecondary)
                          : subColor,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(
                Icons.check_circle_rounded,
                color: accent,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }
}

