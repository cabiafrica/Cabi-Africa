import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/theme/app_theme.dart';
import '../providers/auth_provider.dart';

class LeaderboardScreen extends ConsumerStatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  ConsumerState<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends ConsumerState<LeaderboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Mock Global Data - Now sanitized of "Cabi Driver"
  final List<Map<String, dynamic>> _globalLeaders = [
    {'rank': 1, 'name': 'SARAH M.', 'trips': 145, 'rating': 5.0},
    {'rank': 2, 'name': 'DAVID K.', 'trips': 132, 'rating': 4.9},
    {'rank': 3, 'name': 'YOU', 'trips': 128, 'rating': 4.8, 'isMe': true}, 
    {'rank': 4, 'name': 'ALICE W.', 'trips': 120, 'rating': 4.9},
    {'rank': 5, 'name': 'MICHAEL O.', 'trips': 115, 'rating': 4.7},
  ];

  // Mock Friend Challenge Data
  final List<Map<String, dynamic>> _friendLeaders = [
    {'rank': 1, 'name': 'YOU', 'trips': 128, 'rating': 4.8, 'isMe': true},
    {'rank': 2, 'name': 'BEN T.', 'trips': 98, 'rating': 4.6},
    {'rank': 3, 'name': 'CLARA J.', 'trips': 85, 'rating': 4.9},
  ];

  // Mock Team Challenge Data
  final List<Map<String, dynamic>> _teamLeaders = [
    {'rank': 1, 'name': 'TURBO DRIVERS', 'members': 12, 'avgTrips': 45, 'status': 'Leading'},
    {'rank': 2, 'name': 'NAIROBI NIGHT OWLS', 'members': 8, 'avgTrips': 42, 'status': 'Chasing', 'isMyTeam': true},
    {'rank': 3, 'name': 'AIRPORT EXPRESS', 'members': 15, 'avgTrips': 38, 'status': 'Stable'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _createChallenge() {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: AppTheme.darkSurface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: AppTheme.primaryColor, width: 0.5)),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('CREATE CHALLENGE', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
              const SizedBox(height: 24),
              TextField(
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Challenge Name',
                  labelStyle: const TextStyle(color: AppTheme.darkTextSecondary),
                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1))),
                  focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: AppTheme.primaryColor)),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Invite IDs (comma separated)',
                  labelStyle: const TextStyle(color: AppTheme.darkTextSecondary),
                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1))),
                  focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: AppTheme.primaryColor)),
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Challenge Created!')));
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('LAUNCH', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
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
    String userName = 'YOU';
    if (authState is Authenticated) {
      userName = (authState.user?['firstName'] ?? 'YOU').toUpperCase();
    }

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('PRESTIGE RANKINGS', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, letterSpacing: 1.2, fontSize: 16)),
        backgroundColor: AppTheme.darkSurface,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primaryColor,
          labelColor: AppTheme.primaryColor,
          unselectedLabelColor: AppTheme.darkTextSecondary,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1),
          tabs: const [
            Tab(text: 'GLOBAL'),
            Tab(text: 'FRIENDS'),
            Tab(text: 'TEAMS'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _createChallenge,
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.black,
        icon: const Icon(Icons.add_task),
        label: const Text('CHALLENGE', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildLeaderList(_globalLeaders, type: 'driver', currentUserName: userName),
          _buildLeaderList(_friendLeaders, type: 'driver', subtitle: 'Weekly Hustle', currentUserName: userName),
          _buildLeaderList(_teamLeaders, type: 'team', currentUserName: userName),
        ],
      ),
    );
  }

  Widget _buildLeaderList(List<Map<String, dynamic>> data, {required String type, String? subtitle, required String currentUserName}) {
    return Column(
      children: [
        if (type == 'driver' && subtitle == null)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primaryColor.withValues(alpha: 0.1), Colors.transparent],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: Column(
              children: [
                const Text('🏆 ELITE DRIVER OF THE MONTH 🏆', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 2)),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(3),
                  decoration: const BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle),
                  child: const CircleAvatar(
                    radius: 28,
                    backgroundColor: AppTheme.darkSurface,
                    backgroundImage: NetworkImage('https://i.pravatar.cc/150?u=sarah'),
                  ),
                ),
                const SizedBox(height: 12),
                const Text('SARAH M.', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                const Text('99.8% Reliability Rating', style: TextStyle(color: AppTheme.darkTextSecondary, fontSize: 11)),
              ],
            ),
          ),

        if (subtitle != null)
          Container(
            padding: const EdgeInsets.all(12),
            color: AppTheme.primaryColor.withValues(alpha: 0.05),
            width: double.infinity,
            child: Text(subtitle.toUpperCase(), textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor, fontSize: 10, letterSpacing: 2)),
          ),
        
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: data.length,
            itemBuilder: (ctx, index) {
              final entry = data[index];
              final isMe = entry['isMe'] == true || entry['isMyTeam'] == true;
              final displayName = isMe ? currentUserName : entry['name'];
              final rank = entry['rank'] as int;
              
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: isMe ? AppTheme.primaryColor.withValues(alpha: 0.1) : AppTheme.darkSurface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isMe ? AppTheme.primaryColor.withValues(alpha: 0.3) : Colors.white.withValues(alpha: 0.05)),
                ),
                child: ListTile(
                  leading: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: rank <= 3 ? AppTheme.primaryColor : Colors.transparent,
                      shape: BoxShape.circle,
                      border: Border.all(color: rank <= 3 ? AppTheme.primaryColor : AppTheme.darkTextSecondary.withValues(alpha: 0.3)),
                    ),
                    child: Center(
                      child: Text(
                        '#$rank',
                        style: TextStyle(
                          color: rank <= 3 ? Colors.black : AppTheme.darkTextSecondary,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                  title: Text(displayName, style: TextStyle(fontWeight: FontWeight.bold, color: isMe ? AppTheme.primaryColor : Colors.white, fontSize: 14)),
                  subtitle: type == 'team' ? Text('${entry['members']} AGENTS', style: const TextStyle(fontSize: 10, color: AppTheme.darkTextSecondary)) : null,
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        type == 'team' ? '${entry['avgTrips']} AVG' : '${entry['trips']} TRIPS',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14),
                      ),
                      if (type != 'team')
                        Text('★ ${entry['rating']}', style: const TextStyle(fontSize: 11, color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppTheme.darkSurface,
            border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.05))),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('STATUS: ', style: TextStyle(color: AppTheme.darkTextSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
              Text('TOP 5% OF ELITE DRIVERS', style: TextStyle(color: Colors.green.shade400, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 0.5)),
            ],
          ),
        )
      ],
    );
  }
}

