import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/screens/login_screen.dart';
import 'package:driver_app/widgets/promotional_carousel.dart';
import '../providers/auth_provider.dart';
import 'support_screen.dart';
import 'sacco_screen.dart';
import '../theme/app_theme.dart';

class MenuScreen extends ConsumerWidget {
  const MenuScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    String userName = 'DRIVER';
    String? userEmail;
    String? userId;
    String profilePic = 'https://i.pravatar.cc/150?u=driver';

    if (authState is Authenticated) {
      final user = authState.user!;
      userName = user['firstName'] != null
          ? "${user['firstName']} ${user['lastName'] ?? ''}"
          : user['name'] ?? 'DRIVER';
      userEmail = user['email'];
      userId = user['id'];
      if (user['profilePicture'] != null) profilePic = user['profilePicture'];
    }

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Premium Menu Header
            _buildPremiumHeader(context, userName, userEmail, userId, profilePic),

            const SizedBox(height: 24),

            // Promotional Banner with Carousel
            const PromotionalCarousel(),

            const SizedBox(height: 32),

            // Section: Statements
            _buildSectionHeader('PROFESSIONAL STATEMENTS'),
            _buildGridSection(
              context,
              [
                _MenuGridItem(
                    icon: Icons.radar_outlined,
                    label: 'ACTIVE TRIP',
                    color: Colors.green.withValues(alpha: 0.1),
                    iconColor: Colors.green,
                    route: '/trip_in_progress'),
                _MenuGridItem(
                    icon: Icons.history,
                    label: 'TRIP HISTORY',
                    color: Colors.orange.withValues(alpha: 0.1),
                    iconColor: Colors.orange,
                    route: '/home'),
                _MenuGridItem(
                    icon: Icons.receipt_long,
                    label: 'FARE INFO',
                    color: Colors.blue.withValues(alpha: 0.1),
                    iconColor: Colors.blue,
                    route: null),
                _MenuGridItem(
                    icon: Icons.bar_chart,
                    label: 'PERFORMANCE',
                    color: Colors.purple.withValues(alpha: 0.1),
                    iconColor: Colors.purple,
                    route: '/dashboard'),
                _MenuGridItem(
                    icon: Icons.monetization_on_outlined,
                    label: 'EARNINGS',
                    color: AppTheme.primaryColor.withValues(alpha: 0.1),
                    iconColor: AppTheme.primaryColor,
                    route: '/earnings'),
                _MenuGridItem(
                    icon: Icons.military_tech,
                    label: 'RANKING',
                    color: Colors.teal.withValues(alpha: 0.1),
                    iconColor: Colors.teal,
                    route: '/leaderboard'),
              ],
            ),

            const SizedBox(height: 32),

            // Section: Financial Services & Tools
            _buildSectionHeader('SERVICES & TOOLS'),
            _buildGridSection(
              context,
              [
                _MenuGridItem(
                    icon: Icons.account_balance_wallet_outlined,
                    label: 'WALLET',
                    color: Colors.indigo.withValues(alpha: 0.1),
                    iconColor: Colors.indigoAccent,
                    route: '/wallet'),
                _MenuGridItem(
                    icon: Icons.groups_outlined,
                    label: 'NETWORK',
                    color: Colors.pink.withValues(alpha: 0.1),
                    iconColor: Colors.pinkAccent,
                    route: '/referral_program'),
                _MenuGridItem(
                    icon: Icons.directions_car_filled_outlined,
                    label: 'VEHICLE',
                    color: Colors.blueGrey.withValues(alpha: 0.1),
                    iconColor: Colors.blueGrey,
                    route: '/vehicles'),
                _MenuGridItem(
                    icon: Icons.shield_outlined,
                    label: 'WELFARE',
                    color: Colors.cyan.withValues(alpha: 0.1),
                    iconColor: Colors.cyan,
                    route: '/welfare_schemes'),
                _MenuGridItem(
                    icon: Icons.account_balance_rounded,
                    label: 'MY SACCO',
                    color: Colors.orange.withValues(alpha: 0.1),
                    iconColor: Colors.orangeAccent,
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const SaccoScreen()))),
                _MenuGridItem(
                    icon: Icons.settings_outlined,
                    label: 'SETTINGS',
                    color: Colors.grey.withValues(alpha: 0.1),
                    iconColor: Colors.grey,
                    route: '/settings'),
                _MenuGridItem(
                    icon: Icons.headset_mic_outlined,
                    label: 'SUPPORT',
                    color: Colors.red.withValues(alpha: 0.1),
                    iconColor: Colors.redAccent,
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const DriverSupportScreen()))),
              ],
            ),

            const SizedBox(height: 48),

            // Logout Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    ref.read(authProvider.notifier).logout();
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(
                          builder: (context) => const LoginScreen()),
                      (Route<dynamic> route) => false,
                    );
                  },
                  icon: const Icon(Icons.logout_rounded, size: 18),
                  label: const Text('SIGN OUT', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.redAccent,
                    side: const BorderSide(color: Colors.redAccent, width: 0.5),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 40),

            // Footer Version
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(40),
              child: const Column(
                children: [
                  Text(
                    'CABI DRIVE PRODUCTION',
                    style: TextStyle(color: AppTheme.primaryColor, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'v1.1.0+6 (2026-RELEASE)',
                    style: TextStyle(color: AppTheme.darkTextSecondary, fontSize: 10, letterSpacing: 1),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPremiumHeader(BuildContext context, String name, String? email, String? id, String profilePic) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 60, 20, 30),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.primaryColor, width: 1.5),
            ),
            child: CircleAvatar(
              radius: 32,
              backgroundColor: AppTheme.darkBackground,
              backgroundImage: NetworkImage(profilePic),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name.toUpperCase(),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  email ?? 'N/A',
                  style: const TextStyle(
                    color: AppTheme.darkTextSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          // QR Code Button
          GestureDetector(
            onTap: () {
              // Same QR dialog as ProfileScreen
              _showQrDialog(context, id ?? 'N/A');
            },
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.3)),
              ),
              child: const Icon(Icons.qr_code_rounded, color: AppTheme.primaryColor, size: 24),
            ),
          ),
        ],
      ),
    );
  }

  void _showQrDialog(BuildContext context, String driverId) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: AppTheme.darkSurface,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(24)), side: BorderSide(color: AppTheme.primaryColor, width: 0.5)),
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'MY CABI ID',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: AppTheme.primaryColor,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.qr_code_2_rounded, size: 200, color: Colors.black),
              ),
              const SizedBox(height: 24),
              Text(
                'ID: $driverId',
                style: const TextStyle(color: AppTheme.darkTextSecondary, fontSize: 12, letterSpacing: 1),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.black,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('DISMISS', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: AppTheme.primaryColor,
            letterSpacing: 1.5,
          ),
        ),
      ),
    );
  }

  Widget _buildGridSection(BuildContext context, List<_MenuGridItem> items) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 0.85,
        ),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return GestureDetector(
            onTap: item.onTap ??
                () {
                  if (item.route != null) {
                    Navigator.pushNamed(context, item.route!);
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Feature coming soon')),
                    );
                  }
                },
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.darkSurface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: item.color,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(item.icon, color: item.iconColor, size: 24),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    item.label,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _MenuGridItem {
  final IconData icon;
  final String label;
  final Color color;
  final Color iconColor;
  final String? route;
  final VoidCallback? onTap;

  _MenuGridItem({
    required this.icon,
    required this.label,
    required this.color,
    required this.iconColor,
    this.route,
    this.onTap,
  });
}

