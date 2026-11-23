import 'package:flutter/material.dart';

enum PayoutMethodType { bank, mpesa }

class PayoutSetupScreen extends StatefulWidget {
  const PayoutSetupScreen({super.key});

  @override
  State<PayoutSetupScreen> createState() => _PayoutSetupScreenState();
}

class _PayoutSetupScreenState extends State<PayoutSetupScreen> {
  final _formKey = GlobalKey<FormState>();

  // Bank Controllers
  final _bankNameController = TextEditingController();
  final _accountNumberController = TextEditingController();
  final _routingNumberController = TextEditingController();

  // M-Pesa Controllers
  final _mpesaNameController = TextEditingController();
  final _mpesaPhoneController = TextEditingController();

  PayoutMethodType _selectedMethod =
      PayoutMethodType.mpesa; // Default to M-Pesa commonly
  bool _isSaving = false;
  bool _obscureAccount = true;

  @override
  void dispose() {
    _bankNameController.dispose();
    _accountNumberController.dispose();
    _routingNumberController.dispose();
    _mpesaNameController.dispose();
    _mpesaPhoneController.dispose();
    super.dispose();
  }

  Future<void> _savePayoutMethod() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSaving = true);

      // Mock API call to secure storage
      await Future.delayed(const Duration(seconds: 2));

      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(
                  '${_selectedMethod == PayoutMethodType.mpesa ? "Mobile Money" : "Bank"} details saved successfully!'),
              backgroundColor: Colors.green),
        );
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const cabiYellow = Color(0xFFFFBE0B);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Setup Payout Method'),
        backgroundColor: cabiYellow,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Select Payment Method',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),

              // Method Selector
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(
                          () => _selectedMethod = PayoutMethodType.mpesa),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _selectedMethod == PayoutMethodType.mpesa
                              ? Colors.black
                              : Colors.grey[200],
                          borderRadius: BorderRadius.circular(8),
                          border: _selectedMethod == PayoutMethodType.mpesa
                              ? Border.all(color: cabiYellow, width: 2)
                              : null,
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.phone_android,
                                color: _selectedMethod == PayoutMethodType.mpesa
                                    ? cabiYellow
                                    : Colors.grey),
                            const SizedBox(height: 4),
                            Text("M-Pesa",
                                style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: _selectedMethod ==
                                            PayoutMethodType.mpesa
                                        ? Colors.white
                                        : Colors.black)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(
                          () => _selectedMethod = PayoutMethodType.bank),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _selectedMethod == PayoutMethodType.bank
                              ? Colors.black
                              : Colors.grey[200],
                          borderRadius: BorderRadius.circular(8),
                          border: _selectedMethod == PayoutMethodType.bank
                              ? Border.all(color: cabiYellow, width: 2)
                              : null,
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.account_balance,
                                color: _selectedMethod == PayoutMethodType.bank
                                    ? cabiYellow
                                    : Colors.grey),
                            const SizedBox(height: 4),
                            Text("Bank Transfer",
                                style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color:
                                        _selectedMethod == PayoutMethodType.bank
                                            ? Colors.white
                                            : Colors.black)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),
              const Text(
                'Enter Details',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              if (_selectedMethod == PayoutMethodType.mpesa) ...[
                TextFormField(
                  controller: _mpesaNameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name (as per ID)',
                    border: OutlineInputBorder(),
                    focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: cabiYellow, width: 2)),
                    prefixIcon: Icon(Icons.person),
                  ),
                  validator: (value) => value == null || value.isEmpty
                      ? 'Please enter full name'
                      : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _mpesaPhoneController,
                  decoration: const InputDecoration(
                      labelText: 'M-Pesa Phone Number',
                      border: OutlineInputBorder(),
                      focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: cabiYellow, width: 2)),
                      prefixIcon: Icon(Icons.phone),
                      hintText: '07...'),
                  keyboardType: TextInputType.phone,
                  validator: (value) => value == null || value.isEmpty
                      ? 'Please enter phone number'
                      : null,
                ),
              ] else ...[
                TextFormField(
                  controller: _bankNameController,
                  decoration: const InputDecoration(
                    labelText: 'Bank Name',
                    border: OutlineInputBorder(),
                    focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: cabiYellow, width: 2)),
                    prefixIcon: Icon(Icons.account_balance),
                  ),
                  validator: (value) => value == null || value.isEmpty
                      ? 'Please enter bank name'
                      : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _accountNumberController,
                  obscureText: _obscureAccount,
                  decoration: InputDecoration(
                    labelText: 'Account Number',
                    border: const OutlineInputBorder(),
                    focusedBorder: const OutlineInputBorder(
                        borderSide:
                            BorderSide(color: Color(0xFFFFBE0B), width: 2)),
                    prefixIcon: const Icon(Icons.numbers),
                    suffixIcon: IconButton(
                      icon: Icon(_obscureAccount
                          ? Icons.visibility
                          : Icons.visibility_off),
                      onPressed: () =>
                          setState(() => _obscureAccount = !_obscureAccount),
                    ),
                  ),
                  keyboardType: TextInputType.number,
                  validator: (value) => value == null || value.isEmpty
                      ? 'Please enter account number'
                      : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _routingNumberController,
                  decoration: const InputDecoration(
                    labelText: 'Routing Number',
                    border: OutlineInputBorder(),
                    focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: cabiYellow, width: 2)),
                    prefixIcon: Icon(Icons.confirmation_number),
                  ),
                  keyboardType: TextInputType.number,
                  validator: (value) => value == null || value.isEmpty
                      ? 'Please enter routing number'
                      : null,
                ),
              ],

              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _savePayoutMethod,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black, // Cabi Black
                    foregroundColor: cabiYellow, // Cabi Yellow
                    textStyle: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  child: _isSaving
                      ? const CircularProgressIndicator(color: cabiYellow)
                      : const Text('SAVE PAYOUT METHOD'),
                ),
              ),

              const SizedBox(height: 16),
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.lock, size: 16, color: Colors.green),
                  SizedBox(width: 8),
                  Text('Your information is encrypted and secure.',
                      style: TextStyle(fontSize: 12, color: Colors.green)),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
