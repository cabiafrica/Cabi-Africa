import '../theme/app_theme.dart';
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final dialogBg = isDark ? const Color(0xFF1E1E24) : Colors.white;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final controller = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: dialogBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Enter Custom Tip',
          style: TextStyle(fontWeight: FontWeight.bold, color: textPrimary),
        ),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          style: TextStyle(color: textPrimary),
          decoration: const InputDecoration(
            prefixText: 'KES ',
            labelText: 'Tip Amount',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'CANCEL',
              style: TextStyle(
                color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              final amount = double.tryParse(controller.text) ?? 0.0;
              Navigator.pop(ctx);
              _selectTip('custom', amount);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: accent,
              foregroundColor: isDark ? Colors.black : Colors.white,
            ),
            child: const Text('CONFIRM'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final cardBg = isDark ? const Color(0xFF16161A) : AppTheme.porcelainSurfaceContainer;
    final outline = isDark ? Colors.white12 : AppTheme.porcelainOutline;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;

    final tip10 = widget.fareAmount * 0.10;
    final tip15 = widget.fareAmount * 0.15;
    final tip20 = widget.fareAmount * 0.20;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.favorite, color: Colors.pinkAccent, size: 20),
              const SizedBox(width: 8),
              Text(
                'Add a tip for your driver',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textPrimary),
              ),
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
                    foregroundColor: _selectedOption == 'custom' ? accent : textSecondary,
                    side: BorderSide(
                      color: _selectedOption == 'custom'
                          ? accent
                          : outline,
                      width: _selectedOption == 'custom' ? 2 : 1,
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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
                    foregroundColor: _selectedOption == 'none' ? accent : textSecondary,
                    side: BorderSide(
                      color: _selectedOption == 'none' ? accent : outline,
                      width: _selectedOption == 'none' ? 2 : 1,
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textPrimary),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final btnBg = isSelected
        ? accent
        : (isDark ? const Color(0xFF222228) : Colors.white);
    final border = isSelected
        ? accent
        : (isDark ? Colors.white12 : AppTheme.porcelainOutline);
    final titleColor = isSelected
        ? (isDark ? Colors.black : Colors.white)
        : (isDark ? Colors.white : AppTheme.porcelainTextPrimary);
    final amountColor = isSelected
        ? (isDark ? Colors.black87 : Colors.white70)
        : (isDark ? Colors.white70 : AppTheme.porcelainTextSecondary);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: btnBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: titleColor,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'KES ${amount.toStringAsFixed(2)}',
              style: TextStyle(
                fontSize: 12,
                color: amountColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
