import 'package:flutter/material.dart';
import 'package:cabi_maps/cabi_maps.dart';
import 'package:latlong2/latlong.dart';
import 'screens/wallet_screen.dart';
import 'screens/store_screen.dart';
import 'screens/learning_center_screen.dart';
import 'screens/leaderboard_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/forums_screen.dart';
import 'screens/mentorship_screen.dart';
import 'screens/incentives_screen.dart';
import 'screens/trusted_contacts_screen.dart';
import 'screens/safety_checkup_screen.dart';
import 'screens/pending_approval_screen.dart';
import 'widgets/onboarding_tutorial_overlay.dart';
import 'widgets/consecutive_trip_progress_widget.dart';
import 'screens/scheduled_rides_screen.dart';
import 'screens/discount_marketplace_screen.dart';
import 'screens/mindfulness_content_screen.dart';

final ValueNotifier<ThemeMode> themeNotifier = ValueNotifier(ThemeMode.light);

void main() {
  runApp(const CabiDriverApp());
}

class CabiDriverApp extends StatelessWidget {
  const CabiDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (_, mode, __) {
        return MaterialApp(
          title: 'Cabi Driver',
          theme: ThemeData(
            primarySwatch: Colors.deepPurple,
            visualDensity: VisualDensity.adaptivePlatformDensity,
            brightness: Brightness.light,
          ),
          darkTheme: ThemeData(
            primarySwatch: Colors.deepPurple,
            visualDensity: VisualDensity.adaptivePlatformDensity,
            brightness: Brightness.dark,
            scaffoldBackgroundColor: Colors.grey[900],
            cardColor: Colors.grey[850],
            appBarTheme: AppBarTheme(backgroundColor: Colors.grey[900]),
            drawerTheme: DrawerThemeData(backgroundColor: Colors.grey[900]),
          ),
          themeMode: mode,
          home: const DriverMapView(),
          debugShowCheckedModeBanner: false,
        );
      },
    );
  }
}

class DriverMapView extends StatefulWidget {
  const DriverMapView({super.key});

  @override
  State<DriverMapView> createState() => _DriverMapViewState();
}

class _DriverMapViewState extends State<DriverMapView> {
  bool _isOnline = false;
  final LatLng _driverLocation =
      const LatLng(-1.286389, 36.817223); // Westlands, Nairobi
  String? _destination;
  int _onlineMinutes = 390; // 6.5 hours start

  // Mock nearby ride requests
  final List<Map<String, dynamic>> _rideRequests = [
    {
      'id': 'req-001',
      'passenger': 'Jane Wanjiku',
      'pickup': const LatLng(-1.290270, 36.821946), // CBD
      'dropoff': const LatLng(-1.319167, 36.928611), // JKIA
      'fare': 'KSh 1,200',
      'distance': '2.5 km away',
      'surgeBonus': 'KSh 200',
    },
    {
      'id': 'req-002',
      'passenger': 'Peter Maina',
      'pickup': const LatLng(-1.280000, 36.810000), // Parklands
      'dropoff': const LatLng(-1.270000, 36.890000), // Gigiri
      'fare': 'KSh 650',
      'distance': '1.8 km away',
      'surgeBonus': null,
    },
  ];

  @override
  void initState() {
    super.initState();
    // Simulate time passing
    Future.delayed(const Duration(seconds: 10), () {
      if (mounted && _isOnline) {
        setState(() => _onlineMinutes += 1);
        if (_onlineMinutes > 240 && _onlineMinutes % 60 == 0) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text(
                    '⚠️ You have been driving for over 4 hours. Please take a break soon.'),
                backgroundColor: Colors.orange),
          );
        }
      }
    });
  }

  void _setDestination() {
    showDialog(
        context: context,
        builder: (ctx) {
          final controller = TextEditingController();
          return AlertDialog(
            title: const Text('Set Destination Filter'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Only receive trips heading towards:'),
                TextField(
                    controller: controller,
                    decoration: const InputDecoration(
                        hintText: 'Enter address (e.g. Home)')),
              ],
            ),
            actions: [
              TextButton(
                  onPressed: () {
                    setState(() => _destination = null);
                    Navigator.pop(ctx);
                  },
                  child: const Text('CLEAR')),
              ElevatedButton(
                  onPressed: () {
                    setState(() => _destination = controller.text);
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        content: Text('Destination filter active!')));
                  },
                  child: const Text('SET')),
            ],
          );
        });
  }

  List<CabiMapMarker> _getMarkers() {
    final markers = <CabiMapMarker>[];

    // Driver's current location
    markers.add(CabiMapMarker.driver(
      position: _driverLocation,
      driverId: 'driver-123',
      isOnline: _isOnline,
      onTap: () {
        _showDriverInfo();
      },
    ));

    // Nearby ride requests (only show when online)
    if (_isOnline) {
      for (var request in _rideRequests) {
        markers.add(CabiMapMarker.pickup(
          position: request['pickup'] as LatLng,
          onTap: () {
            _showRideRequest(request);
          },
        ));
      }
    }

    return markers;
  }

  void _showDriverInfo() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircleAvatar(
              radius: 40,
              backgroundColor: Colors.deepPurple,
              child: Icon(Icons.person, size: 40, color: Colors.white),
            ),
            const SizedBox(height: 16),
            const Text(
              'John Kamau',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.star, color: Colors.amber, size: 20),
                SizedBox(width: 4),
                Text('4.8', style: TextStyle(fontSize: 16)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildStat('1,234', 'Trips'),
                _buildStat('KSh 45K', 'Earned'),
                _buildStat('2.5 yrs', 'Experience'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showRideRequest(Map<String, dynamic> request) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const CircleAvatar(
                  backgroundColor: Colors.blue,
                  child: Icon(Icons.person, color: Colors.white),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        request['passenger'],
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        request['distance'],
                        style: const TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
                Text(
                  request['fare'],
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (request['surgeBonus'] != null)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.purple.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.purple.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.flash_on, color: Colors.purple, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Includes ${request['surgeBonus']} Platform Bonus!',
                        style: const TextStyle(
                            color: Colors.purple, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const Icon(Icons.info_outline,
                        color: Colors.purple, size: 16),
                  ],
                ),
              ),
            const Row(
              children: [
                Icon(Icons.circle, color: Colors.green, size: 12),
                SizedBox(width: 8),
                Expanded(child: Text('Pickup location')),
              ],
            ),
            const SizedBox(height: 8),
            const Row(
              children: [
                Icon(Icons.location_on, color: Colors.red, size: 12),
                SizedBox(width: 8),
                Expanded(child: Text('Dropoff location')),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Decline'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      _acceptRide(request);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.deepPurple,
                    ),
                    child: const Text('Accept'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _acceptRide(Map<String, dynamic> request) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Ride accepted! Navigating to pickup...'),
        backgroundColor: Colors.green,
      ),
    );
  }

  Widget _buildStat(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(color: Colors.grey, fontSize: 12),
        ),
      ],
    );
  }

  void _showBreakReminder() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.coffee, color: Colors.brown),
            SizedBox(width: 8),
            Text('Time for a Break?'),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('You\'ve been driving for 2 hours straight.'),
            SizedBox(height: 8),
            Text('Taking a short break can help you stay alert and safe.'),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx), child: const Text('LATER')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              setState(() => _isOnline = false); // Go offline
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text('You are now offline. Enjoy your break!')));
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.brown, foregroundColor: Colors.white),
            child: const Text('GO OFFLINE'),
          ),
        ],
      ),
    );
  }

  void _showTutorial() {
    showGeneralDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withValues(alpha: 0.5),
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (_, __, ___) => OnboardingTutorialOverlay(
        onComplete: () => Navigator.pop(context),
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          const UserAccountsDrawerHeader(
            accountName: Text('John Kamau'),
            accountEmail: Text('john.kamau@example.com'),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.person, size: 40, color: Colors.deepPurple),
            ),
            decoration: BoxDecoration(color: Colors.deepPurple),
          ),
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text('My Profile'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const ProfileScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.map),
            title: const Text('Map'),
            onTap: () => Navigator.pop(context), // Already on map
          ),
          ListTile(
            leading: const Icon(Icons.account_balance_wallet),
            title: const Text('Earnings & Wallet'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const WalletScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.store),
            title: const Text('Driver Store'), // New Feature
            onTap: () {
              Navigator.pop(context);
              Navigator.push(context,
                  MaterialPageRoute(builder: (context) => const StoreScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.school),
            title: const Text('Learning Center'), // Story 62.3
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const LearningCenterScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.local_offer, color: Colors.blueAccent),
            title: const Text('Driver Perks'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const DiscountMarketplaceScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.self_improvement, color: Colors.teal),
            title: const Text('Wellness & Relax'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const MindfulnessContentScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.emoji_events),
            title: const Text('Weekly Challenges'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const IncentivesScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.calendar_today, color: Colors.indigo),
            title: const Text('Scheduled Rides'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const ScheduledRidesScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.security),
            title: const Text('Trusted Contacts'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const TrustedContactsScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('Safety Checkup'), // Story 18.7
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const SafetyCheckupScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.leaderboard),
            title: const Text('Leaderboard'), // Story 62.7
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const LeaderboardScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.handshake),
            title: const Text('Mentorship'), // Story 62.6
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const MentorshipScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.forum),
            title: const Text('Forums'), // Story 62.9
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const ForumsScreen()));
            },
          ),
          SwitchListTile(
            title: const Text('Dark Mode'),
            secondary: const Icon(Icons.dark_mode),
            value: themeNotifier.value == ThemeMode.dark,
            onChanged: (val) {
              themeNotifier.value = val ? ThemeMode.dark : ThemeMode.light;
              Navigator.pop(
                  context); // Close drawer to see effect clearer? Optional.
            },
          ),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Settings'),
            onTap: () => Navigator.pop(context),
          ),
          const Divider(),
          const Padding(
            padding: EdgeInsets.only(left: 16, top: 8, bottom: 8),
            child: Text('Debug', style: TextStyle(color: Colors.grey)),
          ),
          ListTile(
            leading: const Icon(Icons.timer, color: Colors.blueGrey),
            title: const Text('Simulate 2h Driving'),
            onTap: () {
              Navigator.pop(context);
              _showBreakReminder();
            },
          ),
          ListTile(
            leading: const Icon(Icons.hourglass_empty, color: Colors.orange),
            title: const Text('View Pending Approval'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const PendingApprovalScreen()));
            },
          ),
          ListTile(
            leading: const Icon(Icons.school, color: Colors.blue),
            title: const Text('Show Onboarding Tutorial'),
            onTap: () {
              Navigator.pop(context); // Close Drawer
              _showTutorial();
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    String onlineTimeStr = '${(_onlineMinutes / 60).toStringAsFixed(1)}h';

    return Scaffold(
      drawer: _buildDrawer(),
      floatingActionButton: _isOnline
          ? FloatingActionButton(
              onPressed: _setDestination,
              backgroundColor:
                  _destination != null ? Colors.amber : Colors.deepPurple,
              tooltip: 'Set Destination',
              child:
                  Icon(_destination != null ? Icons.flag : Icons.flag_outlined),
            )
          : null,
      body: Stack(
        children: [
          // Map
          CabiMap(
            initialCenter: _driverLocation,
            initialZoom: 14.0,
            markers: _getMarkers(),
            showUserLocation: true,
          ),

          // Top Floating UI
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Menu Button
                    Card(
                      elevation: 4,
                      shape: const CircleBorder(),
                      child: IconButton(
                        icon: const Icon(Icons.menu, color: Colors.black87),
                        onPressed: () => Scaffold.of(context).openDrawer(),
                      ),
                    ),

                    // Status & Earnings Pill
                    Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30)),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 4.0, vertical: 4.0),
                        child: Row(
                          children: [
                            const Padding(
                              padding:
                                  EdgeInsets.symmetric(horizontal: 12.0),
                              child: Text('KSh 3,450',
                                  style: TextStyle(
                                      fontWeight: FontWeight.bold)),
                            ),
                            Container(
                                width: 1, height: 24, color: Colors.grey[300]),
                            Switch(
                              value: _isOnline,
                              onChanged: (val) =>
                                  setState(() => _isOnline = val),
                              activeThumbColor: Colors.green,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          if (_destination != null)
            Positioned(
                top: 80,
                left: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                      color: Colors.amber.shade100,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: const [
                        BoxShadow(color: Colors.black12, blurRadius: 4)
                      ]),
                  child: Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.flag,
                            size: 16, color: Colors.deepPurple),
                        const SizedBox(width: 8),
                        Text('Heading to: $_destination',
                            style:
                                const TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(width: 8),
                        GestureDetector(
                            onTap: () => setState(() => _destination = null),
                            child: const Icon(Icons.close, size: 16))
                      ]),
                )),

          if (_isOnline)
            Positioned(
              top: _destination != null ? 140 : 80,
              left: 0,
              right: 0,
              child: const ConsecutiveTripProgressWidget(
                currentStreak: 2,
                requiredStreak: 3,
                bonusAmount: 15.0,
              ),
            ),

          // Bottom Panel
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _isOnline
                ?
                // Online Panel
                Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 10,
                            offset: const Offset(0, -2)),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          children: [
                            const CircularProgressIndicator(),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Finding Trips...',
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium),
                                  const Text('High demand in Westlands',
                                      style: TextStyle(
                                          color: Colors.green, fontSize: 12)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Divider(),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _buildQuickStat(
                                '12', 'Trips', Icons.local_taxi, Colors.blue),
                            _buildQuickStat('KSh 3.4K', 'Earned',
                                Icons.attach_money, Colors.green),
                            _buildQuickStat(onlineTimeStr, 'Online',
                                Icons.access_time, Colors.orange),
                          ],
                        ),
                      ],
                    ),
                  )
                :
                // Offline Panel
                Container(
                    margin:
                        const EdgeInsets.only(bottom: 40, left: 20, right: 20),
                    child: ElevatedButton(
                      onPressed: () => setState(() => _isOnline = true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.deepPurple,
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30)),
                        elevation: 8,
                      ),
                      child: const Text('GO ONLINE',
                          style: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold)),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStat(
      String value, String label, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }
}
