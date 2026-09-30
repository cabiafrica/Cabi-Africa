import 'package:flutter/material.dart';
import '../services/ride_service.dart';

class RateDriverScreen extends StatefulWidget {
  final String rideId;
  final String driverName;

  const RateDriverScreen(
      {super.key, required this.rideId, required this.driverName});

  @override
  State<RateDriverScreen> createState() => _RateDriverScreenState();
}

class _RateDriverScreenState extends State<RateDriverScreen> {
  final RideService _rideService = RideService();
  int _rating = 0;
  int? _selectedTipPercent;
  double? _customTip;
  final _commentController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _submit() async {
    if (_rating == 0 || _isSubmitting) return;
    setState(() => _isSubmitting = true);

    try {
      await _rideService.rateDriver(
        widget.rideId,
        _rating,
        _commentController.text,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Thank you! Feedback recorded in occurrence book.')),
        );
        Navigator.of(context).popUntil((route) => route.isFirst); // Back to home
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error submitting rating: $e')),
        );
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rate Your Trip')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFF59E0B), width: 2.5),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
                    blurRadius: 16,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const CircleAvatar(
                radius: 40,
                backgroundColor: Colors.black,
                child: Icon(Icons.person_rounded, size: 44, color: Color(0xFFF59E0B)),
              ),
            ),
            const SizedBox(height: 16),
            Text('How was your ride with ${widget.driverName}?',
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
            const Text('Add a Tip',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              children: [10, 15, 20].map((percent) {
                final isSelected = _selectedTipPercent == percent;
                return ChoiceChip(
                  label: Text('$percent%'),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      _selectedTipPercent = selected ? percent : null;
                      _customTip = null;
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _commentController,
              decoration: const InputDecoration(
                labelText: 'Leave a comment (optional)',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: _rating > 0 ? _submit : null,
              style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50)),
              child: Text(_selectedTipPercent != null || _customTip != null
                  ? 'SUBMIT RATING & TIP'
                  : 'SUBMIT RATING'),
            ),
          ],
        ),
      ),
    );
  }
}
