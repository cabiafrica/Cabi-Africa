import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';

import 'package:driver_app/screens/home_screen.dart';
import 'package:driver_app/screens/dashboard_screen.dart';
import 'package:driver_app/screens/profile_screen.dart';
import 'package:driver_app/screens/settings_screen.dart';
import 'package:driver_app/screens/wallet_screen.dart';
import 'package:driver_app/screens/vehicle_list_screen.dart';
import 'package:driver_app/screens/document_history_screen.dart';
import 'package:driver_app/screens/earnings_goal_screen.dart';
import 'package:driver_app/screens/earnings_dashboard_screen.dart';
import 'package:driver_app/screens/my_organization_screen.dart';
import 'package:driver_app/screens/referral_program_screen.dart';
import 'package:driver_app/screens/splash_screen.dart';
import 'package:driver_app/screens/trip_in_progress_screen.dart';
import 'package:driver_app/screens/ratings_screen.dart';
import 'package:driver_app/screens/saved_places_screen.dart';
import 'package:driver_app/screens/welfare_schemes_screen.dart';
import 'package:driver_app/screens/login_screen.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:provider/provider.dart' as legacy_provider;

import 'theme/app_theme.dart';
import 'providers/theme_provider.dart';
import 'providers/ride_request_provider.dart';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:core_ui/core_ui.dart';
import 'package:driver_app/providers/language_provider.dart';
import 'package:driver_app/screens/language_selection_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load preferences synchronously before running app
  final prefs = await SharedPreferences.getInstance();
  final themeString = prefs.getString(ThemeNotifier.themeKey);
  ThemeMode initialThemeMode = ThemeMode.system;
  
  if (themeString == 'light') {
    initialThemeMode = ThemeMode.light;
  } else if (themeString == 'dark') {
    initialThemeMode = ThemeMode.dark;
  }

  final langCode = prefs.getString(LanguageNotifier.languageKey) ?? 'en';
  final initialLocale = Locale(langCode);

  // Amplify configuration removed - app uses direct HTTP API calls
  runApp(
    ProviderScope(
      overrides: [
        themeProvider.overrideWith((ref) => ThemeNotifier(initialThemeMode)),
        languageProvider.overrideWith((ref) => LanguageNotifier(initialLocale)),
      ],
      child: const CabiDriverApp(),
    ),
  );
}

class CabiDriverApp extends ConsumerWidget {
  const CabiDriverApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);
    final locale = ref.watch(languageProvider);

    return legacy_provider.MultiProvider(
      providers: [
        legacy_provider.ChangeNotifierProvider(
            create: (_) => RideRequestProvider()),
      ],
      child: MaterialApp(
        title: 'Cabi Africa',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: themeMode,
        locale: locale,
        supportedLocales: CabiLocalizations.supportedLocales,
        localizationsDelegates: const [
          CabiLocalizations.delegate,
          DefaultMaterialLocalizations.delegate,
          DefaultWidgetsLocalizations.delegate,
        ],
        home: const SplashScreen(),
        routes: {
          '/home': (context) => const HomeScreen(),
          '/dashboard': (context) => const DashboardScreen(),
          '/profile': (context) =>
              const ProfileScreen(), // Ensure this file is imported
          '/settings': (context) => const SettingsScreen(),
          '/language': (context) => const LanguageSelectionScreen(),
          '/wallet': (context) => const WalletScreen(),
          '/vehicles': (context) => const VehicleListScreen(),
          '/document_history': (context) => const DocumentHistoryScreen(
              docType:
                  'All'), // Requires args usually, but handling basic route
          '/earnings_goal': (context) => const EarningsGoalScreen(),
          '/my_organization': (context) => const MyOrganizationScreen(),
          '/referral_program': (context) => const ReferralProgramScreen(),
          '/trip_in_progress': (context) => const TripInProgressScreen(),
          '/earnings': (context) => const EarningsDashboardScreen(),
          '/ratings': (context) => const RatingsScreen(),
          '/saved_places': (context) => const SavedPlacesScreen(),
          '/welfare_schemes': (context) => const WelfareSchemeScreen(),
          '/login': (context) => const LoginScreen(),
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
      ),
    );
  }
}
