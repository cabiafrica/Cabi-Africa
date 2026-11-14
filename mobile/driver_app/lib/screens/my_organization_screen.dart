import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../config/app_config.dart';
import '../widgets/secure_webview.dart';
import '../widgets/sos_button.dart';

class MyOrganizationScreen extends StatefulWidget {
  const MyOrganizationScreen({super.key});

  @override
  State<MyOrganizationScreen> createState() => _MyOrganizationScreenState();
}

class _MyOrganizationScreenState extends State<MyOrganizationScreen> {
  // Mock organization data
  final String organizationName = 'Nairobi Central Fleet Group';
  final String organizationStatus = 'Active';
  final int memberCount = 145;
  final int activeOnlineCount = 42;
  final String joinedDate = '2024-01-15';
  final String role = 'Senior Driver';
  final String stageLocation = 'CBD Kencom & Railway Stage';
  final String groupLeader = 'John Mwangi (+254 722 000 111)';

  void _openPortalGroups(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => Stack(
          children: [
            SecureWebView(
              title: 'Driver Groups & Communities',
              url: '${AppConfig.userPortalUrl}/drivers/groups/browse',
            ),
            Positioned(
              top: MediaQuery.of(context).padding.top + 70,
              right: 16,
              child: const SosButton(size: 46),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showLeaveConfirmationDialog() async {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF1C1914),
          title: Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
              const SizedBox(width: 12),
              Text(
                'Leave Group?',
                style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Are you sure you want to leave this community driver group?',
                  style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Text('By leaving, you will:', style: GoogleFonts.inter(color: Colors.white70)),
                const SizedBox(height: 8),
                _buildBulletPoint('Lose access to group-specific discussions & dispatches'),
                _buildBulletPoint('No longer receive group stage priority alerts'),
                _buildBulletPoint('Be removed from all driver group welfare benefits'),
                _buildBulletPoint('Revert to independent driver status'),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: Colors.cyanAccent, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'You can join another group or re-apply via the Driver Web Portal.',
                          style: GoogleFonts.inter(fontSize: 12, color: Colors.cyanAccent),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: Text('Cancel', style: GoogleFonts.inter(color: Colors.grey)),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Navigator.of(context).pop();
                _leaveOrganization();
              },
              child: Text('Leave Group', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  Widget _buildBulletPoint(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 8, bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(fontSize: 16, color: Colors.white70)),
          Expanded(child: Text(text, style: GoogleFonts.inter(fontSize: 13, color: Colors.white70))),
        ],
      ),
    );
  }

  Future<void> _leaveOrganization() async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(color: AppTheme.primaryColor),
      ),
    );

    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;
    Navigator.of(context).pop();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('You have successfully left the group', style: GoogleFonts.inter()),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );

    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F0E0D) : const Color(0xFFF7F7F7),
      appBar: AppBar(
        title: Text(
          'DRIVER GROUP',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            fontSize: 15,
            color: AppTheme.primaryColor,
          ),
        ),
        backgroundColor: isDark ? const Color(0xFF141311) : Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.primaryColor),
        actions: [
          IconButton(
            icon: const Icon(Icons.open_in_browser_rounded, color: AppTheme.primaryColor),
            tooltip: 'Browse Groups on Portal',
            onPressed: () => _openPortalGroups(context),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Organization Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E1B15), Color(0xFF262118), Color(0xFF141311)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border(
                  bottom: BorderSide(
                    color: AppTheme.primaryColor.withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          gradient: AppTheme.goldGradient,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(
                          Icons.groups_rounded,
                          size: 30,
                          color: Colors.black,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              organizationName,
                              style: GoogleFonts.inter(
                                fontSize: 19,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF00E676).withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFF00E676).withValues(alpha: 0.5), width: 0.8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.circle, size: 7, color: Color(0xFF00E676)),
                                      const SizedBox(width: 4),
                                      Text(
                                        'ACTIVE FLEET GROUP',
                                        style: GoogleFonts.inter(
                                          fontSize: 10,
                                          color: const Color(0xFF00E676),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '$activeOnlineCount Peers Online',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    color: Colors.cyanAccent,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Organization Details
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'GROUP DETAILS & STAGE',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                          color: isDark ? Colors.white70 : Colors.black54,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () => _openPortalGroups(context),
                        icon: const Icon(Icons.open_in_new_rounded, size: 14, color: AppTheme.primaryColor),
                        label: Text(
                          'Web Portal',
                          style: GoogleFonts.inter(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  _buildDetailCard(
                    icon: Icons.person_outline,
                    label: 'Driver Role',
                    value: role,
                  ),
                  _buildDetailCard(
                    icon: Icons.location_on_outlined,
                    label: 'Assigned Stage / Base',
                    value: stageLocation,
                  ),
                  _buildDetailCard(
                    icon: Icons.supervisor_account_outlined,
                    label: 'Group Representative',
                    value: groupLeader,
                  ),
                  _buildDetailCard(
                    icon: Icons.people_outline,
                    label: 'Total Enrolled Drivers',
                    value: '$memberCount Drivers ($activeOnlineCount Online Now)',
                  ),
                  _buildDetailCard(
                    icon: Icons.calendar_today,
                    label: 'Joined Date',
                    value: joinedDate,
                  ),
                  const SizedBox(height: 24),

                  // Benefits Section
                  const Text(
                    'Group Benefits',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildBenefitCard('Access to group activities and events'),
                  _buildBenefitCard('Exclusive chat and forum access'),
                  _buildBenefitCard('Community support and networking'),
                  _buildBenefitCard('Collective bargaining power'),
                  const SizedBox(height: 32),

                  // Leave Organization Button
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.exit_to_app, color: Colors.red),
                            SizedBox(width: 8),
                            Text(
                              'Leave Group',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.red,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'You can leave this community group at any time. This action will remove you from all group activities and discussions.',
                          style: TextStyle(fontSize: 12, color: Colors.black87),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            onPressed: _showLeaveConfirmationDialog,
                            child: const Text(
                              'Leave Community Group',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailCard({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, color: Colors.black),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBenefitCard(String benefit) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                benefit,
                style: const TextStyle(fontSize: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
