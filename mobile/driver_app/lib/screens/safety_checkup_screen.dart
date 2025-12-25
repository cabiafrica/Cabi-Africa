import 'package:flutter/material.dart';

class SafetyCheckupScreen extends StatefulWidget {
  const SafetyCheckupScreen({super.key});

  @override
  State<SafetyCheckupScreen> createState() => _SafetyCheckupScreenState();
}

class _SafetyCheckupScreenState extends State<SafetyCheckupScreen> {
  // Mock feature status
  bool _trustedContactsEnabled = false;
  bool _pinVerificationEnabled = true;
  bool _rideCheckEnabled = false;

  void _setupTrustedContacts() {
      // Navigate to Trusted Contacts or show mock setup
      setState(() => _trustedContactsEnabled = true);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Trusted Contacts setup launched!')));
  }

  void _enableRideCheck() {
      setState(() => _rideCheckEnabled = true);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ride Check enabled!')));
  }

  @override
  Widget build(BuildContext context) {
    final allGood = _trustedContactsEnabled && _pinVerificationEnabled && _rideCheckEnabled;

    return Scaffold(
      appBar: AppBar(title: const Text('Safety Checkup')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                    color: allGood ? Colors.green.shade50 : Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: allGood ? Colors.green : Colors.orange),
                ),
                child: Column(
                    children: [
                        Icon(allGood ? Icons.check_circle : Icons.warning_amber, size: 64, color: allGood ? Colors.green : Colors.orange),
                        const SizedBox(height: 16),
                        Text(
                            allGood ? 'You are all set!' : 'Action Needed',
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: allGood ? Colors.green.shade800 : Colors.orange.shade800),
                        ),
                        const SizedBox(height: 8),
                        Text(
                            allGood 
                                ? 'Great job! You have enabled all recommended safety features.' 
                                : 'Complete the steps below to maximize your safety on the road.',
                            textAlign: TextAlign.center,
                        )
                    ],
                ),
            ),
            const SizedBox(height: 24),
            _buildCheckItem(
                title: 'Trusted Contacts',
                description: 'Share your trip details with friends and family automatically.',
                isEnabled: _trustedContactsEnabled,
                onAction: _setupTrustedContacts,
                actionLabel: 'Set Up',
            ),
            _buildCheckItem(
                title: 'PIN Verification',
                description: 'Verify your rider with a unique 4-digit PIN.',
                isEnabled: _pinVerificationEnabled,
                onAction: () {}, // Already enabled
                actionLabel: 'Manage',
            ),
            _buildCheckItem(
                title: 'RideCheck',
                description: 'Detect unexpected stops or crashes and get help faster.',
                isEnabled: _rideCheckEnabled,
                onAction: _enableRideCheck,
                actionLabel: 'Enable',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckItem({
      required String title, 
      required String description, 
      required bool isEnabled, 
      required VoidCallback onAction,
      required String actionLabel
  }) {
      return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                  children: [
                      Icon(isEnabled ? Icons.check_circle : Icons.circle_outlined, color: isEnabled ? Colors.green : Colors.grey),
                      const SizedBox(width: 16),
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                  Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  Text(description, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                              ],
                          ),
                      ),
                      if (!isEnabled)
                          ElevatedButton(
                              onPressed: onAction, 
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.deepPurple, foregroundColor: Colors.white),
                              child: Text(actionLabel)
                          )
                      else
                          TextButton(onPressed: onAction, child: const Text('Edit'))
                  ],
              ),
          ),
      );
  }
}
