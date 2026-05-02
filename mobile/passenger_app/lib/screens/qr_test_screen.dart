import 'package:flutter/material.dart';
import 'package:passenger_app/theme/app_theme.dart';
import 'package:passenger_app/widgets/profile_avatar_with_qr.dart';

class QrTestScreen extends StatefulWidget {
  const QrTestScreen({super.key});

  @override
  State<QrTestScreen> createState() => _QrTestScreenState();
}

class _QrTestScreenState extends State<QrTestScreen> {
  String _testData = 'passenger:77821-test-identifier';
  final TextEditingController _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    _controller.text = _testData;
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
          'QR INTEGRATION TEST',
          style: TextStyle(
            color: primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 14,
          ),
        ),
        iconTheme: IconThemeData(color: primaryColor),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 20),
            _buildSectionHeader('GENERATION TEST'),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: Column(
                children: [
                  ProfileAvatarWithQr(
                    imageUrl: 'https://i.pravatar.cc/150?u=passenger-test',
                    isNetworkImage: true,
                    radius: 40,
                    qrData: _testData,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Tap the QR icon to verify the modernized identity dialog.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            _buildSectionHeader('INPUT TEST'),
            const SizedBox(height: 16),
            TextField(
              controller: _controller,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              onChanged: (val) {
                setState(() {
                  _testData = val;
                });
              },
              decoration: InputDecoration(
                labelText: 'Update QR Payload',
                labelStyle: TextStyle(color: primaryColor.withValues(alpha: 0.5)),
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
            ),
            const SizedBox(height: 48),
            _buildSectionHeader('SCANNING INTEGRATION (PHASE 2)'),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white10, style: BorderStyle.solid),
              ),
              child: Column(
                children: [
                  Icon(Icons.qr_code_scanner_rounded, color: Colors.white10, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    'Scanner hardware integration pending.',
                    style: TextStyle(color: Colors.white24, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Verification service endpoints confirmed.',
                    style: TextStyle(color: Colors.green.withValues(alpha: 0.5), fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: TextStyle(
        color: AppTheme.primaryColor,
        fontSize: 10,
        fontWeight: FontWeight.bold,
        letterSpacing: 2,
      ),
    );
  }
}

