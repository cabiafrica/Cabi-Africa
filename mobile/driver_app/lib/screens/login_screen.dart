import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:driver_app/config/app_config.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import 'main_shell.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;
  bool _isLoginTab = true; // Toggle state
  String? _errorMessage;
  bool _obscurePassword = true;
  bool _rememberMe = true;

  String _humanizeError(dynamic error) {
    final err = error.toString().toLowerCase();
    if (err.contains('invalid login credentials')) {
      return "Incorrect email or password. Please try again.";
    }
    if (err.contains('email not confirmed')) {
      return "Your email hasn't been verified yet. Please check your inbox.";
    }
    if (err.contains('connection error') ||
        err.contains('failed host lookup') ||
        err.contains('socketexception')) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    if (err.contains('timeout')) {
      return "Connection timed out. Please try again.";
    }
    return error
        .toString()
        .replaceFirst(RegExp(r'Exception: ', caseSensitive: false), '');
  }

  Future<void> _signIn() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ref.read(authProvider.notifier).login(
            _emailController.text.trim(),
            _passwordController.text,
            rememberMe: _rememberMe,
          );

      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const MainShell()),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = _humanizeError(e);
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFFFFD700); // Prestige Gold
    const backgroundColor = Color(0xFF0A0A0A); // Deep Black

    return Scaffold(
      backgroundColor: backgroundColor, // New Dawn Black
      body: Stack(
        children: [
          // Background Image
          Positioned.fill(
            child: Image.asset(
              'assets/images/login_bg.png',
              fit: BoxFit.cover,
            ),
          ),
          // Gradient Overlay
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black26,
                    Colors.black87,
                    backgroundColor,
                  ],
                  stops: [0.0, 0.4, 0.7, 1.0],
                ),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding:
                  const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 500),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 40),
                        // Header Logo (Centered Column)
                        Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border:
                                    Border.all(color: primaryColor, width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: primaryColor.withValues(alpha: 0.2),
                                    blurRadius: 20,
                                    spreadRadius: 1,
                                  )
                                ],
                              ),
                              child: ClipOval(
                                child: Image.asset(
                                  'assets/images/cabi_logo.png',
                                  width: 80,
                                  height: 80,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) =>
                                      const Icon(Icons.directions_car,
                                          color: primaryColor, size: 40),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            const Text(
                              'CABI DRIVE',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: primaryColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 26,
                                letterSpacing: 5.0,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'By Cabi Africa',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Colors.white38,
                                fontSize: 12,
                              ),
                            ),
                            const Text(
                              'The Mark of a New Dawn',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Colors.white60,
                                fontSize: 10,
                                letterSpacing: 2.0,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 40),

                        // Title
                        const Text(
                          'DRIVE WITH PRIDE.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                            letterSpacing: -1,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Earn more on your own schedule',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.8),
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 32),

                        // Toggle Tabs
                        Container(
                          margin: const EdgeInsets.symmetric(
                              horizontal:
                                  16), // Add horizontal margin for better centering appearance
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white10),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () =>
                                      setState(() => _isLoginTab = true),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 12),
                                    decoration: BoxDecoration(
                                      color: _isLoginTab
                                          ? const Color(0xFFFFD700)
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      'Log In',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: _isLoginTab
                                            ? Colors.black
                                            : Colors.white54,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () =>
                                      setState(() => _isLoginTab = false),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 12),
                                    decoration: BoxDecoration(
                                      color: !_isLoginTab
                                          ? const Color(0xFFFFD700)
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      'Register to Drive',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: !_isLoginTab
                                            ? Colors.black
                                            : Colors.white54,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Inputs
                        if (_isLoginTab) ...[
                          Center(child: _buildLabel('Email Address')),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _emailController,
                            style: const TextStyle(color: Colors.white),
                            textAlign:
                                TextAlign.center, // Center align input text
                            decoration: _inputDecoration(
                              hint: 'Enter your email',
                              icon: Icons.email_outlined,
                            ),
                            validator: (value) =>
                                value!.isEmpty || !value.contains('@')
                                    ? 'Invalid email'
                                    : null,
                          ),
                          const SizedBox(height: 20),
                          Center(child: _buildLabel('Password')),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _passwordController,
                            style: const TextStyle(color: Colors.white),
                            textAlign:
                                TextAlign.center, // Center align input text
                            obscureText: _obscurePassword,
                            decoration: _inputDecoration(
                              hint: 'Enter your password',
                              icon: Icons.lock_outline,
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword
                                      ? Icons.visibility_outlined
                                      : Icons.visibility_off_outlined,
                                  color: Colors.white54,
                                ),
                                onPressed: () => setState(
                                    () => _obscurePassword = !_obscurePassword),
                              ),
                            ),
                            validator: (value) =>
                                value!.isEmpty ? 'Required' : null,
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                                      "Remember Me",
                                      style: TextStyle(
                                          color: Colors.white
                                              .withValues(alpha: 0.6),
                                          fontSize: 13),
                                    ),
                                  ),
                                ],
                              ),
                              TextButton(
                                onPressed: () {},
                                child: Text(
                                  'Forgot Password?',
                                  style: TextStyle(
                                      color:
                                          Colors.white.withValues(alpha: 0.7),
                                      fontSize: 13),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          if (_isLoading)
                            const Center(
                                child: CircularProgressIndicator(
                                    color: Color(0xFFFFD700)))
                          else
                            ElevatedButton(
                              onPressed: _signIn,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFFFD700),
                                foregroundColor: Colors.black,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                elevation: 0,
                              ),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text('Start Driving',
                                      style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold)),
                                  SizedBox(width: 8),
                                  Icon(Icons.arrow_forward),
                                ],
                              ),
                            ),
                        ] else ...[
                          // Sign Up Content (Placeholder or Link)
                          const SizedBox(height: 40),
                          const Center(
                              child: Text("Registration is handled via portal",
                                  style: TextStyle(color: Colors.white))),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            onPressed: () async {
                              final Uri url =
                                  Uri.parse(AppConfig.driverRegistrationUrl);
                              launchUrl(url,
                                  mode: LaunchMode.externalApplication);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFFD700),
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text(
                                'Register to Drive'), // Changed from 'Go to Registration Portal'
                          ),
                        ],

                        const SizedBox(height: 32),

                        if (_errorMessage != null) ...[
                          const SizedBox(height: 20),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.red.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                  color: Colors.red.withValues(alpha: 0.3)),
                            ),
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(color: Colors.redAccent),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],

                        const SizedBox(height: 40),
                        Center(
                          child: Text(
                            'By logging in or registering, you agree to our\nTerms of Service and Privacy Policy.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.4),
                              fontSize: 12,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: TextStyle(
        color: const Color(0xFFFFD700).withValues(
            alpha:
                0.8), // Gold/Yellow tint or White? Template has White/Gold mix. Let's stick to White/Gold.
        fontSize: 14,
        fontWeight: FontWeight.w500,
      ),
    );
  }

  InputDecoration _inputDecoration(
      {required String hint, required IconData icon, Widget? suffixIcon}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
      prefixIcon: Icon(icon, color: Colors.white54),
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: Colors.white.withValues(alpha: 0.05),
      contentPadding: const EdgeInsets.all(16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFFFD700)),
      ),
    );
  }
}
