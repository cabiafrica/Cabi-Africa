import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/auth_provider.dart';
import '../screens/home_screen.dart';
import '../screens/login_screen.dart'; // Assuming you have a LoginScreen

class AuthWrapper extends ConsumerWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch the authProvider to get the current authentication state
    final authState = ref.watch(authProvider);

    // Use the state to decide which screen to show
    if (authState is Authenticated) {
      // If the user is authenticated, show the main app screen
      return const HomeScreen();
    }
    if (authState is Unauthenticated) {
      // If not authenticated, show the login screen
      return const LoginScreen();
    }

    // While checking for a token (AuthInitial) or logging in (AuthLoading),
    // show a loading spinner. This prevents a flash of the login screen
    // if a user is already logged in.
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}
