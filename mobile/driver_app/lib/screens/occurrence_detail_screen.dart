import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class OccurrenceDetailScreen extends StatefulWidget {
  final String occurrenceId;

  const OccurrenceDetailScreen({super.key, required this.occurrenceId});

  @override
  State<OccurrenceDetailScreen> createState() => _OccurrenceDetailScreenState();
}

class _OccurrenceDetailScreenState extends State<OccurrenceDetailScreen> {
  Map<String, dynamic>? occurrence;
  bool isLoading = true;
  bool showObjectionForm = false;
  final objectionController = TextEditingController();
  bool isSubmitting = false;

  @override
  void initState() {
    super.initState();
    loadOccurrence();
  }

  @override
  void dispose() {
    objectionController.dispose();
    super.dispose();
  }

  Future<void> loadOccurrence() async {
    setState(() => isLoading = true);

    try {
      final response = await http.get(
        Uri.parse('http://10.0.2.2:3005/occurrences/${widget.occurrenceId}'),
      );

      if (response.statusCode == 200) {
        setState(() {
          occurrence = json.decode(response.body);
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() => isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load occurrence: $e')),
        );
      }
    }
  }

  Future<void> submitObjection() async {
    if (objectionController.text.trim().length < 20) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Please provide at least 20 characters explaining your objection'),
        ),
      );
      return;
    }

    setState(() => isSubmitting = true);

    try {
      const userId = 'current-user-id'; // Get from auth
      final response = await http.post(
        Uri.parse('http://10.0.2.2:3005/objections'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'occurrenceId': widget.occurrenceId,
          'objectorId': userId,
          'objectionText': objectionController.text.trim(),
        }),
      );

      if (response.statusCode == 201) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                  'Objection filed successfully! It will be reviewed by our team.'),
              backgroundColor: Colors.green,
            ),
          );
          setState(() {
            showObjectionForm = false;
            objectionController.clear();
          });
          loadOccurrence();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to file objection: $e')),
        );
      }
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Occurrence Details'),
          backgroundColor: const Color(0xFFDC2626),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (occurrence == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Occurrence Details'),
          backgroundColor: const Color(0xFFDC2626),
        ),
        body: const Center(child: Text('Occurrence not found')),
      );
    }

    final canFileObjection = occurrence!['status'] != 'RESOLVED' &&
        (occurrence!['objections'] == null ||
            (occurrence!['objections'] as List).every(
              (obj) => obj['status'] == 'REJECTED',
            ));

    return Scaffold(
      appBar: AppBar(
        title: Text(occurrence!['obNumber']),
        backgroundColor: const Color(0xFFDC2626),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color(0xFFDC2626),
                    Color(0xFFB91C1C),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    occurrence!['title'],
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),

            // Badges
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.grey[100],
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildCategoryBadge(occurrence!['category']),
                  _buildSeverityBadge(occurrence!['severity']),
                  _buildStatusBadge(occurrence!['status']),
                ],
              ),
            ),

            // Time, Date & Place
            _buildSection(
              title: '📅 TIME, DATE & PLACE',
              color: const Color(0xFFDC2626),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDetailRow(
                      'Date', _formatDate(occurrence!['occurrenceDate'])),
                  _buildDetailRow('Time', occurrence!['occurrenceTime']),
                  if (occurrence!['locationPlaceName'] != null)
                    _buildDetailRow(
                        'Location', occurrence!['locationPlaceName']),
                  if (occurrence!['locationAddress'] != null)
                    _buildDetailRow('Address', occurrence!['locationAddress']),
                  if (occurrence!['locationCity'] != null)
                    _buildDetailRow('City', occurrence!['locationCity']),
                ],
              ),
            ),

            // Description
            _buildSection(
              title: 'Description',
              child: Text(
                occurrence!['description'],
                style: const TextStyle(fontSize: 15, height: 1.5),
              ),
            ),

            // Tags
            if (occurrence!['tags'] != null &&
                (occurrence!['tags'] as List).isNotEmpty)
              _buildSection(
                title: 'Tags',
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: (occurrence!['tags'] as List)
                      .map((tag) => Chip(
                            label: Text(tag),
                            backgroundColor: Colors.grey[200],
                          ))
                      .toList(),
                ),
              ),

            // Resolution
            if (occurrence!['status'] == 'RESOLVED' &&
                occurrence!['resolutionNotes'] != null)
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  border: Border.all(color: Colors.green, width: 2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.check_circle, color: Colors.green),
                        SizedBox(width: 8),
                        Text(
                          'Resolution',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    if (occurrence!['resolvedAt'] != null)
                      Text(
                        'Resolved on ${_formatDate(occurrence!['resolvedAt'])}',
                        style:
                            TextStyle(fontSize: 12, color: Colors.green[700]),
                      ),
                    const SizedBox(height: 8),
                    Text(occurrence!['resolutionNotes']),
                  ],
                ),
              ),

            // Objections
            if (occurrence!['objections'] != null &&
                (occurrence!['objections'] as List).isNotEmpty)
              _buildSection(
                title: '⚖️ Your Objections',
                child: Column(
                  children:
                      (occurrence!['objections'] as List).map((objection) {
                    return _buildObjectionCard(objection);
                  }).toList(),
                ),
              ),

            // File Objection Button
            if (canFileObjection && !showObjectionForm)
              Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => setState(() => showObjectionForm = true),
                    icon: const Icon(Icons.gavel),
                    label: const Text('File an Objection'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFDC2626),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.all(16),
                    ),
                  ),
                ),
              ),

            // Objection Form
            if (showObjectionForm)
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  border: Border.all(color: Colors.red, width: 2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'File an Objection',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Explain why you believe this occurrence record is incorrect or unfair.',
                      style: TextStyle(fontSize: 14, color: Colors.black87),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: objectionController,
                      maxLines: 5,
                      decoration: const InputDecoration(
                        hintText:
                            'Provide a detailed explanation (minimum 20 characters)...',
                        border: OutlineInputBorder(),
                        filled: true,
                        fillColor: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: isSubmitting ? null : submitObjection,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFDC2626),
                              foregroundColor: Colors.white,
                            ),
                            child: isSubmitting
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Submit Objection'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton(
                          onPressed: () =>
                              setState(() => showObjectionForm = false),
                          child: const Text('Cancel'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(
      {required String title, required Widget child, Color? color}) {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color ?? Colors.black87,
            ),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryBadge(String category) {
    final colors = {
      'CRIME': const Color(0xFFDC2626),
      'TRAFFIC_OFFENSE': const Color(0xFFEA580C),
      'HARASSMENT': const Color(0xFF9333EA),
    };
    final color = colors[category] ?? Colors.grey;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        border: Border.all(color: color, width: 2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        category.replaceAll('_', ' '),
        style:
            TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
      ),
    );
  }

  Widget _buildSeverityBadge(String severity) {
    final colors = {
      'CRITICAL': const Color(0xFFDC2626),
      'HIGH': const Color(0xFFEA580C),
      'MEDIUM': const Color(0xFFF59E0B),
      'LOW': const Color(0xFF10B981),
    };
    final color = colors[severity] ?? Colors.grey;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        '$severity SEVERITY',
        style:
            TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        status,
        style:
            TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
      ),
    );
  }

  Widget _buildObjectionCard(Map<String, dynamic> objection) {
    Color statusColor;
    switch (objection['status']) {
      case 'ACCEPTED':
        statusColor = Colors.green;
        break;
      case 'REJECTED':
        statusColor = Colors.red;
        break;
      default:
        statusColor = Colors.orange;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.1),
        border: Border.all(color: statusColor, width: 2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Filed on ${_formatDate(objection['createdAt'])}',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  objection['status'],
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(objection['objectionText']),
          if (objection['reviewNotes'] != null) ...[
            const Divider(height: 24),
            const Text(
              'Admin Response:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
            const SizedBox(height: 4),
            Text(
              objection['reviewNotes'],
              style: const TextStyle(fontSize: 13),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    return '${date.day}/${date.month}/${date.year}';
  }
}
