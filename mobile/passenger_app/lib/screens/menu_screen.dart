import 'package:flutter/material.dart';
import 'package:passenger_app/theme/app_theme.dart';
import 'package:passenger_app/widgets/profile_avatar_with_qr.dart';
import 'package:passenger_app/widgets/menu_grid_item.dart';
import 'package:passenger_app/screens/login_screen.dart';
import 'package:passenger_app/services/settings_service.dart';
import 'package:url_launcher/url_launcher.dart';

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
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('Menu',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: AppTheme.darkBackground,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Menu Header (Profile)
            Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
              decoration: const BoxDecoration(
                color: AppTheme.primaryColor,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              child: Row(
                children: [
                  const ProfileAvatarWithQr(
                    imageUrl: 'https://i.pravatar.cc/150?u=passenger',
                    isNetworkImage: true,
                    radius: 30,
                    qrData: 'passenger:jane_doe_u1234',
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Jane Doe',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                            color: Colors.black,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              'Gold Member',
                              style: TextStyle(
                                color: Colors.black.withValues(alpha: 0.7),
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Section: My Account (Light Red - like Statements in Driver App)
            _buildSectionHeader('My Account'),
            _buildGridSection(
                context,
                [
                  MenuGridItem(
                      icon: Icons.history,
                      title: 'My Trips',
                      baseColor: Colors.deepOrange,
                      onTap: () =>
                          Navigator.pushNamed(context, '/ride_history')),
                  MenuGridItem(
                      icon: Icons.favorite,
                      title: 'Saved Places',
                      baseColor: Colors.red,
                      onTap: () {
                        // Placeholder until saved_places_screen is integrated or created if missing
                        ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('Saved Places coming soon')));
                      }),
                  MenuGridItem(
                      icon: Icons.card_giftcard,
                      title: 'Referrals',
                      baseColor: Colors.pink,
                      onTap: () => Navigator.pushNamed(context,
                          '/referral_status')), // Assuming mapping exists or will create
                ],
                backgroundColor:
                    AppTheme.darkSurface), // Dark Surface background

            const SizedBox(height: 24),

            // Section: Services & Tools (Light Yellow)
            _buildSectionHeader('Services & Tools'),
            _buildGridSection(
                context,
                [
                  MenuGridItem(
                      icon: Icons.account_balance_wallet,
                      title: 'Wallet',
                      baseColor: Colors.indigo,
                      onTap: () => Navigator.pushNamed(context, '/wallet')),
                  MenuGridItem(
                      icon: Icons.settings,
                      title: 'Settings',
                      baseColor: Colors.grey.shade700,
                      onTap: () => Navigator.pushNamed(context, '/settings')),
                  MenuGridItem(
                      icon: Icons.headset_mic,
                      title: 'Support',
                      baseColor: Colors.blue,
                      onTap: () => Navigator.pushNamed(context, '/help')),
                  MenuGridItem(
                      icon: Icons.info,
                      title: 'About',
                      baseColor: Colors.teal,
                      onTap: () {}),
                  // Tours Button — URL configured by admin
                  MenuGridItem(
                      icon: Icons.travel_explore,
                      title: 'Tours',
                      baseColor: Colors.orange,
                      onTap: _isLoadingToursUrl ? () {} : _launchToursUrl),
                  MenuGridItem(
                      icon: Icons.logout,
                      title: 'Logout',
                      baseColor: Colors.red,
                      onTap: () {
                        Navigator.of(context).pushAndRemoveUntil(
                          MaterialPageRoute(
                              builder: (context) => const LoginScreen()),
                          (Route<dynamic> route) => false,
                        );
                      }),
                ],
                backgroundColor:
                    AppTheme.darkSurface), // Dark Surface background

            const SizedBox(height: 40),
            // Footer Version
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              color: AppTheme.darkBackground,
              child: const Center(
                child: Text(
                  'Cabi Go • v1.0.0 (5)',
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildGridSection(BuildContext context, List<Widget> items,
      {Color backgroundColor = Colors.white}) {
    return Container(
      color: backgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 3,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 0.85,
        children: items,
      ),
    );
  }
}
