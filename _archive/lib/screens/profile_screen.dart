import 'package:flutter/material.dart';
import 'package:driver_app/src/screens/trip_history_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: ListView(
        children: [
          const SizedBox(height: 20),
          const CircleAvatar(
            radius: 50,
            // In a real app, this would be a NetworkImage
            child: Icon(Icons.person, size: 50),
          ),
          const SizedBox(height: 10),
          const Center(
            child: Text(
              'Driver Name', // Mock data
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
          ),
          const Center(
            child: Text(
              'driver@email.com', // Mock data
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ),
          const SizedBox(height: 20),
          const Divider(),
          const ListTile(
            leading: Icon(Icons.directions_car),
            title: Text('Vehicle'),
            subtitle: Text('Toyota Fielder - KDA 123X'), // Mock data
          ),
          const Divider(),
          // This new ListTile navigates to the Trip History screen
          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('Trip History'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const TripHistoryScreen(),
                ),
              );
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Sign Out', style: TextStyle(color: Colors.red)),
            onTap: () {
              // In a real app, call AuthService.signOut() and navigate to login
              ScaffoldMessenger.of(
                context,
              ).showSnackBar(const SnackBar(content: Text('Signing out...')));
            },
          ),
        ],
      ),
    );
  }
}
