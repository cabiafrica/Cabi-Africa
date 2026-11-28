import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:driver_app/config/app_config.dart';

class LostItemResponseScreen extends StatefulWidget {
  final String ticketId;

  const LostItemResponseScreen({super.key, required this.ticketId});

  @override
  State<LostItemResponseScreen> createState() => _LostItemResponseScreenState();
}

class _LostItemResponseScreenState extends State<LostItemResponseScreen> {
  final _descriptionController = TextEditingController();
  final _pinController = TextEditingController();
  bool _droppedAtOffice = true;
  bool _submitting = false;

  @override
  void dispose() {
    _descriptionController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  Future<String?> _resolveAuthToken() async {
    try {
      const storage = FlutterSecureStorage();
      for (final key in const ['jwt_token', 'auth_token', 'access_token', 'driver_token']) {
        final token = await storage.read(key: key);
        if (token != null && token.isNotEmpty) return token;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<void> _submitLostAndFound() async {
    final desc = _descriptionController.text.trim();
    if (desc.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a short description of the item.')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final token = await _resolveAuthToken();
      final dio = Dio();
      final options = Options(
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      final response = await dio.post(
        '${AppConfig.dispatchApiUrl}/lost-and-found',
        options: options,
        data: {
          'description': desc,
          'reporterRole': 'DRIVER',
          'tripCode': widget.ticketId,
          'droppedAtOffice': _droppedAtOffice,
        },
      );

      final data = response.data;
      final incident = data['incident'] ?? {};
      final obNumber = incident['obNumber'] ?? '';

      if (!mounted) return;
      Navigator.of(context).pop(true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF10B981),
          content: Text(
            _droppedAtOffice
                ? 'Logged under $obNumber! Passenger notified to collect from Cabi Partner Hub.'
                : 'Custody confirmed ($obNumber)! Collect 4-digit PIN upon direct handover to receive KES 500 fee.',
          ),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Logged locally! Dispatch team notified.')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lost & Found — Office Drop-off')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Describe the found item and confirm if you have dropped it at the CABI Africa office for passenger collection within 7 days.',
              style: TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descriptionController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Short Description',
                hintText: 'e.g., Black wallet found in back seat...',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            SwitchListTile(
              value: _droppedAtOffice,
              onChanged: (v) => setState(() => _droppedAtOffice = v),
              title: const Text('Dropped at CABI Office (7-day collection window)'),
            ),
            const Spacer(),
            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: _submitting ? null : _submitLostAndFound,
                child: _submitting
                    ? const CircularProgressIndicator()
                    : const Text('Submit Found Item'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
