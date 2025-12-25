import 'package:flutter/material.dart';

class BusinessProfileScreen extends StatefulWidget {
  const BusinessProfileScreen({super.key});

  @override
  State<BusinessProfileScreen> createState() => _BusinessProfileScreenState();
}

class _BusinessProfileScreenState extends State<BusinessProfileScreen> {
  final _emailController = TextEditingController();
  final _expenseCodeController = TextEditingController();
  bool _sendReceipts = true;
  bool _connectedExpensify = false;
  bool _connectedConcur = false;

  Widget _buildConnectButton(String provider, IconData icon, Color color, bool isConnected, VoidCallback onTap) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(icon, color: color, size: 32),
        title: Text(provider),
        subtitle: Text(isConnected ? 'Connected' : 'Not Connected', 
          style: TextStyle(color: isConnected ? Colors.green : Colors.grey, fontSize: 12)),
        trailing: ElevatedButton(
          onPressed: onTap,
          style: ElevatedButton.styleFrom(
            backgroundColor: isConnected ? Colors.grey[200] : color,
            foregroundColor: isConnected ? Colors.black87 : Colors.white,
            elevation: 0,
          ),
          child: Text(isConnected ? 'Disconnect' : 'Connect'),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Business Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Set up your business profile to easily manage work rides.',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Work Email',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _expenseCodeController,
              decoration: const InputDecoration(
                labelText: 'Default Expense Code (Optional)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.receipt_long),
              ),
            ),
            const SizedBox(height: 24),
            SwitchListTile(
              title: const Text('Send receipts to work email'),
              value: _sendReceipts,
              onChanged: (val) => setState(() => _sendReceipts = val),
            ),
            const Divider(height: 48),
            const Text(
              'Expense Integration',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Automatically forward receipts to your expense provider.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            _buildConnectButton(
              'Expensify', 
              Icons.account_balance_wallet,
              Colors.green,
              _connectedExpensify,
              () => setState(() => _connectedExpensify = !_connectedExpensify)
            ),
            const SizedBox(height: 12),
            _buildConnectButton(
              'SAP Concur', 
              Icons.business_center,
              Colors.blue[700]!,
              _connectedConcur,
              () => setState(() => _connectedConcur = !_connectedConcur)
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[900],
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('SAVE PROFILE'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _saveProfile() {
    // API Call to UserService would go here
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Business Profile Saved!')),
    );
    Navigator.pop(context);
  }
}
