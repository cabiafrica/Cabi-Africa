import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'positive_feedback_screen.dart';
import '../services/badge_service.dart' as badge_service;
import '../widgets/badge_showcase_widget.dart';
import '../services/profile_service.dart';

// --- MODELS ---

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
}

// --- WIDGET IMPLEMENTATION ---

class ProfileScreen extends ConsumerStatefulWidget {
  final ProfileService? profileService;
  const ProfileScreen({super.key, this.profileService});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  late Future<List<badge_service.Badge>> _badgesFuture;
  late Future<Map<String, dynamic>> _summaryFuture;

  @override
  void initState() {
    super.initState();
    final authState = ref.read(authProvider);
    final profileService = widget.profileService ?? ProfileService();
    
    if (authState is Authenticated) {
      final userId = authState.userId ?? '';
      _badgesFuture = profileService.getUserBadges(userId);
      _summaryFuture = profileService.fetchRatingSummary(userId);
    } else {
      _badgesFuture = Future.value([]);
      _summaryFuture = Future.value({
        'average': 0.0,
        'totalRatings': 0,
        'starCounts': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0},
        'tagCounts': {}
      });
    }
  }

  void _showQrDialog(BuildContext context, String driverId) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: AppTheme.darkSurface,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(20)), side: BorderSide(color: AppTheme.primaryColor, width: 0.5)),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'My QR Code',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: SizedBox(
                  height: 200,
                  width: 200,
                  child: QrImageView(
                    data: 'driver:$driverId',
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
              ),
              const SizedBox(height: 24),
              Text(
                'ID: $driverId',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.darkTextSecondary,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                'Scan to verify identity',
                style: TextStyle(fontSize: 12, color: AppTheme.darkTextSecondary),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    
    if (authState is! Authenticated) {
      return const Scaffold(body: Center(child: Text('Please login to view profile')));
    }

    final user = authState.user!;
    final name = user['firstName'] != null
        ? "${user['firstName']} ${user['lastName'] ?? ''}"
        : user['name'] ?? 'DRIVER';
    final email = user['email'] ?? 'No Email';
    final phone = user['phone'] ?? 'No Phone';
    final id = user['id'] ?? 'N/A';
    final profilePic = user['profilePicture'] ?? 'https://i.pravatar.cc/150?u=$id';

    // Extract stats or use defaults
    final rating = user['rating']?.toDouble() ?? 5.0;
    final tier = user['tier']?.toString().toUpperCase() ?? 'PRESTIGE';
    final trips = user['tripsCount']?.toInt() ?? 0;

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('DRIVER PROFILE', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 14)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.primaryColor),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_note, color: AppTheme.primaryColor),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  backgroundColor: AppTheme.darkSurface,
                  content: Text('Profile editing will be available in the next patch.', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                ),
              );
            },
          ),
        ],
      ),
      body: FutureBuilder<List<dynamic>>(
        future: Future.wait([_badgesFuture, _summaryFuture]),
        builder: (context, snapshot) {
          final badges = (snapshot.data?[0] as List<badge_service.Badge>?) ?? [];
          final summary = (snapshot.data?[1] as Map<String, dynamic>?) ?? {
            'average': 0.0,
            'totalRatings': 0,
            'starCounts': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0},
            'tagCounts': {}
          };
          
          return SingleChildScrollView(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                _buildModernHeader(context, name, email, profilePic, id),
                Transform.translate(
                  offset: const Offset(0, -40),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildStatsRow(rating, tier, trips),
                        const SizedBox(height: 24),
                        _buildSectionTitle("VERIFIED INFORMATION"),
                        _buildProfileDetailsCard(phone, user['status'] ?? 'Active', user['createdAt'] ?? 'N/A'),
                        const SizedBox(height: 24),
                        _buildSectionTitle("PROFESSIONAL TOOLS"),
                        _buildOrganizationCard(context),
                        const SizedBox(height: 24),
                        _buildSectionTitle("ACHIEVEMENTS"),
                        _buildAchievementsCard(badges),
                        const SizedBox(height: 24),
                        _buildSectionTitle("PASSENGER COMPLIMENTS"),
                        _buildComplimentsCard(summary['tagCounts'] ?? {}),
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
      padding: const EdgeInsets.only(bottom: 12.0, left: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: AppTheme.primaryColor,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildModernHeader(BuildContext context, String name, String email, String profilePic, String id) {
    return Stack(
      alignment: Alignment.bottomCenter,
      children: [
        Container(
          height: 320,
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppTheme.darkSurface, AppTheme.darkBackground],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            image: DecorationImage(
              image: const NetworkImage("https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000"),
              fit: BoxFit.cover,
              colorFilter: ColorFilter.mode(
                  Colors.black.withValues(alpha: 0.7), BlendMode.darken),
            ),
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
                          Border.all(color: AppTheme.primaryColor, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withValues(alpha: 0.2),
                          blurRadius: 20,
                          spreadRadius: 2,
                        )
                      ],
                    ),
                    child: CircleAvatar(
                      radius: 50,
                      backgroundColor: AppTheme.darkSurface,
                      backgroundImage: NetworkImage(profilePic),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  name.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  email,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppTheme.darkTextSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
        Positioned(
          top: 40,
          right: 16,
          child: SafeArea(
            child: GestureDetector(
              onTap: () => _showQrDialog(context, id),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(12),
                  border:
                      Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.qr_code_scanner, color: AppTheme.primaryColor, size: 20),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsRow(double rating, String tier, int trips) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildStatItem(
            '${rating.toStringAsFixed(1)} ★',
            'RATING',
            Colors.amber.shade400,
          ),
          Container(height: 30, width: 1, color: Colors.white.withValues(alpha: 0.1)),
          _buildStatItem(
            tier.toUpperCase(),
            'TIER',
            AppTheme.primaryColor,
          ),
          Container(height: 30, width: 1, color: Colors.white.withValues(alpha: 0.1)),
          _buildStatItem(
            '${(trips / 1000).toStringAsFixed(1)}k',
            'TRIPS',
            Colors.blue.shade400,
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
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            color: AppTheme.darkTextSecondary,
            fontWeight: FontWeight.bold,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }

  Widget _buildProfileDetailsCard(String phone, String status, String memberSince) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: [
          _buildDetailTile(Icons.phone_iphone_rounded, 'PHONE', phone, Colors.blue),
          Divider(height: 1, color: Colors.white.withValues(alpha: 0.05)),
          _buildDetailTile(Icons.verified_user_rounded, 'STATUS', status.toUpperCase(), Colors.green, isStatus: true),
          Divider(height: 1, color: Colors.white.withValues(alpha: 0.05)),
          _buildDetailTile(Icons.calendar_today_rounded, 'MEMBER SINCE', memberSince.length > 10 ? memberSince.substring(0, 10) : memberSince, Colors.orange),
        ],
      ),
    );
  }

  Widget _buildDetailTile(IconData icon, String label, String value, Color color, {bool isStatus = false}) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: color.withValues(alpha: 0.8), size: 18),
      ),
      title: Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.darkTextSecondary, fontWeight: FontWeight.bold, letterSpacing: 1)),
      subtitle: isStatus
          ? Row(children: [
              Container(
                margin: const EdgeInsets.only(top: 4),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: const BoxDecoration(
                  color: Color(0x1A4CAF50),
                  borderRadius: BorderRadius.all(Radius.circular(4)),
                  border: Border.fromBorderSide(BorderSide(color: Color(0x4D4CAF50))),
                ),
                child: Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.green)),
              )
            ])
          : Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Colors.white)),
    );
  }

  Widget _buildOrganizationCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: [
          _buildActionTile(
            context,
            icon: Icons.account_balance_rounded,
            color: Colors.indigoAccent,
            title: 'My Organization',
            subtitle: 'Union & Sacco Management',
            onTap: () => Navigator.pushNamed(context, '/my_organization'),
          ),
          Divider(height: 1, color: Colors.white.withValues(alpha: 0.05)),
          _buildActionTile(
            context,
            icon: Icons.monetization_on_rounded,
            color: AppTheme.primaryColor,
            title: 'Referral Rewards',
            subtitle: 'Track your network earnings',
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
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.darkTextSecondary)),
      trailing:
          Icon(Icons.arrow_forward_ios_rounded, color: Colors.white.withValues(alpha: 0.2), size: 14),
    );
  }

  Widget _buildAchievementsCard(List<badge_service.Badge> badges) {
    if (badges.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppTheme.darkSurface,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Column(
          children: [
            Icon(Icons.military_tech_outlined, color: AppTheme.darkTextSecondary, size: 40),
            SizedBox(height: 12),
            Text("NO ACHIEVEMENTS YET", style: TextStyle(color: AppTheme.darkTextSecondary, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1)),
          ],
        ),
      );
    }

    return BadgeShowcaseWidget(badges: badges, compact: true);
  }
  Widget _buildComplimentsCard(Map<dynamic, dynamic> tagCounts) {
    if (tagCounts.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppTheme.darkSurface,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Column(
          children: [
            Icon(Icons.thumb_up_off_alt, color: AppTheme.darkTextSecondary, size: 40),
            SizedBox(height: 12),
            Text("NO COMPLIMENTS YET", style: TextStyle(color: AppTheme.darkTextSecondary, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1)),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: tagCounts.entries.map((entry) {
              final label = entry.key.toString().replaceAll('_', ' ');
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.03),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('${entry.value}',
                        style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.bold)),
                    const SizedBox(width: 8),
                    Text(label,
                        style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          OutlinedButton(
            onPressed: () {
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const PositiveFeedbackScreen()));
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.primaryColor,
              side: const BorderSide(color: AppTheme.primaryColor, width: 0.5),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: const Text('VIEW ALL REVIEWS', style: TextStyle(letterSpacing: 1, fontWeight: FontWeight.bold, fontSize: 11)),
          ),
        ],
      ),
    );
  }

}


