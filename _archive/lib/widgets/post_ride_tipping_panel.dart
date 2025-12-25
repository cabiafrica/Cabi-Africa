import 'package:flutter/material.dart';

class PostRideTippingPanel extends StatefulWidget {
  final Function(double) onTipSelected;

  const PostRideTippingPanel({super.key, required this.onTipSelected});

  @override
  State<PostRideTippingPanel> createState() => _PostRideTippingPanelState();
}

class _PostRideTippingPanelState extends State<PostRideTippingPanel> {
  double? _selectedTip;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16.0),
      elevation: 8,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Add a Tip for Your Driver',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildTipButton(10.0),
                _buildTipButton(15.0),
                _buildTipButton(20.0),
              ],
            ),
            const SizedBox(height: 16),
            // TODO: Add a custom tip amount field
            ElevatedButton(
              onPressed: () => widget.onTipSelected(_selectedTip ?? 0.0),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('CONFIRM TIP'),
            ),
            TextButton(
              onPressed: () => widget.onTipSelected(0.0),
              child: const Text('No Tip'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTipButton(double tip) {
    final isSelected = _selectedTip == tip;
    return OutlinedButton(
      onPressed: () => setState(() => _selectedTip = tip),
      style: OutlinedButton.styleFrom(
        backgroundColor: isSelected
            ? Theme.of(context).primaryColor.withOpacity(0.1)
            : null,
        side: BorderSide(
          color: isSelected ? Theme.of(context).primaryColor : Colors.grey,
        ),
      ),
      child: Text('${tip.toStringAsFixed(0)}%'),
    );
  }
}
