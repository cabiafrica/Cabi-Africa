import 'package:flutter/material.dart';

// Mock service. In a real app, this would make HTTP requests.
class UserService {
  Future<Map<String, String>> getUserProfile() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return {
      'fullName': 'Jane Driver',
      'phone': '+1 (555) 987-6543',
      'email': 'jane.driver@example.com',
      'profilePictureUrl': 'https://via.placeholder.com/150',
    };
  }

  Future<bool> updateUserProfile({
    required String fullName,
    required String phone,
  }) async {
    await Future.delayed(const Duration(seconds: 1));
    print('Updating profile: $fullName, $phone');
    return true;
  }

  Future<void> uploadProfilePicture() async {
    // In a real app, this would use image_picker and http to upload a file.
    await Future.delayed(const Duration(seconds: 2));
    print('Uploading new profile picture...');
  }
}

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _userService = UserService();
  bool _isLoading = false;

  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final profile = await _userService.getUserProfile();
    _fullNameController.text = profile['fullName']!;
    _phoneController.text = profile['phone']!;
  }

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      final success = await _userService.updateUserProfile(
        fullName: _fullNameController.text,
        phone: _phoneController.text,
      );
      setState(() => _isLoading = false);

      if (success) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully!')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update profile.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profile')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              // Placeholder for profile picture upload
              TextFormField(
                controller: _fullNameController,
                decoration: const InputDecoration(labelText: 'Full Name'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Phone Number'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 20),
              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                      onPressed: _submitForm,
                      child: const Text('Save Changes'),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
