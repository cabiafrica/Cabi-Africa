import 'package:flutter/material.dart';

// In a real app, this DTO would be imported and populated with real data.
class BackToBackTripOfferDto {
  final String pickupLocation;
  final String timeToPickup;
  final String distanceToPickup;

  BackToBackTripOfferDto({
    required this.pickupLocation,
    required this.timeToPickup,
    required this.distanceToPickup,
  });
}

class BackToBackOfferWidget extends StatelessWidget {
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  const BackToBackOfferWidget({
    super.key,
    required this.onAccept,
    required this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    // Mock data for the offer
    final offer = BackToBackTripOfferDto(
      pickupLocation: '123 Main St',
      timeToPickup: '3 min',
      distanceToPickup: '0.8 mi',
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
              const Text(
                'New Trip Offer',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              Text('${offer.timeToPickup} away (${offer.distanceToPickup})'),
              Text('Pickup: ${offer.pickupLocation}'),
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
