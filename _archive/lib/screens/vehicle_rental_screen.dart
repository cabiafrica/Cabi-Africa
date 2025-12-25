import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

// Data model for a rental partner
class RentalPartner {
  final String name;
  final String description;
  final String referralUrl;

  RentalPartner({
    required this.name,
    required this.description,
    required this.referralUrl,
  });
}

class VehicleRentalScreen extends StatelessWidget {
  // Mock data for rental partners
  final List<RentalPartner> partners = [
    RentalPartner(
      name: 'FlexiLease Cars',
      description:
          'Weekly and monthly rentals. Insurance included. Starting from KES 7,000/week.',
      referralUrl: 'https://www.flexilease.com/cabi?ref=driver123',
    ),
    RentalPartner(
      name: 'DriveEasy Rentals',
      description:
          'Rent-to-own options available. Low initial deposit. Full maintenance package.',
      referralUrl: 'https://www.driveeasy.co.ke/partners/cabi?ref=driver123',
    ),
  ];

  VehicleRentalScreen({super.key});

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      // Launch the URL in an external browser.
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      // In a real app, show a snackbar or dialog on failure.
      throw 'Could not launch $url';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rent a Vehicle')),
      body: ListView.builder(
        padding: const EdgeInsets.all(8.0),
        itemCount: partners.length,
        itemBuilder: (context, index) {
          final partner = partners[index];
          return Card(
            elevation: 4,
            margin: const EdgeInsets.symmetric(vertical: 8.0),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    partner.name,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(partner.description),
                  const SizedBox(height: 16),
                  Align(
                    alignment: Alignment.centerRight,
                    child: ElevatedButton(
                      onPressed: () => _launchURL(partner.referralUrl),
                      child: const Text('View Offers'),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
