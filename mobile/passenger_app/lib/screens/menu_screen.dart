import 'package:flutter/material.dart';
import 'package:passenger_app/theme/app_theme.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'package:passenger_app/providers/auth_provider.dart';
import 'package:passenger_app/widgets/profile_avatar_with_qr.dart';
import 'package:passenger_app/widgets/menu_grid_item.dart';
import 'package:passenger_app/screens/login_screen.dart';
import 'package:passenger_app/screens/trip_history_screen.dart';
import 'package:passenger_app/screens/saved_places_screen.dart';
import 'package:passenger_app/screens/referral_status_screen.dart';
import 'package:passenger_app/screens/wallet_screen.dart';
import 'package:passenger_app/screens/settings_screen.dart';
import 'package:passenger_app/screens/language_selection_screen.dart';
import 'package:passenger_app/screens/help_center_screen.dart';
import 'package:passenger_app/services/settings_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:passenger_app/screens/profile_screen.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final SettingsService _settingsService = SettingsService();
  String _toursUrl = '';
  bool _isLoadingToursUrl = true;

  @override
  void initState() {
    super.initState();
    _loadToursUrl();
  }

  Future<void> _loadToursUrl() async {
    final url = await _settingsService.getToursUrl();
    if (mounted) {
      setState(() {
        _toursUrl = url;
        _isLoadingToursUrl = false;
      });
    }
  }

  Future<void> _launchToursUrl() async {
    if (_toursUrl.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Tours booking is not yet configured. Please check back later.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final uri = Uri.tryParse(_toursUrl);
    if (uri == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tours link is invalid. Please contact support.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not open tours website. Please try again.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF111111) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Menu',
          style: AppTheme.outfit(
            color: isDark ? Colors.white : const Color(0xFF0F172A),
            fontWeight: FontWeight.bold,
            fontSize: 20,
            letterSpacing: 0.5,
          ),
        ),
        centerTitle: true,
        backgroundColor: isDark ? const Color(0xFF111111) : const Color(0xFFF8FAFC),
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF222222) : Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color: isDark ? const Color(0xFF333333) : const Color(0xFFE2E8F0),
                width: 1,
              ),
            ),
            child: IconButton(
              icon: Icon(
                Icons.close_rounded,
                color: isDark ? Colors.white : Colors.black87,
                size: 20,
              ),
              onPressed: () => Navigator.pop(context),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 6),

            // ── 1. PRESTIGE PROFILE HEADER CARD ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: legacy_provider.Consumer<AuthProvider>(
                builder: (context, auth, child) {
                  final user = auth.user;
                  final fullName = user != null
                      ? "${user['firstName'] ?? ''} ${user['lastName'] ?? ''}".trim()
                      : 'Elite Member';
                  final email = user?['email'] ?? 'Welcome to Cabi Africa';
                  final phone = user?['phone'] ?? '+254 700 000 000';

                  return InkWell(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ProfileScreen()),
                    ),
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isDark
                              ? [const Color(0xFF231F14), const Color(0xFF161616)]
                              : [const Color(0xFFFFFBEB), Colors.white],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: AppTheme.primaryColor.withValues(alpha: isDark ? 0.45 : 0.65),
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryColor.withValues(alpha: 0.12),
                            blurRadius: 20,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              // User Avatar with Golden Ring & QR trigger
                              ProfileAvatarWithQr(
                                user: user,
                                radius: 32,
                                qrData: 'passenger:${user?['id'] ?? 'cabi-member'}',
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Elite Gold Badge
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 2.5),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primaryColor.withValues(alpha: 0.2),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(
                                          color: AppTheme.primaryColor.withValues(alpha: 0.6),
                                          width: 0.8,
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(
                                            Icons.stars_rounded,
                                            size: 13,
                                            color: Color(0xFFD97706),
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            'ELITE MEMBER',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: isDark
                                                  ? const Color(0xFFFFD700)
                                                  : const Color(0xFFB45309),
                                              letterSpacing: 0.8,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      fullName.isNotEmpty ? fullName : 'Cabi Passenger',
                                      style: AppTheme.outfit(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 19,
                                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      email.isNotEmpty ? email : phone,
                                      style: TextStyle(
                                        color: isDark ? Colors.white60 : Colors.black54,
                                        fontSize: 12.5,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                              // Arrow Forward Indicator
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor.withValues(alpha: 0.15),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.arrow_forward_ios_rounded,
                                  size: 14,
                                  color: Color(0xFFD97706),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          // Mini stats bar
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? Colors.black.withValues(alpha: 0.3)
                                  : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isDark ? Colors.white10 : const Color(0xFFE2E8F0),
                                width: 0.8,
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                _buildMiniStat('RATING', '4.9 ★', const Color(0xFFF59E0B)),
                                Container(
                                    width: 1,
                                    height: 20,
                                    color: isDark ? Colors.white12 : const Color(0xFFCBD5E1)),
                                _buildMiniStat('STATUS', 'Verified ✓', const Color(0xFF10B981)),
                                Container(
                                    width: 1,
                                    height: 20,
                                    color: isDark ? Colors.white12 : const Color(0xFFCBD5E1)),
                                _buildMiniStat('PRESTIGE', 'Gold Tier', AppTheme.primaryColor),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 24),

            // ── 2. SECTION: JOURNEYS & ACTIVITY ──
            _buildSectionHeader('Journeys & Destinations'),
            _buildGridSection(
              context,
              [
                MenuGridItem(
                  icon: Icons.route_rounded,
                  title: 'My Trips',
                  subtitle: 'Past rides & receipts',
                  badge: 'TRIPS',
                  baseColor: const Color(0xFFF59E0B), // Amber Gold
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const TripHistoryScreen()),
                  ),
                ),
                MenuGridItem(
                  icon: Icons.bookmark_rounded,
                  title: 'Saved Places',
                  subtitle: 'Home, Work & Favs',
                  badge: 'QUICK',
                  baseColor: const Color(0xFFE11D48), // Rose Coral
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SavedPlacesScreen()),
                  ),
                ),
                MenuGridItem(
                  icon: Icons.explore_rounded,
                  title: 'Tours & Safari',
                  subtitle: 'Curated experiences',
                  badge: 'AFRICA',
                  baseColor: const Color(0xFFD97706), // Safari Bronze
                  onTap: _isLoadingToursUrl ? () {} : _launchToursUrl,
                ),
                MenuGridItem(
                  icon: Icons.celebration_rounded,
                  title: 'Refer & Earn',
                  subtitle: 'Invite & get KES 500',
                  badge: 'EARN',
                  baseColor: const Color(0xFF10B981), // Emerald Green
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ReferralStatusScreen()),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // ── 3. SECTION: FINANCIALS & SERVICES ──
            _buildSectionHeader('Financials & Settings'),
            _buildGridSection(
              context,
              [
                MenuGridItem(
                  icon: Icons.account_balance_wallet_rounded,
                  title: 'Cabi Wallet',
                  subtitle: 'KES 0.00 • Top up',
                  badge: 'PAY',
                  baseColor: const Color(0xFF0284C7), // Sapphire Sky
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const WalletScreen()),
                  ),
                ),
                MenuGridItem(
                  icon: Icons.language_rounded,
                  title: 'Language',
                  subtitle: 'Select app language',
                  badge: 'MULTI',
                  baseColor: const Color(0xFF6366F1), // Indigo
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const LanguageSelectionScreen()),
                  ),
                ),
                MenuGridItem(
                  icon: Icons.tune_rounded,
                  title: 'Preferences',
                  subtitle: 'App & ride settings',
                  baseColor: const Color(0xFF64748B), // Slate Silver
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SettingsScreen()),
                  ),
                ),
                MenuGridItem(
                  icon: Icons.support_agent_rounded,
                  title: 'Concierge',
                  subtitle: 'Help center & chat',
                  badge: '24/7',
                  baseColor: const Color(0xFF0D9488), // Teal Green
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const HelpCenterScreen()),
                  ),
                ),
                MenuGridItem(
                  icon: Icons.auto_awesome_rounded,
                  title: 'About Cabi',
                  subtitle: 'v1.1.0+6 • Official',
                  baseColor: const Color(0xFFCA8A04), // Warm Gold
                  onTap: () {
                    showAboutDialog(
                      context: context,
                      applicationName: 'Cabi Africa',
                      applicationVersion: 'v1.1.0+6',
                      applicationLegalese: '© 2026 Cabi Africa Mobility',
                      children: [
                        const SizedBox(height: 16),
                        const Text(
                          'Cabi Africa delivers premium, safe, and reliable ride-hailing and concierge mobility across Africa.',
                        ),
                      ],
                    );
                  },
                ),
              ],
            ),

            const SizedBox(height: 20),

            // ── 4. SECTION: ACCOUNT ACTIONS ──
            _buildSectionHeader('Account Actions'),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: MenuGridItem(
                icon: Icons.power_settings_new_rounded,
                title: 'Log Out',
                subtitle: 'Safely sign out of your Cabi session',
                badge: 'EXIT',
                baseColor: const Color(0xFFEF4444), // Crimson
                onTap: () {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                    (Route<dynamic> route) => false,
                  );
                },
              ),
            ),

            const SizedBox(height: 36),

            // ── 5. LUXURY FOOTER ──
            Center(
              child: Column(
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: AppTheme.primaryColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'CABI AFRICA LUXURY MOBILITY',
                        style: TextStyle(
                          color: isDark ? Colors.white38 : Colors.black38,
                          fontSize: 10,
                          letterSpacing: 1.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: AppTheme.primaryColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'PROD BUILD • v1.1.0+6',
                    style: TextStyle(
                      color: isDark ? Colors.white24 : Colors.black26,
                      fontSize: 9.5,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniStat(String label, String value, Color valueColor) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 9.5,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: valueColor,
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Container(
            width: 3.5,
            height: 15,
            decoration: BoxDecoration(
              color: AppTheme.primaryColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            title,
            style: AppTheme.outfit(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGridSection(BuildContext context, List<Widget> items) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = 2;
        if (constraints.maxWidth > 900) {
          crossAxisCount = 4;
        } else if (constraints.maxWidth > 600) {
          crossAxisCount = 3;
        }

        double childAspectRatio = 1.35;
        if (constraints.maxWidth <= 400) {
          childAspectRatio = 1.25;
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: crossAxisCount,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: childAspectRatio,
            children: items,
          ),
        );
      },
    );
  }
}
