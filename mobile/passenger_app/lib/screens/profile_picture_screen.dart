import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class ProfilePictureScreen extends StatefulWidget {
  const ProfilePictureScreen({super.key});

  @override
  State<ProfilePictureScreen> createState() => _ProfilePictureScreenState();
}

class _ProfilePictureScreenState extends State<ProfilePictureScreen> {
  String? _currentImageUrl = 'https://i.pravatar.cc/300'; // Mock initial image
  File? _newImageFile;
  final ImagePicker _picker = ImagePicker();
  bool _isUploading = false;

  Future<void> _pickImage(ImageSource source) async {
    final pickedFile = await _picker.pickImage(source: source);
    if (pickedFile != null) {
      setState(() {
        _newImageFile = File(pickedFile.path);
      });
    }
  }

  Future<void> _uploadImage() async {
    if (_newImageFile == null) return;
    setState(() => _isUploading = true);

    // Mock API call for upload
    await Future.delayed(const Duration(seconds: 3));
    debugPrint('Uploading image: ${_newImageFile!.path}');

    // On success:
    if (mounted) {
      setState(() {
        // In a real app, this URL would come from the API response
        _currentImageUrl = _newImageFile!.path;
        _newImageFile = null;
        _isUploading = false;
      });

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Profile picture updated!')));
    }
  }

  void _removeImage() {
    // Mock API call for removal
    debugPrint('Removing profile picture.');
    setState(() {
      _currentImageUrl = null;
      _newImageFile = null;
    });
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Profile picture removed.')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile Picture')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 80,
              backgroundImage: _newImageFile != null
                  ? FileImage(_newImageFile!)
                  : (_currentImageUrl != null
                      ? NetworkImage(_currentImageUrl!)
                      : null) as ImageProvider,
              child: _newImageFile == null && _currentImageUrl == null
                  ? const Icon(Icons.person, size: 80)
                  : null,
            ),
            const SizedBox(height: 20),
            if (_newImageFile == null)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton.icon(
                    onPressed: () => _pickImage(ImageSource.gallery),
                    icon: const Icon(Icons.photo_library),
                    label: const Text('Gallery'),
                  ),
                  TextButton.icon(
                    onPressed: () => _pickImage(ImageSource.camera),
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Camera'),
                  ),
                ],
              ),
            if (_newImageFile != null)
              _isUploading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _uploadImage,
                      child: const Text('Save Picture'),
                    ),
            if (_currentImageUrl != null)
              TextButton(
                onPressed: _removeImage,
                child: const Text(
                  'Remove Picture',
                  style: TextStyle(color: Colors.red),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
