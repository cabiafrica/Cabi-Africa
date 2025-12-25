import 'package:flutter/foundation.dart';

class CartProvider with ChangeNotifier {
  final List<Map<String, dynamic>> _cartItems = [];

  List<Map<String, dynamic>> get cartItems => _cartItems;

  int get itemCount => _cartItems.length;

  double get totalPrice {
    return _cartItems.fold(0.0, (sum, item) => sum + (item['price'] as double));
  }

  void addItem(Map<String, dynamic> item) {
    // For simplicity, we're adding the whole item.
    // In a real app, you might track quantity for each item.
    _cartItems.add(item);
    notifyListeners();
  }

  void removeItem(Map<String, dynamic> item) {
    _cartItems.removeWhere((cartItem) => cartItem['id'] == item['id']);
    notifyListeners();
  }

  void clearCart() {
    _cartItems.clear();
    notifyListeners();
  }
}
