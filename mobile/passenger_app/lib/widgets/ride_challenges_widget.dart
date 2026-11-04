import '../theme/app_theme.dart';
import 'package:flutter/material.dart';

class RideChallengesWidget extends StatelessWidget {
  const RideChallengesWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;

    final challenges = [
      {
        'id': '1',
        'title': 'Weekend Warrior',
        'description': 'Take 3 rides this weekend',
        'progress': 2,
        'target': 3,
        'reward': '25% off next ride',
        'expiresIn': 'Expires in 2 days',
        'color': isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze,
      },
      {
        'id': '2',
        'title': 'Early Bird',
        'description': 'Take a ride before 8 AM',
        'progress': 0,
        'target': 1,
        'reward': 'KES 100 credit',
        'expiresIn': 'Expires tomorrow',
        'color': const Color(0xFFF59E0B),
      },
      {
        'id': '3',
        'title': 'Loyalty Streak',
        'description': 'Take 10 rides this month',
        'progress': 6,
        'target': 10,
        'reward': 'Free ride (up to KES 500)',
        'expiresIn': 'Expires in 12 days',
        'color': isDark ? const Color(0xFF0284C7) : AppTheme.royalBlue,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Active Challenges',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: textPrimary,
                ),
              ),
              TextButton(
                onPressed: () {
                  // Navigate to all challenges
                },
                style: TextButton.styleFrom(foregroundColor: accent),
                child: const Text('View All'),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 200,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: challenges.length,
            itemBuilder: (context, index) {
              final challenge = challenges[index];
              final progress =
                  (challenge['progress'] as int) / (challenge['target'] as int);

              return Container(
                width: 280,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                child: Card(
                  elevation: 3,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: LinearGradient(
                        colors: [
                          (challenge['color'] as Color).withValues(alpha: 0.8),
                          (challenge['color'] as Color),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                challenge['title'] as String,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.3),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(
                                Icons.emoji_events,
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          challenge['description'] as String,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.card_giftcard,
                                  color: Colors.white, size: 16),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  challenge['reward'] as String,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${challenge['progress']}/${challenge['target']} rides',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  challenge['expiresIn'] as String,
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 10,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: progress,
                                backgroundColor:
                                    Colors.white.withValues(alpha: 0.3),
                                valueColor: const AlwaysStoppedAnimation<Color>(
                                    Colors.white),
                                minHeight: 6,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

