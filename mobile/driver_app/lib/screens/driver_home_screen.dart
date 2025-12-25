import 'package:flutter/material.dart';
import '../widgets/trip_offer_widget.dart';

class DriverHomeScreen extends StatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  State<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends State<DriverHomeScreen> {
  bool _isOnline = true;
  bool _hasOffer = false;

  void _handleOfferAccepted() {
    setState(() => _hasOffer = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Trip accepted! Navigating to pickup...')),
    );
    // In a real app, navigate to the in-app navigation screen.
  }

  void _handleOfferRejected() {
    setState(() => _hasOffer = false);
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Trip offer rejected.')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Home'),
        actions: [
          Switch(
            value: _isOnline,
            onChanged: (value) => setState(() => _isOnline = value),
          ),
        ],
      ),
      body: Stack(
        children: [
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  _isOnline
                      ? 'Online - Waiting for a trip...'
                      : 'You are Offline',
                ),
                const SizedBox(height: 20),
                if (_isOnline)
                  ElevatedButton(
                    onPressed: () => setState(() => _hasOffer = true),
                    child: const Text('Simulate Receiving Offer'),
                  ),
              ],
            ),
          ),
          if (_hasOffer)
            TripOfferWidget(
              onAccept: _handleOfferAccepted,
              onDecline: _handleOfferRejected,
            ),
        ],
      ),
    );
  }
}
