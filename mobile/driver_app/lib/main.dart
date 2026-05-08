import 'package:flutter/material.dart';

import 'package:driver_app/screens/home_screen.dart';
import 'package:driver_app/screens/dashboard_screen.dart';
import 'package:driver_app/screens/profile_screen.dart';
import 'package:driver_app/screens/settings_screen.dart';
import 'package:driver_app/screens/wallet_screen.dart';
import 'package:driver_app/screens/vehicle_list_screen.dart';
import 'package:driver_app/screens/document_history_screen.dart';
import 'package:driver_app/screens/earnings_goal_screen.dart';
import 'package:driver_app/screens/my_organization_screen.dart';
import 'package:driver_app/screens/referral_program_screen.dart';
import 'package:driver_app/screens/splash_screen.dart';
import 'package:driver_app/screens/trip_in_progress_screen.dart';
import 'package:driver_app/screens/ratings_screen.dart';
import 'package:driver_app/screens/saved_places_screen.dart';
import 'package:driver_app/screens/welfare_schemes_screen.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:provider/provider.dart' as legacy_provider;

import 'theme/app_theme.dart';
import 'providers/theme_provider.dart';
import 'providers/ride_request_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Amplify configuration removed - app uses direct HTTP API calls
  runApp(const ProviderScope(child: CabiDriverApp()));
}

class CabiDriverApp extends ConsumerWidget {
  const CabiDriverApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);

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
        home: const SplashScreen(),
        routes: {
          '/home': (context) => const HomeScreen(),
          '/dashboard': (context) => const DashboardScreen(),
          '/profile': (context) =>
              const ProfileScreen(), // Ensure this file is imported
          '/settings': (context) => const SettingsScreen(),
          '/wallet': (context) => const WalletScreen(),
          '/vehicles': (context) => const VehicleListScreen(),
          '/document_history': (context) => const DocumentHistoryScreen(
              docType:
                  'All'), // Requires args usually, but handling basic route
          '/earnings_goal': (context) => const EarningsGoalScreen(),
          '/my_organization': (context) => const MyOrganizationScreen(),
          '/referral_program': (context) => const ReferralProgramScreen(),
          '/trip_in_progress': (context) => const TripInProgressScreen(),
          '/earnings': (context) => const EarningsScreen(),
          '/ratings': (context) => const RatingsScreen(),
          '/saved_places': (context) => const SavedPlacesScreen(),
          '/welfare_schemes': (context) => const WelfareSchemeScreen(),
        },
      ),
    );
  }
}
