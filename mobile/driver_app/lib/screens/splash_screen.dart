import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/screens/main_shell.dart';
import 'package:driver_app/screens/login_screen.dart';
import 'package:driver_app/theme/app_theme.dart';

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

    // Start auto-login in background
    final autoLoginFuture = ref.read(authProvider.notifier).tryAutoLogin();

    // Set a minimum duration for the splash screen (e.g., 2 seconds)
    final delayFuture = Future.delayed(const Duration(seconds: 2));

    // Wait for BOTH auto-login and the minimum delay
    Future.wait([autoLoginFuture, delayFuture]).then((_) {
      if (!mounted) return;
      final authState = ref.read(authProvider);

      Widget nextScreen = const LoginScreen();
      if (authState is Authenticated) {
        final driverProfile = authState.user?['driverProfile'];
        if (driverProfile != null) {
          nextScreen = const MainShell();
        } else {
          // No driver profile found -> route to login page
          nextScreen = const LoginScreen();
        }
      } else {
        nextScreen = const LoginScreen();
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
    const primaryGold = AppTheme.primaryColor;
    const prestigeBlack = AppTheme.darkBackground;

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
                      'CABI DRIVE',
                      style: GoogleFonts.inter(
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
                      'Drive. Earn. Thrive.',
                      style: GoogleFonts.inter(
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

