import 'package:flutter/material.dart';
import 'package:core_ui/core_ui.dart';

class ProcessingPaymentPanel extends StatelessWidget {
  const ProcessingPaymentPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return BasePanel(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 20),
          Text(
            'Processing your payment...',
            style: Theme.of(context).textTheme.titleMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
