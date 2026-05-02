import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class FoodCheckoutScreen extends StatefulWidget {
  const FoodCheckoutScreen({super.key});

  @override
  State<FoodCheckoutScreen> createState() => _FoodCheckoutScreenState();
}

class _FoodCheckoutScreenState extends State<FoodCheckoutScreen> {
  final List<Map<String, dynamic>> _categories = [
    {'name': 'Burgers', 'icon': Icons.lunch_dining_rounded},
    {'name': 'Pizza', 'icon': Icons.local_pizza_rounded},
    {'name': 'Chicken', 'icon': Icons.restaurant_rounded},
    {'name': 'Sushi', 'icon': Icons.set_meal_rounded},
    {'name': 'Drinks', 'icon': Icons.local_drink_rounded},
  ];

  final List<Map<String, dynamic>> _popularItems = [
    {
      'name': 'Double Cheese Burger',
      'restaurant': 'Burger King',
      'price': 1200,
      'image':
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      'rating': 4.8,
      'time': '20-30 min',
    },
    {
      'name': 'Pepperoni Feast',
      'restaurant': 'Pizza Hut',
      'price': 2500,
      'image':
          'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
      'rating': 4.5,
      'time': '35-45 min',
    },
    {
      'name': 'Crispy Fried Chicken',
      'restaurant': 'KFC Africa',
      'price': 1800,
      'image':
          'https://images.unsplash.com/photo-1626645738196-c2a7c8d08f58?w=500',
      'rating': 4.7,
      'time': '15-25 min',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // ── Premium App Bar ──
          SliverAppBar(
            expandedHeight: 120.0,
            floating: false,
            pinned: true,
            elevation: 0,
            backgroundColor: Colors.white,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded,
                  color: Colors.black),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              title: const Text(
                'Food Delivery',
                style: TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
              centerTitle: true,
              background: Container(color: Colors.white),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined,
                    color: Colors.black),
                onPressed: () {},
              ),
            ],
          ),

          // ── Search & Filter ──
          SliverToBoxAdapter(
            child: Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: const TextField(
                      decoration: InputDecoration(
                        icon: Icon(Icons.search_rounded, color: Colors.grey),
                        hintText: 'Search for restaurants or dishes',
                        border: InputBorder.none,
                        hintStyle: TextStyle(fontSize: 14),
                      ),
                    ),
                  ),
                  const SizedBox(height: 25),
                  const Text(
                    'Categories',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Categories List ──
          SliverToBoxAdapter(
            child: SizedBox(
              height: 110,
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                scrollDirection: Axis.horizontal,
                itemCount: _categories.length,
                itemBuilder: (context, index) {
                  final cat = _categories[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    child: Column(
                      children: [
                        Container(
                          width: 65,
                          height: 65,
                          decoration: BoxDecoration(
                            color: Colors.orange.shade50,
                            borderRadius: BorderRadius.circular(18),
                          ),
                          child: Icon(cat['icon'],
                              color: Colors.orange.shade700, size: 28),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          cat['name'],
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ),

          // ── Popular Near You ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 15, 20, 15),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Popular Near You',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      'See All',
                      style: TextStyle(color: AppTheme.primaryColor),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Popular Items Grid/List ──
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final item = _popularItems[index];
                return Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(20)),
                          child: Image.network(
                            item['image'],
                            height: 180,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(15.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    item['name'],
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    'KES ${item['price']}',
                                    style: TextStyle(
                                      color: AppTheme.primaryColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 5),
                              Text(
                                item['restaurant'],
                                style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontSize: 13,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  const Icon(Icons.star_rounded,
                                      color: Colors.amber, size: 18),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${item['rating']}',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13),
                                  ),
                                  const SizedBox(width: 15),
                                  const Icon(Icons.access_time_rounded,
                                      color: Colors.grey, size: 16),
                                  const SizedBox(width: 4),
                                  Text(
                                    item['time'],
                                    style: const TextStyle(
                                        color: Colors.grey, fontSize: 13),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
              childCount: _popularItems.length,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 30)),
        ],
      ),
    );
  }
}

