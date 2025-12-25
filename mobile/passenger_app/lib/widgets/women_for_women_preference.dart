import 'package:flutter/material.dart';

class WomenForWomenPreference extends StatefulWidget {
  final bool isEnabled;
  final Function(bool) onChanged;
  final bool isDriver;

  const WomenForWomenPreference({
    super.key,
    required this.isEnabled,
    required this.onChanged,
    this.isDriver = false,
  });

  @override
  State<WomenForWomenPreference> createState() =>
      _WomenForWomenPreferenceState();
}

class _WomenForWomenPreferenceState extends State<WomenForWomenPreference> {
  void _showInfoDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.shield, color: Colors.purple.shade700),
            const SizedBox(width: 8),
            const Text('Women for Women'),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'This feature helps create a safer, more comfortable experience for women.',
                style: TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 16),
              const Text(
                'How it works:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 8),
              _buildInfoItem(
                widget.isDriver
                    ? 'You\'ll only receive ride requests from female passengers'
                    : 'You\'ll only be matched with female drivers',
              ),
              _buildInfoItem(
                'This preference can be toggled on or off anytime',
              ),
              _buildInfoItem(
                widget.isDriver
                    ? 'May reduce available ride requests'
                    : 'May increase wait times during low availability',
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.purple.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.privacy_tip,
                        color: Colors.purple.shade700, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Your gender information is kept private and secure',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.purple.shade900,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('GOT IT'),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.check_circle, size: 18, color: Colors.purple.shade700),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: const TextStyle(fontSize: 13)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: [
          SwitchListTile(
            value: widget.isEnabled,
            onChanged: widget.onChanged,
            secondary: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: widget.isEnabled
                    ? Colors.purple.shade100
                    : Colors.grey.shade200,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.shield,
                color: widget.isEnabled
                    ? Colors.purple.shade700
                    : Colors.grey.shade600,
              ),
            ),
            title: const Text(
              'Women for Women',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              widget.isDriver
                  ? 'Only receive requests from female passengers'
                  : 'Only match with female drivers',
              style: const TextStyle(fontSize: 12),
            ),
            activeTrackColor: Colors.purple,
          ),
          if (widget.isEnabled) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(Icons.info_outline,
                      color: Colors.blue.shade700, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      widget.isDriver
                          ? 'This may reduce your available ride requests'
                          : 'This may increase your wait time',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.blue.shade900,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: _showInfoDialog,
                    child: const Text('Learn More',
                        style: TextStyle(fontSize: 12)),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class WomenForWomenBadge extends StatelessWidget {
  const WomenForWomenBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.purple.shade400, Colors.purple.shade600],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.shield, color: Colors.white, size: 16),
          const SizedBox(width: 6),
          const Text(
            'Women for Women',
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
