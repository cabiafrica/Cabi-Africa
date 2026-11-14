import 'package:core_models/core_models.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TripSummaryPanel extends StatefulWidget {
  final Trip ride;
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
    final driverNet = totalAmount * 0.80; // 80% to driver

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0F0F11),
          borderRadius:
              const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(
            color: AppTheme.primaryColor.withValues(alpha: 0.22),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.7),
              blurRadius: 30,
              offset: const Offset(0, -6),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Handle ──
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // ── Header ──
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.successGreen.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle_rounded,
                        color: AppTheme.successGreen, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'TRIP COMPLETED',
                        style: GoogleFonts.inter(
                          color: AppTheme.successGreen,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                        ),
                      ),
                      Text(
                        'Confirm payment below',
                        style: GoogleFonts.inter(
                          color: Colors.white54,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // ── Fare breakdown ──
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1A1A1D),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
                ),
                child: Column(
                  children: [
                    _FareRow(
                      label: 'Base Fare',
                      amount: 'KES ${widget.ride.fare.toStringAsFixed(0)}',
                      color: Colors.white70,
                    ),
                    if (_tipAmount > 0) ...[
                      const SizedBox(height: 8),
                      _FareRow(
                        label: 'Tip',
                        amount: '+ KES ${_tipAmount.toStringAsFixed(0)}',
                        color: AppTheme.primaryColor,
                      ),
                    ],
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 10),
                      child: Divider(color: Colors.white10, height: 1),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'TOTAL',
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                            letterSpacing: 0.8,
                          ),
                        ),
                        Text(
                          'KES ${totalAmount.toStringAsFixed(0)}',
                          style: GoogleFonts.inter(
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w900,
                            fontSize: 22,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Align(
                      alignment: Alignment.centerRight,
                      child: Text(
                        'Your earnings: KES ${driverNet.toStringAsFixed(0)}',
                        style: GoogleFonts.inter(
                          color: AppTheme.successGreen,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // ── Tip selector ──
              Text(
                'ADD A TIP',
                style: GoogleFonts.inter(
                  color: Colors.white38,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  for (int i = 0; i < 3; i++) ...[
                    if (i > 0) const SizedBox(width: 8),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _setTip(i, [0.10, 0.15, 0.20][i]),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedTipIndex == i
                                ? AppTheme.primaryColor.withValues(alpha: 0.15)
                                : const Color(0xFF1A1A1D),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _selectedTipIndex == i
                                  ? AppTheme.primaryColor
                                  : Colors.white.withValues(alpha: 0.08),
                              width: _selectedTipIndex == i ? 1.5 : 1.0,
                            ),
                          ),
                          child: Column(
                            children: [
                              Text(
                                '${[10, 15, 20][i]}%',
                                style: GoogleFonts.inter(
                                  color: _selectedTipIndex == i
                                      ? AppTheme.primaryColor
                                      : Colors.white70,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 15,
                                ),
                              ),
                              Text(
                                'KES ${(widget.ride.fare * [0.10, 0.15, 0.20][i]).toStringAsFixed(0)}',
                                style: GoogleFonts.inter(
                                  color: _selectedTipIndex == i
                                      ? AppTheme.primaryColor
                                      : Colors.white30,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 16),

              // ── Confirm payment CTA ──
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(
                    colors: [AppTheme.primaryColor, Color(0xFFFFDF00)],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withValues(alpha: 0.4),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: () => widget.onPaymentConfirmed(totalAmount),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text(
                    'CONFIRM  KES ${totalAmount.toStringAsFixed(0)}',
                    style: GoogleFonts.inter(
                      color: Colors.black,
                      fontWeight: FontWeight.w900,
                      fontSize: 15,
                      letterSpacing: 0.5,
                    ),
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

class _FareRow extends StatelessWidget {
  final String label;
  final String amount;
  final Color color;

  const _FareRow({
    required this.label,
    required this.amount,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            color: Colors.white54,
            fontSize: 13,
          ),
        ),
        Text(
          amount,
          style: GoogleFonts.inter(
            color: color,
            fontWeight: FontWeight.w700,
            fontSize: 14,
          ),
        ),
      ],
    );
  }
}
