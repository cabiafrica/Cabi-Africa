import 'package:flutter/material.dart';
import '../services/badge_service.dart' as badge_service;

class BadgeShowcaseWidget extends StatelessWidget {
  final List<badge_service.Badge> badges;
  final bool compact;

  const BadgeShowcaseWidget({
    super.key,
    required this.badges,
    this.compact = false,
  });

  Color _getTierColor(String tier) {
    switch (tier) {
      case 'DIAMOND':
        return const Color(0xFFB9F2FF);
      case 'PLATINUM':
        return const Color(0xFFE5E4E2);
      case 'GOLD':
        return const Color(0xFFFFD700);
      case 'SILVER':
        return const Color(0xFFC0C0C0);
      case 'BRONZE':
      default:
        return const Color(0xFFCD7F32);
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'ACHIEVEMENT':
        return Icons.emoji_events;
      case 'QUALITY':
        return Icons.star;
      case 'LOYALTY':
        return Icons.favorite;
      case 'SAFETY':
        return Icons.security;
      case 'SOCIAL':
        return Icons.people;
      case 'SPECIAL':
      default:
        return Icons.card_giftcard;
    }
  }

  @override
  Widget build(BuildContext context) {
    final earnedBadges = badges.where((b) => b.isEarned).toList();
    final inProgressBadges =
        badges.where((b) => !b.isEarned && (b.progress ?? 0) > 0).toList();

    if (compact) {
      return _buildCompactView(earnedBadges);
    }

    return _buildFullView(earnedBadges, inProgressBadges);
  }

  Widget _buildCompactView(List<badge_service.Badge> earnedBadges) {
    if (earnedBadges.isEmpty) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      height: 60,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: earnedBadges.length,
        itemBuilder: (context, index) {
          final badge = earnedBadges[index];
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: _buildBadgeIcon(badge, size: 50),
          );
        },
      ),
    );
  }

  Widget _buildFullView(List<badge_service.Badge> earnedBadges,
      List<badge_service.Badge> inProgressBadges) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (earnedBadges.isNotEmpty) ...[
          const Text(
            'Earned Badges',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children:
                earnedBadges.map((badge) => _buildBadgeCard(badge)).toList(),
          ),
        ],
        if (inProgressBadges.isNotEmpty) ...[
          const SizedBox(height: 24),
          const Text(
            'In Progress',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ...inProgressBadges.map((badge) => _buildProgressBadge(badge)),
        ],
      ],
    );
  }

  Widget _buildBadgeIcon(badge_service.Badge badge, {double size = 60}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            _getTierColor(badge.tier).withValues(alpha: 0.3),
            _getTierColor(badge.tier),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: _getTierColor(badge.tier).withValues(alpha: 0.5),
            blurRadius: 8,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Icon(
        _getCategoryIcon(badge.category),
        color: Colors.white,
        size: size * 0.5,
      ),
    );
  }

  Widget _buildBadgeCard(badge_service.Badge badge) {
    return Container(
      width: 100,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _getTierColor(badge.tier),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildBadgeIcon(badge, size: 50),
          const SizedBox(height: 8),
          Text(
            badge.name,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            badge.tier,
            style: TextStyle(
              fontSize: 10,
              color: _getTierColor(badge.tier),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressBadge(badge_service.Badge badge) {
    final progress = (badge.progress ?? 0) / 100;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        children: [
          _buildBadgeIcon(badge, size: 40),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  badge.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  badge.description,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                LinearProgressIndicator(
                  value: progress,
                  backgroundColor: Colors.grey.shade200,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    _getTierColor(badge.tier),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${badge.progress}% Complete',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
