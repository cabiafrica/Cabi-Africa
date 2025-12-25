import 'package:flutter/material.dart';

class WaitAndSaveOption extends StatelessWidget {
  final bool isSelected;
  final VoidCallback onTap;
  final double standardFare;
  final double discountedFare;
  final int standardWaitMinutes;
  final int extendedWaitMinutes;

  const WaitAndSaveOption({
    Key? key,
    required this.isSelected,
    required this.onTap,
    required this.standardFare,
    required this.discountedFare,
    required this.standardWaitMinutes,
    required this.extendedWaitMinutes,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final savings = standardFare - discountedFare;
    final savingsPercentage = ((savings / standardFare) * 100).round();

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        margin: const EdgeInsets.symmetric(vertical: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isSelected ? null : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFFF59E0B) : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: const Color(0xFFFBBF24).withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              children: [
                // Icon
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.black : const Color(0xFFFBBF24),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.schedule,
                    color: isSelected ? const Color(0xFFFBBF24) : Colors.black,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),

                // Title and Badge
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Wait & Save',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: isSelected
                                  ? Colors.black
                                  : Colors.grey.shade900,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? Colors.black
                                  : const Color(0xFFFBBF24),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Save $savingsPercentage%',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isSelected
                                    ? const Color(0xFFFBBF24)
                                    : Colors.black,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Lower price, longer wait',
                        style: TextStyle(
                          fontSize: 13,
                          color: isSelected
                              ? Colors.black.withValues(alpha: 0.7)
                              : Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),

                // Price
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '\$${discountedFare.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.black : Colors.grey.shade900,
                      ),
                    ),
                    Text(
                      '\$${standardFare.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 14,
                        decoration: TextDecoration.lineThrough,
                        color: isSelected
                            ? Colors.black.withValues(alpha: 0.5)
                            : Colors.grey.shade500,
                      ),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Divider
            Container(
              height: 1,
              color: isSelected
                  ? Colors.black.withValues(alpha: 0.2)
                  : Colors.grey.shade200,
            ),

            const SizedBox(height: 16),

            // Details Row
            Row(
              children: [
                // Wait Time
                Expanded(
                  child: _DetailItem(
                    icon: Icons.access_time,
                    label: 'Wait Time',
                    value: '$extendedWaitMinutes min',
                    isSelected: isSelected,
                  ),
                ),

                // Vertical Divider
                Container(
                  width: 1,
                  height: 40,
                  color: isSelected
                      ? Colors.black.withValues(alpha: 0.2)
                      : Colors.grey.shade200,
                ),

                // Savings
                Expanded(
                  child: _DetailItem(
                    icon: Icons.savings_outlined,
                    label: 'You Save',
                    value: '\$${savings.toStringAsFixed(2)}',
                    isSelected: isSelected,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Info Banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.black.withValues(alpha: 0.1)
                    : Colors.grey.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    size: 16,
                    color: isSelected ? Colors.black : Colors.grey.shade600,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Your ride will be matched with nearby drivers for better efficiency',
                      style: TextStyle(
                        fontSize: 12,
                        color: isSelected
                            ? Colors.black.withValues(alpha: 0.8)
                            : Colors.grey.shade600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isSelected;

  const _DetailItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.isSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(
          icon,
          size: 20,
          color: isSelected ? Colors.black : Colors.grey.shade600,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: isSelected
                ? Colors.black.withValues(alpha: 0.7)
                : Colors.grey.shade500,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.black : Colors.grey.shade900,
          ),
        ),
      ],
    );
  }
}
