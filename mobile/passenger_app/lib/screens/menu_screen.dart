import 'package:flutter/material.dart';
import 'package:passenger_app/theme/app_theme.dart';
import 'package:passenger_app/widgets/profile_avatar_with_qr.dart';
import 'package:passenger_app/widgets/menu_grid_item.dart';
import 'package:passenger_app/screens/login_screen.dart';

class MenuScreen extends StatelessWidget {
  const MenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Menu',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.black),
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
                backgroundColor: Colors.red.shade50), // Light Red background

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
                    const Color(0xFFFFFDE7)), // Light Yellow background

            const SizedBox(height: 40),
            // Footer Version
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              color: Colors.grey[100],
              child: const Center(
                child: Text(
                  'SW Version : 1.0.0 (5)',
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
            color: Color(0xFF1A1A1A),
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
