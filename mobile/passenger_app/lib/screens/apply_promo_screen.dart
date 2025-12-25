import 'package:flutter/material.dart';

class ApplyPromoScreen extends StatefulWidget {
  final double fareAmount;
  final Function(String, double) onPromoApplied;

  const ApplyPromoScreen({
    super.key,
    required this.fareAmount,
    required this.onPromoApplied,
  });

  @override
  State<ApplyPromoScreen> createState() => _ApplyPromoScreenState();
}

class _ApplyPromoScreenState extends State<ApplyPromoScreen> {
  final _codeController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;
  Map<String, dynamic>? _appliedPromo;

  // Mock available promos
  final List<Map<String, dynamic>> _availablePromos = [
    {'code': 'SAVE10', 'description': '10% off your ride', 'type': 'PERCENTAGE', 'value': 10},
    {'code': 'FIRSTRIDE', 'description': '\$5 off first ride', 'type': 'FIXED', 'value': 5.0},
  ];

  Future<void> _applyPromoCode(String code) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    // Mock API call
    await Future.delayed(const Duration(seconds: 1));

    // Mock validation
    final promo = _availablePromos.firstWhere(
      (p) => p['code'].toString().toUpperCase() == code.toUpperCase(),
      orElse: () => {},
    );

    if (promo.isEmpty) {
      setState(() {
        _errorMessage = 'Invalid promo code';
        _isLoading = false;
      });
      return;
    }

    // Calculate discount
    double discount = 0;
    if (promo['type'] == 'PERCENTAGE') {
      discount = widget.fareAmount * (promo['value'] / 100);
    } else {
      discount = (promo['value'] as double).clamp(0, widget.fareAmount);
    }

    setState(() {
      _appliedPromo = {
        ...promo,
        'discount': discount,
        'finalAmount': widget.fareAmount - discount,
      };
      _isLoading = false;
    });

    widget.onPromoApplied(code, discount);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Apply Promo Code')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Input Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Enter Promo Code', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _codeController,
                            decoration: InputDecoration(
                              hintText: 'SAVE10',
                              border: const OutlineInputBorder(),
                              errorText: _errorMessage,
                            ),
                            textCapitalization: TextCapitalization.characters,
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: _isLoading ? null : () => _applyPromoCode(_codeController.text),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('APPLY'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Applied Promo Display
            if (_appliedPromo != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green[200]!),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.check_circle, color: Colors.green[700]),
                        const SizedBox(width: 8),
                        const Text('Promo Applied!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('Code: ${_appliedPromo!['code']}', style: const TextStyle(fontFamily: 'monospace')),
                    Text('Discount: -\$${_appliedPromo!['discount'].toStringAsFixed(2)}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Original Fare:', style: TextStyle(decoration: TextDecoration.lineThrough)),
                        Text('\$${widget.fareAmount.toStringAsFixed(2)}'),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('New Total:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        Text('\$${_appliedPromo!['finalAmount'].toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.green)),
                      ],
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 24),
            const Text('Available Promos', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),

            // Available Promos List
            ..._availablePromos.map((promo) => Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.local_offer, color: Colors.blue),
                ),
                title: Text(promo['code'], style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                subtitle: Text(promo['description']),
                trailing: TextButton(
                  onPressed: () {
                    _codeController.text = promo['code'];
                    _applyPromoCode(promo['code']);
                  },
                  child: const Text('APPLY'),
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }
}
