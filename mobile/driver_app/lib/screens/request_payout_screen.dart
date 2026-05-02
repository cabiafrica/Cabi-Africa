import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:driver_app/models/payout_dto.dart';
import '../providers/payout_providers.dart';

class RequestPayoutScreen extends ConsumerStatefulWidget {
  const RequestPayoutScreen({super.key});

  @override
  ConsumerState<RequestPayoutScreen> createState() =>
      _RequestPayoutScreenState();
}

class _RequestPayoutScreenState extends ConsumerState<RequestPayoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  String _selectedPaymentMethod = 'M-Pesa'; 

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final amount = double.tryParse(_amountController.text);
      if (amount == null) return;

      final request = RequestPayoutDto(
        amount: amount,
        paymentMethod: _selectedPaymentMethod,
      );

      ref.read(requestPayoutControllerProvider.notifier).submitRequest(request);
    }
  }

  @override
  Widget build(BuildContext context) {
    final availableEarnings = ref.watch(availableEarningsProvider);
    final requestState = ref.watch(requestPayoutControllerProvider);

    ref.listen<AsyncValue<void>>(requestPayoutControllerProvider, (_, state) {
      state.whenOrNull(
        error: (err, stack) => ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppTheme.errorRed,
            content: Text('Error: ${err.toString()}', style: const TextStyle(color: Colors.white)),
          ),
        ),
        data: (_) {
          if (!state.isLoading && state.hasValue) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                backgroundColor: Colors.green,
                content: Text('Payout request submitted successfully!', style: TextStyle(color: Colors.white)),
              ),
            );
            Navigator.of(context).pop();
          }
        },
      );
    });

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('REQUEST PAYOUT', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 14)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.darkSurface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.1)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('AVAILABLE BALANCE', style: TextStyle(color: AppTheme.darkTextSecondary, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                    const SizedBox(height: 8),
                    availableEarnings.when(
                      data: (balance) => Text(
                        'KES ${balance.toStringAsFixed(2)}',
                        style: const TextStyle(color: AppTheme.primaryColor, fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      loading: () => const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryColor)),
                      error: (err, stack) => const Text('KES --.--', style: TextStyle(color: AppTheme.errorRed, fontSize: 24, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              const Text('WITHDRAWAL DETAILS', style: TextStyle(color: AppTheme.darkTextSecondary, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
              const SizedBox(height: 16),
              TextFormField(
                controller: _amountController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'AMOUNT',
                  labelStyle: const TextStyle(color: AppTheme.darkTextSecondary, fontSize: 12),
                  prefixText: 'KES ',
                  prefixStyle: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                  filled: true,
                  fillColor: AppTheme.darkSurface,
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.05))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.primaryColor)),
                  errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.errorRed)),
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Please enter an amount';
                  final amount = double.tryParse(value);
                  final balance = availableEarnings.value ?? 0;
                  if (amount == null || amount <= 0) return 'Please enter a valid amount';
                  if (amount > balance) return 'Amount exceeds balance';
                  return null;
                },
              ),
              const SizedBox(height: 20),
              DropdownButtonFormField<String>(
                initialValue: _selectedPaymentMethod,
                dropdownColor: AppTheme.darkSurface,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'PAYMENT METHOD',
                  labelStyle: const TextStyle(color: AppTheme.darkTextSecondary, fontSize: 12),
                  filled: true,
                  fillColor: AppTheme.darkSurface,
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.05))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.primaryColor)),
                ),
                items: ['M-Pesa', 'Bank Transfer']
                    .map((method) => DropdownMenuItem(value: method, child: Text(method)))
                    .toList(),
                onChanged: (value) {
                  if (value != null) setState(() => _selectedPaymentMethod = value);
                },
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: requestState.isLoading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: requestState.isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                      : const Text('SUBMIT PAYOUT REQUEST', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1, fontSize: 14)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

