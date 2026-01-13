import 'package:flutter/material.dart';
import 'package:driver_app/screens/downline_screen.dart'; // Ensure import
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:driver_app/theme/app_theme.dart';

// Mock DTOs - In a real app, these would be generated.
enum ReferralStatus { pending, active }

class ReferredDriverDto {
  final String name;
  final ReferralStatus status;
  final DateTime joinedAt;

  ReferredDriverDto({
    required this.name,
    required this.status,
    required this.joinedAt,
  });
}

class DriverReferralInfoDto {
  final String referralCode;
  final List<ReferredDriverDto>
      referredDrivers; // Only level 1 usually here, detailed tree in Downline

  DriverReferralInfoDto({
    required this.referralCode,
    required this.referredDrivers,
  });
}

class ReferralProgramScreen extends StatefulWidget {
  const ReferralProgramScreen({super.key});

  @override
  State<ReferralProgramScreen> createState() => _ReferralProgramScreenState();
}

class _ReferralProgramScreenState extends State<ReferralProgramScreen> {
  late Future<DriverReferralInfoDto> _referralInfoFuture;

  @override
  void initState() {
    super.initState();
    _referralInfoFuture = _fetchReferralInfo();
  }

  Future<DriverReferralInfoDto> _fetchReferralInfo() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));
    return DriverReferralInfoDto(
      referralCode: 'DRIVE-XYZ123',
      referredDrivers: [
        ReferredDriverDto(
          name: 'John D.',
          status: ReferralStatus.active,
          joinedAt: DateTime.now().subtract(const Duration(days: 10)),
        ),
        ReferredDriverDto(
          name: 'Jane S.',
          status: ReferralStatus.pending,
          joinedAt: DateTime.now().subtract(const Duration(days: 2)),
        ),
      ],
    );
  }

  void _shareCode(String code) {
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Referral code copied to clipboard!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Invite & Earn')),
      body: FutureBuilder<DriverReferralInfoDto>(
        future: _referralInfoFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Could not load referral info.'));
          }

          final referralInfo = snapshot.data!;
          // Using a unique invitation link structure for the QR code
          final inviteLink =
              "https://cabi.africa/invite?code=${referralInfo.referralCode}";

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // 1. QR Code Section
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      children: [
                        Text(
                          'Scan to Join My Team',
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        QrImageView(
                          data: inviteLink,
                          version: QrVersions.auto,
                          size: 200.0,
                          backgroundColor: Colors.white,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          referralInfo.referralCode,
                          style: Theme.of(context)
                              .textTheme
                              .headlineMedium
                              ?.copyWith(
                                  color: AppTheme.primaryColor,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2.0),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Share this unique code or QR with other drivers.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // 2. Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _shareCode(referralInfo.referralCode),
                        icon: const Icon(Icons.copy),
                        label: const Text('Copy Code'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey[200],
                          foregroundColor: Colors.black,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          // Navigate to Downline / Team View
                          Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) =>
                                      const DownlineScreen()));
                        },
                        icon: const Icon(Icons.people),
                        label: const Text('View Team'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryColor,
                          foregroundColor: Colors.black,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // 3. Level 1 Referrals
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Level 1 Referrals (Recent)',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ),
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: referralInfo.referredDrivers.length,
                  itemBuilder: (context, index) {
                    final driver = referralInfo.referredDrivers[index];
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: CircleAvatar(
                        backgroundColor: Colors.grey[200],
                        child: Text(driver.name[0]),
                      ),
                      title: Text(driver.name),
                      subtitle:
                          Text('Status: ${driver.status.name.toUpperCase()}'),
                      trailing: Text(
                        driver.status == ReferralStatus.active
                            ? '+ Earned'
                            : 'Pending',
                        style: TextStyle(
                            color: driver.status == ReferralStatus.active
                                ? Colors.green
                                : Colors.orange,
                            fontWeight: FontWeight.bold),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 24),

                // Portal Link Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      // Redirect logic
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Opening Driver Portal...')),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black, // Cabi Black
                      foregroundColor: const Color(0xFFFFBE0B), // Cabi Yellow
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('View Full Team in Portal',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          );
        },
      ),
    );
  }
}
