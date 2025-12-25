import 'package:flutter/foundation.dart';

class SupportTicket {
  final String id;
  final String issueType;
  final String status;
  final DateTime reportedDate;
  final String initialComments;
  final List<Map<String, String>> replies;

  SupportTicket({
    required this.id,
    required this.issueType,
    required this.status,
    required this.reportedDate,
    required this.initialComments,
    this.replies = const [],
  });
}

class SupportService {
  /// Simulates submitting an issue report for a specific ride.
  Future<void> reportIssue({
    required String rideId,
    required String issueType,
    required String comments,
  }) async {
    debugPrint('Submitting issue for ride $rideId: "$issueType"');
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));
    debugPrint('Issue report submitted successfully.');
  }

  /// Simulates fetching a list of the user's support tickets.
  Future<List<SupportTicket>> getSupportTickets() async {
    await Future.delayed(const Duration(seconds: 1)); // Simulate network

    return [
      SupportTicket(
        id: 'ticket-1',
        issueType: 'I lost an item',
        status: 'Resolved',
        reportedDate: DateTime.now().subtract(const Duration(days: 5)),
        initialComments: 'I left my sunglasses in the car.',
        replies: [
          {
            'sender': 'Support',
            'message':
                'We have contacted the driver and they have found your item. Please arrange a pickup.',
          },
        ],
      ),
      SupportTicket(
        id: 'ticket-2',
        issueType: 'I had an issue with the fare',
        status: 'In Review',
        reportedDate: DateTime.now().subtract(const Duration(days: 1)),
        initialComments: 'The final fare was much higher than the estimate.',
        replies: [
          {
            'sender': 'Support',
            'message':
                'Thank you for your report. We are reviewing the trip details and will get back to you shortly.',
          },
        ],
      ),
    ];
  }
}
