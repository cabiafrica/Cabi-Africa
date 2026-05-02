import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/screens/downline_screen.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:driver_app/services/referral_service.dart';
import 'package:driver_app/providers/auth_provider.dart';

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
  final List<ReferredDriverDto> referredDrivers;

  DriverReferralInfoDto({
    required this.referralCode,
    required this.referredDrivers,
  });
}

class ReferralProgramScreen extends ConsumerStatefulWidget {
  const ReferralProgramScreen({super.key});

  @override
  ConsumerState<ReferralProgramScreen> createState() =>
      _ReferralProgramScreenState();
}

class _ReferralProgramScreenState extends ConsumerState<ReferralProgramScreen> {
  final ReferralService _referralService = ReferralService();
  late Future<DriverReferralInfoDto> _referralInfoFuture;

  @override
  void initState() {
    super.initState();
    _referralInfoFuture = _fetchReferralInfo();
  }

  Future<DriverReferralInfoDto> _fetchReferralInfo() async {
    final authState = ref.read(authProvider);
    String? driverId;
    if (authState is Authenticated) {
      driverId = authState.userId;
    }

    if (driverId == null) {
      return DriverReferralInfoDto(
        referralCode: 'LOGIN-REQ',
        referredDrivers: [],
      );
    }

    try {
      final code = await _referralService.getReferralCode(driverId);
      final downline = await _referralService.getDownline(driverId);

      final List<ReferredDriverDto> referredDrivers = downline
          .map((item) => ReferredDriverDto(
                name: item['name'] ?? 'Unknown',
                status: item['status'] == 'ACTIVE'
                    ? ReferralStatus.active
                    : ReferralStatus.pending,
                joinedAt: item['joinedAt'] != null
                    ? DateTime.parse(item['joinedAt'])
                    : DateTime.now(),
              ))
          .toList();

      return DriverReferralInfoDto(
        referralCode: code,
        referredDrivers: referredDrivers,
      );
    } catch (e) {
      return DriverReferralInfoDto(
        referralCode: 'ERROR',
        referredDrivers: [],
      );
    }
  }

  void _shareCode(String code) {
    final message =
        'Join Cabi Africa as a driver and earn more! Use my referral code: $code\nSign up here: https://cabi.africa/d';
    Clipboard.setData(ClipboardData(text: message));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Driver invite message copied to clipboard!')),
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
          final inviteLink =
              "https://cabi.africa/invite?code=${referralInfo.referralCode}";

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
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
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Recent Referrals',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ),
                if (referralInfo.referredDrivers.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Text('No referrals yet.'),
                  )
                else
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
                          child: Text(
                              driver.name.isNotEmpty ? driver.name[0] : '?'),
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
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Opening Driver Portal...')),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: const Color(0xFFFFBE0B),
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
