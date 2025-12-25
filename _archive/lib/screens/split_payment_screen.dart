import 'package:flutter/material.dart';

// Mock data model
class PaymentMethod {
  final String id;
  final String name;
  final double balance;
  PaymentMethod({required this.id, required this.name, this.balance = 0});
}

class SplitPaymentScreen extends StatefulWidget {
  final double totalFare;
  const SplitPaymentScreen({super.key, required this.totalFare});

  @override
  State<SplitPaymentScreen> createState() => _SplitPaymentScreenState();
}

class _SplitPaymentScreenState extends State<SplitPaymentScreen> {
  final List<PaymentMethod> _methods = [
    PaymentMethod(id: 'wallet', name: 'Wallet', balance: 50.0),
    PaymentMethod(id: 'visa-1234', name: 'Visa **** 1234'),
  ];

  late Map<String, TextEditingController> _controllers;
  double _remainingAmount = 0.0;

  @override
  void initState() {
    super.initState();
    _controllers = {
      for (var method in _methods) method.id: TextEditingController(),
    };
    _remainingAmount = widget.totalFare;
    _controllers.forEach((key, controller) {
      controller.addListener(_updateRemainingAmount);
    });
  }

  void _updateRemainingAmount() {
    double allocated = 0;
    _controllers.forEach((key, controller) {
      allocated += double.tryParse(controller.text) ?? 0;
    });
    setState(() {
      _remainingAmount = widget.totalFare - allocated;
    });
  }

  @override
  void dispose() {
    _controllers.values.forEach((c) => c.dispose());
    super.dispose();
  }

  void _submitPayment() {
    if (_remainingAmount.abs() > 0.01) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Amounts must sum to the total fare.')),
      );
      return;
    }
    print('Submitting split payment...');
    // In a real app, call the backend here
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Split Payment')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              'Total Fare: KES ${widget.totalFare.toStringAsFixed(2)}',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            Text(
              'Remaining: KES ${_remainingAmount.toStringAsFixed(2)}',
              style: TextStyle(
                color: _remainingAmount.abs() < 0.01
                    ? Colors.green
                    : Colors.red,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView.builder(
                itemCount: _methods.length,
                itemBuilder: (context, index) {
                  final method = _methods[index];
                  return ListTile(
                    title: Text(method.name),
                    subtitle: method.id == 'wallet'
                        ? Text(
                            'Balance: KES ${method.balance.toStringAsFixed(2)}',
                          )
                        : null,
                    trailing: SizedBox(
                      width: 100,
                      child: TextField(
                        controller: _controllers[method.id],
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        decoration: const InputDecoration(prefixText: 'KES '),
                      ),
                    ),
                  );
                },
              ),
            ),
            ElevatedButton(
              onPressed: _submitPayment,
              child: const Text('Confirm Payment'),
            ),
          ],
        ),
      ),
    );
  }
}
