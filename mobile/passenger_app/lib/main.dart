import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'screens/splash_screen.dart';
import 'theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';

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
  runApp(
    const ProviderScope(
      child: CabiPassengerApp(),
    ),
  );
}

class CabiPassengerApp extends ConsumerWidget {
  const CabiPassengerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch theme provider if it exists in Riverpod
    // For now keeping legacy provider support for backward compatibility
    return legacy_provider.MultiProvider(
      providers: [
        legacy_provider.ChangeNotifierProvider(create: (_) => AuthProvider()),
        legacy_provider.ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: legacy_provider.Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            title: 'Cabi - Book a Ride',
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.themeMode,
            home: const SplashScreen(),
            debugShowCheckedModeBanner: false,
          );
        },
      ),
    );
  }
}
