import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import 'home_screen.dart';
import 'registration_screen.dart';

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
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = _humanizeError(e));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Cabi Global Colors (New Dawn)
    const primaryColor = Color(0xFFFFD700); // Prestige Gold
    const backgroundColor = Color(0xFF0A0A0A); // Deep Black

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
                        horizontal: 30, vertical: 60),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Cabi Logo
                          Center(
                            child: Container(
                              height: 90,
                              width: 90,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border:
                                    Border.all(color: primaryColor, width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: primaryColor.withValues(alpha: 0.2),
                                    blurRadius: 20,
                                    spreadRadius: 2,
                                  ),
                                ],
                              ),
                              child: ClipOval(
                                child: Image.asset(
                                  'assets/images/cabi_logo.png',
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) =>
                                      const Icon(Icons.taxi_alert_outlined,
                                          color: primaryColor, size: 30),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 30),
                          const Text(
                            "Welcome to Cabi Go",
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            "Where will you go today?",
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                fontSize: 16, color: Colors.grey[400]),
                          ),
                          const SizedBox(height: 40),

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
                              style: const TextStyle(color: Colors.white),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please enter your email or phone number';
                                }
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(height: 20),

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
                                    color: Colors.grey,
                                  ),
                                  onPressed: () => setState(() =>
                                      _obscurePassword = !_obscurePassword),
                                ),
                              ),
                              style: const TextStyle(color: Colors.white),
                              validator: (value) =>
                                  (value == null || value.length < 6)
                                      ? 'Password must be at least 6 characters'
                                      : null,
                            ),
                          ),

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
                                      "Remember Me",
                                      style: TextStyle(
                                          color: Colors.grey[400],
                                          fontSize: 14),
                                    ),
                                  ),
                                ],
                              ),
                              TextButton(
                                onPressed: () {},
                                child: const Text("Forgot Password?",
                                    style: TextStyle(
                                        color: primaryColor, fontSize: 14)),
                              ),
                            ],
                          ),

                          const SizedBox(height: 30),
                          if (_errorMessage != null)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 20),
                              child: Text(_errorMessage!,
                                  textAlign: TextAlign.center,
                                  style:
                                      const TextStyle(color: Colors.redAccent)),
                            ),

                          // Button
                          ElevatedButton(
                            onPressed: _isLoading ? null : _signIn,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primaryColor,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(vertical: 18),
                              elevation: 5,
                              shadowColor: primaryColor.withValues(alpha: 0.4),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(15)),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                        color: Colors.black, strokeWidth: 2),
                                  )
                                : const Text("Sign In",
                                    style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold)),
                          ),

                          const SizedBox(height: 30),
                          Wrap(
                            alignment: WrapAlignment.center,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Text("Don't have an account? ",
                                  style: TextStyle(color: Colors.grey[400])),
                              TextButton(
                                onPressed: () {
                                  Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                          builder: (_) =>
                                              const RegistrationScreen()));
                                },
                                child: const Text("Sign Up",
                                    style: TextStyle(
                                        color: primaryColor,
                                        fontWeight: FontWeight.bold)),
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
          );
        },
      ),
    );
  }

  Widget _buildInputContainer({required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white10),
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
      labelStyle: const TextStyle(color: Colors.grey),
      floatingLabelStyle: TextStyle(color: primaryColor),
      prefixIcon: Icon(icon, color: primaryColor),
      suffixIcon: suffixIcon,
      border: InputBorder.none,
      enabledBorder: InputBorder.none,
      focusedBorder: InputBorder.none,
      filled: true,
      fillColor: Colors.transparent,
      contentPadding: const EdgeInsets.all(20),
    );
  }
}
