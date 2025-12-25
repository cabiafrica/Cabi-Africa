import 'package:flutter/material.dart';

// Mock data models. In a real app, these would be generated from JSON.
class LostItemReport {
  final String ticketId;
  final String tripId;
  final String itemDescription;
  final String passengerName;
  final DateTime tripDate;

  LostItemReport({
    required this.ticketId,
    required this.tripId,
    required this.itemDescription,
    required this.passengerName,
    required this.tripDate,
  });
}

// Mock service. In a real app, this would make HTTP requests.
class LostItemService {
  Future<LostItemReport> getReportDetails(String ticketId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return LostItemReport(
      ticketId: ticketId,
      tripId: 'trip-abc-123',
      itemDescription: 'A black leather wallet with my ID and credit cards.',
      passengerName: 'John P.',
      tripDate: DateTime.now().subtract(const Duration(days: 1)),
    );
  }

  Future<void> respondToReport(String ticketId, bool found) async {
    await Future.delayed(const Duration(milliseconds: 800));
    print('Driver responded for ticket $ticketId. Found: $found');
    // In a real app, this would be a POST request to the support-service
  }
}

class LostItemResponseScreen extends StatefulWidget {
  final String ticketId;

  const LostItemResponseScreen({super.key, required this.ticketId});

  @override
  State<LostItemResponseScreen> createState() => _LostItemResponseScreenState();
}

class _LostItemResponseScreenState extends State<LostItemResponseScreen> {
  final LostItemService _service = LostItemService();
  late Future<LostItemReport> _reportFuture;

  @override
  void initState() {
    super.initState();
    _reportFuture = _service.getReportDetails(widget.ticketId);
  }

  Future<void> _submitResponse(bool found) async {
    await _service.respondToReport(widget.ticketId, found);
    Navigator.of(context).pop(); // Go back after responding
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Thank you for your response.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lost Item Report')),
      body: FutureBuilder<LostItemReport>(
        future: _reportFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Failed to load report details.'));
          }
          final report = snapshot.data!;
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Passenger ${report.passengerName} reported a lost item from your trip on ${report.tripDate.toLocal().toString().split(' ')[0]}.',
                ),
                const SizedBox(height: 16),
                const Text(
                  'Item Description:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(report.itemDescription),
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton(
                      onPressed: () => _submitResponse(false),
                      child: const Text("I did not find it"),
                    ),
                    ElevatedButton(
                      onPressed: () => _submitResponse(true),
                      child: const Text("I found the item"),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
