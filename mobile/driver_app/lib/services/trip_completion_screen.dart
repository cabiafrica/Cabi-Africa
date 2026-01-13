import 'package:flutter/material.dart';
import '../../services/ride_service.dart';

class TripCompletionScreen extends StatefulWidget {
  final String tripId;

  const TripCompletionScreen({super.key, required this.tripId});

  @override
  State<TripCompletionScreen> createState() => _TripCompletionScreenState();
}

class _TripCompletionScreenState extends State<TripCompletionScreen> {
  final RideService _rideService = RideService();
  bool _isLoading = false;
  double? _finalFare;
  bool _isPaymentConfirmed = false;

  Future<void> _completeTrip() async {
    setState(() => _isLoading = true);
    try {
      final fare = await _rideService.completeTrip(widget.tripId);
      if (mounted) {
        setState(() {
          _finalFare = fare;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error completing trip: $e')));
      }
    }
  }

  Future<void> _confirmCash() async {
    setState(() => _isLoading = true);
    try {
      await _rideService.confirmCashPayment(widget.tripId, _finalFare!);
      if (mounted) {
        setState(() {
          _isPaymentConfirmed = true;
          _isLoading = false;
        });
        // Navigate to rating or home screen
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Trip finalized!')));
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Trip in Progress')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_finalFare == null) ...[
              const Text(
                'Arrived at Destination?',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _isLoading ? null : _completeTrip,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.green,
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'COMPLETE TRIP',
                        style: TextStyle(fontSize: 18),
                      ),
              ),
            ] else ...[
              const Icon(Icons.check_circle, color: Colors.green, size: 64),
              const SizedBox(height: 16),
              Text(
                'Fare: KES ${_finalFare!.toStringAsFixed(2)}',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Waiting for passenger payment...',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
              const SizedBox(height: 32),
              OutlinedButton(
                onPressed:
                    _isLoading || _isPaymentConfirmed ? null : _confirmCash,
                child: const Text('CONFIRM CASH RECEIVED'),
              ),
              if (_isPaymentConfirmed)
                const Padding(
                  padding: EdgeInsets.only(top: 16.0),
                  child: Text(
                    'Payment Confirmed',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }
}
