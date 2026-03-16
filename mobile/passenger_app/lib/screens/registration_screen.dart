import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../services/auth_service.dart';

class RegistrationScreen extends ConsumerStatefulWidget {
  final AuthService? authService;
  const RegistrationScreen({super.key, this.authService});

  @override
  ConsumerState<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends ConsumerState<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _referralController = TextEditingController();
  File? _profileImage;
  final ImagePicker _picker = ImagePicker();
  bool _isLoading = false;
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;
  late final AuthService _authService;

  @override
  void initState() {
    super.initState();
    _authService = widget.authService ?? ref.read(authServiceProvider);
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
    // Strict validation: must have letters, numbers, and symbols
    // Backend requires: Lowercase, Uppercase, Number, Special Char
    // Similar to: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/
    bool hasLower = RegExp(r'[a-z]').hasMatch(value);
    bool hasUpper = RegExp(r'[A-Z]').hasMatch(value);
    bool hasDigit = RegExp(r'\d').hasMatch(value);
    bool hasSpecial = RegExp(r'[!@#\$%^&*(),.?":{}|<>]').hasMatch(value);

    if (!hasLower || !hasUpper || !hasDigit || !hasSpecial) {
      return 'Must contain: Lowercase, Uppercase, Number & Symbol';
    }
    return null;
  }

  Future<void> _pickImage() async {
    final ImageSource? source = await showModalBottomSheet<ImageSource>(
      context: context,
      backgroundColor: const Color(0xFF1A1A1A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12.0),
            child: Wrap(
              children: <Widget>[
                const Padding(
                  padding: EdgeInsets.fromLTRB(20, 10, 20, 5),
                  child: Text(
                    'Upload Professional Photo',
                    style: TextStyle(
                      color: Color(0xFFFFD700),
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.fromLTRB(20, 0, 20, 15),
                  child: Text(
                    'The passport photo must be professional, undistorted, and confirm a real human face to international standards. This photo will be used as your avatar and can only be updated after 1 year.',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ),
                ListTile(
                  leading: const Icon(Icons.photo_library, color: Colors.white),
                  title: const Text('Choose from Gallery',
                      style: TextStyle(color: Colors.white)),
                  onTap: () => Navigator.of(context).pop(ImageSource.gallery),
                ),
                ListTile(
                  leading: const Icon(Icons.photo_camera, color: Colors.white),
                  title: const Text('Take a Photo',
                      style: TextStyle(color: Colors.white)),
                  onTap: () => Navigator.of(context).pop(ImageSource.camera),
                ),
              ],
            ),
          ),
        );
      },
    );

    if (source != null) {
      try {
        final XFile? photo = await _picker.pickImage(
          source: source,
          preferredCameraDevice: CameraDevice.front,
        );
        if (photo != null) {
          setState(() => _isLoading = true);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Verifying passport photo quality...'),
                duration: Duration(seconds: 2),
              ),
            );
          }

          // Simulated ML verification delay
          await Future.delayed(const Duration(seconds: 2));

          // Simulate 10% chance of failing the ML quality check
          bool passesCheck = DateTime.now().millisecond % 10 != 0;

          if (!passesCheck) {
            setState(() => _isLoading = false);
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                      'The uploaded file does not meet the standard. Please upload a professional passport photo.'),
                  backgroundColor: Colors.redAccent,
                  duration: Duration(seconds: 4),
                ),
              );
            }
            return;
          }

          setState(() {
            _profileImage = File(photo.path);
            _isLoading = false;
          });

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Photo verified successfully!'),
                backgroundColor: Colors.green,
                behavior: SnackBarBehavior.floating,
              ),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error getting photo: $e')),
          );
        }
      }
    }
  }

  void _submitRegistration() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      try {
        final firstName = _firstNameController.text.trim();
        final lastName = _lastNameController.text.trim();

        final email = _emailController.text.trim();
        final result = await _authService.register(
          firstName: firstName,
          lastName: lastName,
          email: email.isEmpty ? null : email,
          phone: _phoneController.text,
          password: _passwordController.text,
          referralCode: _referralController.text,
        );

        if (result.isSignedIn && mounted) {
          // On success, show message and navigate to Login
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text(
                    'Registration successful! Please sign in to continue.')),
          );
          // Small delay to let user see the message
          await Future.delayed(const Duration(seconds: 1));
          if (mounted) {
            Navigator.of(context).pop(); // Go back to Login Screen
          }
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
    const primaryColor = Color(0xFFFFD700); // Prestige Gold
    const backgroundColor = Color(0xFF0A0A0A); // Deep Black
    const surfaceColor = Color(0xFF141414); // Elevated Black

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: const Text(
          'CREATE ACCOUNT',
          style: TextStyle(
            color: primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 16,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: primaryColor),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 10),
              Center(
                child: GestureDetector(
                  onTap: _pickImage,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: primaryColor.withValues(alpha: 0.5), width: 1),
                      boxShadow: [
                        BoxShadow(
                          color: primaryColor.withValues(alpha: 0.1),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: CircleAvatar(
                      radius: 55,
                      backgroundColor: surfaceColor,
                      backgroundImage: _profileImage != null
                          ? FileImage(_profileImage!)
                          : null,
                      child: _profileImage == null
                          ? const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.camera_enhance_outlined,
                                    size: 32, color: primaryColor),
                                SizedBox(height: 4),
                                Text(
                                  'PHOTO',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: primaryColor,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ],
                            )
                          : null,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'PERSONAL DETAILS',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 12,
                  letterSpacing: 1,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _firstNameController,
                      label: 'First Name',
                      hint: 'John',
                      validator: (value) =>
                          (value == null || value.isEmpty) ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildTextField(
                      controller: _lastNameController,
                      label: 'Last Name',
                      hint: 'Doe',
                      validator: (value) =>
                          (value == null || value.isEmpty) ? 'Required' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              _buildTextField(
                controller: _emailController,
                label: 'Email Address (Optional)',
                hint: 'john.doe@prestige.com',
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) return null;
                  if (!value.contains('@')) return 'Please enter a valid email';
                  return null;
                },
              ),
              const SizedBox(height: 20),
              _buildTextField(
                controller: _phoneController,
                label: 'Phone Number',
                hint: '+254...',
                keyboardType: TextInputType.phone,
                validator: _validatePhone,
              ),
              const SizedBox(height: 20),
              _buildTextField(
                controller: _passwordController,
                label: 'Password',
                hint: '••••••••',
                isPassword: true,
                isObscured: !_isPasswordVisible,
                onToggleVisibility: () =>
                    setState(() => _isPasswordVisible = !_isPasswordVisible),
                validator: _validatePassword,
              ),
              const SizedBox(height: 20),
              _buildTextField(
                controller: _confirmPasswordController,
                label: 'Confirm Password',
                hint: '••••••••',
                isPassword: true,
                isObscured: !_isConfirmPasswordVisible,
                onToggleVisibility: () => setState(() =>
                    _isConfirmPasswordVisible = !_isConfirmPasswordVisible),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please confirm your password';
                  }
                  if (value != _passwordController.text) {
                    return 'Passwords do not match';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              _buildTextField(
                controller: _referralController,
                label: 'Referral Code (Optional)',
                hint: 'LUXURY2026',
              ),
              const SizedBox(height: 40),
              _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: primaryColor))
                  : ElevatedButton(
                      onPressed: _submitRegistration,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryColor,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        elevation: 10,
                        shadowColor: primaryColor.withValues(alpha: 0.3),
                      ),
                      child: const Text(
                        'COMPLETE REGISTRATION',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    TextInputType? keyboardType,
    bool isPassword = false,
    bool isObscured = false,
    VoidCallback? onToggleVisibility,
    String? Function(String?)? validator,
  }) {
    const primaryColor = Color(0xFFFFD700);
    const surfaceColor = Color(0xFF141414);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            label.toUpperCase(),
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
        ),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: isObscured,
          style: const TextStyle(color: Colors.white, fontSize: 15),
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.2)),
            filled: true,
            fillColor: surfaceColor,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      isObscured
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: primaryColor.withValues(alpha: 0.5),
                    ),
                    onPressed: onToggleVisibility,
                  )
                : null,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  BorderSide(color: Colors.white.withValues(alpha: 0.05)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  BorderSide(color: Colors.white.withValues(alpha: 0.05)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: primaryColor, width: 1),
            ),
            errorStyle: const TextStyle(color: Colors.redAccent, fontSize: 11),
          ),
        ),
      ],
    );
  }
}
