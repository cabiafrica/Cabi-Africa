import 'package:flutter/material.dart';
import '../services/payment_service.dart';

class PaymentScreen extends StatefulWidget {
  final String tripId;
  final double fareAmount;

  const PaymentScreen({
    super.key,
    required this.tripId,
    required this.fareAmount,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final PaymentService _paymentService = PaymentService();
  bool _isProcessing = false;
  bool _mpesaInitiated = false;

  Future<void> _payWithMpesa() async {
    setState(() => _isProcessing = true);
    try {
      await _paymentService.payWithMpesa(widget.tripId, widget.fareAmount);
      if (mounted) {
        setState(() {
          _mpesaInitiated = true;
          _isProcessing = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('M-Pesa prompt sent to your phone.')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Payment failed: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Total Fare',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Text(
              'KES ${widget.fareAmount.toStringAsFixed(2)}',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 48),
            ElevatedButton.icon(
              onPressed: _isProcessing ? null : _payWithMpesa,
              icon: const Icon(Icons.phone_android),
              label: Text(
                _mpesaInitiated ? 'RESEND PROMPT' : 'PAY WITH MOBILE MONEY',
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: _isProcessing
                  ? null
                  : () {}, // Logic handled by driver confirming
              icon: const Icon(Icons.money),
              label: const Text('PAY WITH CASH'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'For cash payments, please pay the driver directly. They will confirm receipt in their app.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
