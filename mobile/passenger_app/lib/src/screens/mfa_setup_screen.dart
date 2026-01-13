import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:qr_flutter/qr_flutter.dart';

class MfaSetupScreen extends StatefulWidget {
  const MfaSetupScreen({super.key});

  @override
  State<MfaSetupScreen> createState() => _MfaSetupScreenState();
}

class _MfaSetupScreenState extends State<MfaSetupScreen> {
  String? _secret;
  String? _qrCodeDataUrl;
  String _errorMessage = '';
  bool _isLoading = true;

  final TextEditingController _mfaCodeController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _generateMfaSecret();
  }

  Future<void> _generateMfaSecret() async {
    // In a real app, the JWT would come from your auth provider
    const String mockJwt = 'mock_jwt_for_mfa_setup';

    try {
      final response = await http.post(
        Uri.parse('http://localhost:3000/auth/mfa/generate'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $mockJwt',
        },
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        setState(() {
          _secret = data['secret'];
          _qrCodeDataUrl = data['qrCodeDataUrl'];
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to generate MFA secret');
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: Could not start MFA setup.';
        _isLoading = false;
      });
    }
  }

  Future<void> _verifyMfa() async {
    // ... similar logic to call the /auth/mfa/verify endpoint
    // On success, show a success message and pop the navigator
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Setup MFA')),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _errorMessage.isNotEmpty
              ? Center(
                  child:
                      Text(_errorMessage, style: TextStyle(color: Colors.red)),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        '1. Scan this QR code with your authenticator app (e.g., Google Authenticator).',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      SizedBox(height: 16),
                      if (_qrCodeDataUrl != null)
                        Container(
                          color: Colors.white,
                          padding: EdgeInsets.all(10),
                          child: QrImageView(
                            data: _qrCodeDataUrl!,
                            version: QrVersions.auto,
                            size: 200.0,
                          ),
                        ),
                      SizedBox(height: 16),
                      Text('Or manually enter this secret key:'),
                      SizedBox(height: 8),
                      SelectableText(
                        _secret ?? '',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                      SizedBox(height: 24),
                      Text(
                        '2. Enter the 6-digit code from your app to verify.',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      SizedBox(height: 8),
                      TextField(
                        controller: _mfaCodeController,
                        decoration: InputDecoration(
                          labelText: 'MFA Code',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                      SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: _verifyMfa,
                        child: Text('Verify and Enable MFA'),
                      ),
                    ],
                  ),
                ),
    );
  }
}
