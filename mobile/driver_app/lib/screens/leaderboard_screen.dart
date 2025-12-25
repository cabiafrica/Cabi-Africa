import 'package:flutter/material.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Mock Global Data
  final List<Map<String, dynamic>> _globalLeaders = [
    {'rank': 1, 'name': 'Sarah M.', 'trips': 145, 'rating': 5.0},
    {'rank': 2, 'name': 'David K.', 'trips': 132, 'rating': 4.9},
    {'rank': 3, 'name': 'John K.', 'trips': 128, 'rating': 4.8, 'isMe': true}, // Current User
    {'rank': 4, 'name': 'Alice W.', 'trips': 120, 'rating': 4.9},
    {'rank': 5, 'name': 'Michael O.', 'trips': 115, 'rating': 4.7},
  ];

  // Mock Friend Challenge Data (Story 81.1)
  final List<Map<String, dynamic>> _friendLeaders = [
    {'rank': 1, 'name': 'John K.', 'trips': 128, 'rating': 4.8, 'isMe': true},
    {'rank': 2, 'name': 'Ben T.', 'trips': 98, 'rating': 4.6},
    {'rank': 3, 'name': 'Clara J.', 'trips': 85, 'rating': 4.9},
  ];

  // Mock Team Challenge Data (Story 81.2)
  final List<Map<String, dynamic>> _teamLeaders = [
    {'rank': 1, 'name': 'Turbo Drivers', 'members': 12, 'avgTrips': 45, 'status': 'Leading'},
    {'rank': 2, 'name': 'Nairobi Night Owls', 'members': 8, 'avgTrips': 42, 'status': 'Chasing', 'isMyTeam': true},
    {'rank': 3, 'name': 'Airport Express', 'members': 15, 'avgTrips': 38, 'status': 'Stable'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  void _createChallenge() {
      showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
              title: const Text('Create New Challenge'),
              content: const Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                      TextField(decoration: InputDecoration(labelText: 'Challenge Name', hintText: 'e.g. Weekend Warriors')),
                      TextField(decoration: InputDecoration(labelText: 'Invite Friends (comma separated)')),
                  ],
              ),
              actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
                  ElevatedButton(onPressed: () {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Challenge Created! Invitations sent.')));
                  }, child: const Text('CREATE')),
              ],
          )
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: const Text('Leaderboards'),
          bottom: TabBar(
              controller: _tabController,
              tabs: const [
                  Tab(text: 'Global'),
                  Tab(text: 'Friends'),
                  Tab(text: 'Teams'),
              ],
          ),
      ),
      floatingActionButton: FloatingActionButton.extended(
          onPressed: _createChallenge,
          icon: const Icon(Icons.add),
          label: const Text('Challenge'),
      ),
      body: TabBarView(
          controller: _tabController,
          children: [
              _buildLeaderList(_globalLeaders, type: 'driver'),
              _buildLeaderList(_friendLeaders, type: 'driver', subtitle: 'Friend Challenge: "Weekly Hustle"'),
              _buildLeaderList(_teamLeaders, type: 'team'),
          ],
      ),
    );
  }

  Widget _buildLeaderList(List<Map<String, dynamic>> data, {required String type, String? subtitle}) {
      return Column(
          children: [
              if (type == 'driver' && subtitle == null)
                  Container(
                      padding: const EdgeInsets.all(12),
                      width: double.infinity,
                      decoration: BoxDecoration(
                          gradient: LinearGradient(colors: [Colors.deepPurple.shade700, Colors.deepPurple.shade400]),
                      ),
                      child: Column(
                          children: [
                              const Text('🏆 Driver of the Month 🏆', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 16)),
                              const SizedBox(height: 8),
                              const CircleAvatar(
                                  radius: 24,
                                  backgroundColor: Colors.white,
                                  child: Text('JD', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.deepPurple)),
                              ),
                              const SizedBox(height: 4),
                              const Text('John Doe (You!)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              const Text('Outstanding Service & Safety', style: TextStyle(color: Colors.white70, fontSize: 10)),
                          ],
                      ),
                  ),

              if (subtitle != null)
                  Container(
                      padding: const EdgeInsets.all(12),
                      color: Colors.amber.shade100,
                      width: double.infinity,
                      child: Text(subtitle, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
              Expanded(
                  child: ListView.builder(
                      itemCount: data.length,
                      itemBuilder: (ctx, index) {
                          final entry = data[index];
                          final isMe = entry['isMe'] == true || entry['isMyTeam'] == true;
                          
                          return Container(
                              color: isMe ? Colors.yellow.shade100 : ((entry['rank'] as int) <= 3 ? Colors.white : Colors.grey.shade50),
                              child: ListTile(
                                  leading: CircleAvatar(
                                      backgroundColor: (entry['rank'] as int) <= 3 ? Colors.deepPurple : Colors.grey.shade300,
                                      foregroundColor: Colors.white,
                                      child: Text('#${entry['rank']}'),
                                  ),
                                  title: Text(entry['name'], style: TextStyle(fontWeight: isMe ? FontWeight.bold : FontWeight.normal)),
                                  subtitle: type == 'team' ? Text('${entry['members']} Members') : null,
                                  trailing: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                          Text(type == 'team' ? '${entry['avgTrips']} Avg Trips' : '${entry['trips']} Trips', style: const TextStyle(fontWeight: FontWeight.bold)),
                                          if (type != 'team') Text('⭐ ${entry['rating']}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                      ],
                                  ),
                              ),
                          );
                      },
                  ),
              ),
              if (type == 'driver')
                  Container(
                    padding: const EdgeInsets.all(16),
                    color: Colors.white,
                    child: Row(
                       mainAxisAlignment: MainAxisAlignment.center,
                       children: [
                           const Text('You are in the top ', style: TextStyle(color: Colors.grey)),
                           Text('5%', style: TextStyle(color: Colors.green[700], fontWeight: FontWeight.bold)),
                           const Text(' of drivers this week!', style: TextStyle(color: Colors.grey)),
                       ],
                    ),
                  )
          ],
      );
  }
}
