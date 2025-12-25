import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:amplify_api/amplify_api.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'screens/login_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'config/amplifyconfiguration.dart';
import 'theme/app_theme.dart';
import 'providers/theme_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await _configureAmplify();
  } on AmplifyAlreadyConfiguredException {
    safePrint(
      'Amplify was already configured. Looks like app restarted on hot reload.',
    );
  }
  runApp(const ProviderScope(child: CabiDriverApp()));
}

Future<void> _configureAmplify() async {
  final authPlugin = AmplifyAuthCognito();
  final apiPlugin = AmplifyAPI();
  await Amplify.addPlugins([authPlugin, apiPlugin]);

  // Call Amplify.configure to use the initialized plugins
  await Amplify.configure(amplifyconfig);
}

class CabiDriverApp extends ConsumerWidget {
  const CabiDriverApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);

    return MaterialApp(
      title: 'Cabi Driver',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      home: const LoginScreen(),
    );
  }
}
