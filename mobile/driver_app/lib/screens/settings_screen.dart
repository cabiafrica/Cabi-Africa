import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:driver_app/config/app_config.dart';
import 'package:driver_app/providers/theme_provider.dart';
import 'package:driver_app/providers/map_provider.dart';
import 'package:driver_app/providers/language_provider.dart';
import 'package:driver_app/screens/account_deletion_screen.dart';
import 'package:driver_app/screens/language_selection_screen.dart';
import 'package:driver_app/screens/safety_checkup_screen.dart';
import 'package:driver_app/screens/support_screen.dart';
import 'package:driver_app/screens/vehicle_account_screen.dart';
import 'package:driver_app/screens/sacco_screen.dart';
import 'package:driver_app/screens/wealth_creation_screen.dart';
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
  String _externalNavApp = 'google';

  @override
  void initState() {
    super.initState();
    _loadB2B();
    _loadNavApp();
  }

  Future<void> _loadNavApp() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (mounted) {
        setState(() {
          _externalNavApp = prefs.getString('cabi_driver_external_nav') ?? 'google';
        });
      }
    } catch (_) {}
  }

  Future<void> _setNavApp(String app) async {
    setState(() => _externalNavApp = app);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('cabi_driver_external_nav', app);
    } catch (_) {}
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

      // Async sync with dispatch service preferences endpoint
      final token = await const FlutterSecureStorage().read(key: 'jwt_token');
      if (token != null) {
        final uri = Uri.parse('${AppConfig.dispatchApiUrl}/dispatch/drivers/me/preferences');
        http.patch(
          uri,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: jsonEncode({'allowBackToBack': val}),
        ).timeout(const Duration(seconds: 5)).then((resp) {
          debugPrint('[SETTINGS] Dispatch back-to-back preferences synced: ${resp.statusCode}');
        }).catchError((err) {
          debugPrint('[SETTINGS] Warning: Backend sync failed, preference cached locally: $err');
        });
      }
    } catch (e) {
      debugPrint('[SETTINGS] Error saving back-to-back: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final themeMode = ref.watch(themeProvider);
    final themeNotifier = ref.read(themeProvider.notifier);
    final mapType = ref.watch(mapProvider);
    final mapNotifier = ref.read(mapProvider.notifier);

    final currentLocale = ref.watch(languageProvider);
    final currentLang = CabiLocalizations.getLanguage(currentLocale.languageCode);
    final l10n = CabiLocalizations.of(context);

    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final bgColor = isDark ? AppTheme.obsidianCanvas : AppTheme.porcelainCanvas;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: accent, size: 20),
          tooltip: 'Back',
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: Text(
          l10n.settings.toUpperCase(),
          style: GoogleFonts.inter(
            color: accent,
            fontWeight: FontWeight.w800,
            letterSpacing: 2.0,
            fontSize: 14,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        children: [
          // ── APPEARANCE & DISPLAY ──
          _buildSettingsSection(l10n.appearance.toUpperCase(), isDark: isDark),
          _buildThemeSelector(context, themeMode, themeNotifier, isDark),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: l10n.language,
            subtitle: '${currentLang.flag} ${currentLang.nativeName} (${currentLang.name})',
            icon: Icons.translate_rounded,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const LanguageSelectionScreen(),
              ),
            ),
          ),

          const SizedBox(height: 28),

          // ── NAVIGATION & MAPPING ──
          _buildSettingsSection(l10n.mapProvider.toUpperCase(), isDark: isDark),
          _buildMapProviderSelector(context, mapType, mapNotifier, isDark),
          const SizedBox(height: 12),
          _buildExternalNavSelector(context, isDark),

          const SizedBox(height: 28),

          // ── VEHICLE & FLEET MANAGEMENT ──
          _buildSettingsSection(l10n.vehicleFleet.toUpperCase(), isDark: isDark),
          _buildNavigationTile(
            context: context,
            title: l10n.vehicleAccount,
            subtitle: 'Inspect maintenance ledger, active shift & vehicle incentives',
            icon: Icons.directions_car_filled_rounded,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const VehicleAccountScreen(vehicleData: {}),
              ),
            ),
          ),

          const SizedBox(height: 28),

          // ── SACCO & CABI LEGACY ──
          _buildSettingsSection('SACCO & CABI LEGACY', isDark: isDark),
          _buildNavigationTile(
            context: context,
            title: 'Cabi Legacy Programs',
            subtitle: 'Choose programs, custom deduction % and automatic trip allocations',
            icon: Icons.auto_awesome_rounded,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const WealthCreationScreen()),
            ),
          ),
          _buildNavigationTile(
            context: context,
            title: l10n.saccoSavings,
            subtitle: 'Enroll with 2% deduction + 3% Cabi match for 6 months & view shares ledger',
            icon: Icons.savings_outlined,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SaccoScreen()),
            ),
          ),

          const SizedBox(height: 28),

          // ── DISPATCH & TRIPS ──
          _buildSettingsSection('DISPATCH & TRIP PREFERENCES', isDark: isDark),
          _buildSwitchTile(
            context: context,
            title: l10n.backToBackTrips,
            subtitle: _allowBackToBack
                ? 'Continuous dispatch: receive offers before completing current ride'
                : 'Paused dispatch: only receive offers after completing current ride',
            icon: Icons.queue_play_next_rounded,
            value: _allowBackToBack,
            onChanged: (val) => _setB2B(val),
          ),

          const SizedBox(height: 28),

          // ── AUDIO NOTIFICATIONS & CHIMES ──
          _buildSettingsSection(l10n.soundSettings.toUpperCase(), isDark: isDark),
          _buildSoundPresetSelector(context, isDark),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: l10n.tripAudioChimes,
            subtitle: 'Configure and test individual trip lifecycle chimes',
            icon: Icons.volume_up_outlined,
            onTap: () => _showAudioSettingsModal(context),
          ),

          const SizedBox(height: 28),

          // ── DRIVER SAFETY & SUPPORT ──
          _buildSettingsSection('DRIVER SAFETY & SUPPORT', isDark: isDark),
          _buildNavigationTile(
            context: context,
            title: l10n.safetyCommandCenter,
            subtitle: '24/7 patrol telemetry, PIN checks & emergency protocol',
            icon: Icons.shield_rounded,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SafetyCheckupScreen()),
            ),
          ),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: l10n.help,
            subtitle: 'Direct dispatch assistance and driver welfare',
            icon: Icons.headset_mic_outlined,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const DriverSupportScreen()),
            ),
          ),
          const SizedBox(height: 12),
          _buildNavigationTile(
            context: context,
            title: l10n.deleteAccount,
            subtitle: 'Unbind vehicle, anonymize PII & request 30-day settlement',
            icon: Icons.delete_outline_rounded,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const AccountDeletionScreen()),
            ),
          ),

          const SizedBox(height: 36),

          // ── FOOTER VERSION ──
          Center(
            child: Column(
              children: [
                Text(
                  'CABI DRIVE • CAPTAIN EDITION',
                  style: GoogleFonts.inter(
                    color: isDark ? Colors.white30 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.5),
                    fontSize: 10,
                    letterSpacing: 1.8,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Version 1.1.0+6  •  Build 2026.11',
                  style: GoogleFonts.inter(
                    color: isDark ? Colors.white24 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.35),
                    fontSize: 9.5,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSettingsSection(String label, {required bool isDark}) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        label,
        style: GoogleFonts.inter(
          color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
          fontSize: 10.5,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.6,
        ),
      ),
    );
  }

  Widget _buildThemeSelector(
    BuildContext context,
    ThemeMode themeMode,
    ThemeNotifier themeNotifier,
    bool isDark,
  ) {
    final activeBorder = AppTheme.primaryColor;
    final inactiveBorder = isDark ? AppTheme.outlineGold.withValues(alpha: 0.25) : AppTheme.porcelainOutline;
    final cardBg = isDark ? AppTheme.surfaceContainer : AppTheme.porcelainSurface;
    final isLightSelected = themeMode == ThemeMode.light || (!isDark && themeMode == ThemeMode.system);
    final isDarkSelected = themeMode == ThemeMode.dark || (isDark && themeMode == ThemeMode.system);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.palette_outlined,
                color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                'THEME MODE',
                style: GoogleFonts.inter(
                  color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 12.5,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              // Light Mode Card
              Expanded(
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => themeNotifier.setTheme(ThemeMode.light),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
                    decoration: BoxDecoration(
                      color: isLightSelected
                          ? AppTheme.primaryColor.withValues(alpha: 0.12)
                          : (isDark ? Colors.black26 : const Color(0xFFF6F3F2)),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isLightSelected ? activeBorder : inactiveBorder,
                        width: isLightSelected ? 2.0 : 1.0,
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          Icons.wb_sunny_rounded,
                          color: isLightSelected ? AppTheme.primaryColor : (isDark ? Colors.white54 : AppTheme.porcelainTextSecondary),
                          size: 24,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Light Mode',
                          style: GoogleFonts.inter(
                            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                            fontWeight: isLightSelected ? FontWeight.w800 : FontWeight.w500,
                            fontSize: 12.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Porcelain Day',
                          style: GoogleFonts.inter(
                            color: isLightSelected ? AppTheme.primaryColor : Colors.grey,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Dark Mode Card
              Expanded(
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => themeNotifier.setTheme(ThemeMode.dark),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
                    decoration: BoxDecoration(
                      color: isDarkSelected
                          ? AppTheme.primaryColor.withValues(alpha: 0.12)
                          : (isDark ? Colors.black26 : const Color(0xFFF6F3F2)),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isDarkSelected ? activeBorder : inactiveBorder,
                        width: isDarkSelected ? 2.0 : 1.0,
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          Icons.dark_mode_rounded,
                          color: isDarkSelected ? AppTheme.primaryColor : (isDark ? Colors.white54 : AppTheme.porcelainTextSecondary),
                          size: 24,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Dark Mode',
                          style: GoogleFonts.inter(
                            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                            fontWeight: isDarkSelected ? FontWeight.w800 : FontWeight.w500,
                            fontSize: 12.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Obsidian Night',
                          style: GoogleFonts.inter(
                            color: isDarkSelected ? AppTheme.primaryColor : Colors.grey,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // System Default toggle option
          InkWell(
            borderRadius: BorderRadius.circular(8),
            onTap: () => themeNotifier.setTheme(ThemeMode.system),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
              child: Row(
                children: [
                  Icon(
                    themeMode == ThemeMode.system ? Icons.radio_button_checked : Icons.radio_button_off,
                    size: 16,
                    color: themeMode == ThemeMode.system
                        ? (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze)
                        : (isDark ? Colors.white38 : Colors.black38),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Match device system appearance',
                    style: GoogleFonts.inter(
                      color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
                      fontSize: 12,
                      fontWeight: themeMode == ThemeMode.system ? FontWeight.w700 : FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapProviderSelector(
    BuildContext context,
    MapType mapType,
    MapNotifier mapNotifier,
    bool isDark,
  ) {
    final activeBorder = AppTheme.primaryColor;
    final inactiveBorder = isDark ? AppTheme.outlineGold.withValues(alpha: 0.25) : AppTheme.porcelainOutline;
    final cardBg = isDark ? AppTheme.surfaceContainer : AppTheme.porcelainSurface;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.layers_outlined,
                color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                'MAP ENGINE PROVIDER',
                style: GoogleFonts.inter(
                  color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 12.5,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              // Google Maps Card
              Expanded(
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => mapNotifier.setMapType(MapType.google),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: mapType == MapType.google
                          ? AppTheme.primaryColor.withValues(alpha: 0.12)
                          : (isDark ? Colors.black26 : const Color(0xFFF6F3F2)),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: mapType == MapType.google ? activeBorder : inactiveBorder,
                        width: mapType == MapType.google ? 2.0 : 1.0,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Icon(
                              Icons.public_rounded,
                              color: mapType == MapType.google ? AppTheme.primaryColor : (isDark ? Colors.white54 : AppTheme.porcelainTextSecondary),
                              size: 22,
                            ),
                            if (mapType == MapType.google)
                              const Icon(Icons.check_circle_rounded, color: AppTheme.primaryColor, size: 16),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Google Maps',
                          style: GoogleFonts.inter(
                            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                            fontWeight: FontWeight.w700,
                            fontSize: 12.5,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'Live traffic, global satellite & route layers',
                          style: GoogleFonts.inter(
                            color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                            fontSize: 10,
                            height: 1.25,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Cabi Africa Maps Card
              Expanded(
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => mapNotifier.setMapType(MapType.cabi),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: mapType == MapType.cabi
                          ? AppTheme.primaryColor.withValues(alpha: 0.12)
                          : (isDark ? Colors.black26 : const Color(0xFFF6F3F2)),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: mapType == MapType.cabi ? activeBorder : inactiveBorder,
                        width: mapType == MapType.cabi ? 2.0 : 1.0,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Icon(
                              Icons.map_rounded,
                              color: mapType == MapType.cabi ? AppTheme.primaryColor : (isDark ? Colors.white54 : AppTheme.porcelainTextSecondary),
                              size: 22,
                            ),
                            if (mapType == MapType.cabi)
                              const Icon(Icons.check_circle_rounded, color: AppTheme.primaryColor, size: 16),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Cabi Africa Maps',
                          style: GoogleFonts.inter(
                            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                            fontWeight: FontWeight.w700,
                            fontSize: 12.5,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'High-contrast Africa landmarks, low data use',
                          style: GoogleFonts.inter(
                            color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                            fontSize: 10,
                            height: 1.25,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildExternalNavSelector(BuildContext context, bool isDark) {
    final activeBorder = AppTheme.primaryColor;
    final inactiveBorder = isDark ? AppTheme.outlineGold.withValues(alpha: 0.25) : AppTheme.porcelainOutline;
    final cardBg = isDark ? AppTheme.surfaceContainer : AppTheme.porcelainSurface;

    final navApps = [
      {'key': 'google', 'label': 'Google Maps', 'desc': 'Traffic & satellite nav'},
      {'key': 'waze', 'label': 'Waze', 'desc': 'Speed traps & live hazards'},
      {'key': 'inapp', 'label': 'Cabi In-App', 'desc': 'Integrated HUD cockpit'},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.navigation_rounded,
                color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                'TURN-BY-TURN NAVIGATION APP',
                style: GoogleFonts.inter(
                  color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 12.5,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: navApps.map((app) {
              final isSelected = _externalNavApp == app['key'];
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(10),
                    onTap: () {
                      _setNavApp(app['key']!);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          duration: const Duration(seconds: 2),
                          content: Text('Navigation app set to ${app['label']}'),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppTheme.primaryColor.withValues(alpha: 0.15)
                            : (isDark ? Colors.black26 : const Color(0xFFF6F3F2)),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? activeBorder : inactiveBorder,
                          width: isSelected ? 1.8 : 1.0,
                        ),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            app['key'] == 'google'
                                ? Icons.directions_rounded
                                : (app['key'] == 'waze' ? Icons.traffic_rounded : Icons.map_outlined),
                            size: 20,
                            color: isSelected
                                ? AppTheme.primaryColor
                                : (isDark ? Colors.white54 : AppTheme.porcelainTextSecondary),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            app['label']!,
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            app['desc']!,
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary,
                              fontSize: 9,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSoundPresetSelector(BuildContext context, bool isDark) {
    final service = AudioNotificationService.instance;
    final currentPreset = service.preset;
    final cardBg = isDark ? AppTheme.surfaceContainer : AppTheme.porcelainSurface;
    final activeBorder = AppTheme.primaryColor;
    final inactiveBorder = isDark ? AppTheme.outlineGold.withValues(alpha: 0.25) : AppTheme.porcelainOutline;

    const presets = [
      {'key': 'modern', 'label': 'Modern Chime', 'icon': Icons.graphic_eq_rounded},
      {'key': 'bell', 'label': 'Soft Bell', 'icon': Icons.notifications_active_rounded},
      {'key': 'digital', 'label': 'Digital Pulse', 'icon': Icons.speed_rounded},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.music_note_outlined,
                color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                'SOUND PRESET CHARACTER',
                style: GoogleFonts.inter(
                  color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 12.5,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: presets.map((p) {
              final isSelected = currentPreset == p['key'];
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(10),
                    onTap: () {
                      service.setPreset(p['key'] as String);
                      setState(() {});
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          duration: const Duration(seconds: 2),
                          content: Text('Audio preset changed to ${p['label']}'),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppTheme.primaryColor.withValues(alpha: 0.15)
                            : (isDark ? Colors.black26 : const Color(0xFFF6F3F2)),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? activeBorder : inactiveBorder,
                          width: isSelected ? 1.8 : 1.0,
                        ),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            p['icon'] as IconData,
                            size: 18,
                            color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.white54 : AppTheme.porcelainTextSecondary),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            p['label'] as String,
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
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
    final cardBg = isDark ? AppTheme.surfaceContainer : AppTheme.porcelainSurface;
    final textColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subtitleColor = isDark ? Colors.white54 : AppTheme.porcelainTextSecondary;

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SwitchListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        value: value,
        onChanged: onChanged,
        activeThumbColor: accent,
        activeTrackColor: accent.withValues(alpha: 0.25),
        secondary: Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: accent.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: accent, size: 20),
        ),
        title: Text(
          title,
          style: GoogleFonts.inter(
            color: textColor,
            fontWeight: FontWeight.w700,
            fontSize: 13.5,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            subtitle,
            style: GoogleFonts.inter(
              color: subtitleColor,
              fontSize: 11,
              height: 1.3,
            ),
          ),
        ),
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
    final cardBg = isDark ? AppTheme.surfaceContainer : AppTheme.porcelainSurface;
    final textColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subtitleColor = isDark ? Colors.white54 : AppTheme.porcelainTextSecondary;

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        onTap: onTap,
        leading: Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: accent.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: accent, size: 20),
        ),
        title: Text(
          title,
          style: GoogleFonts.inter(
            color: textColor,
            fontWeight: FontWeight.w700,
            fontSize: 13.5,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 3),
          child: Text(
            subtitle,
            style: GoogleFonts.inter(
              color: subtitleColor,
              fontSize: 11,
              height: 1.25,
            ),
          ),
        ),
        trailing: Icon(
          Icons.chevron_right_rounded,
          color: subtitleColor.withValues(alpha: 0.6),
          size: 22,
        ),
      ),
    );
  }

  void _showAudioSettingsModal(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final surfaceColor = isDark ? AppTheme.surfaceContainerHigh : AppTheme.porcelainSurface;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final service = AudioNotificationService.instance;
            return Container(
              height: MediaQuery.of(context).size.height * 0.75,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.volume_up_rounded, color: accent, size: 22),
                          const SizedBox(width: 10),
                          Text(
                            'Trip Lifecycle Audio Chimes',
                            style: GoogleFonts.inter(
                              color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: Icon(Icons.close_rounded, color: isDark ? Colors.white70 : Colors.black54),
                        onPressed: () => Navigator.pop(modalContext),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Preview sound alerts and enable/disable individual dispatch chimes.',
                    style: GoogleFonts.inter(
                      color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView.separated(
                      itemCount: NotificationEvent.values.length,
                      separatorBuilder: (_, __) => Divider(
                        color: isDark ? Colors.white10 : AppTheme.porcelainOutline,
                        height: 1,
                      ),
                      itemBuilder: (context, index) {
                        final ev = NotificationEvent.values[index];
                        final isEnabled = service.isEventEnabled(ev.key);
                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(vertical: 4),
                          title: Text(
                            ev.title,
                            style: GoogleFonts.inter(
                              color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                              fontWeight: FontWeight.w600,
                              fontSize: 13.5,
                            ),
                          ),
                          subtitle: Text(
                            ev.description,
                            style: GoogleFonts.inter(
                              color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                              fontSize: 11,
                            ),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: Icon(Icons.play_circle_fill_rounded, color: accent, size: 24),
                                tooltip: 'Play chime preview',
                                onPressed: () => service.play(ev.key),
                              ),
                              Switch(
                                value: isEnabled,
                                activeThumbColor: accent,
                                activeTrackColor: accent.withValues(alpha: 0.25),
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
