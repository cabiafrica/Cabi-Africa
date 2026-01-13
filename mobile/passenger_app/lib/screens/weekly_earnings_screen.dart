import 'package:flutter/material.dart';

class WeeklyEarningsScreen extends StatefulWidget {
  const WeeklyEarningsScreen({super.key});

  @override
  State<WeeklyEarningsScreen> createState() => _WeeklyEarningsScreenState();
}

class _WeeklyEarningsScreenState extends State<WeeklyEarningsScreen> {
  // Mock state for date navigation
  DateTime _currentWeekStart = DateTime.now().subtract(
    Duration(days: DateTime.now().weekday - 1),
  );

  // Mock Data
  final List<Map<String, dynamic>> _dailyEarnings = [
    {'day': 'Mon', 'amount': 1200.0},
    {'day': 'Tue', 'amount': 1500.0},
    {'day': 'Wed', 'amount': 800.0},
    {'day': 'Thu', 'amount': 2000.0},
    {'day': 'Fri', 'amount': 2500.0},
    {'day': 'Sat', 'amount': 3000.0},
    {'day': 'Sun', 'amount': 1800.0},
  ];

  final List<Map<String, String>> _trips = [
    {'date': 'Mon, 10:00 AM', 'amount': 'KES 450', 'id': '#TRP-882'},
    {'date': 'Mon, 02:30 PM', 'amount': 'KES 750', 'id': '#TRP-883'},
    {'date': 'Tue, 09:15 AM', 'amount': 'KES 300', 'id': '#TRP-884'},
    {'date': 'Tue, 05:45 PM', 'amount': 'KES 1200', 'id': '#TRP-885'},
  ];

  double get _totalEarnings =>
      _dailyEarnings.fold(0, (sum, item) => sum + item['amount']);
  double get _maxDaily => _dailyEarnings.fold(
    0,
    (max, item) => item['amount'] > max ? item['amount'] : max,
  );

  void _changeWeek(int offset) {
    setState(() {
      _currentWeekStart = _currentWeekStart.add(Duration(days: offset * 7));
    });
  }

  @override
  Widget build(BuildContext context) {
    final bool isCurrentWeek = _currentWeekStart.isAfter(
      DateTime.now().subtract(const Duration(days: 7)),
    );
    final String weekRange =
        "${_currentWeekStart.day}/${_currentWeekStart.month} - ${_currentWeekStart.add(const Duration(days: 6)).day}/${_currentWeekStart.add(const Duration(days: 6)).month}";

    return Scaffold(
      appBar: AppBar(title: const Text('Weekly Report'), centerTitle: true),
      body: Column(
        children: [
          // Date Navigation
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left),
                  onPressed: () => _changeWeek(-1),
                ),
                Text(
                  weekRange,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  onPressed: isCurrentWeek ? null : () => _changeWeek(1),
                ),
              ],
            ),
          ),

          // Chart
          Container(
            height: 200,
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: _dailyEarnings.map((day) {
                final double heightFactor =
                    day['amount'] / (_maxDaily == 0 ? 1 : _maxDaily);
                return Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      width: 20,
                      height: 150 * heightFactor,
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      day['day'],
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 24),

          // Key Metrics
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildMetricCard(
                  'Total Earnings',
                  'KES ${_totalEarnings.toStringAsFixed(0)}',
                ),
                _buildMetricCard(
                  'Trips',
                  '${_trips.length + 12}',
                ), // Mock total
                _buildMetricCard('Online Hours', '34.5h'),
              ],
            ),
          ),

          const Divider(height: 32),

          // Trip List
          Expanded(
            child: ListView.builder(
              itemCount: _trips.length,
              itemBuilder: (context, index) {
                final trip = _trips[index];
                return ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Colors.green,
                    radius: 16,
                    child: Icon(Icons.check, size: 16, color: Colors.white),
                  ),
                  title: Text(trip['amount']!),
                  subtitle: Text('${trip['date']} • ${trip['id']}'),
                  trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ],
    );
  }
}
