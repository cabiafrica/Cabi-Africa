import 'package:flutter/material.dart';

class PrivacyCenterScreen extends StatefulWidget {
  const PrivacyCenterScreen({super.key});

  @override
  State<PrivacyCenterScreen> createState() => _PrivacyCenterScreenState();
}

class _PrivacyCenterScreenState extends State<PrivacyCenterScreen> {
  bool _emailPromotions = true;
  bool _pushPromotions = true;
  bool _locationSharing = true;

  void _downloadMyData() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Download My Data'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('We\'ll compile all your personal data and send you a secure download link via email.'),
            SizedBox(height: 12),
            Text('This may take up to 24 hours.'),
          ],
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
                const SnackBar(content: Text('Data export requested. Check your email in 24 hours.')),
              );
            },
            child: const Text('REQUEST'),
          ),
        ],
      ),
    );
  }

  void _deleteAccount() {
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
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('This action is permanent and cannot be undone.'),
            SizedBox(height: 12),
            Text('All your data will be deleted:', style: TextStyle(fontWeight: FontWeight.bold)),
            Text('• Profile information'),
            Text('• Trip history'),
            Text('• Payment methods'),
            Text('• Ratings and reviews'),
            SizedBox(height: 12),
            Text('Some data may be retained for legal compliance.', style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              // Show password confirmation
              _confirmPassword();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('DELETE ACCOUNT'),
          ),
        ],
      ),
    );
  }

  void _confirmPassword() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm Password'),
        content: const TextField(
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'Enter your password',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              // Process deletion
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Account deletion initiated. You will be logged out.')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('CONFIRM'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Privacy Center')),
      body: ListView(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.blue[50],
            child: Row(
              children: [
                Icon(Icons.privacy_tip, color: Colors.blue[700]),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Manage your privacy settings and data',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),

          // Communication Preferences
          const ListTile(
            title: Text('Communication Preferences', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ),
          SwitchListTile(
            title: const Text('Email Promotions'),
            subtitle: const Text('Receive promotional emails and newsletters'),
            value: _emailPromotions,
            onChanged: (value) => setState(() => _emailPromotions = value),
          ),
          SwitchListTile(
            title: const Text('Push Notification Promotions'),
            subtitle: const Text('Receive promotional push notifications'),
            value: _pushPromotions,
            onChanged: (value) => setState(() => _pushPromotions = value),
          ),
          const Divider(),

          // Location Sharing
          const ListTile(
            title: Text('Location & Data Sharing', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ),
          SwitchListTile(
            title: const Text('Location Sharing'),
            subtitle: const Text('Share location data for analytics'),
            value: _locationSharing,
            onChanged: (value) => setState(() => _locationSharing = value),
          ),
          const Divider(),

          // Data Management
          const ListTile(
            title: Text('Data Management', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ),
          ListTile(
            leading: const Icon(Icons.download, color: Colors.blue),
            title: const Text('Download My Data'),
            subtitle: const Text('Request a copy of your personal data'),
            trailing: const Icon(Icons.chevron_right),
            onTap: _downloadMyData,
          ),
          ListTile(
            leading: const Icon(Icons.delete_forever, color: Colors.red),
            title: const Text('Delete Account', style: TextStyle(color: Colors.red)),
            subtitle: const Text('Permanently delete your account and data'),
            trailing: const Icon(Icons.chevron_right),
            onTap: _deleteAccount,
          ),
          const Divider(),

          // Legal Documents
          const ListTile(
            title: Text('Legal', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ),
          ListTile(
            leading: const Icon(Icons.description),
            title: const Text('Privacy Policy'),
            trailing: const Icon(Icons.open_in_new),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.description),
            title: const Text('Terms of Service'),
            trailing: const Icon(Icons.open_in_new),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.cookie),
            title: const Text('Cookie Policy'),
            trailing: const Icon(Icons.open_in_new),
            onTap: () {},
          ),

          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Last updated: ${DateTime.now().toString().split(' ')[0]}',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}
