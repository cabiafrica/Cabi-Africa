import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/widgets/referral_tree_graph.dart';
import 'package:driver_app/services/referral_service.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/theme/app_theme.dart';

class DownlineScreen extends ConsumerStatefulWidget {
  const DownlineScreen({super.key});

  @override
  ConsumerState<DownlineScreen> createState() => _DownlineScreenState();
}

class _DownlineScreenState extends ConsumerState<DownlineScreen> {
  final ReferralService _referralService = ReferralService();
  bool _isLoading = true;
  List<dynamic> _downline = [];

  @override
  void initState() {
    super.initState();
    _fetchDownline();
  }

  Future<void> _fetchDownline() async {
    final authState = ref.read(authProvider);
    String? driverId;
    if (authState is Authenticated) {
      driverId = authState.userId;
    }

    if (driverId == null) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
      return;
    }

    final data = await _referralService.getDownline(driverId);

    if (mounted) {
      setState(() {
        _downline = data;
        _isLoading = false;
      });
    }
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
                      _buildLegendItem("You", AppTheme.primaryColor),
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

                if (_downline.isEmpty)
                  const Padding(
                    padding: EdgeInsets.only(top: 20),
                    child: Center(
                      child: Text(
                          "No referrals yet. Share your code to grow your network!"),
                    ),
                  )
                else
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
        title: Text(node['name'] ?? 'Unknown User'),
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

  String _formatDate(dynamic d) {
    if (d == null) return 'N/A';
    DateTime dt;
    if (d is String) {
      dt = DateTime.parse(d);
    } else if (d is DateTime) {
      dt = d;
    } else {
      return 'N/A';
    }
    return '${dt.day}/${dt.month}/${dt.year}';
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
