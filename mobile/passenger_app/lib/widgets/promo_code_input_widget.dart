import 'package:flutter/material.dart';

// Mock DTOs
class AppliedPromoCodeDto {
  final double originalFare;
  final double discountAmount;
  final double finalFare;
  final String message;

  AppliedPromoCodeDto({
    required this.originalFare,
    required this.discountAmount,
    required this.finalFare,
    required this.message,
  });
}

class PromoCodeInputWidget extends StatefulWidget {
  const PromoCodeInputWidget({super.key});

  @override
  State<PromoCodeInputWidget> createState() => _PromoCodeInputWidgetState();
}

class _PromoCodeInputWidgetState extends State<PromoCodeInputWidget> {
  final _promoController = TextEditingController();
  bool _isLoading = false;
  AppliedPromoCodeDto? _appliedPromo;
  String? _error;

  Future<void> _applyPromoCode() async {
    if (_promoController.text.isEmpty) return;
    setState(() {
      _isLoading = true;
      _error = null;
      _appliedPromo = null;
    });

    // Mock API call
    await Future.delayed(const Duration(seconds: 1));

    if (_promoController.text.toUpperCase() == 'WELCOME20') {
      setState(() {
        _appliedPromo = AppliedPromoCodeDto(
          originalFare: 20.0,
          discountAmount: 4.0,
          finalFare: 16.0,
          message: 'WELCOME20 applied!',
        );
      });
    } else {
      setState(() => _error = 'Invalid promo code.');
    }

    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _promoController,
          decoration: InputDecoration(
            labelText: 'Promo Code',
            errorText: _error,
            suffixIcon: _isLoading
                ? const CircularProgressIndicator()
                : TextButton(
                    onPressed: _applyPromoCode,
                    child: const Text('Apply'),
                  ),
          ),
        ),
        if (_appliedPromo != null)
          Padding(
            padding: const EdgeInsets.only(top: 8.0),
            child: Text(
              '${_appliedPromo!.message} New fare: \$${_appliedPromo!.finalFare.toStringAsFixed(2)}',
              style: const TextStyle(color: Colors.green),
            ),
          ),
      ],
    );
  }
}
