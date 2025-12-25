import 'package:flutter/material.dart';

// In a real app, this DTO would be imported and populated with real data.
class TripOfferDto {
  final String tripId;
  final String pickupLocation;
  final String destination;
  final String estimatedFare;
  final String timeToPickup;

  TripOfferDto({
    required this.tripId,
    required this.pickupLocation,
    required this.destination,
    required this.estimatedFare,
    required this.timeToPickup,
  });
}

class TripOfferWidget extends StatelessWidget {
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  const TripOfferWidget({
    super.key,
    required this.onAccept,
    required this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    // Mock data for the offer
    final offer = TripOfferDto(
      tripId: 'trip-abc-123',
      pickupLocation: '456 Grand Ave',
      destination: 'City Museum',
      estimatedFare: '\$15.50',
      timeToPickup: '5 min',
    );

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Card(
        margin: const EdgeInsets.all(8.0),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'New Trip Offer - ${offer.timeToPickup} away',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              Text('Pickup: ${offer.pickupLocation}'),
              Text('Destination: ${offer.destination}'),
              Text('Fare: ~${offer.estimatedFare}'),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  ElevatedButton(
                    onPressed: onAccept,
                    child: const Text('Accept'),
                  ),
                  OutlinedButton(
                    onPressed: onDecline,
                    child: const Text('Decline'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
