import 'package:core_models/core_models.dart';
import 'package:flutter/material.dart';

class TripSummaryPanel extends StatefulWidget {
  final Trip
      ride; // Variable name 'ride' kept for less diff, or should I change to 'trip'? Let's keep 'ride' var name but type 'Trip'.
  final Function(double totalAmount) onPaymentConfirmed;

  const TripSummaryPanel({
    super.key,
    required this.ride,
    required this.onPaymentConfirmed,
  });

  @override
  State<TripSummaryPanel> createState() => _TripSummaryPanelState();
}

class _TripSummaryPanelState extends State<TripSummaryPanel> {
  double _tipAmount = 0.0;
  int? _selectedTipIndex;

  void _setTip(int index, double percentage) {
    setState(() {
      _selectedTipIndex = index;
      _tipAmount = widget.ride.fare * percentage;
    });
  }

  @override
  Widget build(BuildContext context) {
    final totalAmount = widget.ride.fare + _tipAmount;

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Material(
        elevation: 10,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Trip Completed',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Fare:', style: TextStyle(fontSize: 16)),
                  Text(
                    '\$${widget.ride.fare.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Tip:', style: TextStyle(fontSize: 16)),
                  Text(
                    '\$${_tipAmount.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              const Text('Add a tip:', style: TextStyle(fontSize: 16)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  for (var i = 0; i < 3; i++)
                    ElevatedButton(
                      onPressed: () => _setTip(i, [0.15, 0.20, 0.25][i]),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _selectedTipIndex == i
                            ? Theme.of(context).primaryColor
                            : Colors.grey[300],
                      ),
                      child: Text('${[15, 20, 25][i]}%'),
                    ),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => widget.onPaymentConfirmed(totalAmount),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: Text(
                    'Pay \$${totalAmount.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 18),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
