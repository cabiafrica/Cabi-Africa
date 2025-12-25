import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
  String _selectedPaymentMethod = 'M-Pesa'; // Default value

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
        error: (err, stack) => ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: ${err.toString()}'))),
        data: (_) {
          // Check if the state is not loading and has data (i.e., successful)
          if (!state.isLoading && state.hasValue) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Payout request submitted successfully!'),
              ),
            );
            // Optionally navigate back or reset form
            Navigator.of(context).pop();
          }
        },
      );
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Request Payout')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              availableEarnings.when(
                data: (balance) => Text(
                  'Available Balance: KES ${balance.toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Text('Error: ${err.toString()}'),
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _amountController,
                decoration: const InputDecoration(
                  labelText: 'Amount to Withdraw',
                  prefixText: 'KES ',
                ),
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter an amount';
                  }
                  final amount = double.tryParse(value);
                  final balance = availableEarnings.value ?? 0;
                  if (amount == null || amount <= 0) {
                    return 'Please enter a valid amount';
                  }
                  if (amount > balance) {
                    return 'Amount exceeds available balance';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _selectedPaymentMethod,
                decoration: const InputDecoration(labelText: 'Payment Method'),
                items: ['M-Pesa', 'Bank Transfer']
                    .map(
                      (method) =>
                          DropdownMenuItem(value: method, child: Text(method)),
                    )
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedPaymentMethod = value);
                  }
                },
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: requestState.isLoading ? null : _submit,
                  child: requestState.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Request Payout'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
