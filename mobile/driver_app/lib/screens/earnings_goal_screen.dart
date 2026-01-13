import 'package:flutter/material.dart';
import 'package:driver_app/widgets/driver_analytics_cards.dart';

class EarningsGoalScreen extends StatelessWidget {
  const EarningsGoalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Score Matrix'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      backgroundColor: Colors.grey[50], // Light background for the cards
      body: const SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: DriverAnalyticsCards(),
      ),
    );
  }
}
