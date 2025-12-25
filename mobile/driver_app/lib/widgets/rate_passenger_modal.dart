import 'package:flutter/material.dart';
import '../services/ride_service.dart';

class RatePassengerModal extends StatefulWidget {
  final RideService rideService;
  final String rideId;
  final String passengerName;

  const RatePassengerModal({
    super.key,
    required this.rideService,
    required this.rideId,
    required this.passengerName,
  });

  @override
  State<RatePassengerModal> createState() => _RatePassengerModalState();
}

class _RatePassengerModalState extends State<RatePassengerModal> {
  int _rating = 0;
  bool _isSubmitting = false;

  void _submitRating() async {
    if (_rating == 0) return;

    setState(() => _isSubmitting = true);

    try {
      await widget.rideService.ratePassenger(widget.rideId, _rating);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Thank you for your feedback!')),
        );
        Navigator.of(context).pop(); // Close the modal
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to submit rating: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Rate Your Passenger',
            style: Theme.of(context).textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            widget.passengerName,
            style: Theme.of(context).textTheme.titleMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
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
          _isSubmitting
              ? const Center(child: CircularProgressIndicator())
              : ElevatedButton(
                  onPressed: _rating > 0 ? _submitRating : null,
                  child: const Text('Submit Rating'),
                ),
        ],
      ),
    );
  }
}
