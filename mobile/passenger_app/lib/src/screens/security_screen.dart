// ignore_for_file: dead_code
import 'package:flutter/material.dart';
import 'mfa_setup_screen.dart';

class SecurityScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // In a real app, you'd get this from a provider
    bool isMfaEnabled = false;

    return Scaffold(
      appBar: AppBar(title: Text('Security')),
      body: ListView(
        children: <Widget>[
          ListTile(
            title: Text('Multi-Factor Authentication'),
            subtitle: Text(isMfaEnabled ? 'Enabled' : 'Disabled'),
            trailing: Icon(Icons.chevron_right),
            onTap: () {
              if (!isMfaEnabled) {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => MfaSetupScreen()),
                );
              } else {
                // In a future story, this could lead to a screen to disable MFA
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('MFA is already enabled.')),
                );
              }
            },
          ),
        ],
      ),
    );
  }
}
