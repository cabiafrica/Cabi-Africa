import 'package:flutter/material.dart';
import 'incognito_trips_screen.dart';

class PrivacySettingsScreen extends StatefulWidget {
  const PrivacySettingsScreen({super.key});

  @override
  State<PrivacySettingsScreen> createState() => _PrivacySettingsScreenState();
}

class _PrivacySettingsScreenState extends State<PrivacySettingsScreen> {
  // Privacy consent flags
  final Map<String, bool> _privacySettings = {
    'personalizedAds': true,
    'analyticsResearch': true,
    'marketingEmails': false,
    'locationTracking': true,
    'dataSharingPartners': false,
    'crashReporting': true,
  };

  bool _isSaving = false;

  Future<void> _saveSettings() async {
    setState(() => _isSaving = true);

    // Simulate API call to user-service
    await Future.delayed(const Duration(seconds: 1));

    setState(() => _isSaving = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Privacy settings saved successfully'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy & Data'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        children: [
          // Header Section
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.deepPurple.shade50, Colors.white],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.shield,
                        size: 40, color: Colors.deepPurple.shade700),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Your Privacy Matters',
                            style: TextStyle(
                                fontSize: 22, fontWeight: FontWeight.bold),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Control how your data is used',
                            style: TextStyle(color: Colors.grey, fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Privacy Controls Section
          _buildSectionHeader('Data Usage Preferences'),

          _buildPrivacyToggle(
            'personalizedAds',
            'Personalized Ads',
            'Show ads tailored to your interests and ride history',
            Icons.ad_units,
            Colors.orange,
          ),

          _buildPrivacyToggle(
            'analyticsResearch',
            'Analytics & Research',
            'Help us improve the app by sharing anonymous usage data',
            Icons.analytics,
            Colors.blue,
          ),

          _buildPrivacyToggle(
            'marketingEmails',
            'Marketing Communications',
            'Receive promotional emails about offers and updates',
            Icons.email,
            Colors.green,
          ),

          const Divider(height: 32),

          _buildSectionHeader('Location & Tracking'),

          _buildPrivacyToggle(
            'locationTracking',
            'Location Tracking',
            'Allow location tracking when app is in background (required for ride features)',
            Icons.location_on,
            Colors.red,
            isRequired: true,
          ),

          _buildPrivacyToggle(
            'dataSharingPartners',
            'Data Sharing with Partners',
            'Share anonymized data with trusted partners for service improvements',
            Icons.people,
            Colors.purple,
          ),

          const Divider(height: 32),

          _buildSectionHeader('Technical Data'),

          _buildPrivacyToggle(
            'crashReporting',
            'Crash Reporting',
            'Automatically send crash reports to help us fix bugs',
            Icons.bug_report,
            Colors.teal,
          ),

          const SizedBox(height: 24),

          // Additional Privacy Links
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                _buildPrivacyLink(
                  'View Privacy Policy',
                  Icons.description,
                  () {
                    // Navigate to privacy policy
                  },
                ),
                _buildPrivacyLink(
                  'Download My Data',
                  Icons.download,
                  () {
                    _showDataDownloadDialog();
                  },
                ),
                _buildPrivacyLink(
                  'Incognito Trips',
                  Icons.visibility_off,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const IncognitoTripsScreen()),
                    );
                  },
                ),
                _buildPrivacyLink(
                  'Delete My Account',
                  Icons.delete_forever,
                  () {
                    _showDeleteAccountDialog();
                  },
                  isDestructive: true,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Save Button
          Padding(
            padding: const EdgeInsets.all(16),
            child: ElevatedButton(
              onPressed: _isSaving ? null : _saveSettings,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.deepPurple,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isSaving
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Text(
                      'SAVE PREFERENCES',
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.grey.shade700,
        ),
      ),
    );
  }

  Widget _buildPrivacyToggle(
    String key,
    String title,
    String description,
    IconData icon,
    Color color, {
    bool isRequired = false,
  }) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: SwitchListTile(
        value: _privacySettings[key] ?? false,
        onChanged: isRequired
            ? null
            : (value) {
                setState(() {
                  _privacySettings[key] = value;
                });
              },
        secondary: CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.1),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Row(
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
            if (isRequired) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.orange.shade100,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  'REQUIRED',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.orange,
                  ),
                ),
              ),
            ],
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            description,
            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
          ),
        ),
        activeThumbColor: color,
      ),
    );
  }

  Widget _buildPrivacyLink(String title, IconData icon, VoidCallback onTap,
      {bool isDestructive = false}) {
    return ListTile(
      leading: Icon(
        icon,
        color: isDestructive ? Colors.red : Colors.grey.shade700,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isDestructive ? Colors.red : Colors.black87,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
    );
  }

  void _showDataDownloadDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.download, color: Colors.blue),
            SizedBox(width: 8),
            Text('Download My Data'),
          ],
        ),
        content: const Text(
          'We will prepare a copy of all your data and send it to your registered email address within 48 hours.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Data download request submitted'),
                ),
              );
            },
            child: const Text('REQUEST'),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning, color: Colors.red),
            SizedBox(width: 8),
            Text('Delete Account?'),
          ],
        ),
        content: const Text(
          'This action is permanent and cannot be undone. All your data, ride history, and payment methods will be deleted.',
          style: TextStyle(color: Colors.red),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              // Would navigate to account deletion flow
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('DELETE ACCOUNT'),
          ),
        ],
      ),
    );
  }
}

