import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:driver_app/theme/app_theme.dart';

class SlideToAction extends StatefulWidget {
  final String label;
  final VoidCallback onAction;
  final Color color;
  final Color textColor;
  final bool slideLeft;

  const SlideToAction({
    super.key,
    required this.label,
    required this.onAction,
    this.color = AppTheme.primaryColor,
    this.textColor = Colors.black,
    this.slideLeft = false,
  });

  @override
  State<SlideToAction> createState() => _SlideToActionState();
}

class _SlideToActionState extends State<SlideToAction> {
  double _dragValue = 0.0;
  static const double _width = 280.0;
  static const double _buttonSize = 50.0;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: _width,
      height: 60,
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: widget.color.withValues(alpha: 0.3)),
      ),
      child: Stack(
        children: [
          Center(
            child: Text(
              widget.label,
              style: GoogleFonts.inter(
                color: widget.textColor.withValues(alpha: 0.7),
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.0,
              ),
            ),
          ),
          Positioned(
            left: widget.slideLeft ? null : _dragValue,
            right: widget.slideLeft ? _dragValue : null,
            child: GestureDetector(
              onHorizontalDragUpdate: (details) {
                setState(() {
                  double delta =
                      widget.slideLeft ? -details.delta.dx : details.delta.dx;
                  _dragValue = (_dragValue + delta)
                      .clamp(0.0, _width - _buttonSize - 10);
                });
              },
              onHorizontalDragEnd: (details) {
                if (_dragValue >= _width - _buttonSize - 20) {
                  widget.onAction();
                }
                setState(() {
                  _dragValue = 0.0;
                });
              },
              child: Container(
                margin: const EdgeInsets.all(5),
                width: _buttonSize,
                height: _buttonSize,
                decoration: BoxDecoration(
                  color: widget.color,
                  shape: BoxShape.circle,
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black45,
                      blurRadius: 4,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Icon(
                  widget.slideLeft
                      ? Icons.power_settings_new
                      : Icons.chevron_right,
                  color: widget.textColor,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

