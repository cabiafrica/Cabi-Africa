import 'package:flutter/material.dart';

class AirlineSelectionScreen extends StatelessWidget {
  final String airportName;
  final Function(String, String) onAirlineSelected; // airline, terminal

  AirlineSelectionScreen({
    super.key,
    required this.airportName,
    required this.onAirlineSelected,
  });

  final Map<String, String> _airlines = {
    'Delta Air Lines': 'Terminal 4',
    'JetBlue Airways': 'Terminal 5',
    'American Airlines': 'Terminal 8',
    'British Airways': 'Terminal 7',
    'Virgin Atlantic': 'Terminal 4',
    'Emirates': 'Terminal 4',
    'Lufthansa': 'Terminal 1',
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Flying from $airportName?')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.blue[50],
            child: Row(
              children: [
                Icon(Icons.flight_takeoff, color: Colors.blue[800]),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Select your airline for drop-off directly at the correct terminal.',
                    style: TextStyle(fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: const InputDecoration(
                labelText: 'Search Airline',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                // Filter logic would go here
              },
            ),
          ),
          Expanded(
            child: ListView.separated(
              itemCount: _airlines.length,
              separatorBuilder: (ctx, i) => const Divider(height: 1),
              itemBuilder: (ctx, index) {
                final airline = _airlines.keys.elementAt(index);
                final terminal = _airlines.values.elementAt(index);
                return ListTile(
                  leading: const Icon(Icons.airplanemode_active, size: 20, color: Colors.grey),
                  title: Text(airline),
                  subtitle: Text(terminal),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    onAirlineSelected(airline, terminal);
                    Navigator.pop(context);
                  },
                );
              },
            ),
          ),
          TextButton(
            onPressed: () {
              onAirlineSelected('Unknown', 'General Drop-off');
              Navigator.pop(context);
            },
            child: const Text('I DON\'T KNOW MY AIRLINE / JUST DROP ME OFF'),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
