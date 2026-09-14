import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart' as legacy_provider;
import '../services/auth_service.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class ProfilePictureScreen extends StatefulWidget {
  const ProfilePictureScreen({super.key});

  @override
  State<ProfilePictureScreen> createState() => _ProfilePictureScreenState();
}

class _ProfilePictureScreenState extends State<ProfilePictureScreen> {
  final AuthService _authService = AuthService();
  final ImagePicker _picker = ImagePicker();
  String? _currentImageUrl;
  File? _newImageFile;
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = legacy_provider.Provider.of<AuthProvider>(context, listen: false);
      if (auth.user != null) {
        setState(() {
          _currentImageUrl = auth.user?['profilePicture'] ?? auth.user?['passportPhotoUrl'];
        });
      }
    });
  }

  Future<void> _pickImage(ImageSource source) async {
    final pickedFile = await _picker.pickImage(
      source: source,
      maxWidth: 1024,
      maxHeight: 1024,
      imageQuality: 85,
    );
    if (pickedFile != null) {
      setState(() {
        _newImageFile = File(pickedFile.path);
      });
    }
  }

  ImageProvider? _resolveImageProvider() {
    if (_newImageFile != null) {
      return FileImage(_newImageFile!);
    }
    if (_currentImageUrl != null && _currentImageUrl!.isNotEmpty) {
      if (_currentImageUrl!.startsWith('data:')) {
        try {
          return MemoryImage(base64Decode(_currentImageUrl!.split(',').last));
        } catch (_) {
          return const NetworkImage('https://i.pravatar.cc/300');
        }
      }
      return NetworkImage(_currentImageUrl!);
    }
    return null;
  }

  Future<void> _uploadImage() async {
    if (_newImageFile == null) return;
    setState(() => _isUploading = true);

    try {
      final auth = legacy_provider.Provider.of<AuthProvider>(context, listen: false);
      final currentName = auth.user?['fullName'] ?? 
          "${auth.user?['firstName'] ?? ''} ${auth.user?['lastName'] ?? ''}".trim();

      final res = await _authService.updateProfile(
        name: currentName.isNotEmpty ? currentName : 'Passenger',
        imagePath: _newImageFile!.path,
      );

      if (res.isSignedIn && res.user != null) {
        if (mounted) {
          final userMap = Map<String, dynamic>.from(res.user!);
          auth.updateUser(userMap);
          try {
            ProviderScope.containerOf(context, listen: false)
                .read(passengerAuthProvider.notifier)
                .updateUser(userMap);
          } catch (_) {}

          setState(() {
            _currentImageUrl = userMap['profilePicture'] ?? userMap['passportPhotoUrl'] ?? _newImageFile!.path;
            _newImageFile = null;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: AppTheme.darkSurface,
              content: Text('Profile picture updated successfully!', style: TextStyle(color: AppTheme.primaryColor)),
            ),
          );
        }
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red.shade900,
            content: Text(res.error ?? 'Failed to update profile picture'),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red.shade900,
            content: Text('Upload failed: $e'),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  Future<void> _removeImage() async {
    setState(() => _isUploading = true);
    try {
      final auth = legacy_provider.Provider.of<AuthProvider>(context, listen: false);
      final currentName = auth.user?['fullName'] ?? 
          "${auth.user?['firstName'] ?? ''} ${auth.user?['lastName'] ?? ''}".trim();

      final res = await _authService.updateProfile(
        name: currentName.isNotEmpty ? currentName : 'Passenger',
        imageUrl: '',
      );

      if (res.isSignedIn && res.user != null) {
        if (mounted) {
          final userMap = Map<String, dynamic>.from(res.user!);
          userMap['profilePicture'] = null;
          userMap['passportPhotoUrl'] = null;
          auth.updateUser(userMap);
          try {
            ProviderScope.containerOf(context, listen: false)
                .read(passengerAuthProvider.notifier)
                .updateUser(userMap);
          } catch (_) {}

          setState(() {
            _currentImageUrl = null;
            _newImageFile = null;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: AppTheme.darkSurface,
              content: Text('Profile picture removed.', style: TextStyle(color: Colors.white)),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to remove: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final imageProvider = _resolveImageProvider();

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'PROFILE PICTURE',
          style: TextStyle(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 14,
          ),
        ),
        iconTheme: const IconThemeData(color: AppTheme.primaryColor),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.3), width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withValues(alpha: 0.1),
                      blurRadius: 30,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: CircleAvatar(
                  radius: 80,
                  backgroundColor: AppTheme.darkSurface,
                  backgroundImage: imageProvider,
                  child: imageProvider == null
                      ? const Icon(Icons.person, size: 80, color: Colors.white38)
                      : null,
                ),
              ),
              const SizedBox(height: 32),
              if (_newImageFile == null)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton.icon(
                      onPressed: () => _pickImage(ImageSource.gallery),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primaryColor,
                        side: const BorderSide(color: AppTheme.primaryColor),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.photo_library_rounded),
                      label: const Text('Gallery'),
                    ),
                    const SizedBox(width: 16),
                    ElevatedButton.icon(
                      onPressed: () => _pickImage(ImageSource.camera),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.camera_alt_rounded),
                      label: const Text('Camera', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              if (_newImageFile != null)
                Column(
                  children: [
                    _isUploading
                        ? const CircularProgressIndicator(color: AppTheme.primaryColor)
                        : ElevatedButton(
                            onPressed: _uploadImage,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryColor,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Save Picture', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () => setState(() => _newImageFile = null),
                      child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
                    ),
                  ],
                ),
              if (_currentImageUrl != null && _newImageFile == null) ...[
                const SizedBox(height: 24),
                TextButton.icon(
                  onPressed: _isUploading ? null : _removeImage,
                  icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 18),
                  label: const Text(
                    'Remove Picture',
                    style: TextStyle(color: Colors.redAccent),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
