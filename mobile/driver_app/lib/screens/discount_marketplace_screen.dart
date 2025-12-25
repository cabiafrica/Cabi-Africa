import 'package:flutter/material.dart';

class DiscountMarketplaceScreen extends StatelessWidget {
  const DiscountMarketplaceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Mock Data
    final List<Map<String, dynamic>> offers = [
      {
        'partner': 'Shell Refuel',
        'title': '5% Off Fuel',
        'description': 'Save on every liter at participating Shell stations.',
        'icon': Icons.local_gas_station,
        'color': Colors.red.shade100,
        'iconColor': Colors.red,
        'code': 'DRIVER5',
      },
      {
        'partner': 'AutoFix Garage',
        'title': '15% Off Oil Change',
        'description': 'Keep your engine running smoothly for less.',
        'icon': Icons.car_repair,
        'color': Colors.blue.shade100,
        'iconColor': Colors.blue,
        'code': 'FIX15',
      },
      {
        'partner': 'Safaricom Data',
        'title': '2GB Daily Bundle',
        'description': 'Exclusive driver rate: KSh 50/day.',
        'icon': Icons.wifi,
        'color': Colors.green.shade100,
        'iconColor': Colors.green,
        'link': 'https://safaricom.com',
      },
      {
        'partner': 'Java House',
        'title': 'Free Coffee',
        'description': 'Get a free coffee with any meal purchase.',
        'icon': Icons.coffee,
        'color': Colors.orange.shade100,
        'iconColor': Colors.brown,
        'code': 'JAVA-FREE',
      },
    ];

    void showRedemptionDialog(
        BuildContext context, Map<String, dynamic> offer) {
      showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
                title: Row(
                  children: [
                    Icon(offer['icon'], color: offer['iconColor']),
                    const SizedBox(width: 8),
                    Text(offer['partner'])
                  ],
                ),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(offer['title'],
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 18)),
                    const SizedBox(height: 16),
                    Text(offer['description']),
                    const SizedBox(height: 24),
                    if (offer.containsKey('code'))
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                            color: Colors.grey.shade200,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                                color: Colors.grey.shade400,
                                style: BorderStyle.solid)),
                        child: SelectableText(offer['code'],
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 24,
                                letterSpacing: 2)),
                      )
                    else
                      ElevatedButton(
                          onPressed: () {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content:
                                        Text('Opening partner website...')));
                          },
                          child: const Text('VISIT WEBSITE')),
                    const SizedBox(height: 16),
                    const Text('Show this code or visiting the link to redeem.',
                        style: TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('CLOSE')),
                ],
              ));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Perks'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: offers.length,
        itemBuilder: (context, index) {
          final offer = offers[index];
          return Card(
            elevation: 2,
            margin: const EdgeInsets.only(bottom: 16),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: InkWell(
              onTap: () => showRedemptionDialog(context, offer),
              borderRadius: BorderRadius.circular(12),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: offer['color'],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(offer['icon'],
                          color: offer['iconColor'], size: 30),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(offer['partner'],
                              style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12)),
                          const SizedBox(height: 4),
                          Text(offer['title'],
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 4),
                          Text(offer['description'],
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                  color: Colors.grey.shade700, fontSize: 13)),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios,
                        size: 14, color: Colors.grey),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
