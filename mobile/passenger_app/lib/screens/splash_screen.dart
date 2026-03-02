import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import 'home_screen.dart';
import 'login_screen.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(passengerAuthProvider.notifier).tryAutoLogin();
      if (!mounted) return;
      final authState = ref.read(passengerAuthProvider);
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => authState is Authenticated
              ? const HomeScreen()
              : const LoginScreen(),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    const primaryGold = Color(0xFFFFD700);
    const prestigeBlack = Color(0xFF0A0A0A);

    return Scaffold(
      backgroundColor: prestigeBlack,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Elegant Centered Logo/Sunburst Area
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo Placeholder with Glow Effect
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: primaryGold.withValues(alpha: 0.15),
                        blurRadius: 40,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: Image.asset(
                    'assets/images/cabi_logo.png',
                    errorBuilder: (context, error, stackTrace) => const Icon(
                        Icons.taxi_alert,
                        color: primaryGold,
                        size: 40),
                  ),
                ),
                const SizedBox(height: 32),
                // Elegant Branding
                const Text(
                  "CABI GO",
                  style: TextStyle(
                    color: primaryGold,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 5.0,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "B Y  C A B I  A F R I C A",
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.5),
                    fontSize: 9,
                    letterSpacing: 4.0,
                  ),
                ),
                const SizedBox(height: 48),
                // Subtle Tagline
                const Text(
                  "Where will you go today?",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontStyle: FontStyle.italic,
                    fontWeight: FontWeight.w300,
                  ),
                ),
              ],
            ),
          ),
          // Lower Loading Indicator
          Positioned(
            bottom: 80,
            left: 60,
            right: 60,
            child: Column(
              children: [
                const SizedBox(
                  height: 2,
                  child: LinearProgressIndicator(
                    backgroundColor: Colors.white10,
                    valueColor: AlwaysStoppedAnimation<Color>(primaryGold),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  "Launching Cabi Go...",
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.3),
                    fontSize: 10,
                    letterSpacing: 1.0,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
