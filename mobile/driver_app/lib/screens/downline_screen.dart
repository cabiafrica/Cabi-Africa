import 'package:flutter/material.dart';
import 'package:driver_app/widgets/referral_tree_graph.dart';

class DownlineScreen extends StatefulWidget {
  const DownlineScreen({super.key});

  @override
  State<DownlineScreen> createState() => _DownlineScreenState();
}

class _DownlineScreenState extends State<DownlineScreen> {
  // Mock Data
  bool _isLoading = true;
  List<dynamic> _downline = [];

  @override
  void initState() {
    super.initState();
    _fetchDownline();
  }

  Future<void> _fetchDownline() async {
    // Simulate API call to GET /users/:id/downline
    await Future.delayed(const Duration(seconds: 1));

    // Mock response (matches recursive structure from user.service.ts)
    setState(() {
      _downline = [
        {
          'id': 'd_mock_1',
          'name': 'John D.',
          'status': 'ACTIVE',
          'level': 1,
          'joinedAt': DateTime.now().subtract(const Duration(days: 30)),
          'children': [
            {
              'id': 'd_mock_2',
              'name': 'Sarah M.',
              'status': 'PROSPECT',
              'level': 2,
              'joinedAt': DateTime.now().subtract(const Duration(days: 5)),
              'children': []
            }
          ]
        },
        {
          'id': 'd_mock_3',
          'name': 'Mike R.',
          'status': 'ACTIVE',
          'level': 1,
          'joinedAt': DateTime.now().subtract(const Duration(days: 60)),
          'children': []
        }
      ];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Network')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Visualization
                Center(
                  child: SizedBox(
                    height: 300,
                    width: 300,
                    child: ReferralTreeGraph(
                      // Simple count logic for mock data
                      level1Count:
                          _downline.where((n) => n['level'] == 1).length,
                      level2Count: _downline.fold<int>(
                          0, (sum, n) => sum + (n['children'] as List).length),
                      userImageUrl: 'https://i.pravatar.cc/150?u=driver',
                    ),
                  ),
                ),

                // Legend
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildLegendItem("You", const Color(0xFFFFD700)),
                      const SizedBox(width: 15),
                      _buildLegendItem("Level 1", Colors.orange.shade700),
                      const SizedBox(width: 15),
                      _buildLegendItem("Level 2", Colors.orange.shade300),
                    ],
                  ),
                ),
                const Divider(height: 30),
                const Text("Detailed List",
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),

                ..._downline.map((node) => _buildNode(node)),
              ],
            ),
    );
  }

  Widget _buildNode(Map<String, dynamic> node) {
    final children = (node['children'] as List).cast<Map<String, dynamic>>();
    final hasChildren = children.isNotEmpty;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      elevation: 1,
      child: ExpansionTile(
        initiallyExpanded: true,
        leading: CircleAvatar(
          backgroundColor:
              node['status'] == 'ACTIVE' ? Colors.green : Colors.orange,
          child: Text(
            (node['level'] as int).toString(),
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(node['name']),
        subtitle: Text(
            'Status: ${node['status']} • Joined: ${_formatDate(node['joinedAt'])}'),
        trailing: hasChildren
            ? null
            : const SizedBox.shrink(), // Hides arrow if no children
        children: children
            .map((child) => Padding(
                  padding: const EdgeInsets.only(left: 16.0),
                  child: _buildNode(child),
                ))
            .toList(),
      ),
    );
  }

  String _formatDate(DateTime d) {
    return '${d.day}/${d.month}/${d.year}';
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
        ),
        const SizedBox(width: 4),
        Text(label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
