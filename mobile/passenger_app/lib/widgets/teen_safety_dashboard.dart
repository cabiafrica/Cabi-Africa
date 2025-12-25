import 'package:flutter/material.dart';

class TeenSafetyDashboard extends StatelessWidget {
  final String guardianName;
  final bool isTripActive;

  const TeenSafetyDashboard({
    Key? key,
    required this.guardianName,
    required this.isTripActive,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.security,
                    color: Colors.blue.shade700,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Teen Safety Mode',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                    Text(
                      'Active & Monitoring',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.green,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          
          // Features List
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildSafetyFeature(
                  icon: Icons.verified_user,
                  title: 'Top-Rated Drivers Only',
                  description: 'You are only matched with highly experienced drivers with excellent ratings.',
                  isActive: true,
                ),
                const SizedBox(height: 16),
                _buildSafetyFeature(
                  icon: Icons.share_location,
                  title: 'Automatic Trip Sharing',
                  description: 'Your location is automatically shared with $guardianName during every trip.',
                  isActive: isTripActive,
                  isPending: !isTripActive,
                ),
                const SizedBox(height: 16),
                _buildSafetyFeature(
                  icon: Icons.record_voice_over,
                  title: 'Ride Recording',
                  description: 'Audio recording is available for your safety.',
                  isActive: true,
                ),
              ],
            ),
          ),

          // Emergency Button Area
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: Row(
              children: [
                Icon(Icons.emergency, color: Colors.red.shade700),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'In case of emergency, contact 911 or $guardianName immediately.',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.red.shade900,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSafetyFeature({
    required IconData icon,
    required String title,
    required String description,
    required bool isActive,
    bool isPending = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: isActive ? Colors.black87 : Colors.grey,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  if (isActive && !isPending)
                    const Icon(Icons.check_circle, size: 16, color: Colors.green)
                  else if (isPending)
                     Container(
                       padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                       decoration: BoxDecoration(
                         color: Colors.grey.shade200,
                         borderRadius: BorderRadius.circular(4),
                       ),
                       child: const Text('Ready', style: TextStyle(fontSize: 10, color: Colors.grey)),
                     ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
