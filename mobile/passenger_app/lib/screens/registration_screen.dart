import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'otp_verification_screen.dart';
import 'package:core_ui/core_ui.dart';

class RegistrationScreen extends StatefulWidget {
  final AuthService? authService;
  const RegistrationScreen({super.key, this.authService});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _referralController = TextEditingController();
  bool _isLoading = false;
  late final AuthService _authService;

  @override
  void initState() {
    super.initState();
    _authService = widget.authService ?? AuthService();
  }

  String? _validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your phone number';
    }
    // Basic Kenyan phone number validation
    if (!RegExp(r'^(?:\+254|0)?(7|1)\d{8}$').hasMatch(value)) {
      return 'Enter a valid Kenyan phone number';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    // Simple validation: must have letters and numbers
    if (!RegExp(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$').hasMatch(value)) {
      return 'Password must contain letters and numbers';
    }
    return null;
  }

  void _submitRegistration() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      try {
        final nameParts = _nameController.text.trim().split(' ');
        final firstName = nameParts[0];
        final lastName =
            nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

        final result = await _authService.register(
          firstName: firstName,
          lastName: lastName,
          email: _emailController.text,
          phone: _phoneController.text,
          password: _passwordController.text,
          referralCode: _referralController.text,
        );

        if (result.isSignedIn && mounted) {
          // Pass the authService down to the next screen for testability.
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (_) => OtpVerificationScreen(
                phone: _phoneController.text,
                authService: _authService,
              ),
            ),
          );
        } else if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Registration Failed: ${result.error}')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Registration Error: $e')));
        }
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Account')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Full Name'),
                validator: (value) => (value == null || value.isEmpty)
                    ? 'Please enter your name'
                    : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email Address'),
                keyboardType: TextInputType.emailAddress,
                validator: (value) => (value == null || !value.contains('@'))
                    ? 'Please enter a valid email'
                    : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _phoneController,
                decoration:
                    const InputDecoration(labelText: 'Phone Number (+254...)'),
                keyboardType: TextInputType.phone,
                validator: _validatePhone,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: 'Password'),
                obscureText: true,
                validator: _validatePassword,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _referralController,
                decoration: const InputDecoration(
                  labelText: 'Referral Code (Optional)',
                ),
              ),
              const SizedBox(height: 32),
              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : PrimaryButton(
                      onPressed: _submitRegistration,
                      label: 'Register',
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
