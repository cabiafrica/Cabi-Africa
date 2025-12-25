import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/food_order_service.dart';
import '../providers/cart_provider.dart';

class CheckoutScreen extends StatefulWidget {
  final String restaurantId;
  final String restaurantName;
  final FoodOrderService? foodOrderService;

  const CheckoutScreen({
    super.key,
    required this.restaurantId,
    required this.restaurantName,
    this.foodOrderService,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  late final FoodOrderService _foodOrderService;
  bool _isPlacingOrder = false;

  // Mock delivery address for now
  final String _deliveryAddress = 'My Current Location';

  @override
  void initState() {
    super.initState();
    _foodOrderService = widget.foodOrderService ?? FoodOrderService();
  }

  Future<void> _placeOrder(CartProvider cart) async {
    if (cart.itemCount == 0) return;

    setState(() => _isPlacingOrder = true);

    try {
      await _foodOrderService.placeOrder(
        restaurantId: widget.restaurantId,
        items: cart.cartItems,
        total: cart.totalPrice,
        deliveryAddress: _deliveryAddress,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order placed successfully!')),
        );
        cart.clearCart();
        Navigator.of(
          context,
        ).popUntil((route) => route.isFirst); // Go back to home
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to place order: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isPlacingOrder = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: Consumer<CartProvider>(
        builder: (context, cart, child) {
          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: cart.itemCount,
                  itemBuilder: (context, index) {
                    final item = cart.cartItems[index];
                    return ListTile(
                      title: Text(item['name']),
                      subtitle: Text(item['description']),
                      trailing: Text('KES ${item['price']}'),
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Delivery to: $_deliveryAddress',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Total: KES ${cart.totalPrice.toStringAsFixed(0)}',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 16),
                    _isPlacingOrder
                        ? const Center(child: CircularProgressIndicator())
                        : ElevatedButton(
                            onPressed: cart.itemCount > 0
                                ? () => _placeOrder(cart)
                                : null,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: const Text('Place Order'),
                          ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
