import 'package:flutter/material.dart';

class StoreItem {
  final String id;
  final String name;
  final double price;
  final String imageUrl;

  StoreItem({required this.id, required this.name, required this.price, required this.imageUrl});
}

class StoreScreen extends StatefulWidget {
  const StoreScreen({super.key});

  @override
  State<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends State<StoreScreen> {
  // Mock Items
  final List<StoreItem> _items = [
    StoreItem(id: '1', name: 'Cabi Branded Cap', price: 500, imageUrl: 'assets/cap.png'),
    StoreItem(id: '2', name: 'Magnetic Phone Mount', price: 1200, imageUrl: 'assets/mount.png'),
    StoreItem(id: '3', name: 'Car Freshener (Pack of 3)', price: 300, imageUrl: 'assets/freshener.png'),
    StoreItem(id: '4', name: 'USB-C Car Charger', price: 800, imageUrl: 'assets/charger.png'),
    StoreItem(id: '5', name: 'Cabi Polo Shirt', price: 1500, imageUrl: 'assets/shirt.png'),
  ];

  final Map<String, int> _cart = {}; // ItemID -> Quantity

  double get _totalAmount {
    double total = 0;
    _cart.forEach((id, qty) {
      final item = _items.firstWhere((i) => i.id == id);
      total += item.price * qty;
    });
    return total;
  }

  void _addToCart(String itemId) {
    setState(() {
      _cart[itemId] = (_cart[itemId] ?? 0) + 1;
    });
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Item added to cart'), duration: Duration(milliseconds: 500)),
    );
  }

  void _checkout() {
    if (_cart.isEmpty) return;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm Purchase'),
        content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
                Text('Total: KSh ${_totalAmount.toStringAsFixed(0)}'),
                const SizedBox(height: 8),
                const Text('Or redeem 500 points?', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
            ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
          TextButton(
              onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Purchase successful using Points!')));
                  setState(() => _cart.clear());
              },
              child: const Text('PAY WITH POINTS', style: TextStyle(color: Colors.amber)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              // Mock Payment Service Call
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Purchase successful! Items will be shipped to you.')),
              );
              setState(() {
                _cart.clear();
              });
            },
            child: const Text('PAY WITH WALLET'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Store'),
        actions: [
           Stack(
            alignment: Alignment.center,
            children: [
                IconButton(
                    icon: const Icon(Icons.shopping_cart),
                    onPressed: _cart.isEmpty ? null : _checkout,
                ),
                if (_cart.isNotEmpty)
                    Positioned(
                        right: 8,
                        top: 8,
                        child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                                color: Colors.red,
                                borderRadius: BorderRadius.circular(6),
                            ),
                            constraints: const BoxConstraints(minWidth: 14, minHeight: 14),
                            child: Text(
                                '${_cart.values.fold(0, (a, b) => a + b)}',
                                style: const TextStyle(color: Colors.white, fontSize: 8),
                                textAlign: TextAlign.center,
                            ),
                        ),
                    )
            ],
           )
        ],
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.75,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: _items.length,
        itemBuilder: (ctx, index) {
          final item = _items[index];
          return Card(
            elevation: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Container(
                    color: Colors.grey[200],
                    width: double.infinity,
                    child: const Icon(Icons.image, size: 50, color: Colors.grey),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold), maxLines: 2, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 4),
                      Text('KSh ${item.price.toStringAsFixed(0)}', style: TextStyle(color: Colors.green[700], fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _addToCart(item.id),
                          style: ElevatedButton.styleFrom(
                              visualDensity: VisualDensity.compact,
                              textStyle: const TextStyle(fontSize: 12)
                          ),
                          child: const Text('ADD TO CART'),
                        ),
                      )
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
