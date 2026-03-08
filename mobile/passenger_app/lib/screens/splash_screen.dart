import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import 'home_screen.dart';
import 'login_screen.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
          parent: _controller,
          curve: const Interval(0.0, 0.6, curve: Curves.easeIn)),
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
          parent: _controller,
          curve: const Interval(0.0, 0.6, curve: Curves.easeOutBack)),
    );

    _controller.forward();

    // Start auto-login in background with safety timeout
    final autoLoginFuture = ref
        .read(passengerAuthProvider.notifier)
        .tryAutoLogin()
        .timeout(const Duration(seconds: 5), onTimeout: () {});

    // Set a minimum duration for the splash screen
    final delayFuture = Future.delayed(const Duration(seconds: 2));

    // Wait for BOTH auto-login and the minimum delay
    Future.wait([autoLoginFuture, delayFuture]).then((_) {
      if (!mounted) return;
      final authState = ref.read(passengerAuthProvider);

      Widget nextScreen = const LoginScreen();
      if (authState is Authenticated) {
        nextScreen = const HomeScreen();
      }

      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => nextScreen,
          transitionsBuilder: (_, animation, __, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 800),
        ),
      );
    }).catchError((e) {
      if (!mounted) return;
      debugPrint("Splash error: $e");
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const LoginScreen(),
          transitionsBuilder: (_, animation, __, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 800),
        ),
      );
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const primaryGold = Color(0xFFFFD700);
    const prestigeBlack = Color(0xFF0A0A0A);

    return Scaffold(
      backgroundColor: prestigeBlack,
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Opacity(
              opacity: _fadeAnimation.value,
              child: Transform.scale(
                scale: _scaleAnimation.value,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo Placeholder with Glow Effect
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: primaryGold, width: 2), // Golden ring
                        boxShadow: [
                          BoxShadow(
                            color: primaryGold.withValues(
                                alpha: 0.25), // Increased glow
                            blurRadius: 30,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(
                            4), // Space between ring and logo
                        child: ClipOval(
                          child: Container(
                            color: Colors.black12,
                            child: Image.asset(
                              'assets/images/cabi_logo.png',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  const Icon(Icons.taxi_alert,
                                      color: primaryGold, size: 40),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    // App Name
                    Text(
                      'CABI GO',
                      style: GoogleFonts.outfit(
                        color: primaryGold,
                        fontWeight: FontWeight.bold,
                        fontSize: 26,
                        letterSpacing: 5.0,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Sub-Branding
                    Text(
                      'B Y   C A B I   A F R I C A',
                      style: GoogleFonts.inter(
                        color: Colors.white.withValues(alpha: 0.6),
                        fontSize: 10,
                        letterSpacing: 4.0,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 48),
                    // Elegant Tagline
                    Text(
                      'Where will you go today?',
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 14,
                        fontStyle: FontStyle.italic,
                        fontWeight: FontWeight.w300,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
