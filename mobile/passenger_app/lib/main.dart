import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'screens/splash_screen.dart';
import 'theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';

import 'package:core_ui/core_ui.dart';
import 'providers/language_provider.dart';
import 'screens/language_selection_screen.dart';

/// Robust fallback delegates to ensure text inputs never crash when a locale
/// lacks official Material/Cupertino translations (especially on web/macOS).
class FallbackMaterialLocalizationsDelegate
    extends LocalizationsDelegate<MaterialLocalizations> {
  const FallbackMaterialLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => true;

  @override
  Future<MaterialLocalizations> load(Locale locale) =>
      DefaultMaterialLocalizations.load(locale);

  @override
  bool shouldReload(FallbackMaterialLocalizationsDelegate old) => false;
}

class FallbackCupertinoLocalizationsDelegate
    extends LocalizationsDelegate<CupertinoLocalizations> {
  const FallbackCupertinoLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => true;

  @override
  Future<CupertinoLocalizations> load(Locale locale) =>
      DefaultCupertinoLocalizations.load(locale);

  @override
  bool shouldReload(FallbackCupertinoLocalizationsDelegate old) => false;
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Ensure theme and fonts don't block the UI thread during startup
  // Allow runtime fetching in development/production but disable in integration tests to prevent timeouts
  const isTest = bool.fromEnvironment('dart.vm.test', defaultValue: false);
  const isIntegrationTest = bool.fromEnvironment('integration_test', defaultValue: false);
  
  if (isTest || isIntegrationTest) {
    GoogleFonts.config.allowRuntimeFetching = false;
    AppTheme.useGoogleFonts = false;
  } else {
    GoogleFonts.config.allowRuntimeFetching = true;
    AppTheme.useGoogleFonts = true;
  }
  final prefs = await SharedPreferences.getInstance();
  final themeString = prefs.getString('theme_mode');
  ThemeMode initialThemeMode = ThemeMode.system;
  if (themeString == 'light') {
    initialThemeMode = ThemeMode.light;
  } else if (themeString == 'dark') {
    initialThemeMode = ThemeMode.dark;
  }

  final langCode = prefs.getString('cabi_preferred_language') ?? 'en';
  final initialLocale = Locale(langCode);

  runApp(
    ProviderScope(
      child: CabiPassengerApp(
        initialThemeMode: initialThemeMode,
        initialLocale: initialLocale,
      ),
    ),
  );
}

class CabiPassengerApp extends ConsumerWidget {
  final ThemeMode initialThemeMode;
  final Locale initialLocale;

  const CabiPassengerApp({
    super.key,
    this.initialThemeMode = ThemeMode.system,
    this.initialLocale = const Locale('en'),
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch theme provider if it exists in Riverpod
    // For now keeping legacy provider support for backward compatibility
    return legacy_provider.MultiProvider(
      providers: [
        legacy_provider.ChangeNotifierProvider(create: (_) => AuthProvider()),
        legacy_provider.ChangeNotifierProvider(create: (_) => ThemeProvider(initialMode: initialThemeMode)),
        legacy_provider.ChangeNotifierProvider(create: (_) => LanguageProvider(initialLocale: initialLocale)),
      ],
      child: legacy_provider.Consumer2<ThemeProvider, LanguageProvider>(
        builder: (context, themeProvider, languageProvider, child) {
          return MaterialApp(
            title: 'Cabi - Book a Ride',
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.themeMode,
            locale: languageProvider.locale,
            supportedLocales: CabiLocalizations.supportedLocales,
            localizationsDelegates: const [
              CabiLocalizations.delegate,
              FallbackMaterialLocalizationsDelegate(),
              FallbackCupertinoLocalizationsDelegate(),
              DefaultWidgetsLocalizations.delegate,
            ],
            home: const SplashScreen(),
            routes: {
              '/language': (context) => const LanguageSelectionScreen(),
            },
            scrollBehavior: const MaterialScrollBehavior().copyWith(
              dragDevices: {
                PointerDeviceKind.mouse,
                PointerDeviceKind.touch,
                PointerDeviceKind.stylus,
                PointerDeviceKind.trackpad,
              },
            ),
            builder: (context, child) {
              if (child == null) return const SizedBox.shrink();
              final mediaQuery = MediaQuery.of(context);
              if (mediaQuery.size.width <= 480) {
                return child;
              }
              final phoneWidth = math.min(430.0, mediaQuery.size.width * 0.96);
              final phoneHeight = math.min(932.0, mediaQuery.size.height * 0.96);
              return Container(
                color: const Color(0xFF000000),
                alignment: Alignment.center,
                child: Container(
                  width: phoneWidth,
                  height: phoneHeight,
                  decoration: BoxDecoration(
                    color: Theme.of(context).scaffoldBackgroundColor,
                    borderRadius: BorderRadius.circular(36),
                    border: Border.all(
                      color: const Color(0xFFD4AF37).withValues(alpha: 0.35),
                      width: 2.0,
                    ),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0xCC000000),
                        blurRadius: 48,
                        spreadRadius: 4,
                        offset: Offset(0, 20),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(34),
                    child: MediaQuery(
                      data: mediaQuery.copyWith(
                        size: Size(phoneWidth, phoneHeight),
                      ),
                      child: child,
                    ),
                  ),
                ),
              );
            },
            debugShowCheckedModeBanner: false,
          );
        },
      ),
    );
  }
}

