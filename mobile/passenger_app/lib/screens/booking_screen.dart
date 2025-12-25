import 'package:flutter/material.dart';
import '../widgets/promo_code_input_widget.dart';
import '../widgets/vehicle_selection_widget.dart';

class BookingScreen extends StatelessWidget {
  const BookingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Book a Ride')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Mock booking details
            const Text('Origin: 123 Home St'),
            const Text('Destination: 456 Work Ave'),
            const SizedBox(height: 16),
            const VehicleSelectionWidget(),
            const SizedBox(height: 16),
            const Divider(),
            const PromoCodeInputWidget(),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // Mock confirm booking action
                },
                child: const Text('Confirm Booking'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
