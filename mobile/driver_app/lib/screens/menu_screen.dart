import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:driver_app/screens/login_screen.dart';
import 'package:driver_app/widgets/promotional_carousel.dart';
import '../providers/auth_provider.dart';
import 'support_screen.dart';
import 'finance_screen.dart';
import 'my_organization_screen.dart';
import '../theme/app_theme.dart';

class MenuScreen extends ConsumerWidget {
  const MenuScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    String userName = 'ALEXANDER MWANGI';
    String? userEmail = 'driver.alex@cabi.africa';
    String? userPhone = '+254 712 345 678';
    String? userId;
    String profilePic = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
    double rating = 4.9;
    String driverGroup = 'Nairobi Central Fleet';
    String badge = 'PRO DRIVER';

    if (authState is Authenticated && authState.user != null) {
      final user = authState.user!;
      userName = user['firstName'] != null
          ? "${user['firstName']} ${user['lastName'] ?? ''}"
          : user['name'] ?? 'ALEXANDER MWANGI';
      userEmail = user['email'] ?? userEmail;
      userPhone = user['phone'] ?? user['phoneNumber'] ?? userPhone;
      userId = user['id'];
      if (user['passportPhoto'] != null && user['passportPhoto'].toString().isNotEmpty) {
        profilePic = user['passportPhoto'];
      } else if (user['profilePicture'] != null && user['profilePicture'].toString().isNotEmpty) {
        profilePic = user['profilePicture'];
      }
      if (user['rating'] != null) {
        rating = (user['rating'] as num).toDouble();
      } else if (user['averageRating'] != null) {
        rating = (user['averageRating'] as num).toDouble();
      }
      if (user['driverGroup'] != null) {
        driverGroup = user['driverGroup'].toString();
      } else if (user['driverGroupName'] != null) {
        driverGroup = user['driverGroupName'].toString();
      } else if (user['organization'] != null) {
        driverGroup = user['organization'].toString();
      }
      if (user['tier'] != null) {
        badge = user['tier'].toString().toUpperCase();
      }
    }

    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Premium Menu Header with Passport Avatar, Name, Email, Phone, Rating, Group, Badge
            _buildPremiumHeader(
              context: context,
              name: userName,
              email: userEmail,
              phone: userPhone,
              id: userId,
              profilePic: profilePic,
              rating: rating,
              driverGroup: driverGroup,
              badge: badge,
            ),

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
                    icon: Icons.bar_chart_rounded,
                    label: 'PERFORMANCE',
                    color: AppTheme.primaryColor.withValues(alpha: 0.12),
                    iconColor: AppTheme.primaryDark,
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
                    icon: Icons.account_balance_rounded,
                    label: 'FINANCE',
                    color: Colors.orange.withValues(alpha: 0.12),
                    iconColor: Colors.orangeAccent,
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const FinanceScreen()))),
                _MenuGridItem(
                    icon: Icons.groups_rounded,
                    label: 'DRIVER GROUP',
                    color: Colors.amber.withValues(alpha: 0.12),
                    iconColor: Colors.amber,
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const MyOrganizationScreen()))),
                _MenuGridItem(
                    icon: Icons.shield_outlined,
                    label: 'WELFARE',
                    color: Colors.cyan.withValues(alpha: 0.1),
                    iconColor: Colors.cyan,
                    route: '/welfare_schemes'),
                _MenuGridItem(
                    icon: Icons.directions_car_filled_outlined,
                    label: 'VEHICLE',
                    color: Colors.blueGrey.withValues(alpha: 0.1),
                    iconColor: Colors.blueGrey,
                    route: '/vehicles'),
                _MenuGridItem(
                    icon: Icons.share_rounded,
                    label: 'NETWORK',
                    color: Colors.pink.withValues(alpha: 0.1),
                    iconColor: Colors.pinkAccent,
                    route: '/referral_program'),
                _MenuGridItem(
                    icon: Icons.settings_outlined,
                    label: 'SETTINGS',
                    color: Colors.grey.withValues(alpha: 0.1),
                    iconColor: Colors.grey,
                    route: '/settings'),
                _MenuGridItem(
                    icon: Icons.translate_rounded,
                    label: 'LANGUAGE',
                    color: Colors.deepPurple.withValues(alpha: 0.1),
                    iconColor: Colors.deepPurpleAccent,
                    route: '/language'),
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
              child: Column(
                children: [
                  const Text(
                    'CABI DRIVE PRODUCTION',
                    style: TextStyle(color: AppTheme.primaryColor, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'v1.1.0+6 (2026-RELEASE)',
                    style: TextStyle(color: theme.textTheme.bodyMedium?.color ?? AppTheme.darkTextSecondary, fontSize: 10, letterSpacing: 1),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPremiumHeader({
    required BuildContext context,
    required String name,
    String? email,
    String? phone,
    String? id,
    required String profilePic,
    required double rating,
    required String driverGroup,
    required String badge,
  }) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 56, 16, 24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF161513) : Colors.white,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
        border: Border(
          bottom: BorderSide(
            color: isDark ? AppTheme.primaryColor.withValues(alpha: 0.25) : Colors.black12,
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.08),
            blurRadius: 18,
            offset: const Offset(0, 8),
          )
        ],
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Real Passport Photo Avatar with Gold Ring Halo
              Container(
                padding: const EdgeInsets.all(2.5),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: AppTheme.goldGradient,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withValues(alpha: 0.35),
                      blurRadius: 10,
                      spreadRadius: 1,
                    ),
                  ],
                ),
                child: CircleAvatar(
                  radius: 34,
                  backgroundColor: isDark ? const Color(0xFF22201C) : Colors.grey.shade200,
                  backgroundImage: NetworkImage(profilePic),
                ),
              ),

              const SizedBox(width: 14),

              // Details Column: Name, Badge, Email, Phone, Rating, Driver Group
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Driver Name & Badge Pill
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            name.toUpperCase(),
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                              color: isDark ? Colors.white : Colors.black87,
                              letterSpacing: 0.3,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        // Verified / Tier Badge Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                          decoration: BoxDecoration(
                            gradient: AppTheme.goldGradient,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primaryColor.withValues(alpha: 0.3),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.verified_rounded, size: 11, color: Colors.black),
                              const SizedBox(width: 3),
                              Text(
                                badge,
                                style: const TextStyle(
                                  color: Colors.black,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 9,
                                  letterSpacing: 0.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 4),

                    // Email Address
                    Row(
                      children: [
                        Icon(
                          Icons.email_outlined,
                          size: 13,
                          color: isDark ? Colors.white60 : Colors.black54,
                        ),
                        const SizedBox(width: 5),
                        Expanded(
                          child: Text(
                            email ?? 'driver@cabi.africa',
                            style: GoogleFonts.outfit(
                              color: isDark ? Colors.white70 : Colors.black87,
                              fontSize: 11.5,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 3),

                    // Phone Number
                    Row(
                      children: [
                        Icon(
                          Icons.phone_outlined,
                          size: 13,
                          color: isDark ? Colors.white60 : Colors.black54,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          phone ?? '+254 700 000 000',
                          style: GoogleFonts.outfit(
                            color: isDark ? Colors.white70 : Colors.black87,
                            fontSize: 11.5,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 6),

                    // Star Rating & Driver Group Row
                    Row(
                      children: [
                        // Star Rating Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: Colors.amber.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.amber.withValues(alpha: 0.4),
                              width: 0.8,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star_rounded, size: 13, color: Colors.amber),
                              const SizedBox(width: 3),
                              Text(
                                '${rating.toStringAsFixed(1)} ★',
                                style: GoogleFonts.outfit(
                                  color: Colors.amber,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(width: 8),

                        // Driver Group Pill
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                            decoration: BoxDecoration(
                              color: Colors.cyan.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: Colors.cyan.withValues(alpha: 0.35),
                                width: 0.8,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.groups_rounded, size: 13, color: Colors.cyanAccent),
                                const SizedBox(width: 4),
                                Flexible(
                                  child: Text(
                                    driverGroup,
                                    style: GoogleFonts.outfit(
                                      color: isDark ? Colors.cyanAccent : Colors.cyan.shade800,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 10.5,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 6),

              // QR Code Button
              GestureDetector(
                onTap: () {
                  _showQrDialog(context, id ?? 'N/A');
                },
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.3)),
                  ),
                  child: const Icon(Icons.qr_code_rounded, color: AppTheme.primaryColor, size: 20),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showQrDialog(BuildContext context, String driverId) {
    final theme = Theme.of(context);
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: theme.cardTheme.color ?? theme.colorScheme.surface,
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
                style: TextStyle(color: theme.textTheme.bodyMedium?.color ?? AppTheme.darkTextSecondary, fontSize: 12, letterSpacing: 1),
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
                color: Theme.of(context).cardTheme.color ?? Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Theme.of(context).brightness == Brightness.dark ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.05)),
                boxShadow: [
                  BoxShadow(
                    color: Theme.of(context).brightness == Brightness.dark ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.05),
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
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).textTheme.bodyLarge?.color ?? Colors.white,
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

