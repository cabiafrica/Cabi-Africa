import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class DriverSupportScreen extends StatelessWidget {
  const DriverSupportScreen({super.key});

  // Example Logic for Drivers under an organziation
  final bool isUnderOrganization = true;

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (!await launchUrl(launchUri)) {
      throw Exception('Could not launch $launchUri');
    }
  }

  Future<void> _sendEmail(String email) async {
    final Uri launchUri = Uri(
      scheme: 'mailto',
      path: email,
      query: 'subject=Driver Support Request&body=Hi Driver Support Team,',
    );
    if (!await launchUrl(launchUri)) {
      throw Exception('Could not launch $launchUri');
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFFFFBE0B); // Amber

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Driver Support'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              color: Colors.grey[50],
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 10)
                        ]),
                    child: const Icon(Icons.headset_mic,
                        size: 48, color: Colors.black),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    "Need Assistance?",
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Select an option below to get help.",
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Organization Team Leader (Conditional)
            if (isUnderOrganization) ...[
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text("Your Organization",
                      style: TextStyle(
                          color: Colors.grey[800],
                          fontWeight: FontWeight.bold)),
                ),
              ),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                    color: primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border:
                        Border.all(color: primaryColor.withValues(alpha: 0.3))),
                child: Row(
                  children: [
                    const CircleAvatar(
                      backgroundColor: Colors.black,
                      child: Icon(Icons.person, color: primaryColor),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text("Team Leader",
                              style: TextStyle(fontWeight: FontWeight.bold)),
                          Text("Contact your fleet manager",
                              style: TextStyle(
                                  fontSize: 12, color: Colors.grey[700])),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.call, color: Colors.green),
                      onPressed: () => _makePhoneCall("+254711111111"),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // General Support
            _buildSectionHeader("Contact Support"),
            _buildContactOption(
              context,
              icon: Icons.phone_in_talk,
              title: "Call Helpline",
              subtitle: "Emergency & General queries",
              iconColor: Colors.green,
              onTap: () => _makePhoneCall("+254700000000"),
            ),
            _buildContactOption(
              context,
              icon: Icons.admin_panel_settings,
              title: "System Admin Request",
              subtitle: "Request admin intervention",
              iconColor: Colors.red,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text("Opening Admin Support Ticket Form...")));
                // Navigate to ticket form
              },
            ),
            _buildContactOption(
              context,
              icon: Icons.email_outlined,
              title: "Email Support",
              subtitle: "For document submissions & reports",
              iconColor: Colors.blue,
              onTap: () => _sendEmail("drivers@cabiapp.com"),
            ),
            _buildContactOption(
              context,
              icon: Icons.chat_bubble_outline,
              title: "Driver Chatbot",
              subtitle: "Instant automated assistance",
              iconColor: const Color(0xFFD4AF37),
              onTap: () {
                // Open Chat
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text("Connecting to Driver Bot...")));
              },
            ),
            _buildContactOption(
              context,
              icon: Icons.phone_callback,
              title: "Request Callback",
              subtitle: "Queue for a callback from admin",
              iconColor: Colors.orange,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Callback request queued.")));
              },
            ),

            const SizedBox(height: 30),

            // Helpful Links
            _buildSectionHeader("Resources"),
            ListTile(
              leading: const Icon(Icons.book, color: Colors.grey),
              title: const Text("Driver Handbook"),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.policy, color: Colors.grey),
              title: const Text("Privacy & Policy"),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () {},
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(title,
            style: const TextStyle(
                fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey)),
      ),
    );
  }

  Widget _buildContactOption(BuildContext context,
      {required IconData icon,
      required String title,
      required String subtitle,
      required Color iconColor,
      required VoidCallback onTap}) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: iconColor.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: iconColor),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(subtitle,
          style: TextStyle(fontSize: 12, color: Colors.grey[600])),
      trailing:
          const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
      onTap: onTap,
    );
  }
}

