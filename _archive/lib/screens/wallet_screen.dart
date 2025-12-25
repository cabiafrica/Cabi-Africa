import 'package:flutter/material.dart';
import '../widgets/next_payout_widget.dart';
import 'package:cabi_flutter/apps/driver-app/src/screens/manage_payout_method_screen.dart'; // Assuming path

/// A screen that displays the driver's financial information, including the next payout.
class WalletScreen extends StatelessWidget {
  const WalletScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Wallet')),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const ManagePayoutMethodScreen(),
              ),
            );
          },
          child: const NextPayoutWidget(), // This now acts as a button
        ),
      ),
    );
  }
}
