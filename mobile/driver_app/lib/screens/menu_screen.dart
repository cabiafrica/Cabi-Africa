import 'package:flutter/material.dart';
import 'package:driver_app/screens/login_screen.dart';
import 'package:driver_app/widgets/promotional_carousel.dart';
import 'support_screen.dart';
import 'my_organization_screen.dart';

class MenuScreen extends StatelessWidget {
  const MenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      // AppBar removed for custom header design
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Menu Header (Profile)
            Container(
              padding: const EdgeInsets.fromLTRB(20, 50, 20, 30),
              decoration: const BoxDecoration(
                color: Color(
                    0xFFC62828), // Deep Red as per referenced "Taxi" app style request
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: const CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.white,
                      backgroundImage:
                          NetworkImage('https://i.pravatar.cc/150?u=driver'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'John Doe',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              'U2973',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.9),
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.share,
                                color: Colors.white, size: 16),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // QR Code Button
                  GestureDetector(
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (context) => Dialog(
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20)),
                          child: Padding(
                            padding: const EdgeInsets.all(24.0),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'My QR Code',
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall
                                      ?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                const SizedBox(height: 24),
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                    border:
                                        Border.all(color: Colors.grey.shade200),
                                  ),
                                  // Placeholder for actual QR widget (using Icon for now to verify layout)
                                  child: const Icon(Icons.qr_code_2, size: 200),
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'Scan to refer a driver or passenger',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: Colors.grey),
                                ),
                                const SizedBox(height: 24),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: () => Navigator.pop(context),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFFFD700),
                                      foregroundColor: Colors.black,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                    child: const Text('Close'),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: Colors.white.withValues(alpha: 0.3)),
                      ),
                      child: const Icon(Icons.qr_code, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            const SizedBox(height: 20),

            // Promotional Banner with Carousel
            // Promotional Banner with Carousel
            const PromotionalCarousel(),

            const SizedBox(height: 24),

            // Section: Statements
            _buildSectionHeader('Statements'),
            _buildGridSection(
                context,
                [
                  _MenuGridItem(
                      icon: Icons.radar_outlined,
                      label: 'Active Trip',
                      color: Colors.lightGreen.shade100,
                      iconColor: Colors.green,
                      route: '/trip_in_progress'),
                  _MenuGridItem(
                      icon: Icons.history,
                      label: 'Trip History',
                      color: Colors.orange.shade100,
                      iconColor: Colors.deepOrange,
                      route: '/home'),
                  _MenuGridItem(
                      icon: Icons.receipt_long,
                      label: 'Fare Info',
                      color: Colors.blue.shade100,
                      iconColor: Colors.blue,
                      route: null),
                  _MenuGridItem(
                      icon: Icons.bar_chart,
                      label: 'Performance',
                      color: Colors.purple.shade100,
                      iconColor: Colors.purple,
                      route: '/dashboard'),
                  _MenuGridItem(
                      icon: Icons.monetization_on_outlined,
                      label: 'Earnings',
                      color: Colors.amber.shade100,
                      iconColor: Colors.amber.shade800,
                      route: '/earnings'),
                  _MenuGridItem(
                      icon: Icons.star_outline,
                      label: 'Ratings',
                      color: Colors.teal.shade100,
                      iconColor: Colors.teal,
                      route: '/ratings'),
                ],
                backgroundColor: Colors.red.shade50),

            const SizedBox(height: 24),

            // Section: Financial Services & Tools
            _buildSectionHeader('Services & Tools'),
            _buildGridSection(
                context,
                [
                  _MenuGridItem(
                      icon: Icons.account_balance_wallet_outlined,
                      label: 'Wallet',
                      color: Colors.indigo.shade100,
                      iconColor: Colors.indigo,
                      route: '/wallet'),
                  _MenuGridItem(
                      icon: Icons.groups_outlined,
                      label: 'Referral Family',
                      color: Colors.pink.shade100,
                      iconColor: Colors.pink,
                      route: '/referral_program'),
                  _MenuGridItem(
                      icon: Icons.directions_car_filled_outlined,
                      label: 'Vehicles',
                      color: Colors.blueGrey.shade100,
                      iconColor: Colors.blueGrey,
                      route: '/vehicles'),
                  _MenuGridItem(
                      icon: Icons.groups,
                      label: 'My Sacco',
                      color: Colors.teal.shade100,
                      iconColor: Colors.teal.shade800,
                      onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const MyOrganizationScreen()))),
                  _MenuGridItem(
                      icon: Icons.settings_outlined,
                      label: 'Settings',
                      color: Colors.grey.shade200,
                      iconColor: Colors.grey.shade700,
                      route: '/settings'),
                  _MenuGridItem(
                      icon: Icons.headset_mic_outlined,
                      label: 'Support',
                      color: Colors.red.shade100,
                      iconColor: Colors.red,
                      onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const DriverSupportScreen()))),
                  _MenuGridItem(
                      icon: Icons.logout,
                      label: 'Signout',
                      color: Colors.red.shade50,
                      iconColor: Colors.red,
                      onTap: () {
                        Navigator.of(context).pushAndRemoveUntil(
                          MaterialPageRoute(
                              builder: (context) => const LoginScreen()),
                          (Route<dynamic> route) => false,
                        );
                      }),
                ],
                backgroundColor: const Color(0xFFFFFDE7)), // Very Light Yellow

            const SizedBox(height: 40),

            // Footer Version
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              color: Colors.grey[100],
              child: const Center(
                child: Text(
                  'SW Version : 2.8.0 (180)',
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
            color: Color(0xFF1A1A1A), // Dark text
          ),
        ),
      ),
    );
  }

  Widget _buildGridSection(BuildContext context, List<_MenuGridItem> items,
      {Color backgroundColor = Colors.white}) {
    return Container(
      color: backgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 12,
          mainAxisSpacing: 16,
          childAspectRatio: 0.8, // Adjust for card height
        ),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return GestureDetector(
            onTap: item.onTap ??
                () {
                  if (item.route != null) {
                    if (item.route == '/home') {
                      Navigator.pushReplacementNamed(context, item.route!);
                    } else {
                      Navigator.pushNamed(context, item.route!);
                    }
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Feature coming soon')),
                    );
                  }
                },
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withValues(alpha: 0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  )
                ],
                border: Border.all(color: Colors.grey.shade100),
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
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
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
