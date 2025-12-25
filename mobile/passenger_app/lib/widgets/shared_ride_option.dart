import 'package:flutter/material.dart';

class SharedRideOption extends StatelessWidget {
  final bool isSelected;
  final VoidCallback onTap;
  final double standardFare;
  final double sharedFare;
  final int estimatedExtraTime;

  const SharedRideOption({
    Key? key,
    required this.isSelected,
    required this.onTap,
    required this.standardFare,
    required this.sharedFare,
    this.estimatedExtraTime = 5,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final savings = standardFare - sharedFare;
    final savingsPercent = ((savings / standardFare) * 100).round();

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? Colors.black.withValues(alpha: 0.2)
                        : const Color(0xFFFBBF24).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.people,
                    color: isSelected ? Colors.black : const Color(0xFFF59E0B),
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
                            'Shared Ride',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? Colors.black : Colors.black87,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.green.shade600,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'SAVE $savingsPercent%',
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Share with other riders',
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
                      '\$${sharedFare.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.black : Colors.black87,
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

            // Details
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.black.withValues(alpha: 0.1)
                    : Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  _buildDetailRow(
                    Icons.access_time,
                    'May take $estimatedExtraTime min longer',
                    isSelected,
                  ),
                  const SizedBox(height: 8),
                  _buildDetailRow(
                    Icons.route,
                    'Multiple pickups & drop-offs',
                    isSelected,
                  ),
                  const SizedBox(height: 8),
                  _buildDetailRow(
                    Icons.eco,
                    'Eco-friendly option',
                    isSelected,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Benefits
            Row(
              children: [
                Expanded(
                  child: _buildBenefitChip(
                    '💰 Save \$${savings.toStringAsFixed(2)}',
                    isSelected,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildBenefitChip(
                    '🌍 Reduce emissions',
                    isSelected,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String text, bool isSelected) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: isSelected
              ? Colors.black.withValues(alpha: 0.7)
              : Colors.grey.shade600,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 13,
              color: isSelected
                  ? Colors.black.withValues(alpha: 0.7)
                  : Colors.grey.shade700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBenefitChip(String text, bool isSelected) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: isSelected
            ? Colors.white.withValues(alpha: 0.3)
            : const Color(0xFFFBBF24).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: isSelected ? Colors.black : const Color(0xFFF59E0B),
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}

// Example usage
class SharedRideExample extends StatefulWidget {
  const SharedRideExample({Key? key}) : super(key: key);

  @override
  State<SharedRideExample> createState() => _SharedRideExampleState();
}

class _SharedRideExampleState extends State<SharedRideExample> {
  bool isSharedSelected = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Choose Ride Type'),
        backgroundColor: const Color(0xFFFBBF24),
      ),
      body: Column(
        children: [
          const SizedBox(height: 16),

          // Standard Ride Option
          GestureDetector(
            onTap: () {
              setState(() {
                isSharedSelected = false;
              });
            },
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color:
                    !isSharedSelected ? const Color(0xFFFBBF24) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: !isSharedSelected
                      ? const Color(0xFFF59E0B)
                      : Colors.grey.shade300,
                  width: !isSharedSelected ? 2 : 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.directions_car,
                    color:
                        !isSharedSelected ? Colors.black : Colors.grey.shade600,
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Standard Ride',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const Text(
                    '\$15.50',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Shared Ride Option
          SharedRideOption(
            isSelected: isSharedSelected,
            onTap: () {
              setState(() {
                isSharedSelected = true;
              });
            },
            standardFare: 15.50,
            sharedFare: 9.99,
            estimatedExtraTime: 7,
          ),

          const Spacer(),

          // Confirm Button
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFBBF24),
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Text(
                  isSharedSelected ? 'Request Shared Ride' : 'Request Ride',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
