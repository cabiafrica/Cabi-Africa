import 'package:flutter/material.dart';
import 'package:driver_app/widgets/back_to_back_offer_widget.dart';

class TripInProgressScreen extends StatefulWidget {
  const TripInProgressScreen({super.key});

  @override
  State<TripInProgressScreen> createState() => _TripInProgressScreenState();
}

class _TripInProgressScreenState extends State<TripInProgressScreen> {
  bool _showOffer = false;

  void _handleOfferAccepted() {
    setState(() {
      _showOffer = false;
    });
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Next trip accepted!')));
  }

  void _handleOfferDeclined() {
    setState(() {
      _showOffer = false;
    });
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Trip offer declined.')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Trip in Progress')),
      body: Stack(
        children: [
          // This would be the map and navigation UI
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Navigating to destination...'),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => setState(() {
                    _showOffer = true;
                  }),
                  child: const Text('Simulate Receiving B2B Offer'),
                ),
              ],
            ),
          ),
          if (_showOffer)
            BackToBackOfferWidget(
              onAccept: _handleOfferAccepted,
              onDecline: _handleOfferDeclined,
            ),
        ],
      ),
    );
  }
}
