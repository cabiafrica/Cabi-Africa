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

  void _showBiometricSettingsModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              decoration: const BoxDecoration(
                color: Color(0xFF1E1E1E),
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                border: Border(
                  top: BorderSide(color: Color(0xFFD4AF37), width: 1.2),
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
                                color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.fingerprint_rounded, color: Color(0xFFD4AF37), size: 22),
                            ),
                            const SizedBox(width: 12),
                            const Text(
                              'Biometric & Verification',
                              style: TextStyle(
                                color: Color(0xFFD4AF37),
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white70),
                          onPressed: () => Navigator.pop(modalContext),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Choose your default identity verification method for Cabi ride requests.',
                      style: TextStyle(color: Colors.white60, fontSize: 12),
                    ),
                    const SizedBox(height: 20),
                    _buildMethodChoiceTile(
                      title: 'Face Recognition Scan',
                      subtitle: 'Passive scan via camera reticle • No photo saved',
                      icon: Icons.face_retouching_natural_rounded,
                      methodKey: 'FACE_RECOGNITION',
                      setSheetState: setSheetState,
                      modalContext: modalContext,
                    ),
                    const SizedBox(height: 10),
                    _buildMethodChoiceTile(
                      title: 'Fingerprint Biometrics',
                      subtitle: 'Hardware fingerprint sensor / Touch ID',
                      icon: Icons.fingerprint_rounded,
                      methodKey: 'FINGERPRINT',
                      setSheetState: setSheetState,
                      modalContext: modalContext,
                    ),
                    const SizedBox(height: 10),
                    _buildMethodChoiceTile(
                      title: 'SMS OTP Verification',
                      subtitle: '6-digit SMS verification code',
                      icon: Icons.sms_rounded,
                      methodKey: 'OTP',
                      setSheetState: setSheetState,
                      modalContext: modalContext,
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.face_retouching_natural_rounded, color: Color(0xFFD4AF37), size: 18),
                        label: const Text(
                          'RUN PASSIVE FACE SCAN NOW',
                          style: TextStyle(
                            color: Color(0xFFD4AF37),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            letterSpacing: 1,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFD4AF37)),
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
  }) {
    final isSelected = _activeMethod == methodKey;
    return InkWell(
      onTap: () async {
        await PassengerBiometricService.saveSettings(method: methodKey, isConfigured: true);
        await _loadBiometricSettings();
        setSheetState(() {});
        if (!mounted) return;
        Navigator.pop(modalContext);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Preferred verification set to $title'),
            backgroundColor: const Color(0xFF1E1E1E),
            duration: const Duration(seconds: 2),
          ),
        );
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFFD4AF37).withValues(alpha: 0.12)
              : Colors.white.withValues(alpha: 0.04),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected
                ? const Color(0xFFD4AF37)
                : Colors.white.withValues(alpha: 0.08),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? const Color(0xFFD4AF37) : Colors.white60,
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
                      color: isSelected ? const Color(0xFFD4AF37) : Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: isSelected ? Colors.white70 : Colors.white38,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle_rounded,
                color: Color(0xFFD4AF37),
                size: 20,
              ),
          ],
        ),
      ),
    );
  }
}

