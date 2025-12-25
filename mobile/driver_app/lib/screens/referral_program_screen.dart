import 'package:flutter/material.dart';

// Mock DTOs - In a real app, these would be generated.
enum ReferralStatus { Pending, Active }

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
          status: ReferralStatus.Active,
          joinedAt: DateTime.now().subtract(const Duration(days: 10)),
        ),
        ReferredDriverDto(
          name: 'Jane S.',
          status: ReferralStatus.Pending,
          joinedAt: DateTime.now().subtract(const Duration(days: 2)),
        ),
      ],
    );
  }

  void _shareCode(String code) {
    // Mock share action
    print('Sharing referral code: $code');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Opening share dialog... (mock)')),
    );
    // In a real app, you would use a package like `share_plus`.
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Referral Program')),
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

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    const Text('Your Referral Code:'),
                    Text(
                      referralInfo.referralCode,
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _shareCode(referralInfo.referralCode),
                      icon: const Icon(Icons.share),
                      label: const Text('Share Code'),
                    ),
                  ],
                ),
              ),
              const Divider(),
              Expanded(
                child: ListView.builder(
                  itemCount: referralInfo.referredDrivers.length,
                  itemBuilder: (context, index) {
                    final driver = referralInfo.referredDrivers[index];
                    return ListTile(
                      title: Text(driver.name),
                      subtitle: Text(
                        'Joined: ${driver.joinedAt.toLocal().toString().split(' ')[0]}',
                      ),
                      trailing: Chip(
                        label: Text(driver.status.name),
                        backgroundColor: driver.status == ReferralStatus.Active
                            ? Colors.green
                            : Colors.orange,
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
