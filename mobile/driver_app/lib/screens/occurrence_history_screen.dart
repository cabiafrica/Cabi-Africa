import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class OccurrenceHistoryScreen extends StatefulWidget {
  const OccurrenceHistoryScreen({super.key});

  @override
  State<OccurrenceHistoryScreen> createState() =>
      _OccurrenceHistoryScreenState();
}

class _OccurrenceHistoryScreenState extends State<OccurrenceHistoryScreen> {
  List<dynamic> occurrences = [];
  bool isLoading = true;
  String filter = 'all';

  final Map<String, Color> categoryColors = {
    'CRIME': const Color(0xFFDC2626),
    'TRAFFIC_OFFENSE': const Color(0xFFEA580C),
    'SAFETY_VIOLATION': const Color(0xFFD97706),
    'POLICY_VIOLATION': const Color(0xFFCA8A04),
    'HARASSMENT': const Color(0xFF9333EA),
    'FRAUD': const Color(0xFF4F46E5),
    'PROPERTY_DAMAGE': const Color(0xFF2563EB),
    'MEDICAL_EMERGENCY': const Color(0xFFDB2777),
    'DISPUTE': const Color(0xFF0D9488),
    'SUSPICIOUS_ACTIVITY': const Color(0xFF475569),
    'VEHICLE_ISSUE': const Color(0xFF0891B2),
    'ENVIRONMENTAL': const Color(0xFF16A34A),
  };

  final Map<String, Color> severityColors = {
    'CRITICAL': const Color(0xFFDC2626),
    'HIGH': const Color(0xFFEA580C),
    'MEDIUM': const Color(0xFFF59E0B),
    'LOW': const Color(0xFF10B981),
  };

  @override
  void initState() {
    super.initState();
    loadOccurrences();
  }

  Future<void> loadOccurrences() async {
    setState(() => isLoading = true);

    try {
      // Replace with your actual API endpoint and user ID
      final userId = 'current-user-id'; // Get from auth
      final role = 'passenger'; // or 'driver'

      final response = await http.get(
        Uri.parse(
            'http://10.0.2.2:3005/occurrences/user/$userId/history?role=$role'),
      );

      if (response.statusCode == 200) {
        setState(() {
          occurrences = json.decode(response.body);
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() => isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load occurrences: $e')),
        );
      }
    }
  }

  List<dynamic> get filteredOccurrences {
    if (filter == 'all') return occurrences;
    return occurrences
        .where((occ) => occ['status'].toString().toLowerCase() == filter)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Occurrence Records'),
        backgroundColor: const Color(0xFFDC2626),
      ),
      body: Column(
        children: [
          // Filter Chips
          Container(
            padding: const EdgeInsets.all(16),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('All', 'all'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Open', 'open'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Resolved', 'resolved'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Disputed', 'disputed'),
                ],
              ),
            ),
          ),

          // Occurrence List
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : filteredOccurrences.isEmpty
                    ? _buildEmptyState()
                    : RefreshIndicator(
                        onRefresh: loadOccurrences,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filteredOccurrences.length,
                          itemBuilder: (context, index) {
                            final occurrence = filteredOccurrences[index];
                            return _buildOccurrenceCard(occurrence);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = filter == value;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() => filter = value);
      },
      backgroundColor: Colors.white,
      selectedColor: const Color(0xFFDC2626),
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : Colors.black87,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.description_outlined, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'No occurrences found',
            style: TextStyle(fontSize: 18, color: Colors.grey[600]),
          ),
          const SizedBox(height: 8),
          Text(
            filter == 'all'
                ? 'You have no occurrence records'
                : 'You have no $filter occurrences',
            style: TextStyle(color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }

  Widget _buildOccurrenceCard(Map<String, dynamic> occurrence) {
    final category = occurrence['category'] as String;
    final severity = occurrence['severity'] as String;
    final status = occurrence['status'] as String;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(
            context,
            '/occurrence-detail',
            arguments: occurrence['id'],
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          occurrence['obNumber'],
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFDC2626),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          occurrence['title'],
                          style: const TextStyle(fontSize: 14),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Badges
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildBadge(
                    _formatCategory(category),
                    categoryColors[category] ?? Colors.grey,
                  ),
                  _buildBadge(
                    severity,
                    severityColors[severity] ?? Colors.grey,
                  ),
                  _buildStatusBadge(status),
                ],
              ),
              const SizedBox(height: 12),

              // Details
              Row(
                children: [
                  const Icon(Icons.calendar_today,
                      size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    '${_formatDate(occurrence['occurrenceDate'])} at ${occurrence['occurrenceTime']}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
              if (occurrence['locationPlaceName'] != null) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        occurrence['locationPlaceName'],
                        style:
                            const TextStyle(fontSize: 12, color: Colors.grey),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],

              // Objections indicator
              if (occurrence['objections'] != null &&
                  (occurrence['objections'] as List).isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.purple.shade50,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.gavel, size: 14, color: Colors.purple),
                      const SizedBox(width: 4),
                      Text(
                        '${(occurrence['objections'] as List).length} objection(s) filed',
                        style:
                            const TextStyle(fontSize: 12, color: Colors.purple),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        border: Border.all(color: color, width: 1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status) {
      case 'RESOLVED':
        color = Colors.green;
        break;
      case 'DISPUTED':
        color = Colors.purple;
        break;
      default:
        color = Colors.orange;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  String _formatCategory(String category) {
    return category
        .replaceAll('_', ' ')
        .split(' ')
        .map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase())
        .join(' ');
  }

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    return '${date.day}/${date.month}/${date.year}';
  }
}
