import 'package:flutter/material.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'positive_feedback_screen.dart';
import '../services/badge_service.dart' as badge_service;
import '../widgets/badge_showcase_widget.dart';

// --- MOCK MODELS AND SERVICES FOR DEMONSTRATION ---

class DriverProfile {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String userType;
  final String registrationDate;
  final String accountStatus;
  final double averageRating;
  final List<badge_service.Badge> badges;
  final String tier;
  final String? coverImageUrl;
  final Map<String, int> compliments;

  DriverProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.userType,
    required this.registrationDate,
    required this.accountStatus,
    required this.averageRating,
    required this.badges,
    required this.tier,
    this.coverImageUrl,
    required this.compliments,
  });

  factory DriverProfile.fromJson(Map<String, dynamic> json) {
    return DriverProfile(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      userType: json['userType'],
      registrationDate: json['registrationDate'],
      accountStatus: json['accountStatus'],
      averageRating: (json['averageRating'] as num).toDouble(),
      badges: (json['badges'] as List?)
              ?.map((e) => badge_service.Badge.fromJson(e))
              .toList() ??
          [],
      tier: json['tier'] ?? 'Silver',
      coverImageUrl: json['coverImageUrl'],
      compliments: Map<String, int>.from(json['compliments'] ?? {}),
    );
  }
}

class ProfileService {
  const ProfileService();

  Future<DriverProfile> fetchMyProfile() async {
    debugPrint("Fetching driver profile from mock service...");
    await Future.delayed(const Duration(seconds: 1));
    final mockApiResponse = {
      "id": "driver-123",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "555-123-4567",
      "userType": "Driver",
      "registrationDate": "2024-08-10T09:00:00Z",
      "accountStatus": "Active",
      "averageRating": 4.85,
      "badges": [
        "100 Trips",
        "Top Rated",
        "Early Bird",
        "Safety Star",
        "Driver of the Month"
      ],
      "tier": "Gold",
      "coverImageUrl":
          "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000",
      "compliments": {
        "Excellent Service": 25,
        "Great Conversation": 12,
        "Clean Car": 8,
        "Safe Driver": 15,
      },
    };

    // Fetch real badges if possible
    try {
      final badgeService = badge_service.BadgeService();
      final realBadges = await badgeService.getUserBadges("driver-123");
      mockApiResponse['badges'] =
          realBadges; // This relies on Badge.fromJson handling the object correctly or we pass List

      // Since fromJson expects List<dynamic> (Map), and realBadges is List<Badge>
      // We should reconstruct the DriverProfile manually or adjust logic.
      // Easiest is to construct DriverProfile with the mock data + real badges

      return DriverProfile(
        id: mockApiResponse['id'] as String,
        name: mockApiResponse['name'] as String,
        email: mockApiResponse['email'] as String,
        phone: mockApiResponse['phone'] as String,
        userType: mockApiResponse['userType'] as String,
        registrationDate: mockApiResponse['registrationDate'] as String,
        accountStatus: mockApiResponse['accountStatus'] as String,
        averageRating: (mockApiResponse['averageRating'] as num).toDouble(),
        badges: realBadges,
        tier: mockApiResponse['tier'] as String,
        coverImageUrl: mockApiResponse['coverImageUrl'] as String?,
        compliments:
            Map<String, int>.from(mockApiResponse['compliments'] as Map),
      );
    } catch (e) {
      debugPrint("Error fetching real badges: $e");
      // Fallback with empty badges
      mockApiResponse['badges'] = [];
      return DriverProfile.fromJson(mockApiResponse);
    }
  }
}

// --- WIDGET IMPLEMENTATION ---

class ProfileScreen extends StatefulWidget {
  final ProfileService profileService;

  const ProfileScreen(
      {super.key, this.profileService = const ProfileService()});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late Future<DriverProfile> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = widget.profileService.fetchMyProfile();
  }

  void _showQrDialog(BuildContext context, DriverProfile profile) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'My QR Code',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                height: 250,
                width: 250,
                child: QrImageView(
                  data: 'driver:${profile.id}', // Use actual ID
                  version: QrVersions.auto,
                  eyeStyle: const QrEyeStyle(
                    eyeShape: QrEyeShape.square,
                    color: Colors.black,
                  ),
                  dataModuleStyle: const QrDataModuleStyle(
                    dataModuleShape: QrDataModuleShape.square,
                    color: Colors.black,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'driver:${profile.id}',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                'Scan to verify identity',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('My Profile', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Edit profile feature coming soon!'),
                ),
              );
            },
          ),
        ],
      ),
      body: FutureBuilder<DriverProfile>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData) {
            return const Center(child: Text('Could not load profile.'));
          }

          final profile = snapshot.data!;

          return SingleChildScrollView(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                _buildModernHeader(context, profile),
                Transform.translate(
                  offset: const Offset(0, -40),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildStatsRow(profile),
                        const SizedBox(height: 16),
                        _buildSectionTitle("Account Info"),
                        _buildProfileDetailsCard(profile),
                        const SizedBox(height: 24),
                        _buildSectionTitle("My Career"),
                        _buildOrganizationCard(context),
                        const SizedBox(height: 24),
                        _buildSectionTitle("Achievements"),
                        _buildAchievementsCard(profile),
                        const SizedBox(height: 24),
                        _buildSectionTitle("Passenger Compliments"),
                        _buildComplimentsCard(profile),
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, left: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _buildModernHeader(BuildContext context, DriverProfile profile) {
    return Stack(
      alignment: Alignment.bottomCenter,
      children: [
        Container(
          height: 280,
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: profile.coverImageUrl == null
                ? const LinearGradient(
                    colors: [Color(0xFF1F1F1F), Color(0xFF333333)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  )
                : null,
            image: profile.coverImageUrl != null
                ? DecorationImage(
                    image: NetworkImage(profile.coverImageUrl!),
                    fit: BoxFit.cover,
                    colorFilter: ColorFilter.mode(
                        Colors.black.withValues(alpha: 0.3), BlendMode.darken),
                  )
                : null,
          ),
          child: SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 20),
                Hero(
                  tag: 'profile_pic',
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border:
                          Border.all(color: AppTheme.primaryColor, width: 3),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        )
                      ],
                    ),
                    child: const CircleAvatar(
                      radius: 50,
                      backgroundColor: Colors.white,
                      backgroundImage:
                          NetworkImage('https://i.pravatar.cc/150?u=driver'),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  profile.name,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  profile.email,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 60), // Space for stats row
              ],
            ),
          ),
        ),
        // Decorative bottom curve
        Positioned(
          top: 40,
          right: 16,
          child: SafeArea(
            child: GestureDetector(
              onTap: () => _showQrDialog(context, profile),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                  border:
                      Border.all(color: Colors.white.withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.qr_code, color: Colors.white),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsRow(DriverProfile profile) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildStatItem(
            '${profile.averageRating.toStringAsFixed(1)} ★',
            'Rating',
            Colors.amber.shade800,
          ),
          Container(height: 40, width: 1, color: Colors.grey.shade200),
          _buildStatItem(
            profile.tier,
            'Tier',
            _getTierColor(profile.tier),
          ),
          Container(height: 40, width: 1, color: Colors.grey.shade200),
          _buildStatItem(
            '2.5k', // Mock
            'Trips',
            Colors.blue.shade700,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String value, String label, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade500,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Color _getTierColor(String tier) {
    switch (tier.toLowerCase()) {
      case 'gold':
        return Colors.amber.shade800;
      case 'silver':
        return Colors.blueGrey;
      case 'bronze':
        return Colors.brown;
      default:
        return Colors.blue;
    }
  }

  Widget _buildProfileDetailsCard(DriverProfile profile) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        children: [
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.phone, color: Colors.blue.shade700, size: 20),
            ),
            title: const Text('Phone Number',
                style: TextStyle(fontSize: 14, color: Colors.grey)),
            subtitle: Text(profile.phone,
                style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.black87)),
          ),
          Divider(height: 1, color: Colors.grey.shade100),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.purple.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.badge, color: Colors.purple.shade700, size: 20),
            ),
            title: const Text('Account Status',
                style: TextStyle(fontSize: 14, color: Colors.grey)),
            subtitle: Row(
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 4),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Text(
                    profile.accountStatus.toUpperCase(),
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                        color: Colors.green.shade700),
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: Colors.grey.shade100),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.calendar_today,
                  color: Colors.orange.shade700, size: 20),
            ),
            title: const Text('Member Since',
                style: TextStyle(fontSize: 14, color: Colors.grey)),
            subtitle: Text(
              profile.registrationDate.substring(0, 10),
              style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.black87),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrganizationCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        children: [
          _buildActionTile(
            context,
            icon: Icons.groups,
            color: Colors.indigo,
            title: 'My Organization',
            subtitle: 'Manage union membership',
            onTap: () => Navigator.pushNamed(context, '/my_organization'),
          ),
          Divider(height: 1, color: Colors.grey.shade100),
          _buildActionTile(
            context,
            icon: Icons.share,
            color: Colors.green,
            title: 'Referrals & Earnings',
            subtitle: 'Expand your network',
            onTap: () => Navigator.pushNamed(context, '/referral_program'),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile(BuildContext context,
      {required IconData icon,
      required Color color,
      required String title,
      required String subtitle,
      required VoidCallback onTap}) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      trailing:
          Icon(Icons.chevron_right, color: Colors.grey.shade400, size: 20),
    );
  }

  Widget _buildAchievementsCard(DriverProfile profile) {
    if (profile.badges.isEmpty) {
      return Card(
          elevation: 0,
          color: Colors.grey.shade100,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: const Padding(
              padding: EdgeInsets.all(16),
              child: Text("No badges earned yet.")));
    }

    return BadgeShowcaseWidget(badges: profile.badges, compact: true);
  }

  Widget _buildComplimentsCard(DriverProfile profile) {
    if (profile.compliments.isEmpty) {
      return const Card(
          child: Padding(
              padding: EdgeInsets.all(16), child: Text("No compliments yet.")));
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2D2D2D), // Dark card for contrast
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: profile.compliments.entries.map((entry) {
              return Chip(
                avatar: CircleAvatar(
                  backgroundColor: AppTheme.primaryColor,
                  radius: 10,
                  child: Text('${entry.value}',
                      style: const TextStyle(
                          fontSize: 10,
                          color: Colors.black,
                          fontWeight: FontWeight.bold)),
                ),
                label: Text(entry.key,
                    style: const TextStyle(color: Colors.white, fontSize: 12)),
                backgroundColor: Colors.white.withValues(alpha: 0.1),
                side: BorderSide.none,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20)),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: () {
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const PositiveFeedbackScreen()));
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.primaryColor,
              side: const BorderSide(color: AppTheme.primaryColor),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('VIEW ALL FEEDBACK'),
          ),
        ],
      ),
    );
  }
}
