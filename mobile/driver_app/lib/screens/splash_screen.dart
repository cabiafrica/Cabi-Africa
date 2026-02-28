import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/screens/home_screen.dart';
import 'package:driver_app/screens/login_screen.dart';

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

    // Navigate after delay and auto-login check
    Future.delayed(const Duration(seconds: 3), () async {
      await ref.read(authProvider.notifier).tryAutoLogin();
      final authState = ref.read(authProvider);

      if (mounted) {
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
      }
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
                    // New Dawn Luxury Logo Container
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: primaryGold, width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: primaryGold.withValues(alpha: 0.2),
                              blurRadius: 30,
                              spreadRadius: 2,
                            )
                          ]),
                      child: ClipOval(
                        child: Image.asset(
                          'assets/images/cabi_logo.png', // Reimagined "C" logo
                          width: 80,
                          height: 80,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(Icons.directions_car,
                                  color: primaryGold, size: 40),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    // App Name
                    Text(
                      'CABI AFRICA',
                      style: GoogleFonts.outfit(
                        color: primaryGold,
                        fontWeight: FontWeight.bold,
                        fontSize: 22,
                        letterSpacing: 4.0,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Sub-Branding
                    Text(
                      'D R I V E R   |   N E W   D A W N',
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
                      'Drive. Earn. Thrive.',
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
