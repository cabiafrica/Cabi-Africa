import 'package:flutter/material.dart';

class SpendingLimitWidget extends StatefulWidget {
  final String memberName;
  final double currentLimit;
  final double currentSpending;
  final ValueChanged<double?> onLimitChanged;

  const SpendingLimitWidget({
    Key? key,
    required this.memberName,
    required this.currentLimit,
    required this.currentSpending,
    required this.onLimitChanged,
  }) : super(key: key);

  @override
  State<SpendingLimitWidget> createState() => _SpendingLimitWidgetState();
}

class _SpendingLimitWidgetState extends State<SpendingLimitWidget> {
  late TextEditingController _controller;
  bool _isUnlimited = false;

  @override
  void initState() {
    super.initState();
    _isUnlimited = widget.currentLimit < 0; // Assuming -1 means unlimited
    _controller = TextEditingController(
      text: _isUnlimited ? '' : widget.currentLimit.toStringAsFixed(2),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _save() {
    if (_isUnlimited) {
      widget.onLimitChanged(null); // Null or -1 to signify unlimited
    } else {
      final value = double.tryParse(_controller.text);
      if (value != null) {
        widget.onLimitChanged(value);
      }
    }
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.attach_money, color: Colors.green.shade700),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Spending Limit',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Set a monthly spending limit for ${widget.memberName}.',
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: 20),

            // Unlimited Checkbox
            SwitchListTile(
              title: const Text('Unlimited Spending'),
              value: _isUnlimited,
              activeTrackColor: Colors.green,
              contentPadding: EdgeInsets.zero,
              onChanged: (val) {
                setState(() {
                  _isUnlimited = val;
                });
              },
            ),

            if (!_isUnlimited) ...[
              const SizedBox(height: 12),
              TextField(
                controller: _controller,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: 'Monthly Limit Amount',
                  prefixText: '\$ ',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Colors.green, width: 2),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 20),

            // Stats
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Spent this month:'),
                  Text(
                    '\$${widget.currentSpending.toStringAsFixed(2)}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Save Limit'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
