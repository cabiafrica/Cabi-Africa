import 'package:flutter/material.dart';
import 'package:driver_app/theme/app_theme.dart';

class SosAlertScreen extends StatelessWidget {
  final Map<String, dynamic> alertData;

  const SosAlertScreen({super.key, required this.alertData});

  void _navigateToDriver(BuildContext context) {
    final lat = alertData['lat'];
    final lng = alertData['lng'];
    debugPrint('Navigating to $lat, $lng');

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: AppTheme.primaryColor,
        content: Text('LAUNCHING NAVIGATION...', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.errorRed.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.errorRed, width: 2),
                ),
                child: const Icon(
                  Icons.warning_amber_rounded,
                  size: 64,
                  color: AppTheme.errorRed,
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'SOS ALERT',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.errorRed,
                  letterSpacing: 4.0,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'A NEARBY DRIVER NEEDS IMMEDIATE ASSISTANCE',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.white70, letterSpacing: 1.2, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 40),
              
              // Stylized Info Card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.darkSurface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppTheme.errorRed.withValues(alpha: 0.3)),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.errorRed.withValues(alpha: 0.1),
                      blurRadius: 20,
                      spreadRadius: 2,
                    )
                  ],
                ),
                child: Column(
                  children: [
                    _buildInfoRow('DRIVER ID', alertData['driverName'] ?? 'ELITE-AGENT-772'),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Divider(color: Colors.white10),
                    ),
                    _buildInfoRow('EST. DISTANCE', alertData['distance'] ?? '1.2 KM'),
                  ],
                ),
              ),
              
              const Spacer(),
              
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _navigateToDriver(context),
                  icon: const Icon(Icons.navigation, size: 20),
                  label: const Text('NAVIGATE TO LOCATION', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1, fontSize: 14)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text(
                  'IGNORE (UNABLE TO ASSIST)',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppTheme.darkTextSecondary, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5),
        ),
        Text(
          value.toUpperCase(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

