import 'package:flutter/material.dart';

// Mock data models for demonstration
class PaymentMethod {
  final String id;
  final String last4;
  final String brand;

  PaymentMethod({required this.id, required this.last4, required this.brand});
}

class BusinessProfile {
  String? workEmail;
  String? expenseCode;
  PaymentMethod? paymentMethod;

  BusinessProfile({this.workEmail, this.expenseCode, this.paymentMethod});
}

// Mock service to simulate backend interactions
class BusinessProfileService {
  Future<void> saveProfile(BusinessProfile profile) async {
    await Future.delayed(const Duration(milliseconds: 500));
    print('Saving profile: ${profile.workEmail}, ${profile.expenseCode}');
  }
}

class BusinessProfileScreen extends StatefulWidget {
  const BusinessProfileScreen({super.key});

  @override
  State<BusinessProfileScreen> createState() => _BusinessProfileScreenState();
}

class _BusinessProfileScreenState extends State<BusinessProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _profileService = BusinessProfileService();
  final _emailController = TextEditingController();
  final _expenseCodeController = TextEditingController();

  PaymentMethod? _selectedPaymentMethod;
  bool _isLoading = false;

  // Mock list of available payment methods for the user
  final List<PaymentMethod> _availablePaymentMethods = [
    PaymentMethod(id: 'pm_1', last4: '4242', brand: 'Visa'),
    PaymentMethod(id: 'pm_2', last4: '5555', brand: 'MasterCard'),
  ];

  @override
  void initState() {
    super.initState();
    // In a real app, you'd fetch the existing profile and populate the fields.
    // For this mock, we'll pre-select the first payment method.
    if (_availablePaymentMethods.isNotEmpty) {
      _selectedPaymentMethod = _availablePaymentMethods.first;
    }
  }

  Future<void> _saveProfile() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      final profile = BusinessProfile(
        workEmail: _emailController.text,
        expenseCode: _expenseCodeController.text,
        paymentMethod: _selectedPaymentMethod,
      );

      await _profileService.saveProfile(profile);

      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Business profile saved!')),
        );
        Navigator.of(context).pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Business Profile'),
        actions: [
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.only(right: 16.0),
              child: Center(child: CircularProgressIndicator()),
            )
          else
            TextButton(onPressed: _saveProfile, child: const Text('Save')),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Work Email for Receipts',
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value == null || value.isEmpty || !value.contains('@')) {
                  return 'Please enter a valid email';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _expenseCodeController,
              decoration: const InputDecoration(
                labelText: 'Default Expense Code (Optional)',
              ),
            ),
            const SizedBox(height: 24),
            DropdownButtonFormField<PaymentMethod>(
              value: _selectedPaymentMethod,
              decoration: const InputDecoration(labelText: 'Payment Method'),
              items: _availablePaymentMethods
                  .map(
                    (pm) => DropdownMenuItem(
                      value: pm,
                      child: Text('${pm.brand} ending in ${pm.last4}'),
                    ),
                  )
                  .toList(),
              onChanged: (PaymentMethod? newValue) {
                setState(() => _selectedPaymentMethod = newValue);
              },
              validator: (value) =>
                  value == null ? 'Please select a payment method' : null,
            ),
          ],
        ),
      ),
    );
  }
}
