import 'package:flutter/material.dart';

class IncognitoTripsScreen extends StatefulWidget {
  const IncognitoTripsScreen({super.key});

  @override
  State<IncognitoTripsScreen> createState() => _IncognitoTripsScreenState();
}

class _IncognitoTripsScreenState extends State<IncognitoTripsScreen> {
  bool _isUnlocked = false;
  final TextEditingController _pinController = TextEditingController();

  final List<Map<String, dynamic>> _incognitoTrips = [];

  void _attemptUnlock() {
    // Mock PIN verification (in production, this would verify against user's PIN)
    if (_pinController.text == '1234') {
      setState(() => _isUnlocked = true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Incorrect PIN'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade900,
      appBar: AppBar(
        title: const Text('Incognito Trips'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: _isUnlocked ? _buildTripsList() : _buildLockScreen(),
    );
  }

  Widget _buildLockScreen() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.lock,
              size: 80,
              color: Colors.grey.shade600,
            ),
            const SizedBox(height: 24),
            Text(
              'Protected Content',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade300,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Enter your PIN to view incognito trips',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade500,
              ),
            ),
            const SizedBox(height: 32),
            Container(
              constraints: const BoxConstraints(maxWidth: 300),
              child: TextField(
                controller: _pinController,
                obscureText: true,
                keyboardType: TextInputType.number,
                maxLength: 4,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 24,
                  letterSpacing: 8,
                  color: Colors.white,
                ),
                decoration: InputDecoration(
                  hintText: '••••',
                  hintStyle: TextStyle(color: Colors.grey.shade700),
                  filled: true,
                  fillColor: Colors.grey.shade800,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  counterText: '',
                ),
                onSubmitted: (_) => _attemptUnlock(),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _attemptUnlock,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F2B27),
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('UNLOCK', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTripsList() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade800,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(Icons.visibility_off, color: Colors.grey.shade400),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Private Trip History',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade200,
                      ),
                    ),
                    Text(
                      'These trips are hidden from your main history',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade400,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        if (_incognitoTrips.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(Icons.check_circle,
                      size: 60, color: Colors.grey.shade600),
                  const SizedBox(height: 16),
                  Text(
                    'No incognito trips yet',
                    style: TextStyle(fontSize: 16, color: Colors.grey.shade400),
                  ),
                ],
              ),
            ),
          )
        else
          ..._incognitoTrips.map((trip) => Card(
                color: const Color(0xFF212121),
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFF0A0A0B),
                    child: const Icon(Icons.visibility_off,
                        color: Colors.white, size: 20),
                  ),
                  title: Text(
                    '${trip['pickup']} → ${trip['dropoff']}',
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text(
                    _formatDate(trip['date']),
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                  ),
                  trailing: Text(
                    'KES ${trip['fare'].toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              )),
      ],
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }
}
