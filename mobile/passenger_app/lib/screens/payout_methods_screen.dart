import 'package:flutter/material.dart';
import '../services/ride_service.dart';

class PayoutMethodsScreen extends StatefulWidget {
  const PayoutMethodsScreen({Key? key}) : super(key: key);

  @override
  State<PayoutMethodsScreen> createState() => _PayoutMethodsScreenState();
}

class _PayoutMethodsScreenState extends State<PayoutMethodsScreen> {
  final RideService _rideService = RideService();
  late Future<List<PayoutMethod>> _payoutMethodsFuture;

  @override
  void initState() {
    super.initState();
    _loadMethods();
  }

  void _loadMethods() {
    _payoutMethodsFuture = _rideService.getPayoutMethods();
  }

  Future<void> _setDefault(String id) async {
    await _rideService.setDefaultPayoutMethod(id);
    setState(() {
      _loadMethods();
    });
  }

  Future<void> _delete(String id) async {
    await _rideService.deletePayoutMethod(id);
    setState(() {
      _loadMethods();
    });
  }

  void _showAddMethodDialog() {
    // In a real app, this would be a more complex form.
    // For this MVP, we'll just add a mock bank account.
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Payout Method'),
        content: const Text(
          'This will add a mock bank account. In a real app, this would be a form.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              await _rideService.addPayoutMethod(
                'bank',
                'Equity Bank: ***5678',
              );
              Navigator.pop(context);
              setState(() {
                _loadMethods();
              });
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payout Methods')),
      body: FutureBuilder<List<PayoutMethod>>(
        future: _payoutMethodsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Could not load payout methods.'));
          }
          final methods = snapshot.data!;
          return ListView.builder(
            itemCount: methods.length,
            itemBuilder: (context, index) {
              final method = methods[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  leading: Icon(
                    method.type == 'mpesa'
                        ? Icons.phone_android
                        : Icons.account_balance,
                  ),
                  title: Text(method.display),
                  subtitle: method.isDefault
                      ? const Text(
                          'Default',
                          style: TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      : null,
                  trailing: PopupMenuButton<String>(
                    onSelected: (value) {
                      if (value == 'default') {
                        _setDefault(method.id);
                      } else if (value == 'delete') {
                        _delete(method.id);
                      }
                    },
                    itemBuilder: (BuildContext context) =>
                        <PopupMenuEntry<String>>[
                      if (!method.isDefault)
                        const PopupMenuItem<String>(
                          value: 'default',
                          child: Text('Set as Default'),
                        ),
                      if (methods.length > 1)
                        const PopupMenuItem<String>(
                          value: 'delete',
                          child: Text('Delete'),
                        ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddMethodDialog,
        label: const Text('Add Method'),
        icon: const Icon(Icons.add),
      ),
    );
  }
}
