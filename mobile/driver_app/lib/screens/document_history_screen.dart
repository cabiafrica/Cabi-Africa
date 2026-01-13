import 'package:flutter/material.dart';

// --- MOCK MODELS AND SERVICES FOR DEMONSTRATION ---

enum HistoryFilterStatus { all, pending, approved, rejected }

class DocumentSubmission {
  final String id;
  final String status;
  final String submittedAt;
  final String? rejectionReason;

  DocumentSubmission({
    required this.id,
    required this.status,
    required this.submittedAt,
    this.rejectionReason,
  });

  factory DocumentSubmission.fromJson(Map<String, dynamic> json) {
    return DocumentSubmission(
      id: json['id'],
      status: json['status'],
      submittedAt: json['submittedAt'],
      rejectionReason: json['rejectionReason'],
    );
  }
}

class DocumentHistoryService {
  const DocumentHistoryService();

  Future<List<DocumentSubmission>> fetchDocumentHistory(
    String docType, {
    HistoryFilterStatus filter = HistoryFilterStatus.all,
  }) async {
    debugPrint(
      "Fetching history for '$docType' with filter '${filter.name}' from mock service...",
    );
    await Future.delayed(const Duration(milliseconds: 800));
    // In a real app, this would make an HTTP GET request to `/api/admin/documents/driver/:userId/history?docType=...&status=...`
    final mockApiResponse = [
      {
        "id": "sub-2",
        "docType": "Driver's License",
        "userId": "driver-123",
        "submittedAt": "2024-08-20T11:00:00Z",
        "status": "Pending Review",
        "rejectionReason": null,
      },
      {
        "id": "sub-1",
        "docType": "Driver's License",
        "userId": "driver-123",
        "submittedAt": "2024-08-19T10:00:00Z",
        "status": "Rejected",
        "rejectionReason": "Photo was blurry.",
      },
    ];

    var submissions = mockApiResponse
        .where((s) => s['docType'] == docType)
        .map((s) => DocumentSubmission.fromJson(s))
        .toList();

    if (filter != HistoryFilterStatus.all) {
      submissions = submissions
          .where(
            (s) => s.status.toLowerCase().contains(filter.name.toLowerCase()),
          )
          .toList();
    }

    return submissions;
  }
}

// --- WIDGET IMPLEMENTATION ---

class DocumentHistoryScreen extends StatefulWidget {
  final String docType;
  final DocumentHistoryService historyService;

  const DocumentHistoryScreen({
    super.key,
    required this.docType,
    this.historyService = const DocumentHistoryService(),
  });

  @override
  State<DocumentHistoryScreen> createState() => _DocumentHistoryScreenState();
}

class _DocumentHistoryScreenState extends State<DocumentHistoryScreen> {
  late Future<List<DocumentSubmission>> _historyFuture;
  HistoryFilterStatus _selectedFilter = HistoryFilterStatus.all;

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  void _fetchHistory() {
    _historyFuture = widget.historyService.fetchDocumentHistory(
      widget.docType,
      filter: _selectedFilter,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${widget.docType} History')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: SegmentedButton<HistoryFilterStatus>(
              segments: const [
                ButtonSegment(
                  value: HistoryFilterStatus.all,
                  label: Text('All'),
                ),
                ButtonSegment(
                  value: HistoryFilterStatus.pending,
                  label: Text('Pending'),
                ),
                ButtonSegment(
                  value: HistoryFilterStatus.approved,
                  label: Text('Approved'),
                ),
                ButtonSegment(
                  value: HistoryFilterStatus.rejected,
                  label: Text('Rejected'),
                ),
              ],
              selected: {_selectedFilter},
              onSelectionChanged: (newSelection) {
                setState(() {
                  _selectedFilter = newSelection.first;
                  _fetchHistory();
                });
              },
            ),
          ),
          Expanded(
            child: FutureBuilder<List<DocumentSubmission>>(
              future: _historyFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                }
                final history = snapshot.data;
                if (history == null || history.isEmpty) {
                  return const Center(
                    child: Text('No submission history found.'),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(8.0),
                  itemCount: history.length,
                  itemBuilder: (context, index) {
                    return DocumentHistoryCard(
                      submission: history[index],
                      submissionNumber: history.length - index,
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class DocumentHistoryCard extends StatelessWidget {
  final DocumentSubmission submission;
  final int submissionNumber;

  const DocumentHistoryCard({
    super.key,
    required this.submission,
    required this.submissionNumber,
  });

  @override
  Widget build(BuildContext context) {
    // Basic date formatting
    final submittedDate = DateTime.parse(submission.submittedAt);
    final formattedDate =
        '${submittedDate.day}/${submittedDate.month}/${submittedDate.year}';

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Submission #$submissionNumber',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(formattedDate),
                Chip(label: Text(submission.status.replaceAll(' Review', ''))),
              ],
            ),
            if (submission.rejectionReason != null) ...[
              const Divider(height: 24),
              Text(
                'Rejection Reason:',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              Text(submission.rejectionReason!),
            ],
          ],
        ),
      ),
    );
  }
}
