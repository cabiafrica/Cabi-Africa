import 'package:flutter/foundation.dart';

/// A simulated service for handling food ordering.
class FoodOrderService {
  /// Simulates fetching a list of available restaurants.
  Future<List<Map<String, dynamic>>> getRestaurants() async {
    debugPrint('API CALL: Fetching restaurants...');
    await Future.delayed(const Duration(seconds: 1));
    return [
      {
        'id': 'rest-1',
        'name': 'Mama Oliech\'s',
        'cuisine': 'Local, Fish',
        'rating': 4.5,
        'imageUrl':
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070',
        'deliveryTime': '30-45 min',
      },
      {
        'id': 'rest-2',
        'name': 'Burger King',
        'cuisine': 'Fast Food',
        'rating': 4.0,
        'imageUrl':
            'https://images.unsplash.com/photo-1571091718767-18b5b1479d29?q=80&w=2070',
        'deliveryTime': '20-30 min',
      },
      {
        'id': 'rest-3',
        'name': 'Java House',
        'cuisine': 'Cafe, International',
        'rating': 4.2,
        'imageUrl':
            'https://images.unsplash.com/photo-1504754528070-e6876ae7f1d5?q=80&w=2070',
        'deliveryTime': '35-50 min',
      },
    ];
  }

  /// Simulates fetching the menu for a specific restaurant.
  Future<List<Map<String, dynamic>>> getMenu(String restaurantId) async {
    debugPrint('API CALL: Fetching menu for $restaurantId...');
    await Future.delayed(const Duration(milliseconds: 800));
    if (restaurantId == 'rest-1') {
      return [
        {
          'id': 'item-1',
          'name': 'Tilapia Fillet',
          'description': 'Served with ugali and kachumbari',
          'price': 850.0,
        },
        {
          'id': 'item-2',
          'name': 'Wet Fry Beef',
          'description': 'Served with chapati',
          'price': 600.0,
        },
        {
          'id': 'item-3',
          'name': 'Mukimo',
          'description': 'Traditional mashed potatoes with greens',
          'price': 350.0,
        },
      ];
    } else if (restaurantId == 'rest-2') {
      return [
        {
          'id': 'item-4',
          'name': 'Whopper',
          'description': 'Classic flame-grilled beef burger',
          'price': 700.0,
        },
        {
          'id': 'item-5',
          'name': 'Chicken Royale',
          'description': 'Crispy chicken fillet burger',
          'price': 650.0,
        },
        {
          'id': 'item-6',
          'name': 'Fries (Large)',
          'description': 'Golden crispy fries',
          'price': 250.0,
        },
      ];
    } else {
      return [
        {
          'id': 'item-7',
          'name': 'Chicken Stir Fry',
          'description': 'Wok-fried chicken and veggies',
          'price': 900.0,
        },
        {
          'id': 'item-8',
          'name': 'Cappuccino',
          'description': 'Classic coffee drink',
          'price': 300.0,
        },
      ];
    }
  }

  /// Simulates placing a food order.
  Future<Map<String, dynamic>> placeOrder({
    required String restaurantId,
    required List<Map<String, dynamic>> items,
    required double total,
    required String deliveryAddress,
  }) async {
    debugPrint(
      'API CALL: Placing order for restaurant $restaurantId, total KES $total',
    );
    await Future.delayed(const Duration(seconds: 2));
    final orderId = 'food_order_${DateTime.now().millisecondsSinceEpoch}';
    debugPrint('API CALL: Order placed successfully: $orderId');
    return {'orderId': orderId, 'status': 'ORDER_PLACED'};
  }
}
