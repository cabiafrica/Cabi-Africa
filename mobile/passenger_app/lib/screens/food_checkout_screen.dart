import 'package:flutter/material.dart';

class FoodCheckoutScreen extends StatelessWidget {
  const FoodCheckoutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Food Checkout')),
      body: const Padding(
        padding: EdgeInsets.all(16.0),
        child: Center(child: Text('Food checkout content will go here.')),
      ),
    );
  }
}
