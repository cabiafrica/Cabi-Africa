import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

/// A widget that displays the trip summary and tipping options.
///
/// This is a stateful widget to manage the selected tip amount.
class TripSummaryPanel extends StatefulWidget {
  final double fare;
  final String currency;

  const TripSummaryPanel({Key? key, required this.fare, this.currency = 'KES'})
    : super(key: key);

  @override
  _TripSummaryPanelState createState() => _TripSummaryPanelState();
}

class _TripSummaryPanelState extends State<TripSummaryPanel> {
  double? _selectedTip;

  /// Calculates the amount needed to round up the fare to the next whole number.
  double _calculateRoundUpTip() {
    if (widget.fare == widget.fare.ceil()) {
      return 1.0; // If fare is already a whole number, round up to the next one.
    }
    final double cents = widget.fare - widget.fare.floor();
    final double tip = 1.0 - cents;
    // handle floating point inaccuracies, round to 2 decimal places
    return (tip * 100).round() / 100.0;
  }

  void _selectTip(double tip) {
    setState(() {
      _selectedTip = tip;
    });
  }

  @override
  Widget build(BuildContext context) {
    final roundUpAmount = _calculateRoundUpTip();
    final currencyFormat = NumberFormat.currency(symbol: '${widget.currency} ');

    final total = widget.fare + (_selectedTip ?? 0.0);

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Add a Tip',
            style: Theme.of(context).textTheme.headline6,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Standard Tip Buttons (Example)
              ElevatedButton(
                onPressed: () => _selectTip(50.0),
                child: const Text('KES 50'),
              ),
              ElevatedButton(
                onPressed: () => _selectTip(100.0),
                child: const Text('KES 100'),
              ),
              // "Round Up" Button
              ElevatedButton(
                onPressed: () => _selectTip(roundUpAmount),
                child: Text(
                  'Round Up (+${currencyFormat.format(roundUpAmount)})',
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Divider(),
          ListTile(
            title: const Text('Fare'),
            trailing: Text(currencyFormat.format(widget.fare)),
          ),
          ListTile(
            title: const Text('Tip'),
            trailing: Text(currencyFormat.format(_selectedTip ?? 0.0)),
          ),
          const Divider(),
          ListTile(
            title: Text(
              'Total',
              style: Theme.of(
                context,
              ).textTheme.bodyText1?.copyWith(fontWeight: FontWeight.bold),
            ),
            trailing: Text(
              currencyFormat.format(total),
              style: Theme.of(
                context,
              ).textTheme.bodyText1?.copyWith(fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              // This would trigger the payment service
            },
            child: const Text('Pay Now'),
          ),
        ],
      ),
    );
  }
}
