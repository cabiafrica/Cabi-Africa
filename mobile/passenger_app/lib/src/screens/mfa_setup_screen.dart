import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:qr_flutter/qr_flutter.dart';
import '../../config/app_config.dart';
import '../../theme/app_theme.dart';

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
        Uri.parse('${AppConfig.authApiUrl}/auth/mfa/generate'),
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
    final primaryColor = AppTheme.primaryColor;
    final backgroundColor = AppTheme.darkBackground;
    final surfaceColor = AppTheme.darkSurface;

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'MFA SETUP',
          style: TextStyle(
            color: primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 14,
          ),
        ),
        iconTheme: IconThemeData(color: primaryColor),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: primaryColor))
          : _errorMessage.isNotEmpty
              ? Center(
                  child: Text(_errorMessage, style: TextStyle(color: AppTheme.errorRed)),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      _buildStepNumber(1),
                      const SizedBox(height: 16),
                      Text(
                        'Scan this QR code with your authenticator app (e.g., Google Authenticator).',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 32),
                      if (_qrCodeDataUrl != null)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: primaryColor.withValues(alpha: 0.2),
                                blurRadius: 20,
                                spreadRadius: 2,
                              )
                            ],
                          ),
                          child: QrImageView(
                            data: _qrCodeDataUrl!,
                            version: QrVersions.auto,
                            size: 200.0,
                          ),
                        ),
                      const SizedBox(height: 32),
                      Text(
                        'Or manually enter this secret key:',
                        style: TextStyle(color: Colors.white38, fontSize: 13),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: surfaceColor,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                        ),
                        child: SelectableText(
                          _secret ?? '',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: primaryColor,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                      const SizedBox(height: 48),
                      _buildStepNumber(2),
                      const SizedBox(height: 16),
                      Text(
                        'Enter the 6-digit code from your app to verify.',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 24),
                      TextField(
                        controller: _mfaCodeController,
                        style: const TextStyle(color: Colors.white, fontSize: 18, letterSpacing: 4),
                        textAlign: TextAlign.center,
                        decoration: InputDecoration(
                          hintText: '000000',
                          hintStyle: TextStyle(color: Colors.white10),
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
                            borderSide: BorderSide(color: primaryColor, width: 0.5),
                          ),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 32),
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: _verifyMfa,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryColor,
                            foregroundColor: Colors.black,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: const Text(
                            'VERIFY AND ENABLE MFA',
                            style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStepNumber(int number) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withValues(alpha: 0.1),
        shape: BoxShape.circle,
        border: Border.all(color: AppTheme.primaryColor, width: 1),
      ),
      child: Center(
        child: Text(
          '$number',
          style: TextStyle(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

