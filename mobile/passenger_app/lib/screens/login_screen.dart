import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:provider/provider.dart' as legacy_provider;
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/primary_button.dart';
import 'home_screen.dart';
import 'registration_screen.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _identifierController =
      TextEditingController(); // Replaces _emailController
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _rememberMe = true;
  String? _errorMessage;

  String _humanizeError(dynamic error) {
    final err = error.toString().toLowerCase();

    // Connection errors (technical indicators) - check first for speed
    if (err.contains('connection error') ||
        err.contains('failed host lookup') ||
        err.contains('socketexception') ||
        err.contains('errno 111') ||
        err.contains('connection refused') ||
        err.contains('network is unreachable')) {
      return "Unable to connect to Cabi servers. Please check your internet connection and try again.";
    }

    // Timeout errors
    if (err.contains('timeout')) {
      return "The request is taking too long. Please check your signal and try again.";
    }

    // Credential errors
    if (err.contains('invalid credentials') ||
        err.contains('invalid login credentials') ||
        err.contains('401') ||
        err.contains('unauthorized')) {
      return "The credentials you entered are incorrect. Please try again.";
    }

    // Verification errors
    if (err.contains('email not confirmed') || err.contains('not verified')) {
      return "Your account is not yet active. Please check your email or phone for verification.";
    }

    // General/Server errors
    if (err.contains('500') || err.contains('internalservererror')) {
      return "Something went wrong on our end. Please try again shortly.";
    }

    // Default: Strip technical prefix if it exists
    String cleanMessage = error
        .toString()
        .replaceFirst(RegExp(r'Exception: ', caseSensitive: false), '');

    if (cleanMessage.length < 5 || cleanMessage.contains('{')) {
      return "An unexpected error occurred. Please try again.";
    }

    return cleanMessage;
  }

  Future<void> _demoLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final mockUser = {
        'id': 'demo_user_1',
        'name': 'Alex Passenger',
        'email': _identifierController.text.trim().isNotEmpty
            ? _identifierController.text.trim()
            : 'alex@cabi.africa',
        'phone': '+254700000000',
      };
      await ref
          .read(passengerAuthProvider.notifier)
          .setSession('mock_jwt_token', mockUser);
      if (mounted) {
        legacy_provider.Provider.of<AuthProvider>(context, listen: false)
            .login('mock_jwt_token', mockUser);
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = e.toString());
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signIn() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Use the updated auth notifier which now takes 'identifier'
      await ref.read(passengerAuthProvider.notifier).login(
            _identifierController.text.trim(),
            _passwordController.text,
            rememberMe: _rememberMe,
          );
      if (mounted) {
        final authState = ref.read(passengerAuthProvider);
        if (authState is Authenticated) {
          legacy_provider.Provider.of<AuthProvider>(context, listen: false)
              .login(authState.token, authState.user);
        }
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      }
    } catch (e) {
      if (kDebugMode || kIsWeb) {
        await _demoLogin();
        return;
      }
      if (mounted) {
        setState(() => _errorMessage = _humanizeError(e));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = AppTheme.primaryColor;
    final backgroundColor = AppTheme.obsidianCanvas;

    return Scaffold(
      backgroundColor: backgroundColor,
      body: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: constraints.maxHeight,
              ),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 400),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 40),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 32),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainer,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                            color: AppTheme.outlineGold, width: 0.5),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.45),
                            blurRadius: 28,
                            offset: const Offset(0, 12),
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Cabi Emblem
                            Center(
                              child: Container(
                                height: 78,
                                width: 78,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppTheme.obsidianCanvas,
                                  border: Border.all(
                                      color: AppTheme.executiveGold, width: 2),
                                  boxShadow: [
                                    BoxShadow(
                                      color:
                                          primaryColor.withValues(alpha: 0.22),
                                      blurRadius: 22,
                                      spreadRadius: 1,
                                    ),
                                  ],
                                ),
                                child: ClipOval(
                                  child: Image.asset(
                                    'assets/images/cabi_logo.png',
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) =>
                                        Icon(Icons.local_taxi,
                                            color: primaryColor, size: 30),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 18),
                            Center(
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryContainer,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                      color: AppTheme.outlineGold),
                                ),
                                child: Text(
                                  'CABI GO PASSENGER',
                                  style: AppTheme.inter(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1.4,
                                    color: primaryColor,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 14),
                            Text(
                              'Welcome Back',
                              textAlign: TextAlign.center,
                              style: AppTheme.inter(
                                fontSize: 26,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                letterSpacing: -0.4,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Where will you go today?',
                              textAlign: TextAlign.center,
                              style: AppTheme.inter(
                                fontSize: 14,
                                color: AppTheme.darkTextSecondary,
                              ),
                            ),
                            const SizedBox(height: 28),

                            // Identifier Input (Email or Phone)
                            _buildInputContainer(
                              child: TextFormField(
                                controller: _identifierController,
                                keyboardType: TextInputType.text,
                                decoration: _buildInputDecoration(
                                  label: 'Email or Phone Number',
                                  icon: Icons.person_outline,
                                  primaryColor: primaryColor,
                                ),
                                style: AppTheme.inter(color: Colors.white),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter your email or phone number';
                                  }
                                  return null;
                                },
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Password Input
                            _buildInputContainer(
                              child: TextFormField(
                                controller: _passwordController,
                                obscureText: _obscurePassword,
                                decoration: _buildInputDecoration(
                                  label: 'Password',
                                  icon: Icons.lock_outline,
                                  primaryColor: primaryColor,
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _obscurePassword
                                          ? Icons.visibility_outlined
                                          : Icons.visibility_off_outlined,
                                      color: AppTheme.darkTextSecondary,
                                    ),
                                    onPressed: () => setState(() =>
                                        _obscurePassword = !_obscurePassword),
                                  ),
                                ),
                                style: AppTheme.inter(color: Colors.white),
                                validator: (value) =>
                                    (value == null || value.length < 6)
                                        ? 'Password must be at least 6 characters'
                                        : null,
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Remember Me & Forgot Password
                            Wrap(
                              alignment: WrapAlignment.spaceBetween,
                              crossAxisAlignment: WrapCrossAlignment.center,
                              children: [
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    SizedBox(
                                      height: 24,
                                      width: 24,
                                      child: Checkbox(
                                        value: _rememberMe,
                                        onChanged: (val) => setState(
                                            () => _rememberMe = val ?? true),
                                        activeColor: primaryColor,
                                        checkColor: Colors.black,
                                        side: const BorderSide(
                                            color: Colors.white30),
                                        shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(4)),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    GestureDetector(
                                      onTap: () => setState(
                                          () => _rememberMe = !_rememberMe),
                                      child: Text(
                                        'Remember Me',
                                        style: AppTheme.inter(
                                            color: AppTheme.darkTextSecondary,
                                            fontSize: 13),
                                      ),
                                    ),
                                  ],
                                ),
                                TextButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const ForgotPasswordScreen(),
                                      ),
                                    );
                                  },
                                  child: Text('Forgot Password?',
                                      style: AppTheme.inter(
                                          color: primaryColor,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13)),
                                ),
                              ],
                            ),

                            const SizedBox(height: 24),
                            if (_errorMessage != null)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: Text(_errorMessage!,
                                    textAlign: TextAlign.center,
                                    style: AppTheme.inter(
                                        color: AppTheme.errorRed,
                                        fontSize: 13)),
                              ),

                            // Stitch #F59E0B Amber CTA
                            PrimaryButton(
                              label: 'SIGN IN',
                              isLoading: _isLoading,
                              onPressed: _signIn,
                            ),
                            if (kDebugMode || kIsWeb) ...[
                              const SizedBox(height: 12),
                              OutlinedButton.icon(
                                onPressed: _demoLogin,
                                icon: const Icon(Icons.bolt, size: 18),
                                label: Text(
                                  'QUICK DEMO SIGN IN',
                                  style: AppTheme.inter(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12,
                                    letterSpacing: 1.0,
                                  ),
                                ),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: primaryColor,
                                  side: BorderSide(
                                      color: primaryColor.withValues(alpha: 0.5),
                                      width: 1),
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                              ),
                            ],

                            const SizedBox(height: 22),
                            Wrap(
                              alignment: WrapAlignment.center,
                              crossAxisAlignment: WrapCrossAlignment.center,
                              children: [
                                Text("Don't have an account? ",
                                    style: AppTheme.inter(
                                        color: AppTheme.darkTextSecondary,
                                        fontSize: 13)),
                                TextButton(
                                  onPressed: () {
                                    Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (_) =>
                                                const RegistrationScreen()));
                                  },
                                  child: Text('Sign Up',
                                      style: AppTheme.inter(
                                          color: primaryColor,
                                          fontWeight: FontWeight.w700,
                                          fontSize: 13)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildInputContainer({required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.outlineBorder),
      ),
      child: child,
    );
  }

  InputDecoration _buildInputDecoration({
    required String label,
    required IconData icon,
    required Color primaryColor,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      labelText: label,
      labelStyle: AppTheme.inter(color: AppTheme.darkTextSecondary, fontSize: 14),
      floatingLabelStyle: AppTheme.inter(color: primaryColor, fontSize: 13),
      prefixIcon: Icon(icon, color: primaryColor, size: 20),
      suffixIcon: suffixIcon,
      border: InputBorder.none,
      enabledBorder: InputBorder.none,
      focusedBorder: InputBorder.none,
      filled: true,
      fillColor: Colors.transparent,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    );
  }
}

