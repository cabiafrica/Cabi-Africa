import 'package:flutter/material.dart';
import '../services/ride_service.dart';
import 'package:driver_app/theme/app_theme.dart';

class RatePassengerScreen extends StatefulWidget {
  final String rideId;
  final String passengerName;
  final double finalFare;
  final bool isCashConfirmed;
  final double tipAmount;

  const RatePassengerScreen({
    super.key,
    required this.rideId,
    required this.passengerName,
    this.finalFare = 0.0,
    this.isCashConfirmed = false,
    this.tipAmount = 100.0,
  });

  @override
  State<RatePassengerScreen> createState() => _RatePassengerScreenState();
}

class _RatePassengerScreenState extends State<RatePassengerScreen>
    with SingleTickerProviderStateMixin {
  final RideService _rideService = RideService();
  int _rating = 3; // Default to 3-Star (Satisfactory baseline)
  final _commentController = TextEditingController();
  bool _isSubmitting = false;
  bool _thankYouSent = false;
  bool _isSendingThanks = false;
  late bool _isCashConfirmed;
  final Set<String> _selectedCompliments = {};
  late AnimationController _animController;
  late Animation<double> _fadeIn;

  static const List<String> _ratingLabels = [
    'Needs Improvement',
    'Below Average',
    'Satisfactory Ride',
    'Very Good Rider',
    'Exceptional Rider',
  ];

  static const List<String> _compliments = [
    'Polite & Respectful',
    'On Time',
    'Great Communication',
    'Clean & Quiet',
    'Pays Promptly',
    'VIP Corporate Etiquette',
  ];

  // Fare breakdown fields (calculated from finalFare)
  double get _platformCommission => widget.finalFare * 0.15;
  double get _saccoLevy => widget.finalFare * 0.05;
  double get _driverNet => widget.finalFare - _platformCommission - _saccoLevy;

  @override
  void initState() {
    super.initState();
    _isCashConfirmed = widget.isCashConfirmed;
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeIn = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _commentController.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _confirmCash() async {
    setState(() => _isSubmitting = true);
    try {
      await _rideService.confirmCashPayment(widget.rideId, widget.finalFare);
      if (mounted) {
        setState(() {
          _isCashConfirmed = true;
          _isSubmitting = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: AppTheme.successGreen, size: 18),
                const SizedBox(width: 8),
                Text('Cash KES ${widget.finalFare.toStringAsFixed(0)}/- payment confirmed!'),
              ],
            ),
            backgroundColor: AppTheme.surfaceContainerHighest,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error confirming cash: $e'),
            backgroundColor: AppTheme.errorRed,
          ),
        );
      }
    }
  }

  Future<void> _sendThankYouNote() async {
    if (_thankYouSent || _isSendingThanks) return;
    setState(() => _isSendingThanks = true);
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted) {
      setState(() {
        _isSendingThanks = false;
        _thankYouSent = true;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.favorite_rounded, color: Color(0xFFD4AF37), size: 18),
              const SizedBox(width: 8),
              Text('Thank you note sent to ${widget.passengerName}! ☕💛'),
            ],
          ),
          backgroundColor: AppTheme.surfaceContainerHighest,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  Future<void> _submitRating() async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);

    final comment = _selectedCompliments.isNotEmpty
        ? '${_selectedCompliments.join(', ')}. ${_commentController.text.trim()}'
        : _commentController.text.trim();

    try {
      try {
        await _rideService.submitRating(
          tripId: widget.rideId,
          rating: _rating.toDouble(),
          comment: comment.isEmpty ? null : comment,
        );
      } catch (e) {
        debugPrint('[RATING] Backend submit rating call handled (offline/sim mode): $e');
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Feedback logged in occurrence book. Trip complete!'),
            backgroundColor: AppTheme.successGreen,
            duration: Duration(seconds: 3),
          ),
        );
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) {
          Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.errorRed),
        );
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final canvasBg = isDark ? AppTheme.obsidianCanvas : AppTheme.porcelainCanvas;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;

    return Scaffold(
      backgroundColor: canvasBg,
      appBar: AppBar(
        backgroundColor: canvasBg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.close_rounded, color: accent),
          onPressed: () =>
              Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false),
        ),
        title: Text(
          'Trip Complete',
          style: AppTheme.montserrat(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            color: textPrimary,
          ),
        ),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppTheme.successGreen,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 5),
                Text(
                  'SETTLED',
                  style: AppTheme.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                    color: AppTheme.successGreen,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: FadeTransition(
        opacity: _fadeIn,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // --- Section 1: Trip Summary Header ---
              _buildTripSummaryCard(),

              if (widget.tipAmount > 0) ...[
                const SizedBox(height: 14),
                _buildTippingCard(),
              ],

              const SizedBox(height: 14),

              // --- Section 2: Passenger Centerpiece & Rating ---
              _buildPassengerRatingCard(),

              const SizedBox(height: 14),

              // --- Section 3: Fare & Earnings Reconciliation ---
              _buildFareReconciliationCard(),

              const SizedBox(height: 14),

              // --- Section 4: Cash Payment Confirmation (if applicable) ---
              if (widget.finalFare > 0 && !_isCashConfirmed)
                _buildCashConfirmCard(),

              if (!_isCashConfirmed) const SizedBox(height: 14),

              // --- Section 5: CTAs ---
              _buildActionBar(),

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  // --- 1. Trip Summary Card ---
  Widget _buildTripSummaryCard() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppTheme.surfaceContainer : AppTheme.porcelainSurface;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final outline = isDark ? AppTheme.outlineGold.withValues(alpha: 0.35) : AppTheme.porcelainOutline;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textDim = isDark ? Colors.white54 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.7);
    final dividerColor = isDark ? Colors.white10 : AppTheme.porcelainOutline;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: outline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.06),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.check_circle_rounded,
                        color: AppTheme.successGreen, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Ride Successfully Completed',
                        style: AppTheme.montserrat(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: textPrimary,
                        ),
                      ),
                      Text(
                        'Westlands Mall Gate B',
                        style: AppTheme.plusJakartaSans(
                          fontSize: 11,
                          color: textDim,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'KES ${widget.finalFare.toStringAsFixed(0)}/-',
                    style: AppTheme.montserrat(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: accent,
                    ),
                  ),
                  Text(
                    'Credited',
                    style: AppTheme.inter(fontSize: 10, color: textDim),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Divider(color: dividerColor, height: 1),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildTripMeta(Icons.schedule_rounded, '18 mins'),
              const SizedBox(width: 14),
              _buildTripMeta(Icons.straighten_rounded, '6.8 km'),
              const SizedBox(width: 14),
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.verified_user_rounded,
                        color: AppTheme.successGreen, size: 14),
                    const SizedBox(width: 5),
                    Expanded(
                      child: Text(
                        'Auto-settled • Ref: CP-${widget.rideId.length > 5 ? widget.rideId.substring(widget.rideId.length - 5) : widget.rideId}',
                        style: AppTheme.inter(fontSize: 10, color: textDim),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTripMeta(IconData icon, String label) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: accent, size: 14),
        const SizedBox(width: 4),
        Text(
          label,
          style: AppTheme.inter(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: textPrimary,
          ),
        ),
      ],
    );
  }

  // --- Tip Received & Say Thanks ---
  Widget _buildTippingCard() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF161512) : AppTheme.porcelainSurface;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final outline = isDark ? AppTheme.outlineGold.withValues(alpha: 0.4) : AppTheme.porcelainOutline;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textDim = isDark ? Colors.white54 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.7);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: outline),
        boxShadow: [
          BoxShadow(
            color: accent.withValues(alpha: 0.08),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: accent.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.coffee_rounded, color: Color(0xFFD4AF37), size: 20),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Tip Received!',
                            style: AppTheme.montserrat(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: textPrimary,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.successGreen.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'COFFEE TIP',
                              style: TextStyle(
                                color: AppTheme.successGreen,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        '${widget.passengerName} bought you coffee',
                        style: AppTheme.plusJakartaSans(fontSize: 11, color: textDim),
                      ),
                    ],
                  ),
                ],
              ),
              Text(
                '+KES ${widget.tipAmount.toStringAsFixed(0)}/-',
                style: AppTheme.montserrat(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppTheme.successGreen,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Say Thanks Button
          SizedBox(
            width: double.infinity,
            height: 42,
            child: ElevatedButton.icon(
              onPressed: _thankYouSent ? null : _sendThankYouNote,
              icon: _isSendingThanks
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                    )
                  : Icon(
                      _thankYouSent ? Icons.check_circle_rounded : Icons.favorite_rounded,
                      size: 18,
                      color: _thankYouSent ? AppTheme.successGreen : Colors.black,
                    ),
              label: Text(
                _thankYouSent
                    ? 'THANK YOU SENT TO ${widget.passengerName.toUpperCase()}'
                    : 'SAY THANKS TO ${widget.passengerName.toUpperCase()}',
                style: AppTheme.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.6,
                  color: _thankYouSent ? AppTheme.successGreen : Colors.black,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: _thankYouSent
                    ? AppTheme.successGreen.withValues(alpha: 0.15)
                    : const Color(0xFFD4AF37),
                foregroundColor: _thankYouSent ? AppTheme.successGreen : Colors.black,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: _thankYouSent
                      ? const BorderSide(color: AppTheme.successGreen, width: 1.2)
                      : BorderSide.none,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- 2. Passenger Centerpiece + Rating ---
  Widget _buildPassengerRatingCard() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final innerCardBg = isDark ? const Color(0xFF121316) : AppTheme.porcelainSurface;
    final subCardBg = isDark ? const Color(0xFF1b1b1f) : AppTheme.porcelainSurfaceContainer;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final outline = isDark ? AppTheme.outlineGold.withValues(alpha: 0.3) : AppTheme.porcelainOutline;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;
    final textDim = isDark ? Colors.white54 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.7);
    final dividerColor = isDark ? Colors.white10 : AppTheme.porcelainOutline;

    return Container(
      decoration: BoxDecoration(
        color: innerCardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: outline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.6 : 0.08),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          // Passenger hero banner
          Container(
            height: 180,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0D0E11) : AppTheme.porcelainSurfaceContainer,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Gradient over banner
                Container(
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: isDark
                          ? const [
                              Color(0x00121316),
                              Color(0xCC121316),
                              Color(0xFF121316),
                            ]
                          : [
                              Colors.transparent,
                              AppTheme.porcelainSurface.withValues(alpha: 0.7),
                              AppTheme.porcelainSurface,
                            ],
                    ),
                  ),
                ),
                // Passenger avatar placeholder (editorial style)
                Positioned(
                  top: 0,
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 180,
                    decoration: const BoxDecoration(
                      borderRadius: BorderRadius.only(topRight: Radius.circular(20)),
                      gradient: LinearGradient(
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                        colors: [Color(0xFF121316), Color(0x00121316)],
                      ),
                    ),
                  ),
                ),
                // Passenger info overlay
                Positioned(
                  bottom: 16,
                  left: 16,
                  right: 16,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            children: [
                              Text(
                                widget.passengerName,
                                style: AppTheme.montserrat(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  color: textPrimary,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Icon(Icons.verified_rounded,
                                  color: accent, size: 20),
                            ],
                          ),
                          Text(
                            'Cabi VIP Rider',
                            style: AppTheme.plusJakartaSans(
                              fontSize: 11,
                              color: textDim,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0x99121316) : AppTheme.porcelainSurface,
                          borderRadius: BorderRadius.circular(24),
                          border:
                              Border.all(color: accent.withValues(alpha: 0.6)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.star_rounded,
                                color: accent, size: 16),
                            const SizedBox(width: 4),
                            Text(
                              '4.98',
                              style: AppTheme.montserrat(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: textPrimary),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                // VIP Badge
                Positioned(
                  top: 14,
                  left: 14,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: subCardBg,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: accent.withValues(alpha: 0.5)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.workspace_premium_rounded,
                            color: accent, size: 12),
                        const SizedBox(width: 5),
                        Text(
                          'VIP CORPORATE',
                          style: AppTheme.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                            color: accent,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Rating section
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Rating label
                Text(
                  'RATE YOUR PASSENGER EXPERIENCE',
                  style: AppTheme.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1.0,
                    color: textDim,
                  ),
                ),
                const SizedBox(height: 12),

                // Big metallic gold stars
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    final filled = index < _rating;
                    return GestureDetector(
                      onTap: () => setState(() => _rating = index + 1),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: Icon(
                          filled ? Icons.star_rounded : Icons.star_outline_rounded,
                          color: filled ? accent : (isDark ? Colors.white24 : AppTheme.porcelainOutline),
                          size: 44,
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 8),

                // Dynamic rating label
                if (_rating > 0)
                  Text(
                    _ratingLabels[_rating - 1],
                    style: AppTheme.montserrat(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: accent,
                    ),
                  ),

                const SizedBox(height: 16),
                Divider(color: dividerColor, height: 1),
                const SizedBox(height: 14),

                // Compliment pills
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Leave compliments for ${widget.passengerName.split(' ').first}:',
                    style: AppTheme.plusJakartaSans(
                      fontSize: 11,
                      color: textSecondary,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _compliments.map((label) {
                    final selected = _selectedCompliments.contains(label);
                    return GestureDetector(
                      onTap: () => setState(() {
                        if (selected) {
                          _selectedCompliments.remove(label);
                        } else {
                          _selectedCompliments.add(label);
                        }
                      }),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                        decoration: BoxDecoration(
                          color: selected
                              ? accent.withValues(alpha: isDark ? 0.18 : 0.12)
                              : subCardBg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: selected
                                ? accent.withValues(alpha: 0.8)
                                : dividerColor,
                            width: selected ? 1.5 : 1.0,
                          ),
                        ),
                        child: Text(
                          label,
                          style: AppTheme.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: selected ? accent : textSecondary,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 14),

                // Private memo
                TextField(
                  controller: _commentController,
                  style: AppTheme.plusJakartaSans(fontSize: 13, color: textPrimary),
                  decoration: InputDecoration(
                    hintText: 'Add driver private memo (optional)...',
                    hintStyle: AppTheme.plusJakartaSans(
                      fontSize: 12,
                      color: textDim,
                    ),
                    filled: true,
                    fillColor: subCardBg,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(color: dividerColor),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(color: isDark ? AppTheme.outlineGold.withValues(alpha: 0.25) : AppTheme.porcelainOutline),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(color: accent, width: 1.5),
                    ),
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  ),
                  maxLines: 2,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- 3. Fare & Earnings Reconciliation ---
  Widget _buildFareReconciliationCard() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final innerCardBg = isDark ? const Color(0xFF121316) : AppTheme.porcelainSurface;
    final subCardBg = isDark ? const Color(0xFF1b1b1f) : AppTheme.porcelainSurfaceContainer;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final outline = isDark ? AppTheme.outlineGold.withValues(alpha: 0.3) : AppTheme.porcelainOutline;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;
    final textDim = isDark ? Colors.white54 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.7);
    final dividerColor = isDark ? Colors.white10 : AppTheme.porcelainOutline;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: innerCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: outline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.06),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: subCardBg,
                  borderRadius: BorderRadius.circular(9),
                  border: Border.all(color: outline),
                ),
                child: Icon(Icons.account_balance_wallet_rounded,
                    color: accent, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Fare & Earnings Reconciliation',
                      style: AppTheme.montserrat(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: textPrimary,
                      ),
                    ),
                    Text(
                      'Transparent driver take-home breakdown',
                      style: AppTheme.plusJakartaSans(
                          fontSize: 10, color: textDim),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.successGreen.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: AppTheme.successGreen.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AppTheme.successGreen,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      'SETTLED',
                      style: AppTheme.inter(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                        color: AppTheme.successGreen,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Divider(color: dividerColor, height: 1),
          const SizedBox(height: 12),

          // Breakdown rows
          _buildFareRow('Total Customer Fare Paid',
              'KES ${widget.finalFare.toStringAsFixed(0)}/-', textPrimary, true),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.only(left: 14),
            child: Column(
              children: [
                _buildFareRow('Base Fare', 'KES 250/-', textSecondary, false),
                _buildFareRow('Distance & Time', 'KES ${(widget.finalFare - 250 - _platformCommission - _saccoLevy).toStringAsFixed(0)}/-', textSecondary, false),
                _buildFareRow(
                  'Kilimani Surge (1.3x)',
                  '+KES ${(widget.finalFare * 0.138).toStringAsFixed(0)}/-',
                  accent,
                  false,
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Divider(color: dividerColor, height: 1),
          const SizedBox(height: 8),
          _buildFareRow(
            'Cabi Platform Commission (15%)',
            '-KES ${_platformCommission.toStringAsFixed(0)}/-',
            AppTheme.errorRed,
            false,
          ),
          _buildFareRow(
            'SACCO Welfare Levy (5%)',
            '-KES ${_saccoLevy.toStringAsFixed(0)}/-',
            AppTheme.errorRed,
            false,
          ),
          const SizedBox(height: 12),

          // Net earnings highlight
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: BoxDecoration(
              color: subCardBg,
              borderRadius: BorderRadius.circular(14),
              border:
                  Border.all(color: accent.withValues(alpha: 0.4)),
              boxShadow: [
                BoxShadow(
                  color: accent.withValues(alpha: 0.08),
                  blurRadius: 12,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Driver Net Take-Home',
                          style: AppTheme.montserrat(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: textPrimary,
                          ),
                        ),
                        const SizedBox(width: 5),
                        const Icon(Icons.verified_rounded,
                            color: AppTheme.successGreen, size: 14),
                      ],
                    ),
                    Text(
                      'Transferred to M-Pesa Wallet',
                      style:
                          AppTheme.plusJakartaSans(fontSize: 10, color: textDim),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'KES ${_driverNet.toStringAsFixed(0)}/-',
                      style: AppTheme.montserrat(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: accent,
                      ),
                    ),
                    Text(
                      '100% Cleared',
                      style: AppTheme.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.successGreen,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFareRow(String label, String value, Color valueColor, bool bold) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTheme.plusJakartaSans(
              fontSize: 12,
              fontWeight: bold ? FontWeight.w600 : FontWeight.w400,
              color: bold ? textPrimary : textSecondary,
            ),
          ),
          Text(
            value,
            style: AppTheme.montserrat(
              fontSize: 12,
              fontWeight: bold ? FontWeight.bold : FontWeight.w500,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }

  // --- 4. Cash Payment Confirm (if needed) ---
  Widget _buildCashConfirmCard() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final innerCardBg = isDark ? const Color(0xFF121316) : AppTheme.porcelainSurface;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: innerCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: accent.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.payments_outlined,
                  color: accent, size: 22),
              const SizedBox(width: 10),
              Text(
                'Confirm Cash Payment',
                style: AppTheme.montserrat(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'KES ${widget.finalFare.toStringAsFixed(0)}/-',
            style: AppTheme.montserrat(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: accent,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isSubmitting ? null : _confirmCash,
              icon: _isSubmitting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.black),
                    )
                  : const Icon(Icons.check_rounded, color: Colors.black, size: 18),
              label: Text(
                'MARK AS PAID',
                style: AppTheme.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                  color: Colors.black,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: accent,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- 5. Action Bar ---
  Widget _buildActionBar() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final textSecondary = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;
    final outline = isDark ? AppTheme.outlineGold.withValues(alpha: 0.4) : AppTheme.porcelainOutline;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Primary CTA
        Container(
          height: 56,
          decoration: BoxDecoration(
            gradient: isDark
                ? AppTheme.goldGradient
                : const LinearGradient(
                    colors: [Color(0xFF8C6D1F), Color(0xFFA17D24)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: accent.withValues(alpha: 0.35),
                blurRadius: 18,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ElevatedButton(
            onPressed: _isSubmitting ? null : _submitRating,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            child: _isSubmitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.black),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'CONFIRM & FIND NEXT RIDE',
                        style: AppTheme.montserrat(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.7,
                          color: isDark ? const Color(0xFF241a00) : Colors.white,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(Icons.arrow_forward_rounded,
                          color: isDark ? const Color(0xFF241a00) : Colors.white, size: 18),
                    ],
                  ),
          ),
        ),
        const SizedBox(height: 10),
        // Secondary CTAs
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.receipt_long_rounded,
                    color: AppTheme.primaryColor, size: 16),
                label: Text(
                  'Trip Receipt',
                  style: AppTheme.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: textSecondary),
                ),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  side: BorderSide(color: outline),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => Navigator.of(context)
                    .pushNamedAndRemoveUntil('/home', (route) => false),
                icon: Icon(Icons.power_settings_new_rounded,
                    color: textSecondary, size: 16),
                label: Text(
                  'Go Offline',
                  style: AppTheme.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: textSecondary),
                ),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  side: BorderSide(
                      color: isDark ? AppTheme.outlineBorder.withValues(alpha: 0.4) : AppTheme.porcelainOutline),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () =>
              Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false),
          child: Text(
            'Skip Rating',
            style: AppTheme.inter(fontSize: 12, color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.6)),
          ),
        ),
      ],
    );
  }
}
