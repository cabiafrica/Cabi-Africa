import 'package:flutter/material.dart';

// Mock DTOs - In a real app, these would be generated.
class OrganizationDriverDto {
  final String driverId;
  final String driverName;
  final DateTime joinedAt;

  OrganizationDriverDto({
    required this.driverId,
    required this.driverName,
    required this.joinedAt,
  });
}

class OrganizationJoinRequestDto {
  final String requestId;
  final String driverName;
  final DateTime requestedAt;

  OrganizationJoinRequestDto({
    required this.requestId,
    required this.driverName,
    required this.requestedAt,
  });
}

class OrganizationManagementDashboardDto {
  final List<OrganizationDriverDto> members;
  final List<OrganizationJoinRequestDto> pendingRequests;

  OrganizationManagementDashboardDto({
    required this.members,
    required this.pendingRequests,
  });
}

class OrganizationManagementScreen extends StatefulWidget {
  const OrganizationManagementScreen({super.key});

  @override
  State<OrganizationManagementScreen> createState() =>
      _OrganizationManagementScreenState();
}

class _OrganizationManagementScreenState
    extends State<OrganizationManagementScreen> {
  late Future<OrganizationManagementDashboardDto> _dashboardFuture;

  @override
  void initState() {
    super.initState();
    _dashboardFuture = _fetchDashboard();
  }

  Future<OrganizationManagementDashboardDto> _fetchDashboard() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));
    return OrganizationManagementDashboardDto(
      members: [
        OrganizationDriverDto(
          driverId: 'driver-1',
          driverName: 'John Doe',
          joinedAt: DateTime.now().subtract(const Duration(days: 10)),
        ),
        OrganizationDriverDto(
          driverId: 'driver-2',
          driverName: 'Jane Smith',
          joinedAt: DateTime.now().subtract(const Duration(days: 5)),
        ),
      ],
      pendingRequests: [
        OrganizationJoinRequestDto(
          requestId: 'req-1',
          driverName: 'Peter Jones',
          requestedAt: DateTime.now().subtract(const Duration(hours: 2)),
        ),
      ],
    );
  }

  Future<void> _handleRequest(String requestId, bool approve) async {
    // Mock API call
    debugPrint(
        'Handling request $requestId: ${approve ? 'Approving' : 'Denying'}');
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
      _dashboardFuture = _fetchDashboard(); // Refresh data
    });
  }

  Future<void> _removeDriver(String driverId) async {
    // Mock API call
    debugPrint('Removing driver $driverId');
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
      _dashboardFuture = _fetchDashboard(); // Refresh data
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Organization')),
      body: FutureBuilder<OrganizationManagementDashboardDto>(
        future: _dashboardFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(
              child: Text('Could not load organization data.'),
            );
          }

          final dashboard = snapshot.data!;

          return ListView(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Pending Requests',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              ...dashboard.pendingRequests.map(
                (req) => ListTile(
                  title: Text(req.driverName),
                  subtitle: Text('Requested: ${req.requestedAt.toLocal()}'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.check, color: Colors.green),
                        onPressed: () => _handleRequest(req.requestId, true),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.red),
                        onPressed: () => _handleRequest(req.requestId, false),
                      ),
                    ],
                  ),
                ),
              ),
              if (dashboard.pendingRequests.isEmpty)
                const ListTile(title: Text('No pending requests.')),
              const Divider(),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Members',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              ...dashboard.members.map(
                (member) => ListTile(
                  title: Text(member.driverName),
                  subtitle: Text(
                    'Joined: ${member.joinedAt.toLocal().toString().split(' ')[0]}',
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.person_remove, color: Colors.red),
                    onPressed: () => _removeDriver(member.driverId),
                  ),
                ),
              ),
              if (dashboard.members.isEmpty)
                const ListTile(title: Text('No members yet.')),
            ],
          );
        },
      ),
    );
  }
}
