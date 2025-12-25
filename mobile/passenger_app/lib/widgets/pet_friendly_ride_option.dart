import 'package:flutter/material.dart';

class PetFriendlyRideOption extends StatelessWidget {
  final bool isSelected;
  final VoidCallback onToggle;

  const PetFriendlyRideOption({
    super.key,
    required this.isSelected,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onToggle,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? Colors.green.shade50 : Colors.white,
          border: Border.all(
            color: isSelected ? Colors.green : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected ? Colors.green : Colors.grey.shade200,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.pets,
                color: isSelected ? Colors.white : Colors.grey.shade700,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text(
                        'Pet-Friendly Ride',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade100,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '+KES 50',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.orange.shade700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Travel with your furry friend',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            Switch(
              value: isSelected,
              onChanged: (_) => onToggle(),
              activeTrackColor: Colors.green,
            ),
          ],
        ),
      ),
    );
  }
}

class PetFriendlyInfoDialog extends StatelessWidget {
  const PetFriendlyInfoDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Row(
        children: [
          Icon(Icons.pets, color: Colors.green.shade700),
          const SizedBox(width: 8),
          const Text('Pet-Friendly Rides'),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'What you need to know:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 12),
            _buildInfoItem(
              Icons.check_circle,
              'Only drivers who accept pets will be matched',
              Colors.green,
            ),
            _buildInfoItem(
              Icons.info_outline,
              'Small surcharge applies (KES 50)',
              Colors.blue,
            ),
            _buildInfoItem(
              Icons.cleaning_services,
              'Please ensure your pet is clean and well-behaved',
              Colors.orange,
            ),
            _buildInfoItem(
              Icons.warning_amber,
              'Pets must be in a carrier or on a leash',
              Colors.red,
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.favorite, color: Colors.green.shade700, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Thank you for being a responsible pet owner!',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.green.shade900,
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
          onPressed: () => Navigator.pop(context),
          child: const Text('GOT IT'),
        ),
      ],
    );
  }

  Widget _buildInfoItem(IconData icon, String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}

class DriverPetFriendlySettings extends StatefulWidget {
  const DriverPetFriendlySettings({super.key});

  @override
  State<DriverPetFriendlySettings> createState() =>
      _DriverPetFriendlySettingsState();
}

class _DriverPetFriendlySettingsState extends State<DriverPetFriendlySettings> {
  bool _acceptsPets = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Column(
        children: [
          SwitchListTile(
            value: _acceptsPets,
            onChanged: (value) {
              setState(() => _acceptsPets = value);
            },
            secondary: Icon(
              Icons.pets,
              color: _acceptsPets ? Colors.green : Colors.grey,
            ),
            title: const Text(
              'Accept Pet-Friendly Rides',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              _acceptsPets
                  ? 'You\'ll receive requests from passengers with pets'
                  : 'Enable to earn extra with pet-friendly rides',
              style: const TextStyle(fontSize: 12),
            ),
          ),
          if (_acceptsPets) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.attach_money,
                          color: Colors.green.shade700, size: 20),
                      const SizedBox(width: 8),
                      const Text(
                        'Earn KES 50 extra per pet ride',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline,
                            color: Colors.blue.shade700, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'You can decline any ride if you\'re uncomfortable',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.blue.shade900,
                            ),
                          ),
                        ),
                      ],
                    ),
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
