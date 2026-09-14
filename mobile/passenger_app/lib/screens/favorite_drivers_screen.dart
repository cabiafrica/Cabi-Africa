import 'package:flutter/material.dart';

class FavoriteDriversScreen extends StatefulWidget {
  const FavoriteDriversScreen({super.key});

  @override
  State<FavoriteDriversScreen> createState() => _FavoriteDriversScreenState();
}

class _FavoriteDriversScreenState extends State<FavoriteDriversScreen> {
  final List<Map<String, dynamic>> _favoriteDrivers = [
    {
      'id': 'driver_bob',
      'name': 'Bob Smith',
      'rating': 4.9,
      'trips': 12,
      'photo': null,
      'vehicleInfo': 'Toyota Camry • Silver',
    },
    {
      'id': 'driver_alice',
      'name': 'Alice Johnson',
      'rating': 4.8,
      'trips': 8,
      'photo': null,
      'vehicleInfo': 'Honda Accord • Black',
    },
  ];

  void _removeFavorite(String driverId) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove Favorite?'),
        content: const Text('This driver will no longer be prioritized for your scheduled rides.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _favoriteDrivers.removeWhere((d) => d['id'] == driverId);
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Driver removed from favorites')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('REMOVE'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Favorite Drivers',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: _favoriteDrivers.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E1E1E),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF333333)),
                    ),
                    child: const Icon(
                      Icons.favorite_border_rounded,
                      size: 40,
                      color: Color(0xFFF59E0B),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'No favorite drivers yet',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 48),
                    child: Text(
                      'Mark drivers as favorites after great trips. They will be prioritized for your scheduled rides!',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Color(0xFFAAAAAA), fontSize: 14),
                    ),
                  ),
                ],
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1E1E),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.info_outline_rounded,
                          color: Color(0xFFF59E0B),
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Text(
                          'When you schedule a ride, we\'ll try to match you with your favorite drivers first!',
                          style: TextStyle(fontSize: 13, color: Colors.white70, height: 1.4),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                ..._favoriteDrivers.map((driver) => Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1E1E),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF2C2C2C)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.black,
                                border: Border.all(color: const Color(0xFFF59E0B), width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  driver['name'][0],
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFFF59E0B),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        driver['name'],
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 17,
                                          color: Colors.white,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      const Icon(
                                        Icons.favorite_rounded,
                                        color: Color(0xFFF59E0B),
                                        size: 18,
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 18),
                                      const SizedBox(width: 4),
                                      Text(
                                        driver['rating'].toString(),
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                          fontSize: 13,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withValues(alpha: 0.08),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          '${driver['trips']} trips with you',
                                          style: const TextStyle(color: Color(0xFFAAAAAA), fontSize: 11),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 24, color: Color(0xFF2C2C2C)),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.06),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.directions_car_filled_rounded, size: 16, color: Color(0xFFF59E0B)),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              driver['vehicleInfo'],
                              style: const TextStyle(color: Colors.white70, fontSize: 13),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () {
                                  // View driver profile
                                },
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: const Color(0xFFF59E0B),
                                  side: const BorderSide(color: Color(0xFF333333)),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                icon: const Icon(Icons.person_outline_rounded, size: 18),
                                label: const Text(
                                  'VIEW PROFILE',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.5),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.red.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: IconButton(
                                onPressed: () => _removeFavorite(driver['id']),
                                icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                                tooltip: 'Remove from favorites',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                )),
              ],
            ),
    );
  }
}
