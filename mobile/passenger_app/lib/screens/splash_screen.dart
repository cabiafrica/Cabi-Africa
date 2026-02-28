import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'home_screen.dart';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Defer tryAutoLogin to after the first frame to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      auth.tryAutoLogin().then((_) {
        if (mounted) {
          if (auth.isAuthenticated) {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const HomeScreen()),
            );
          } else {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const LoginScreen()),
            );
          }
        }
      });
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
                    errorBuilder: (context, error, stackTrace) =>
                        const Icon(Icons.taxi_alert, color: primaryGold, size: 40),
                  ),
                ),
                const SizedBox(height: 32),
                // Elegant Branding
                const Text(
                  "CABI AFRICA",
                  style: TextStyle(
                    color: primaryGold,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 4.0,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "P A S S E N G E R",
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.6),
                    fontSize: 10,
                    letterSpacing: 6.0,
                  ),
                ),
                const SizedBox(height: 48),
                // Subtle Tagline
                const Text(
                  "Your Ride. Your Dawn.",
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
                  "Entering the New Dawn...",
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
