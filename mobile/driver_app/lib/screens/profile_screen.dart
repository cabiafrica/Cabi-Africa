import 'package:flutter/material.dart';
import 'positive_feedback_screen.dart';

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
  final List<String> badges;
  final String tier;
  final Map<String, int> compliments; // Story 44.4

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
      badges: List<String>.from(json['badges'] ?? []),
      tier: json['tier'] ?? 'Silver',
      compliments: Map<String, int>.from(json['compliments'] ?? {}),
    );
  }
}

class ProfileService {
  const ProfileService();

  Future<DriverProfile> fetchMyProfile() async {
    print("Fetching driver profile from mock service...");
    await Future.delayed(const Duration(seconds: 1));
    // In a real app, this would make an HTTP GET request to `/api/profile/me`
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
      ], // Story 44.6
      "tier": "Gold",
      "compliments": {
        // Story 44.4
        "Excellent Service": 25,
        "Great Conversation": 12,
        "Clean Car": 8,
        "Safe Driver": 15,
      },
    };
    return DriverProfile.fromJson(mockApiResponse);
  }
}

// --- WIDGET IMPLEMENTATION ---

class ProfileScreen extends StatefulWidget {
  final ProfileService profileService;

  const ProfileScreen({Key? key, this.profileService = const ProfileService()})
      : super(key: key);

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late Future<DriverProfile> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = widget.profileService.fetchMyProfile();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
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
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildProfileHeader(context, profile),
                const SizedBox(height: 24),
                _buildProfileDetailsCard(profile),
                const SizedBox(height: 24),
                _buildOrganizationCard(context),
                const SizedBox(height: 24),
                const Text("Achievements",
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                _buildAchievementsCard(profile),
                const SizedBox(height: 24),
                const Text("Passenger Compliments",
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                _buildComplimentsCard(profile),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, DriverProfile profile) {
    return Center(
      // Centered header
      child: Column(
        children: [
          const CircleAvatar(radius: 50, child: Icon(Icons.person, size: 50)),
          const SizedBox(height: 16),
          Text(profile.name, style: Theme.of(context).textTheme.headlineSmall),
          Text(profile.email, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Chip(
                label: Text(
                  '${profile.averageRating.toStringAsFixed(2)} ★',
                ),
                backgroundColor: Colors.amber.shade100,
              ),
              const SizedBox(width: 8),
              Chip(
                avatar: const Icon(Icons.shield, size: 16, color: Colors.white),
                label: Text(profile.tier,
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold)),
                backgroundColor: _getTierColor(profile.tier),
              ),
            ],
          )
        ],
      ),
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
    return Card(
      child: Column(
        children: [
          ListTile(
            leading: const Icon(Icons.phone),
            title: Text(profile.phone),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.badge),
            title: const Text('Account Status'),
            trailing: Text(
              profile.accountStatus,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.calendar_today),
            title: Text(
              'Member since ${profile.registrationDate.substring(0, 10)}',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrganizationCard(BuildContext context) {
    return Card(
      child: Column(
        children: [
          ListTile(
            leading: const Icon(Icons.groups, color: Colors.indigo),
            title: const Text('My Organization'),
            subtitle: const Text('Manage union membership'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // Navigate to Organization Screen
              Navigator.pushNamed(context, '/my_organization');
            },
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.share, color: Colors.green),
            title: const Text('Referrals & Earnings'),
            subtitle: const Text('Expand your network'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // Navigate to MLM/Referrals Screen
              Navigator.pushNamed(context, '/referral_program');
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementsCard(DriverProfile profile) {
    if (profile.badges.isEmpty) {
      return const Card(
          child: Padding(
              padding: EdgeInsets.all(16),
              child: Text("No badges earned yet.")));
    }

    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: profile.badges.length,
        itemBuilder: (ctx, index) {
          return Card(
            margin: const EdgeInsets.only(right: 8),
            child: Container(
              width: 100,
              padding: const EdgeInsets.all(8),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.emoji_events, color: Colors.amber, size: 30),
                  const SizedBox(height: 4),
                  Text(profile.badges[index],
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildComplimentsCard(DriverProfile profile) {
    if (profile.compliments.isEmpty) {
      return const Card(
          child: Padding(
              padding: EdgeInsets.all(16), child: Text("No compliments yet.")));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: profile.compliments.entries.map((entry) {
            return Chip(
              avatar: CircleAvatar(
                backgroundColor: Colors.deepPurple,
                child: Text('${entry.value}',
                    style: const TextStyle(fontSize: 10, color: Colors.white)),
              ),
              label: Text(entry.key),
              backgroundColor: Colors.deepPurple.shade50,
              side: BorderSide.none,
            );
          }).toList(),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () {
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => const PositiveFeedbackScreen()));
          },
          icon: const Icon(Icons.favorite_border),
          label: const Text('VIEW ALL FEEDBACK'),
        ),
      ],
    );
  }
}
