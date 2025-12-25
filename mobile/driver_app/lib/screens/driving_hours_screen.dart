import 'package:flutter/material.dart';

// Mock DTO - In a real app, this would be generated from the shared DTO library.
class DrivingHoursDto {
  final int timeOnlineTodaySeconds;
  final int timeOnlineThisWeekSeconds;
  final int weeklyLimitSeconds;

  DrivingHoursDto({
    required this.timeOnlineTodaySeconds,
    required this.timeOnlineThisWeekSeconds,
    required this.weeklyLimitSeconds,
  });
}

// Mock Service Call
Future<DrivingHoursDto> fetchDrivingHours() async {
  // Simulate network delay
  await Future.delayed(const Duration(seconds: 1));
  // In a real app, this would be an HTTP call to the backend.
  return DrivingHoursDto(
    timeOnlineTodaySeconds: 3 * 3600 + 15 * 60, // 3h 15m
    timeOnlineThisWeekSeconds: 25 * 3600, // 25h
    weeklyLimitSeconds: 60 * 3600, // 60h
  );
}

class DrivingHoursScreen extends StatefulWidget {
  const DrivingHoursScreen({super.key});

  @override
  State<DrivingHoursScreen> createState() => _DrivingHoursScreenState();
}

class _DrivingHoursScreenState extends State<DrivingHoursScreen> {
  late Future<DrivingHoursDto> _drivingHoursFuture;

  @override
  void initState() {
    super.initState();
    _drivingHoursFuture = fetchDrivingHours();
  }

  String _formatDuration(int totalSeconds) {
    final duration = Duration(seconds: totalSeconds);
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    return '${hours}h ${minutes}m';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Driving Hours')),
      body: FutureBuilder<DrivingHoursDto>(
        future: _drivingHoursFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData) {
            return const Center(child: Text('No data available.'));
          }

          final data = snapshot.data!;
          final remainingWeekly =
              data.weeklyLimitSeconds - data.timeOnlineThisWeekSeconds;

          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              ListTile(
                title: const Text('Time Online Today'),
                trailing: Text(_formatDuration(data.timeOnlineTodaySeconds)),
              ),
              ListTile(
                title: const Text('Time Online This Week'),
                trailing: Text(_formatDuration(data.timeOnlineThisWeekSeconds)),
              ),
              const Divider(),
              ListTile(
                title: const Text('Weekly Limit Remaining'),
                trailing: Text(_formatDuration(remainingWeekly)),
              ),
              LinearProgressIndicator(
                value: data.timeOnlineThisWeekSeconds / data.weeklyLimitSeconds,
              ),
            ],
          );
        },
      ),
    );
  }
}
