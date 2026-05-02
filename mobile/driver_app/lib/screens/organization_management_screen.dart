import 'package:flutter/material.dart';
import 'package:driver_app/theme/app_theme.dart';

// DTOs - In a real app, these would be generated.
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
    // Mock API call - Sanitized
    await Future.delayed(const Duration(seconds: 1));
    return OrganizationManagementDashboardDto(
      members: [
        OrganizationDriverDto(
          driverId: 'driver-1',
          driverName: 'ELITE AGENT 001',
          joinedAt: DateTime.now().subtract(const Duration(days: 30)),
        ),
        OrganizationDriverDto(
          driverId: 'driver-2',
          driverName: 'PRESTIGE DRIVER A',
          joinedAt: DateTime.now().subtract(const Duration(days: 15)),
        ),
      ],
      pendingRequests: [
        OrganizationJoinRequestDto(
          requestId: 'req-1',
          driverName: 'PENDING APPLICANT',
          requestedAt: DateTime.now().subtract(const Duration(hours: 4)),
        ),
      ],
    );
  }

  Future<void> _handleRequest(String requestId, bool approve) async {
    debugPrint('Handling request $requestId: ${approve ? 'Approving' : 'Denying'}');
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() {
      _dashboardFuture = _fetchDashboard(); 
    });
  }

  Future<void> _removeDriver(String driverId) async {
    debugPrint('Removing driver $driverId');
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() {
      _dashboardFuture = _fetchDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('ORGANIZATION PORTAL', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 1)),
        backgroundColor: AppTheme.darkSurface,
        elevation: 0,
      ),
      body: FutureBuilder<OrganizationManagementDashboardDto>(
        future: _dashboardFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Could not load data.', style: TextStyle(color: AppTheme.darkTextSecondary)));
          }

          final dashboard = snapshot.data!;

          return ListView(
            padding: const EdgeInsets.symmetric(vertical: 16),
            children: [
              _buildSectionHeader('PENDING REQUESTS'),
              ...dashboard.pendingRequests.map((req) => _buildRequestCard(req)),
              if (dashboard.pendingRequests.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('No pending requests.', style: TextStyle(color: AppTheme.darkTextSecondary, fontSize: 13)),
                ),
              
              const SizedBox(height: 24),
              _buildSectionHeader('ACTIVE MEMBERS'),
              ...dashboard.members.map((member) => _buildMemberCard(member)),
              if (dashboard.members.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('No members yet.', style: TextStyle(color: AppTheme.darkTextSecondary, fontSize: 13)),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
      child: Text(
        title,
        style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.5),
      ),
    );
  }

  Widget _buildRequestCard(OrganizationJoinRequestDto req) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.2)),
      ),
      child: ListTile(
        title: Text(req.driverName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text('Requested: ${req.requestedAt.toLocal().toString().split(' ')[0]}', style: const TextStyle(color: AppTheme.darkTextSecondary, fontSize: 11)),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.check_circle_outline, color: Colors.green),
              onPressed: () => _handleRequest(req.requestId, true),
            ),
            IconButton(
              icon: const Icon(Icons.cancel_outlined, color: Colors.red),
              onPressed: () => _handleRequest(req.requestId, false),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMemberCard(OrganizationDriverDto member) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
          child: const Icon(Icons.person, color: AppTheme.primaryColor, size: 20),
        ),
        title: Text(member.driverName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text('Joined: ${member.joinedAt.toLocal().toString().split(' ')[0]}', style: const TextStyle(color: AppTheme.darkTextSecondary, fontSize: 11)),
        trailing: IconButton(
          icon: const Icon(Icons.remove_circle_outline, color: AppTheme.darkTextSecondary, size: 20),
          onPressed: () => _removeDriver(member.driverId),
        ),
      ),
    );
  }
}

