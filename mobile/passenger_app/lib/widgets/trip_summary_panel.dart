import 'package:flutter/material.dart';

class TripSummaryPanel extends StatefulWidget {
  final Map<String, dynamic> tripDetails;
  final Function(double) onPaymentConfirmed;

  const TripSummaryPanel({
    super.key,
    required this.tripDetails,
    required this.onPaymentConfirmed,
  });

  @override
  State<TripSummaryPanel> createState() => _TripSummaryPanelState();
}

class _TripSummaryPanelState extends State<TripSummaryPanel> {
  double _tipAmount = 0.0;
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    final finalFare = widget.tripDetails['finalFare'] as double? ?? 0.0;
    final totalAmount = finalFare + _tipAmount;

    final roundUpDifference =
        (finalFare + _tipAmount).ceil() - (finalFare + _tipAmount);
    final roundUpAmount = _tipAmount + roundUpDifference;
    final canRoundUp = roundUpDifference > 0.01;
    final roundUpButtonText = canRoundUp
        ? 'Round Up (+KES ${roundUpDifference.toStringAsFixed(2)})'
        : 'Rounded Up!';

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Card(
        margin: const EdgeInsets.all(16.0),
        elevation: 8,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Trip Completed',
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              const Divider(height: 24),
              _buildDetailRow(
                'Final Fare:',
                'KES ${finalFare.toStringAsFixed(2)}',
              ),
              _buildDetailRow('Tip:', 'KES ${_tipAmount.toStringAsFixed(2)}'),
              const Divider(),
              _buildDetailRow(
                'Total:',
                'KES ${totalAmount.toStringAsFixed(2)}',
                isTotal: true,
              ),
              const SizedBox(height: 16),
              const Text('Add a tip:', style: TextStyle(fontSize: 16)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  for (var tip in [10.0, 20.0, 50.0])
                    OutlinedButton(
                      onPressed: () => setState(() => _tipAmount = tip),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: _tipAmount == tip
                            ? Theme.of(context)
                                .primaryColor
                                .withValues(alpha: 0.1)
                            : null,
                      ),
                      child: Text('KES ${tip.toStringAsFixed(0)}'),
                    ),
                  OutlinedButton(
                    onPressed: canRoundUp
                        ? () => setState(() => _tipAmount = roundUpAmount)
                        : null,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: canRoundUp ? null : Colors.grey,
                    ),
                    child: Text(roundUpButtonText),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isProcessing
                    ? null
                    : () async {
                        setState(() => _isProcessing = true);
                        await widget.onPaymentConfirmed(totalAmount);
                        if (mounted) {
                          setState(() => _isProcessing = false);
                        }
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isProcessing
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'PAY NOW',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isTotal = false}) {
    final style = isTotal
        ? Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)
        : Theme.of(context).textTheme.titleMedium;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: style),
          Text(value, style: style),
        ],
      ),
    );
  }
}

