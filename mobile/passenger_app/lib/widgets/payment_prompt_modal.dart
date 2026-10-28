import 'package:flutter/material.dart';
import '../services/ride_service.dart';

class PaymentPromptModal extends StatefulWidget {
  final RideService? rideService;
  final Map<String, dynamic>
      tripData; // e.g., {'rideId': 'xyz', 'finalFare': 550.0, 'driverName': 'John'}
  final VoidCallback onPaymentFinalized;

  const PaymentPromptModal({
    super.key,
    required this.tripData,
    required this.onPaymentFinalized,
    this.rideService,
  });

  @override
  State<PaymentPromptModal> createState() => _PaymentPromptModalState();
}

class _PaymentPromptModalState extends State<PaymentPromptModal> {
  late final RideService _service;
  bool _isAwaitingMpesaConfirmation = false;
  bool _isCheckingStatus = false;
  int _rating = 0;

  @override
  void initState() {
    super.initState();
    _service = widget.rideService ?? RideService();
  }

  void _handleCashPayment() async {
    _handlePaymentAndRating(
      _service.confirmCashPayment(widget.tripData['rideId']),
    );
  }

  void _initiateMpesaPayment() async {
    setState(() => _isAwaitingMpesaConfirmation = true);
    try {
      await _service.initiateMpesaPayment(widget.tripData['rideId']);
      // At this point, the STK push is sent. The UI is now in a waiting state.
      // A real app might start a timer here to auto-query after 60s.
    } catch (e) {
      // Handle failure to even initiate the STK push
      setState(() => _isAwaitingMpesaConfirmation = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not start M-Pesa payment: $e')),
        );
      }
    }
  }

  void _checkMpesaStatus() async {
    setState(() => _isCheckingStatus = true);
    try {
      final bool isPaid = await _service.checkMpesaPaymentStatus(
        widget.tripData['rideId'],
      );
      if (isPaid) {
        _handlePaymentAndRating(
          Future.value(),
        ); // Payment is confirmed, now submit rating
      } else {
        // This case would happen if the query confirms the payment has NOT been made.
        // This case would happen if the query confirms the payment has NOT been made.
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Payment not yet confirmed. Please try again shortly.',
              ),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to check status: $e')));
      }
    } finally {
      setState(() => _isCheckingStatus = false);
    }
  }

  void _handlePaymentAndRating(Future<void> paymentFuture) async {
    // Show a loading indicator on the modal
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      await paymentFuture;
      // If payment is successful, submit the rating
      await _service.submitRating(
        rideId: widget.tripData['rideId'] as String,
        rating: (_rating as num).toDouble(),
        role: 'PASSENGER',
      );

      if (!mounted) return;

      Navigator.of(context, rootNavigator: true).pop(); // dismiss loading
      _finalizeAndClose();
    } on InsufficientFundsException {
      Navigator.of(context, rootNavigator: true).pop(); // dismiss loading
      // Show a specific dialog for this error
      showDialog(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('Insufficient Funds'),
          content: const Text(
            'Your M-Pesa balance is too low. Please top up and try again, or pay with cash.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
                // User can now tap "Pay with Cash"
              },
              child: const Text('PAY WITH CASH'),
            ),
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('TRY AGAIN'),
            ),
          ],
        ),
      );
    } catch (e) {
      Navigator.of(context, rootNavigator: true).pop(); // dismiss loading
      // Handle error, show a snackbar
      showDialog(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('Payment Failed'),
          content: Text(
            'We could not process your payment at this time. Please try again or select a different payment method.\n\nError: $e',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
                // If user was in M-Pesa flow, take them back to initial options
                if (_isAwaitingMpesaConfirmation) {
                  setState(() => _isAwaitingMpesaConfirmation = false);
                }
              },
              child: const Text('PAY WITH CASH'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
              },
              child: const Text('RETRY'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final finalFare = widget.tripData['finalFare'] as double;

    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: _isAwaitingMpesaConfirmation
            ? _buildMpesaWaitingUI()
            : _buildInitialPaymentUI(finalFare),
      ),
    );
  }

  List<Widget> _buildInitialPaymentUI(double finalFare) {
    return [
      Text(
        'Trip Completed',
        style: Theme.of(context).textTheme.headlineSmall,
        textAlign: TextAlign.center,
      ),
      const SizedBox(height: 16),
      Text(
        'Final Fare: KES $finalFare',
        style: Theme.of(context).textTheme.titleLarge,
        textAlign: TextAlign.center,
      ),
      const SizedBox(height: 24),
      Text(
        'Rate your driver',
        style: Theme.of(context).textTheme.titleMedium,
        textAlign: TextAlign.center,
      ),
      const SizedBox(height: 8),
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(5, (index) {
          return IconButton(
            icon: Icon(
              index < _rating ? Icons.star : Icons.star_border,
              color: Colors.amber,
              size: 36,
            ),
            onPressed: () {
              setState(() => _rating = index + 1);
            },
          );
        }),
      ),
      const SizedBox(height: 24),
      ElevatedButton.icon(
        icon: const Icon(Icons.money),
        label: const Text('Pay with Cash'),
        onPressed: _rating > 0 ? _handleCashPayment : null,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
      const SizedBox(height: 12),
      ElevatedButton.icon(
        icon: const Icon(Icons.phone_android),
        label: const Text(
          'Pay with M-Pesa',
        ), // Assuming M-Pesa can be initiated before rating
        onPressed: _rating > 0 ? _initiateMpesaPayment : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.green,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    ];
  }

  List<Widget> _buildMpesaWaitingUI() {
    return [
      Text(
        'Confirm on Your Phone',
        style: Theme.of(context).textTheme.headlineSmall,
        textAlign: TextAlign.center,
      ),
      const SizedBox(height: 24),
      const CircularProgressIndicator(),
      const SizedBox(height: 24),
      const Text(
        'An M-Pesa STK push has been sent to your phone. Please enter your PIN to complete the payment.',
        textAlign: TextAlign.center,
      ),
      const SizedBox(height: 32),
      _isCheckingStatus
          ? const Center(child: Text("Checking..."))
          : ElevatedButton(
              onPressed: _rating > 0 ? _checkMpesaStatus : null,
              child: const Text('I have paid, check status'),
            ),
      TextButton(
        onPressed: () => setState(() => _isAwaitingMpesaConfirmation = false),
        child: const Text('Cancel'),
      ),
    ];
  }

  void _finalizeAndClose() {
    // Dismiss the payment modal itself
    Navigator.of(context).pop();
    // Call the parent callback to reset the home screen UI
    widget.onPaymentFinalized();
  }
}
