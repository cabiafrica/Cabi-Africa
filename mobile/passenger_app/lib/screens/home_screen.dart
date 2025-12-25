import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // Mock data for vehicle types
  final List<Map<String, dynamic>> _vehicleTypes = [
    {
      'name': 'Standard',
      'price': 'KES 350',
      'time': '5 min',
      'icon': Icons.local_taxi
    },
    {
      'name': 'XL',
      'price': 'KES 550',
      'time': '8 min',
      'icon': Icons.airport_shuttle
    },
    {
      'name': 'Boda',
      'price': 'KES 150',
      'time': '3 min',
      'icon': Icons.two_wheeler
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.menu, color: Colors.black),
            ),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              backgroundColor: Colors.white,
              child: IconButton(
                icon: const Icon(Icons.notifications_none, color: Colors.black),
                onPressed: () {},
              ),
            ),
          ),
        ],
      ),
      drawer: const Drawer(
        child: Center(child: Text('Menu Placeholder')),
      ),
      body: Stack(
        children: [
          // 1. Map Background (Placeholder)
          Container(
            color: Colors.grey[200],
            child: const Center(
              child: Text(
                'Google Map View',
                style: TextStyle(color: Colors.grey, fontSize: 18),
              ),
            ),
          ),

          // 2. Bottom Sheet for Booking
          DraggableScrollableSheet(
            initialChildSize: 0.4,
            minChildSize: 0.3,
            maxChildSize: 0.85,
            builder: (context, scrollController) {
              return Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black12, blurRadius: 10, spreadRadius: 2),
                  ],
                ),
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(24),
                  children: [
                    // Destination Input
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      child: Row(
                        children: const [
                          Icon(Icons.search, color: Colors.black54),
                          SizedBox(width: 12),
                          Text(
                            "Where to?",
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.black87),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Shortcuts (Home/Work)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildShortcutItem(Icons.home_filled, "Home"),
                        _buildShortcutItem(Icons.work, "Work"),
                        _buildShortcutItem(Icons.star, "Saved"),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Recent Rides / Suggestions
                    const Text(
                      "Choose your ride",
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    ..._vehicleTypes
                        .map((vehicle) => _buildVehicleOption(vehicle))
                        .toList(),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildShortcutItem(IconData icon, String label) {
    return Column(
      children: [
        CircleAvatar(
          radius: 28,
          backgroundColor: Colors.grey[200],
          child: Icon(icon, color: Colors.black87),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildVehicleOption(Map<String, dynamic> vehicle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[200]!),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Image.network(
            // Placeholder car image or icon
            'https://cdn-icons-png.flaticon.com/512/3097/3097180.png',
            height: 50,
            width: 80,
            errorBuilder: (c, o, s) => Icon(vehicle['icon'], size: 40),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(vehicle['name'],
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold)),
                Text(vehicle['time'],
                    style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ),
          Text(vehicle['price'],
              style:
                  const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
