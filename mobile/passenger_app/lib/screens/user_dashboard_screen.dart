import 'package:flutter/material.dart';
import 'package:passenger_app/theme/app_theme.dart';
import 'package:passenger_app/screens/referral_status_screen.dart';
import 'package:provider/provider.dart';
import 'package:passenger_app/providers/auth_provider.dart';
import 'package:passenger_app/widgets/badge_showcase_widget.dart';
import 'package:passenger_app/widgets/profile_avatar_with_qr.dart';
import '../services/badge_service.dart' as badge_service;

class UserDashboardScreen extends StatelessWidget {
  const UserDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final badgeServiceInstance = badge_service.BadgeService();

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('Dashboard'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Profile Header
            Consumer<AuthProvider>(
              builder: (context, auth, _) {
                final user = auth.user;
                final fullName = user != null ? "${user['firstName'] ?? ''} ${user['lastName'] ?? ''}".trim() : 'Elite Member';
                
                return Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.darkSurface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.1), width: 1),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(2.5),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: AppTheme.primaryColor, width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primaryColor.withValues(alpha: 0.35),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: CircleAvatar(
                          radius: 30,
                          backgroundColor: const Color(0xFF1E1E1E),
                          backgroundImage: getPassengerAvatarProvider(user),
                        ),
                      ),
                      const SizedBox(width: 20),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            fullName.isNotEmpty ? fullName : 'Elite Member',
                            style: const TextStyle(
                                fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          Text(
                            user?['membershipTier'] ?? 'Standard Member',
                            style: const TextStyle(
                                color: AppTheme.primaryColor,
                                fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 20),

            // Stats Grid
            Consumer<AuthProvider>(
              builder: (context, auth, _) {
                final user = auth.user;
                return Row(
                  children: [
                    _buildStatCard('Rides', user?['totalRides']?.toString() ?? '0'),
                    const SizedBox(width: 15),
                    _buildStatCard('Spent', 'KES ${user?['totalSpent']?.toString() ?? '0'}'),
                  ],
                );
              },
            ),
            const SizedBox(height: 20),

            // Badges & Achievements
            Consumer<AuthProvider>(
              builder: (context, auth, _) {
                if (auth.userId == null) return const SizedBox.shrink();

                return FutureBuilder<List<badge_service.Badge>>(
                  future: badgeServiceInstance.getUserBadges(auth.userId!),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    if (snapshot.hasError ||
                        !snapshot.hasData ||
                        snapshot.data!.isEmpty) {
                      return const SizedBox.shrink();
                    }

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Achievements',
                                style: TextStyle(
                                    fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                            TextButton(
                              onPressed: () {
                                // Navigate to full badge screen if implemented
                              },
                              child: const Text('View All', style: TextStyle(color: AppTheme.primaryColor)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        BadgeShowcaseWidget(
                            badges: snapshot.data!, compact: true),
                        const SizedBox(height: 20),
                      ],
                    );
                  },
                );
              },
            ),

            // Quick Actions
            Container(
              decoration: BoxDecoration(
                color: AppTheme.darkSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.1), width: 1),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 10)
                ],
              ),
              child: Column(
                children: [
                  _buildMenuOption(
                    context,
                    icon: Icons.people_outline,
                    title: 'Referral Tree',
                    onTap: () {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const ReferralStatusScreen()));
                    },
                  ),
                  const Divider(height: 1, color: Colors.white10),
                  _buildMenuOption(
                    context,
                    icon: Icons.star_outline,
                    title: 'My Ratings',
                    onTap: () {},
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Recent Activity Placeholder
            const Text('Recent Activity',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 10),
            Container(
              height: 200,
              decoration: BoxDecoration(
                color: AppTheme.darkSurface,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Center(child: Text('No recent activity', style: TextStyle(color: Colors.white38))),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.darkSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.1), width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 10,
            ),
          ],
        ),
        child: Column(
          children: [
            Text(value,
                style:
                    const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            Text(label, style: const TextStyle(color: Colors.white54)),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuOption(BuildContext context,
      {required IconData icon,
      required String title,
      required VoidCallback onTap}) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppTheme.primaryColor.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: AppTheme.primaryColor),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
      trailing:
          const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
      onTap: onTap,
    );
  }
}

