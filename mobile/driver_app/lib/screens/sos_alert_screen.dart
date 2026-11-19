import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:driver_app/theme/app_theme.dart';
import '../services/sos_service.dart';

class SosAlertScreen extends StatefulWidget {
  final Map<String, dynamic> alertData;

  const SosAlertScreen({super.key, required this.alertData});

  @override
  State<SosAlertScreen> createState() => _SosAlertScreenState();
}

class _SosAlertScreenState extends State<SosAlertScreen> {
  bool _isResponding = false;
  bool _hasAccepted = false;
  String? _responseMessage;

  Future<void> _navigateToLocation(BuildContext context) async {
    final location = widget.alertData['location'];
    final lat = location is Map ? location['lat'] : widget.alertData['lat'];
    final lng = location is Map ? (location['lng'] ?? location['lon']) : widget.alertData['lng'];

    if (lat != null && lng != null) {
      final googleMapsUrl = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
      if (await canLaunchUrl(googleMapsUrl)) {
        await launchUrl(googleMapsUrl, mode: LaunchMode.externalApplication);
        return;
      }
    }

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppTheme.primaryColor,
          content: Text('Navigation link unavailable for coordinates.', style: TextStyle(color: Colors.black)),
        ),
      );
    }
  }

  Future<void> _acceptRescueMission(BuildContext context) async {
    final alertId = widget.alertData['alertId'] ?? widget.alertData['id'];
    if (alertId == null || alertId.toString().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot accept mission: Missing incident ID')),
      );
      return;
    }

    setState(() => _isResponding = true);
    try {
      final result = await SosService().respondToDistress(alertId.toString());
      setState(() {
        _hasAccepted = true;
        _responseMessage = result['message'] ?? 'Rescue mission accepted! 500 Good Samaritan Points awarded.';
      });

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_responseMessage!),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not record rescue acceptance: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isResponding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final data = widget.alertData;
    final callerType = data['callerType'] ?? 'CAPTAIN';
    final callerName = data['callerName'] ?? data['driverName'] ?? 'Fellow Captain';
    final obNumber = data['obNumber'] ?? 'OB-EMERGENCY';
    final distance = data['distanceKm'] != null ? '${data['distanceKm']} KM' : (data['distance'] ?? 'NEARBY');
    final rewardPoints = data['rewardPoints'] ?? 500;

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.errorRed.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.errorRed, width: 2),
                ),
                child: const Icon(
                  Icons.warning_amber_rounded,
                  size: 58,
                  color: AppTheme.errorRed,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'DISTRESS SIGNAL',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  color: AppTheme.errorRed,
                  letterSpacing: 3.0,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'A NEARBY $callerType NEEDS IMMEDIATE RESCUE ASSISTANCE',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: Colors.white70, letterSpacing: 1.1, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 28),
              
              // Stylized Info Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.darkSurface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.errorRed.withValues(alpha: 0.35)),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.errorRed.withValues(alpha: 0.12),
                      blurRadius: 20,
                      spreadRadius: 2,
                    )
                  ],
                ),
                child: Column(
                  children: [
                    _buildInfoRow('INCIDENT REF', obNumber),
                    const Padding(padding: EdgeInsets.symmetric(vertical: 10), child: Divider(color: Colors.white10)),
                    _buildInfoRow('DISTRESSED USER', callerName),
                    const Padding(padding: EdgeInsets.symmetric(vertical: 10), child: Divider(color: Colors.white10)),
                    _buildInfoRow('EST. PROXIMITY', distance),
                    const Padding(padding: EdgeInsets.symmetric(vertical: 10), child: Divider(color: Colors.white10)),
                    _buildInfoRow('RESCUER BOUNTY', '+$rewardPoints PTS (FUEL / SACCO)'),
                  ],
                ),
              ),
              
              const Spacer(),
              
              // Primary Accept Rescue Button
              if (!_hasAccepted)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isResponding ? null : () => _acceptRescueMission(context),
                    icon: _isResponding
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                        : const Icon(Icons.volunteer_activism_rounded, size: 20),
                    label: Text(
                      _isResponding ? 'RECORDING RESCUE...' : 'ACCEPT MISSION (+$rewardPoints PTS)',
                      style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.8, fontSize: 13.5),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.greenAccent.shade400,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),

              if (_hasAccepted)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.green),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Colors.green, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _responseMessage ?? 'Rescue mission accepted!',
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 12),

              // Navigate Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _navigateToLocation(context),
                  icon: const Icon(Icons.navigation, size: 18),
                  label: const Text('NAVIGATE TO LOCATION', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.8, fontSize: 13.5)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),

              const SizedBox(height: 14),

              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text(
                  'DISMISS / UNABLE TO RESPOND',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.35), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
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
          style: const TextStyle(color: AppTheme.darkTextSecondary, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2),
        ),
        Text(
          value.toUpperCase(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}
