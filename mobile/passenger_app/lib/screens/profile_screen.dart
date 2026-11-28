import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'package:core_ui/core_ui.dart';
import '../services/auth_service.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/profile_avatar_with_qr.dart';
import '../widgets/security_verification_modal.dart';
import 'login_screen.dart';
import 'loyalty_dashboard_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nameController = TextEditingController();
  final _authService = AuthService();
  File? _imageFile;
  bool _isLoading = false;
  String? _selectedPreferredName;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = legacy_provider.Provider.of<AuthProvider>(context, listen: false);
      if (auth.user != null) {
        setState(() {
          final user = auth.user!;
          final firstName = (user['firstName'] ?? '').toString().trim();
          final lastName = (user['lastName'] ?? '').toString().trim();
          final middleName = (user['middleName'] ?? '').toString().trim();
          final fullNameCombined = "$firstName $middleName $lastName".replaceAll(RegExp(r'\s+'), ' ').trim();
          _nameController.text = fullNameCombined.isNotEmpty
              ? fullNameCombined
              : "${user['name'] ?? user['fullName'] ?? ''}".trim();

          final existing = (user['preferredPublicName'] ?? user['nickname'] ?? user['preferredName'])?.toString().trim();
          final options = PublicNameHelper.generateOptions(_nameController.text, middleName: middleName);
          if (existing != null && existing.isNotEmpty && options.contains(existing)) {
            _selectedPreferredName = existing;
          } else if (options.isNotEmpty) {
            _selectedPreferredName = options.first;
          }
        });
      }
    });

    _nameController.addListener(() {
      final options = PublicNameHelper.generateOptions(_nameController.text);
      if (_selectedPreferredName == null || !options.contains(_selectedPreferredName)) {
        if (options.isNotEmpty && mounted) {
          setState(() {
            _selectedPreferredName = options.first;
          });
        }
      }
    });
  }

  Future<void> _pickImage() async {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.darkSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'UPDATE PROFILE PICTURE',
                style: TextStyle(
                  color: AppTheme.primaryColor,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.camera_alt_rounded, color: AppTheme.primaryColor),
                title: const Text('Take Photo', style: TextStyle(color: Colors.white)),
                onTap: () async {
                  Navigator.pop(ctx);
                  final picked = await ImagePicker().pickImage(
                    source: ImageSource.camera,
                    maxWidth: 1024,
                    maxHeight: 1024,
                    imageQuality: 85,
                  );
                  if (picked != null) {
                    setState(() => _imageFile = File(picked.path));
                  }
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_rounded, color: AppTheme.primaryColor),
                title: const Text('Choose from Gallery', style: TextStyle(color: Colors.white)),
                onTap: () async {
                  Navigator.pop(ctx);
                  final picked = await ImagePicker().pickImage(
                    source: ImageSource.gallery,
                    maxWidth: 1024,
                    maxHeight: 1024,
                    imageQuality: 85,
                  );
                  if (picked != null) {
                    setState(() => _imageFile = File(picked.path));
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _saveProfile() async {
    setState(() => _isLoading = true);
    try {
      final res = await _authService.updateProfile(
        name: _nameController.text,
        preferredPublicName: _selectedPreferredName,
        imagePath: _imageFile?.path,
      );
      if (res.isSignedIn && res.user != null) {
        if (mounted) {
          final userMap = Map<String, dynamic>.from(res.user!);
          if (_selectedPreferredName != null && _selectedPreferredName!.isNotEmpty) {
            userMap['preferredPublicName'] = _selectedPreferredName;
            userMap['nickname'] = _selectedPreferredName;
          }
          legacy_provider.Provider.of<AuthProvider>(context, listen: false).updateUser(userMap);
          try {
            ProviderScope.containerOf(context, listen: false)
                .read(passengerAuthProvider.notifier)
                .updateUser(userMap);
          } catch (_) {}
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profile updated successfully!')),
          );
        }
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res.error ?? 'Failed to update profile')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to update profile: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _logout() {
    // Clear legacy AuthProvider
    legacy_provider.Provider.of<AuthProvider>(context, listen: false).logout();
    // Clear Riverpod state
    ProviderScope.containerOf(context, listen: false)
        .read(passengerAuthProvider.notifier)
        .logout();
    // Navigate to Login (replace all routes)
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = AppTheme.primaryColor;
    final backgroundColor = AppTheme.darkBackground;
    final surfaceColor = AppTheme.darkSurface;

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'PRESTIGE PROFILE',
          style: TextStyle(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 14,
          ),
        ),
        iconTheme: IconThemeData(color: AppTheme.primaryColor),
        actions: [
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.only(right: 16.0),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: AppTheme.primaryColor),
                ),
              ),
            )
          else
            TextButton(
              onPressed: _saveProfile,
              child: Text('SAVE',
                  style: TextStyle(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1)),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 20),
            Center(
              child: Stack(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: primaryColor.withValues(alpha: 0.3), width: 1),
                      boxShadow: [
                        BoxShadow(
                          color: primaryColor.withValues(alpha: 0.05),
                          blurRadius: 30,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: legacy_provider.Consumer<AuthProvider>(
                      builder: (context, auth, child) {
                        ImageProvider? avatarProvider;
                        if (_imageFile != null) {
                          avatarProvider = FileImage(_imageFile!);
                        } else {
                          avatarProvider = getPassengerAvatarProvider(auth.user);
                        }

                        return CircleAvatar(
                          radius: 65,
                          backgroundImage: avatarProvider,
                          backgroundColor: surfaceColor,
                          child: avatarProvider == null
                              ? const Icon(Icons.person_rounded, size: 65, color: AppTheme.primaryColor)
                              : null,
                        );
                      },
                    ),
                  ),
                  Positioned(
                    bottom: 4,
                    right: 4,
                    child: GestureDetector(
                      onTap: _pickImage,
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.camera_alt_rounded,
                          color: Colors.black,
                          size: 18,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'ELITE MEMBER',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white38,
                fontSize: 10,
                letterSpacing: 2,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 48),
            _buildSectionLabel('PERSONAL INFORMATION'),
            const SizedBox(height: 16),
            legacy_provider.Consumer<AuthProvider>(
              builder: (context, auth, child) {
                final user = auth.user;
                return Column(
                  children: [
                    _buildProfileField(
                      controller: _nameController,
                      label: 'Full Name',
                      icon: Icons.person_outline_rounded,
                    ),
                    const SizedBox(height: 20),
                    _buildProfileField(
                      initialValue: user?['phone'] ?? "No Phone Linked",
                      label: 'Identity Verified Phone',
                      icon: Icons.verified_user_outlined,
                      readOnly: true,
                    ),
                    _buildPreferredPublicNameSection(user),
                    _buildVerificationStatusSection(user),
                  ],
                );
              },
            ),
            const SizedBox(height: 32),
            _buildSectionLabel('EXCLUSIVES'),
            const SizedBox(height: 16),
            _buildMenuTile(
              icon: Icons.auto_awesome_rounded,
              title: 'CABI Rewards Program',
              subtitle: 'Tier Status: Gold Elite',
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => const LoyaltyDashboardScreen()),
              ),
            ),
            const SizedBox(height: 48),
            TextButton(
              onPressed: _logout,
              style: TextButton.styleFrom(
                foregroundColor: Colors.redAccent.withValues(alpha: 0.7),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('TERMINATE SESSION',
                  style: TextStyle(
                      letterSpacing: 2,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      color: AppTheme.errorRed)),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        color: AppTheme.primaryColor,
        fontSize: 10,
        fontWeight: FontWeight.bold,
        letterSpacing: 1.5,
      ),
    );
  }

  Widget _buildPreferredPublicNameSection(Map<String, dynamic>? user) {
    final middle = user?['middleName']?.toString();
    final options = PublicNameHelper.generateOptions(
      _nameController.text,
      middleName: middle,
    );

    final selectedName = (_selectedPreferredName != null && options.contains(_selectedPreferredName))
        ? _selectedPreferredName!
        : (options.isNotEmpty ? options.first : _nameController.text);

    return Container(
      margin: const EdgeInsets.only(top: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.badge_outlined, color: AppTheme.primaryColor, size: 20),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'PREFERRED PUBLIC NAME',
                  style: TextStyle(
                    color: AppTheme.primaryColor,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'VISIBLE TO DRIVERS',
                  style: TextStyle(
                    color: AppTheme.primaryColor,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Select how drivers will see your identity upon receiving your trip request. This must be derived from your official registered name.',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.6),
              fontSize: 12,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: options.map((opt) {
              final isSelected = opt == selectedName;
              return ChoiceChip(
                label: Text(
                  opt,
                  style: TextStyle(
                    color: isSelected ? Colors.black : Colors.white,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    fontSize: 13,
                  ),
                ),
                selected: isSelected,
                selectedColor: AppTheme.primaryColor,
                backgroundColor: AppTheme.darkBackground,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(
                    color: isSelected
                        ? AppTheme.primaryColor
                        : Colors.white.withValues(alpha: 0.1),
                  ),
                ),
                onSelected: (selected) {
                  if (selected) {
                    setState(() {
                      _selectedPreferredName = opt;
                    });
                  }
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          // Live Dispatch Preview Card
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.darkBackground,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: Row(
              children: [
                ProfileAvatarBadge(
                  imageUrl: user?['profilePicture'] ?? user?['passportPhotoUrl'],
                  imageFile: _imageFile,
                  fallbackName: selectedName,
                  size: 40,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'DISPATCH VIEW PREVIEW',
                        style: TextStyle(
                          color: Colors.white38,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              selectedName,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Icon(Icons.verified, color: Colors.lightGreenAccent, size: 14),
                        ],
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'Driver View',
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileField({
    TextEditingController? controller,
    String? initialValue,
    required String label,
    required IconData icon,
    bool readOnly = false,
  }) {
    final primaryColor = AppTheme.primaryColor;
    final surfaceColor = AppTheme.darkSurface;


    return TextFormField(
      controller: controller,
      initialValue: initialValue,
      readOnly: readOnly,
      style: TextStyle(
          color: readOnly ? Colors.white54 : Colors.white, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white24, fontSize: 12),
        prefixIcon:
            Icon(icon, color: primaryColor.withValues(alpha: 0.5), size: 18),
        filled: true,
        fillColor: surfaceColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppTheme.primaryColor, width: 0.5),
        ),
      ),
    );
  }

  Widget _buildVerificationStatusSection(Map<String, dynamic>? user) {
    return Container(
      margin: const EdgeInsets.only(top: 20),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFD4AF37).withValues(alpha: 0.25),
        ),
      ),
      child: Material(
        type: MaterialType.transparency,
        child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.green.withValues(alpha: 0.15),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.greenAccent.withValues(alpha: 0.4)),
          ),
          child: const Icon(
            Icons.verified_user_rounded,
            color: Colors.greenAccent,
            size: 22,
          ),
        ),
        title: Row(
          children: [
            const Text(
              'PASSENGER VERIFICATION',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 13,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text(
                'ACTIVE',
                style: TextStyle(
                  color: Colors.greenAccent,
                  fontWeight: FontWeight.bold,
                  fontSize: 9,
                ),
              ),
            ),
          ],
        ),
        subtitle: const Padding(
          padding: EdgeInsets.only(top: 4),
          child: Text(
            'Selfie Face Recognition • Fingerprint • SMS OTP',
            style: TextStyle(color: Colors.white54, fontSize: 11),
          ),
        ),
        trailing: Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.05),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.refresh_rounded,
            color: Color(0xFFD4AF37),
            size: 18,
          ),
        ),
        onTap: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (ctx) => SecurityVerificationModal(
              userPhone: user?['phone']?.toString(),
              userName: _selectedPreferredName ?? _nameController.text,
              onVerified: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Passenger biometric identity verified!'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
            ),
          );
        },
        ),
      ),
    );
  }

  Widget _buildMenuTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    final primaryColor = AppTheme.primaryColor;
    final surfaceColor = AppTheme.darkSurface;


    return Container(
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Material(
        type: MaterialType.transparency,
        child: ListTile(
        leading: Icon(icon, color: primaryColor, size: 22),
        title: Text(title,
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14)),
        subtitle: Text(subtitle,
            style: const TextStyle(color: Colors.white38, fontSize: 11)),
        trailing:
            const Icon(Icons.chevron_right_rounded, color: Colors.white24),
        onTap: onTap,
        ),
      ),
    );
  }
}

