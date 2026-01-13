import 'package:flutter/material.dart';

class RatePassengerScreen extends StatefulWidget {
  final String rideId;
  final String passengerName;

  const RatePassengerScreen(
      {super.key, required this.rideId, required this.passengerName});

  @override
  State<RatePassengerScreen> createState() => _RatePassengerScreenState();
}

class _RatePassengerScreenState extends State<RatePassengerScreen> {
  int _rating = 0;
  final _commentController = TextEditingController();

  void _submit() {
    if (_rating == 0) return;
    // API Call: POST /ratings
    debugPrint('Rating Passenger: $_rating stars');
    Navigator.of(context)
        .popUntil((route) => route.isFirst); // Back to home/map
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rate Passenger')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Text('How was ${widget.passengerName}?',
                style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return IconButton(
                  icon: Icon(
                    index < _rating ? Icons.star : Icons.star_border,
                    color: Colors.amber,
                    size: 40,
                  ),
                  onPressed: () => setState(() => _rating = index + 1),
                );
              }),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _commentController,
              decoration: const InputDecoration(
                labelText: 'Feedback (optional)',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: _rating > 0 ? _submit : null,
              style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50)),
              child: const Text('SUBMIT'),
            ),
          ],
        ),
      ),
    );
  }
}
