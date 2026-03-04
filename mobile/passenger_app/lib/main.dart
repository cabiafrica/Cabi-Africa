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
  // We allow fetching but with a fallback mindset
  GoogleFonts.config.allowRuntimeFetching = true;
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
      child: MaterialApp(
        title: 'Cabi - Book a Ride',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system, // Or watch a provider
        home: const SplashScreen(),
        debugShowCheckedModeBanner: false,
        // Shorebird auto-update can be disabled here if needed for debugging startup
        // This is a placeholder for potential Shorebird configuration in Dart code
        // For actual Shorebird configuration, refer to shorebird.yaml or Shorebird API.
        // # auto_update: false
        // auto_update: false
      ),
    );
  }
}
