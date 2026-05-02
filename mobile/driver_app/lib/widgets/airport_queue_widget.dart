import 'package:flutter/material.dart';

class AirportQueueWidget extends StatelessWidget {
  final String airportName;
  final int position;
  final int totalInQueue;
  final int estimatedWaitMinutes; // Optional estimate

  const AirportQueueWidget({
    super.key,
    required this.airportName,
    required this.position,
    required this.totalInQueue,
    this.estimatedWaitMinutes = 15,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue[50],
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.flight_takeoff, color: Colors.blue[800]),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    airportName,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const Text('Virtual Queue',
                      style: TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.green,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('ACTIVE',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildStat('POSITION', '#$position', Colors.blue[900]!),
              _buildStat('BEHIND YOU', '${totalInQueue - position}',
                  Colors.grey[600]!),
              _buildStat(
                  'EST. WAIT', '$estimatedWaitMinutes m', Colors.orange[800]!),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: 1 - (position / totalInQueue),
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color?>(Colors.blue[600]),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Stay within the waiting zone to keep your spot.',
            style: TextStyle(
                fontSize: 11, color: Colors.grey, fontStyle: FontStyle.italic),
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(value,
            style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }
}

