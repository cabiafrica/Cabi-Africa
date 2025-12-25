import 'package:flutter/material.dart';

class RentalPartner {
  final String name;
  final String logoUrl;
  final String description;
  final String startingPrice;
  final String url;
  final List<String> benefits;

  RentalPartner({
    required this.name,
    required this.logoUrl,
    required this.description,
    required this.startingPrice,
    required this.url,
    required this.benefits,
  });
}

class VehicleRentalScreen extends StatelessWidget {
  const VehicleRentalScreen({Key? key}) : super(key: key);

  List<RentalPartner> get _partners => [
        RentalPartner(
          name: 'Hertz',
          logoUrl: 'assets/partners/hertz.png',
          description:
              'Rent a car to drive with Cabi. No credit check required.',
          startingPrice: '\$250/week',
          url: 'https://hertz.com/rent/cabi',
          benefits: [
            'Insurance included',
            'Unlimited miles',
            'Maintenance included'
          ],
        ),
        RentalPartner(
          name: 'Avis',
          logoUrl: 'assets/partners/avis.png',
          description:
              'Flexible rentals for rideshare drivers. Weekly and monthly options.',
          startingPrice: '\$230/week',
          url: 'https://avis.com/drive',
          benefits: ['Roadside assistance', 'Vehicle swap', 'Earn rewards'],
        ),
        RentalPartner(
          name: 'Enterprise',
          logoUrl: 'assets/partners/enterprise.png',
          description:
              'Drive in style with Enterprise. Premium vehicles available.',
          startingPrice: '\$275/week',
          url: 'https://enterprise.com/cabi',
          benefits: ['Hybrid options', '24/7 support', 'Low deposit'],
        ),
      ];

  void _launchUrl(String url) {
    // In a real app, uses url_launcher
    print('Launching $url');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Rent a Vehicle'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Hero Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              color: Colors.black,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.car_rental,
                      color: Color(0xFFFBBF24), size: 48),
                  const SizedBox(height: 16),
                  const Text(
                    'Need a car?',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'We partner with top rental agencies to get you on the road quickly.',
                    style: TextStyle(
                      color: Colors.grey[400],
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Available Partners',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ..._partners
                      .map((partner) => _buildPartnerCard(context, partner))
                      .toList(),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildPartnerCard(BuildContext context, RentalPartner partner) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  partner.name,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.green.shade100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'From ${partner.startingPrice}',
                    style: TextStyle(
                      color: Colors.green.shade800,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  partner.description,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: partner.benefits
                      .map((benefit) => Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFBBF24)
                                  .withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                  color: const Color(0xFFFBBF24)
                                      .withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.check,
                                    size: 14, color: Color(0xFFD97706)),
                                const SizedBox(width: 4),
                                Text(
                                  benefit,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.brown[800],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ))
                      .toList(),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () => _launchUrl(partner.url),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('View Offer'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
