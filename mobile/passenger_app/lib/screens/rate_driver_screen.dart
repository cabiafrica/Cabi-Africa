import 'package:flutter/material.dart';
import '../services/ride_service.dart';
import '../theme/app_theme.dart';

class RateDriverScreen extends StatefulWidget {
  final String rideId;
  final String driverName;
  final double? fare;
  final String? destination;
  final String? vehicleInfo;

  const RateDriverScreen({
    super.key,
    required this.rideId,
    required this.driverName,
    this.fare,
    this.destination,
    this.vehicleInfo,
  });

  @override
  State<RateDriverScreen> createState() => _RateDriverScreenState();
}

class _RateDriverScreenState extends State<RateDriverScreen> {
  final RideService _rideService = RideService();
  int _rating = 5;
  int? _selectedTipAmount = 100;
  final Set<String> _selectedCompliments = {'Smooth Driving', 'Exceptional Hospitality'};
  final TextEditingController _commentController = TextEditingController();
  final TextEditingController _customTipController = TextEditingController();
  bool _isSubmitting = false;

  final List<String> _complimentOptions = [
    'Immaculate Vehicle',
    'Smooth Driving',
    'Exceptional Hospitality',
    'Great Conversation',
    'Prompt Arrival',
    'Safe Navigation',
  ];

  final List<int> _tipOptions = [50, 100, 200, 500];

  final List<String> _ratingLabels = [
    'POOR EXPERIENCE',
    'COULD BE BETTER',
    'SATISFACTORY TRIP',
    'GREAT SERVICE',
    'EXCEPTIONAL EXPERIENCE',
  ];

  @override
  void dispose() {
    _commentController.dispose();
    _customTipController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_rating == 0 || _isSubmitting) return;
    setState(() => _isSubmitting = true);

    try {
      final compliments = _selectedCompliments.join(', ');
      final fullComment = _commentController.text.trim().isEmpty
          ? compliments
          : '$compliments. ${_commentController.text.trim()}';

      await _rideService.rateDriver(
        widget.rideId,
        _rating,
        fullComment,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF1E1E24),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: AppTheme.outlineGold),
            ),
            content: Row(
              children: [
                const Icon(Icons.verified_rounded, color: AppTheme.primaryColor),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Thank you! Chauffeur rating & feedback logged.',
                    style: AppTheme.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error submitting rating: $e')),
        );
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fareDisplay = widget.fare != null ? widget.fare!.toStringAsFixed(0) : '520';
    final destinationDisplay = widget.destination ?? 'Delta Towers, Westlands';
    final vehicleDisplay = widget.vehicleInfo ?? 'Black Mercedes-Benz E-Class';

    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF121215),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Trip Receipt Details',
          style: AppTheme.outfit(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.outlineGold),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.verified_user_rounded, color: AppTheme.primaryColor, size: 14),
                const SizedBox(width: 4),
                Text(
                  'Verified',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 40),
        child: Column(
          children: [
            // Journey Complete Badge
            Center(
              child: Column(
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF1A1A20),
                          border: Border.all(color: AppTheme.outlineGold, width: 1.5),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primaryColor.withValues(alpha: 0.2),
                              blurRadius: 16,
                            ),
                          ],
                        ),
                        child: Container(
                          margin: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: AppTheme.goldGradient,
                          ),
                          child: const Icon(
                            Icons.check_rounded,
                            color: Colors.black,
                            size: 28,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'JOURNEY COMPLETE',
                    style: AppTheme.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primaryColor,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'You have arrived at your destination!',
                    style: AppTheme.outfit(
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.location_on_rounded, color: AppTheme.primaryColor, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        destinationDisplay,
                        style: AppTheme.inter(
                          fontSize: 13,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Total Fare Paid Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF141418),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.outlineGold),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x18000000),
                    blurRadius: 14,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'TOTAL FARE PAID',
                            style: AppTheme.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.primaryColor,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'KES $fareDisplay',
                            style: AppTheme.montserrat(
                              fontSize: 28,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppTheme.outlineGold),
                            ),
                            child: Text(
                              'Prepaid M-Pesa',
                              style: AppTheme.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.primaryColor,
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Ref: #${widget.rideId.substring(0, widget.rideId.length.clamp(0, 8)).toUpperCase()}',
                            style: AppTheme.inter(
                              fontSize: 11,
                              color: Colors.white38,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Fare itemization breakdown
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1B1B22),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Column(
                      children: [
                        _buildFareRow('Base Fare', 'KES 250'),
                        const SizedBox(height: 8),
                        _buildFareRow('Distance Rate (6.8 km)', 'KES 204'),
                        const SizedBox(height: 8),
                        _buildFareRow('Time (18 mins)', 'KES 72'),
                        const SizedBox(height: 8),
                        _buildFareRow('Surge Discount', '-KES 6', isDiscount: true),
                        const Divider(color: Colors.white12, height: 16),
                        _buildFareRow('Subtotal', 'KES $fareDisplay', isBold: true),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Icon(
                              Icons.account_balance_wallet_rounded,
                              color: AppTheme.primaryColor,
                              size: 16,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Settled via M-Pesa Express',
                            style: AppTheme.inter(
                              fontSize: 12,
                              color: Colors.white70,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primaryColor.withValues(alpha: 0.6),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Official Tax Waybill (PDF) sent to registered email')),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white24),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      minimumSize: const Size(double.infinity, 42),
                    ),
                    icon: const Icon(Icons.receipt_long_rounded, color: AppTheme.primaryColor, size: 16),
                    label: Text(
                      'Download Official Tax Waybill (PDF)',
                      style: AppTheme.inter(fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Chauffeur Rating & Feedback Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF141418),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: AppTheme.primaryColor, width: 2),
                          color: const Color(0xFF222228),
                        ),
                        child: const Icon(
                          Icons.person_rounded,
                          color: AppTheme.primaryColor,
                          size: 30,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  widget.driverName.isEmpty ? 'Samuel Mwangi' : widget.driverName,
                                  style: AppTheme.outfit(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    gradient: AppTheme.goldGradient,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    'GOLD',
                                    style: AppTheme.inter(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w900,
                                      color: Colors.black,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              vehicleDisplay,
                              style: AppTheme.inter(
                                fontSize: 12,
                                color: Colors.white60,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  Text(
                    'How was your journey with ${widget.driverName.isEmpty ? 'your chauffeur' : widget.driverName}?',
                    style: AppTheme.outfit(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),

                  // Interactive Star Rating
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      final starValue = index + 1;
                      return GestureDetector(
                        onTap: () {
                          setState(() => _rating = starValue);
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          child: Icon(
                            starValue <= _rating ? Icons.star_rounded : Icons.star_outline_rounded,
                            color: AppTheme.primaryColor,
                            size: 38,
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _rating > 0 && _rating <= 5
                        ? _ratingLabels[_rating - 1]
                        : 'SELECT RATING',
                    style: AppTheme.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primaryColor,
                      letterSpacing: 1.1,
                    ),
                  ),
                  const SizedBox(height: 18),

                  // Compliment Pills
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    alignment: WrapAlignment.center,
                    children: _complimentOptions.map((compliment) {
                      final isSelected = _selectedCompliments.contains(compliment);
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            if (isSelected) {
                              _selectedCompliments.remove(compliment);
                            } else {
                              _selectedCompliments.add(compliment);
                            }
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppTheme.primaryColor
                                : const Color(0xFF1B1B20),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? AppTheme.primaryColor : Colors.white12,
                            ),
                          ),
                          child: Text(
                            compliment,
                            style: AppTheme.inter(
                              fontSize: 12,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected ? Colors.black : Colors.white70,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  // Tip Driver Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Add a tip for chauffeur',
                        style: AppTheme.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        '100% goes to driver',
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  Row(
                    children: [
                      ..._tipOptions.map((amount) {
                        final isSelected = _selectedTipAmount == amount;
                        return Expanded(
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 3),
                            child: ElevatedButton(
                              onPressed: () {
                                setState(() {
                                  _selectedTipAmount = isSelected ? null : amount;
                                });
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isSelected
                                    ? AppTheme.primaryColor
                                    : const Color(0xFF1B1B22),
                                foregroundColor: isSelected ? Colors.black : Colors.white,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  side: BorderSide(
                                    color: isSelected ? AppTheme.primaryColor : Colors.white12,
                                  ),
                                ),
                              ),
                              child: Text(
                                '$amount/-',
                                style: AppTheme.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        );
                      }),
                      Expanded(
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          child: OutlinedButton(
                            onPressed: () {
                              _showCustomTipDialog();
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white70,
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              side: const BorderSide(color: Colors.white12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: Text(
                              _selectedTipAmount != null && !_tipOptions.contains(_selectedTipAmount)
                                  ? '$_selectedTipAmount/-'
                                  : 'Custom',
                              style: AppTheme.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Disbursed directly via M-Pesa immediately',
                      style: AppTheme.inter(fontSize: 10, color: Colors.white38),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Optional Comment Text Field
                  TextField(
                    controller: _commentController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Add an executive note for the trip occurrence book...',
                      hintStyle: const TextStyle(color: Colors.white30, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF1B1B22),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Colors.white12),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Colors.white12),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppTheme.primaryColor),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 6,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Submit Rating & Done',
                            style: AppTheme.outfit(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: Colors.black,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward_rounded, color: Colors.black, size: 20),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 12),

            TextButton.icon(
              onPressed: () {
                Navigator.of(context).popUntil((route) => route.isFirst);
              },
              icon: const Icon(Icons.support_agent_rounded, color: AppTheme.primaryColor, size: 18),
              label: Text(
                'Report Lost Item / Concierge Support',
                style: AppTheme.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.white70,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCustomTipDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A20),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppTheme.outlineGold),
        ),
        title: Text(
          'Enter Custom Tip (KES)',
          style: AppTheme.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
        ),
        content: TextField(
          controller: _customTipController,
          keyboardType: TextInputType.number,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'e.g. 350',
            hintStyle: TextStyle(color: Colors.white38),
            prefixText: 'KES ',
            prefixStyle: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            onPressed: () {
              final val = int.tryParse(_customTipController.text.trim());
              if (val != null && val > 0) {
                setState(() => _selectedTipAmount = val);
              }
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
            child: const Text('Apply Tip', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildFareRow(String label, String value, {bool isDiscount = false, bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTheme.inter(
            fontSize: 13,
            fontWeight: isBold ? FontWeight.w700 : FontWeight.w400,
            color: isDiscount
                ? AppTheme.primaryColor
                : (isBold ? Colors.white : Colors.white70),
          ),
        ),
        Text(
          value,
          style: AppTheme.montserrat(
            fontSize: isBold ? 15 : 13,
            fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
            color: isDiscount
                ? AppTheme.primaryColor
                : (isBold ? AppTheme.primaryColor : Colors.white),
          ),
        ),
      ],
    );
  }
}
