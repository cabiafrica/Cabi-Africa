import 'package:flutter/material.dart';
import 'chat_screen.dart';

class ActiveTripScreen extends StatelessWidget {
  // In a real app, this would be part of the trip state
  final String tripId = 'trip-12345';
  final String currentUserId = 'driver-xyz';

  const ActiveTripScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Trip in Progress')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('You are on an active trip.'),
            SizedBox(height: 20),
            ElevatedButton.icon(
              icon: Icon(Icons.chat),
              label: Text('Chat with Passenger'),
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) =>
                      ChatScreen(tripId: tripId, currentUserId: currentUserId),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
