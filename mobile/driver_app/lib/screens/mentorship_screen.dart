import 'package:flutter/material.dart';

class MentorshipScreen extends StatefulWidget {
  const MentorshipScreen({super.key});

  @override
  State<MentorshipScreen> createState() => _MentorshipScreenState();
}

class _MentorshipScreenState extends State<MentorshipScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isMentor = false; // Toggle for demo
  bool _hasApplied = false;

  final Map<String, dynamic> _myMentor = {
    'name': 'Sarah K.',
    'rating': 4.9,
    'trips': 2500,
    'bio': 'Driving for 3 years. Happy to help!',
    'image': 'https://via.placeholder.com/150',
  };

  final List<Map<String, dynamic>> _myMentees = [
    {'name': 'David M.', 'trips': 15, 'status': 'Active', 'nextMilestone': '20 Trips'},
    {'name': 'Lisa W.', 'trips': 42, 'status': 'Active', 'nextMilestone': '50 Trips'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mentorship Program'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Program'),
            Tab(text: 'Connections'),
          ],
        ),
        actions: [
            // Demo toggle
            Switch(value: _isMentor, onChanged: (val) => setState(() => _isMentor = val)),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildProgramTab(),
          _isMentor ? _buildMenteesTab() : _buildMyMentorTab(),
        ],
      ),
    );
  }

  Widget _buildProgramTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: const Color(0xFF0F1510),
          child: const Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              children: [
                Icon(Icons.handshake, size: 60, color: const Color(0xFF10B981)),
                SizedBox(height: 16),
                Text(
                  'Grow Together',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Text(
                  'Join the mentorship program to share knowledge and earn rewards.',
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        const Text('Benefits', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        _buildBenefitItem(Icons.monetization_on, 'Earn Bonuses', 'Get paid when your mentees reach milestones.'),
        _buildBenefitItem(Icons.star, 'Leadership Badge', 'Get recognized as a top driver in the community.'),
        _buildBenefitItem(Icons.group, 'Exclusive Events', 'Access to mentor-only meetups and training.'),
        
        const SizedBox(height: 24),
        if (!_isMentor)
            SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                    onPressed: _hasApplied ? null : () {
                        setState(() => _hasApplied = true);
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Application submitted!')));
                    },
                    style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(16)),
                    child: Text(_hasApplied ? 'Application Pending' : 'Apply to be a Mentor'),
                ),
            ),
      ],
    );
  }

  Widget _buildBenefitItem(IconData icon, String title, String desc) {
    return ListTile(
      leading: CircleAvatar(radius: 18, backgroundColor: const Color(0xFF10B981), child: Icon(icon, color: Colors.white, size: 20)),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(desc),
      contentPadding: EdgeInsets.zero,
    );
  }

  Widget _buildMyMentorTab() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
           const Text('Your Mentor', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
           const SizedBox(height: 16),
           CircleAvatar(radius: 50, child: Text(_myMentor['name'][0], style: const TextStyle(fontSize: 40))),
           const SizedBox(height: 16),
           Text(_myMentor['name'], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
           Text('${_myMentor['trips']} Trips • ${_myMentor['rating']} ★'),
           const SizedBox(height: 8),
           Text(_myMentor['bio'], style: const TextStyle(fontStyle: FontStyle.italic)),
           const SizedBox(height: 24),
           ElevatedButton.icon(
               onPressed: () {
                   ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Opening chat with Sarah...')));
               }, 
               icon: const Icon(Icons.chat), 
               label: const Text('Chat with Mentor')
           ),
        ],
      ),
    );
  }

  Widget _buildMenteesTab() {
    return ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _myMentees.length,
        itemBuilder: (ctx, index) {
            final mentee = _myMentees[index];
            return Card(
                child: ListTile(
                    leading: CircleAvatar(child: Text(mentee['name'][0])),
                    title: Text(mentee['name']),
                    subtitle: Text('${mentee['trips']} Trips'),
                    trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                            Text(mentee['status'], style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                            Text('Goal: ${mentee['nextMilestone']}', style: const TextStyle(fontSize: 10)),
                        ],
                    ),
                    onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Chatting with ${mentee['name']}')));
                    },
                ),
            );
        },
    );
  }
}
