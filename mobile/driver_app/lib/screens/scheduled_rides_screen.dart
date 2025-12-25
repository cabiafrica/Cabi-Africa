import 'package:flutter/material.dart';

class ScheduledRidesScreen extends StatefulWidget {
  const ScheduledRidesScreen({super.key});

  @override
  State<ScheduledRidesScreen> createState() => _ScheduledRidesScreenState();
}

class _ScheduledRidesScreenState extends State<ScheduledRidesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<Map<String, dynamic>> _opportunities = [
    {
      'id': 'sched-001',
      'time': 'Tomorrow, 8:00 AM - 8:15 AM',
      'pickup': 'Westlands',
      'dropoff': 'JKIA Airport',
      'fare': 'KSh 1,500',
      'distance': '18 km'
    },
    {
      'id': 'sched-002',
      'time': 'Tomorrow, 5:30 PM - 5:45 PM',
      'pickup': 'Upper Hill',
      'dropoff': 'Lavington',
      'fare': 'KSh 800',
      'distance': '6 km'
    },
    {
      'id': 'sched-003',
      'time': 'Wed, 7:00 AM',
      'pickup': 'Kilimani',
      'dropoff': 'CBD',
      'fare': 'KSh 600',
      'distance': '4 km'
    },
  ];

  final List<Map<String, dynamic>> _mySchedule = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  void _acceptRide(int index) {
    final ride = _opportunities[index];
    setState(() {
      _opportunities.removeAt(index);
      _mySchedule.add(ride);
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Ride accepted! added to My Schedule.'),
        backgroundColor: Colors.green,
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _cancelRide(int index) {
      final ride = _mySchedule[index];
      setState(() {
          _mySchedule.removeAt(index);
          _opportunities.add(ride);
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ride request cancelled.')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scheduled Rides'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Opportunities'),
            Tab(text: 'My Schedule'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Opportunities Tab
          _opportunities.isEmpty 
              ? const Center(child: Text('No new opportunities at the moment.'))
              : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _opportunities.length,
            itemBuilder: (context, index) {
              final ride = _opportunities[index];
              return Card(
                elevation: 3,
                margin: const EdgeInsets.only(bottom: 16),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(ride['time'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          Text(ride['fare'], style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green, fontSize: 16)),
                        ],
                      ),
                      const Divider(height: 24),
                      Row(
                        children: [
                          const Icon(Icons.circle, size: 12, color: Colors.blue),
                          const SizedBox(width: 8),
                          Expanded(child: Text('${ride['pickup']} (Approx.)', style: const TextStyle(color: Colors.grey))),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 12, color: Colors.red),
                          const SizedBox(width: 8),
                          Expanded(child: Text('${ride['dropoff']} (Approx.)', style: const TextStyle(color: Colors.grey))),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _acceptRide(index),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.deepPurple,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('ACCEPT RIDE'),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          // My Schedule Tab
          _mySchedule.isEmpty 
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                      const Icon(Icons.calendar_month, size: 60, color: Colors.grey),
                      const SizedBox(height: 16),
                      const Text('No rides scheduled yet.', style: TextStyle(fontSize: 18, color: Colors.grey)),
                      const SizedBox(height: 8),
                      TextButton(onPressed: () => _tabController.animateTo(0), child: const Text('Browse Opportunities'))
                  ],
              ) 
              : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _mySchedule.length,
            itemBuilder: (context, index) {
              final ride = _mySchedule[index];
              return Card(
                elevation: 3,
                margin: const EdgeInsets.only(bottom: 16),
                color: Colors.purple.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                       Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(ride['time'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const Chip(label: Text('Assigned', style: TextStyle(color: Colors.white, fontSize: 10)), backgroundColor: Colors.purple, visualDensity: VisualDensity.compact),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                          children: [
                              Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                     Text(ride['pickup'], style: const TextStyle(fontWeight: FontWeight.w500)),
                                     const Icon(Icons.arrow_downward, size: 14, color: Colors.grey),
                                     Text(ride['dropoff'], style: const TextStyle(fontWeight: FontWeight.w500)),
                                  ],
                              ),
                              const Spacer(),
                              Text(ride['fare'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.green)),
                          ],
                      ),
                      const SizedBox(height: 16),
                      OutlinedButton(
                          onPressed: () => _cancelRide(index),
                          style: OutlinedButton.styleFrom(foregroundColor: Colors.red, side: const BorderSide(color: Colors.red)),
                          child: const Text('CANCEL ASSIGNMENT'),
                      )
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
