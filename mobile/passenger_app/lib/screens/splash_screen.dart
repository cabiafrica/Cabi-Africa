import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import 'home_screen.dart';
import 'login_screen.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with TickerProviderStateMixin {
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

      Widget nextScreen = const HomeScreen();
      if (authState is Authenticated) {
        // Already authenticated, user data is populated
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
    const primaryAmber = AppTheme.primaryColor;
    const executiveGold = AppTheme.executiveGold;
    const prestigeBlack = AppTheme.obsidianCanvas;

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
                    // Circular Logo Frame with Executive Gold Border
                    Container(
                      width: 116,
                      height: 116,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.surfaceContainer,
                        border: Border.all(
                            color: executiveGold, width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: primaryAmber.withValues(alpha: 0.24),
                            blurRadius: 32,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(4),
                        child: ClipOval(
                          child: Container(
                            color: Colors.black26,
                            child: Image.asset(
                              'assets/images/cabi_logo.png',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  const Icon(Icons.local_taxi,
                                      color: primaryAmber, size: 40),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    // App Name
                    Text(
                      'CABI GO',
                      style: AppTheme.inter(
                        color: primaryAmber,
                        fontWeight: FontWeight.w800,
                        fontSize: 28,
                        letterSpacing: 4.5,
                      ),
                    ),
                    const SizedBox(height: 10),
                    // Sub-Branding
                    Text(
                      'B Y   C A B I   A F R I C A',
                      style: AppTheme.inter(
                        color: Colors.white.withValues(alpha: 0.65),
                        fontSize: 10,
                        letterSpacing: 3.6,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 44),
                    // Tagline
                    Text(
                      'Where will you go today?',
                      style: AppTheme.inter(
                        color: AppTheme.darkTextSecondary,
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
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

