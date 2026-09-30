import 'package:flutter/material.dart';
import '../services/ride_service.dart';

class RatePassengerScreen extends StatefulWidget {
  final String rideId;
  final String passengerName;
  final double finalFare;

  const RatePassengerScreen({
    super.key,
    required this.rideId,
    required this.passengerName,
    this.finalFare = 0.0,
  });

  @override
  State<RatePassengerScreen> createState() => _RatePassengerScreenState();
}

class _RatePassengerScreenState extends State<RatePassengerScreen> {
  final RideService _rideService = RideService();
  int _rating = 0;
  final _commentController = TextEditingController();
  bool _isSubmitting = false;
  bool _isCashConfirmed = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _confirmCash() async {
    setState(() => _isSubmitting = true);
    try {
      await _rideService.confirmCashPayment(widget.rideId, widget.finalFare);
      if (mounted) {
        setState(() {
          _isCashConfirmed = true;
          _isSubmitting = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Cash payment of KES ${widget.finalFare.toStringAsFixed(2)} confirmed!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error confirming cash: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _submitRating() async {
    if (_rating == 0 || _isSubmitting) return;
    setState(() => _isSubmitting = true);

    try {
      await _rideService.submitRating(
        tripId: widget.rideId,
        rating: _rating.toDouble(),
        comment: _commentController.text.trim().isEmpty ? null : _commentController.text.trim(),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Feedback recorded in occurrence book. Trip complete!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) {
          Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error submitting rating: $e'), backgroundColor: Colors.red),
        );
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rate Passenger'),
        backgroundColor: Colors.black,
        foregroundColor: const Color(0xFFF59E0B),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false),
        ),
      ),
      backgroundColor: const Color(0xFF121212),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // --- Cash Payment Section ---
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E1E),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _isCashConfirmed ? Colors.green : const Color(0xFFF59E0B),
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        _isCashConfirmed ? Icons.check_circle : Icons.payments_outlined,
                        color: _isCashConfirmed ? Colors.green : const Color(0xFFF59E0B),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _isCashConfirmed ? 'Payment Confirmed' : 'Confirm Cash Payment',
                        style: TextStyle(
                          color: _isCashConfirmed ? Colors.green : Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'KES ${widget.finalFare.toStringAsFixed(2)}',
                    style: TextStyle(
                      color: _isCashConfirmed ? Colors.green : const Color(0xFFF59E0B),
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (!_isCashConfirmed) ...[
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isSubmitting ? null : _confirmCash,
                        icon: _isSubmitting
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                              )
                            : const Icon(Icons.check, color: Colors.black),
                        label: const Text('MARK AS PAID', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFF59E0B),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24),

            // --- Rating Section ---
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E1E),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 36,
                    backgroundColor: Colors.black,
                    child: Icon(Icons.person_rounded, size: 40, color: Color(0xFFF59E0B)),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'How was ${widget.passengerName}?',
                    style: const TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Your feedback is registered in the occurrence book',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      return IconButton(
                        icon: Icon(
                          index < _rating ? Icons.star : Icons.star_border,
                          color: Colors.amber,
                          size: 44,
                        ),
                        onPressed: () => setState(() => _rating = index + 1),
                      );
                    }),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _commentController,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      labelText: 'Feedback / Comment (optional)',
                      labelStyle: TextStyle(color: Colors.grey),
                      border: OutlineInputBorder(),
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.grey),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Color(0xFFF59E0B)),
                      ),
                    ),
                    maxLines: 3,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: (_rating > 0 && !_isSubmitting) ? _submitRating : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                    )
                  : const Text('SUBMIT RATING', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),

            const SizedBox(height: 12),

            TextButton(
              onPressed: () => Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false),
              child: const Text('Skip Rating', style: TextStyle(color: Colors.grey)),
            ),
          ],
        ),
      ),
    );
  }
}
