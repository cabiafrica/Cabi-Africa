import 'package:flutter/material.dart';

class TipSelectionWidget extends StatefulWidget {
  final double fareAmount;
  final Function(double) onTipSelected;

  const TipSelectionWidget({
    super.key,
    required this.fareAmount,
    required this.onTipSelected,
  });

  @override
  State<TipSelectionWidget> createState() => _TipSelectionWidgetState();
}

class _TipSelectionWidgetState extends State<TipSelectionWidget> {
  double _selectedTip = 0.0;
  String _selectedOption = 'none';

  void _selectTip(String option, double amount) {
    setState(() {
      _selectedOption = option;
      _selectedTip = amount;
    });
    widget.onTipSelected(amount);
  }

  void _showCustomTipDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Enter Custom Tip'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            prefixText: 'KES ',
            labelText: 'Tip Amount',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              final amount = double.tryParse(controller.text) ?? 0.0;
              Navigator.pop(ctx);
              _selectTip('custom', amount);
            },
            child: const Text('CONFIRM'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tip10 = widget.fareAmount * 0.10;
    final tip15 = widget.fareAmount * 0.15;
    final tip20 = widget.fareAmount * 0.20;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.favorite, color: Colors.pink, size: 20),
              SizedBox(width: 8),
              Text('Add a tip for your driver',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _TipButton(
                  label: '10%',
                  amount: tip10,
                  isSelected: _selectedOption == '10',
                  onTap: () => _selectTip('10', tip10),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _TipButton(
                  label: '15%',
                  amount: tip15,
                  isSelected: _selectedOption == '15',
                  onTap: () => _selectTip('15', tip15),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _TipButton(
                  label: '20%',
                  amount: tip20,
                  isSelected: _selectedOption == '20',
                  onTap: () => _selectTip('20', tip20),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _showCustomTipDialog,
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(
                      color: _selectedOption == 'custom'
                          ? Colors.blue
                          : Colors.grey,
                      width: _selectedOption == 'custom' ? 2 : 1,
                    ),
                  ),
                  child: Text(
                    _selectedOption == 'custom'
                        ? 'KES ${_selectedTip.toStringAsFixed(2)}'
                        : 'Custom',
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _selectTip('none', 0.0),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(
                      color:
                          _selectedOption == 'none' ? Colors.blue : Colors.grey,
                      width: _selectedOption == 'none' ? 2 : 1,
                    ),
                  ),
                  child: const Text('No Tip'),
                ),
              ),
            ],
          ),
          if (_selectedTip > 0) ...[
            const SizedBox(height: 8),
            Text(
              'Total: KES ${(widget.fareAmount + _selectedTip).toStringAsFixed(2)}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ],
        ],
      ),
    );
  }
}

class _TipButton extends StatelessWidget {
  final String label;
  final double amount;
  final bool isSelected;
  final VoidCallback onTap;

  const _TipButton({
    required this.label,
    required this.amount,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? Colors.blue : Colors.grey[300]!,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'KES ${amount.toStringAsFixed(2)}',
              style: TextStyle(
                fontSize: 12,
                color: isSelected ? Colors.white70 : Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
