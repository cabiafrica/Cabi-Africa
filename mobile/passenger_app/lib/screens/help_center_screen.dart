import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class HelpCenterScreen extends StatelessWidget {
  const HelpCenterScreen({super.key});

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
      query: 'subject=Support Request&body=Hi Support Team,',
    );
    if (!await launchUrl(launchUri)) {
      throw Exception('Could not launch $launchUri');
    }
  }

  @override
  Widget build(BuildContext context) {
    // Cabi Global Colors
    const primaryColor = Color(0xFFFFBE0B);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Help & Support'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(24),
              color: Colors.white,
              child: Column(
                children: [
                  const Icon(Icons.support_agent,
                      size: 60, color: primaryColor),
                  const SizedBox(height: 16),
                  const Text(
                    "How can we help you?",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Our team is available 24/7 to assist you.",
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // Contact Options
            _buildSectionHeader("Contact Us"),
            _buildContactOption(
              context,
              icon: Icons.phone_in_talk,
              title: "Call Support",
              subtitle: "Speak directly with an agent",
              iconColor: Colors.green,
              onTap: () =>
                  _makePhoneCall("+254700000000"), // Replace with actual number
            ),
            _buildContactOption(
              context,
              icon: Icons.email_outlined,
              title: "Email Support",
              subtitle: "Get a response within 24 hours",
              iconColor: Colors.blue,
              onTap: () => _sendEmail("support@cabiapp.com"),
            ),
            _buildContactOption(
              context,
              icon: Icons.chat_bubble_outline,
              title: "Live Chat",
              subtitle: "Chat with our virtual assistant",
              iconColor: Colors.purple,
              onTap: () {
                // Navigate to Chat Screen
                // Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen()));
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text("Connecting to Live Chat...")));
              },
            ),
            _buildContactOption(
              context,
              icon: Icons.phone_callback,
              title: "Request Callback",
              subtitle: "We'll call you back shortly",
              iconColor: Colors.orange,
              onTap: () {
                showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                          title: const Text("Request Callback"),
                          content: const Text(
                              "Would you like us to call you back on your registered number?"),
                          actions: [
                            TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text("Cancel")),
                            ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                    backgroundColor: primaryColor,
                                    foregroundColor: Colors.black),
                                onPressed: () {
                                  Navigator.pop(context);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                          content: Text(
                                              "Callback requested successfully!")));
                                },
                                child: const Text("Request")),
                          ],
                        ));
              },
            ),

            const SizedBox(height: 20),

            // FAQs
            _buildSectionHeader("Frequently Asked Questions"),
            _buildCategory(context, 'Account & Profile'),
            _buildCategory(context, 'Trips & Fares'),
            _buildCategory(context, 'Payment Methods'),

            const SizedBox(height: 30),
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

  Widget _buildCategory(BuildContext context, String title) {
    return ExpansionTile(
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
      childrenPadding: const EdgeInsets.only(left: 16),
      children: const [
        ListTile(
            title: Text('How do I reset my password?'),
            trailing: Icon(Icons.chevron_right, size: 16)),
        ListTile(
            title: Text('How is the fare calculated?'),
            trailing: Icon(Icons.chevron_right, size: 16)),
      ],
    );
  }
}

