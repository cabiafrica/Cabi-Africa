import 'package:flutter/material.dart';

class DriverAnalyticsCards extends StatelessWidget {
  const DriverAnalyticsCards({super.key});

  void _openUserPortal(BuildContext context) {
    // Logic to open user portal url
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Redirecting to User Portal for detailed analytics...'),
        backgroundColor: Colors.black,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title Row
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Score Matrix',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () => _openUserPortal(context),
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFFF59E0B),
                ),
                child: const Row(
                  children: [
                    Text('Portal'),
                    SizedBox(width: 4),
                    Icon(Icons.open_in_new, size: 16),
                  ],
                ),
              ),
            ],
          ),
        ),

        // 1. Points & Tier Header
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [
                Color(0xFFB91C1C), // Deep Red
                Color(0xFFEF4444), // Red
                Color(0xFFF59E0B), // Amber/Gold
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 10,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'GOLD TIER',
                      style: TextStyle(
                        color: Color(0xFFFBBF24), // Cabi Yellow
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        letterSpacing: 1.2,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      '2,450 Points',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Badges Mini View
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.1),
                  ),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.emoji_events,
                        color: Color(0xFFFBBF24), size: 24),
                    SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '12',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          'Badges',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              )
            ],
          ),
        ),

        const SizedBox(height: 12),

        // 2. Stats Grid (Ratings, Acceptance, Complaints)
        Row(
          children: [
            Expanded(
                child: _buildMatrixCard(
                    Icons.star, Colors.amber, '4.95', 'Rating')),
            const SizedBox(width: 12),
            Expanded(
                child: _buildMatrixCard(
                    Icons.check_circle, Colors.green, '94%', 'Acceptance')),
            const SizedBox(width: 12),
            Expanded(
                child: _buildMatrixCard(
                    Icons.thumb_down, Colors.red, '0', 'Complaints')),
          ],
        ),

        const SizedBox(height: 12),

        // 3. Earnings & Analytics Bars
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text('Earnings Activity',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                  Text(
                    'Last 7 Days',
                    style: TextStyle(fontSize: 11, color: Colors.grey),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  _buildBar('Mon', 40),
                  _buildBar('Tue', 65),
                  _buildBar('Wed', 85, isActive: true),
                  _buildBar('Thu', 30),
                  _buildBar('Fri', 20),
                  _buildBar('Sat', 50),
                  _buildBar('Sun', 10),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 8),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Total Earnings',
                          style: TextStyle(fontSize: 12, color: Colors.grey)),
                      Text('KES 14,500',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('Growth',
                          style: TextStyle(fontSize: 12, color: Colors.grey)),
                      Text('+12% 📈',
                          style: TextStyle(
                              color: Colors.green,
                              fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              )
            ],
          ),
        ),

        const SizedBox(height: 12),

        // 4. Missed Opportunities
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF5F5),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.red.shade100),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.warning_amber_rounded,
                    color: Colors.red[700], size: 24),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Missed Opportunities',
                      style: TextStyle(
                          color: Colors.red, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'You missed 2 requests (KES 1,450)',
                      style: TextStyle(color: Colors.black87, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // 5. More Button
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () => _openUserPortal(context),
            style: OutlinedButton.styleFrom(
              // Cabi Black border
              side: const BorderSide(color: Colors.black, width: 1.5),
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text(
              'View Full Score Matrix in Portal',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMatrixCard(
      IconData icon, Color color, String value, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 4,
            )
          ]),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(value,
              style:
                  const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 2),
          Text(label,
              style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
        ],
      ),
    );
  }

  Widget _buildBar(String label, double percentage, {bool isActive = false}) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.bottomCenter,
          children: [
            Container(
              height: 100,
              width: 8,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            Container(
              height: 100 * (percentage / 100),
              width: 8,
              decoration: BoxDecoration(
                // Use Gradient for Cabi feel? Or just black/yellow.
                // Let's use yellow for active, black for others to mix it up or just black.
                color: isActive ? const Color(0xFFFBBF24) : Colors.black,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          label[0],
          style: TextStyle(
            fontSize: 10,
            color: Colors.grey.shade600,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}

