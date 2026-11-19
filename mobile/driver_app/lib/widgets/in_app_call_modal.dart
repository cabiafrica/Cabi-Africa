import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/trip_communication_service.dart';
import '../theme/app_theme.dart';

class InAppCallModal extends StatefulWidget {
  final String peerName;
  final String peerRole;
  final String peerVehicle;
  final String? peerAvatar;
  final bool isIncoming;

  const InAppCallModal({
    super.key,
    required this.peerName,
    required this.peerRole,
    required this.peerVehicle,
    this.peerAvatar,
    this.isIncoming = false,
  });

  static Future<void> show(
    BuildContext context, {
    required String peerName,
    required String peerRole,
    required String peerVehicle,
    String? peerAvatar,
    bool isIncoming = false,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => InAppCallModal(
        peerName: peerName,
        peerRole: peerRole,
        peerVehicle: peerVehicle,
        peerAvatar: peerAvatar,
        isIncoming: isIncoming,
      ),
    );
  }

  @override
  State<InAppCallModal> createState() => _InAppCallModalState();
}

class _InAppCallModalState extends State<InAppCallModal> with SingleTickerProviderStateMixin {
  bool _isMuted = false;
  bool _isSpeaker = false;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    TripCommunicationService.instance.addListener(_onServiceUpdate);
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
    if (TripCommunicationService.instance.callState == VoipCallState.ended) {
      Future.delayed(const Duration(milliseconds: 1200), () {
        if (mounted) Navigator.of(context).maybePop();
      });
    }
  }

  @override
  void dispose() {
    TripCommunicationService.instance.removeListener(_onServiceUpdate);
    _pulseController.dispose();
    super.dispose();
  }

  String _formatDuration(int totalSeconds) {
    final mins = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final secs = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final comm = TripCommunicationService.instance;
    final state = comm.callState;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final bg = isDark ? const Color(0xFF141416) : Colors.white;

    String statusText;
    Color statusColor;

    switch (state) {
      case VoipCallState.outgoingCalling:
        statusText = 'CALLING PASSENGER...';
        statusColor = accent;
        break;
      case VoipCallState.incomingRinging:
        statusText = 'INCOMING PASSENGER CALL...';
        statusColor = const Color(0xFF10B981);
        break;
      case VoipCallState.connected:
        statusText = 'CONNECTED  •  ${_formatDuration(comm.callDurationSeconds)}';
        statusColor = const Color(0xFF10B981);
        break;
      case VoipCallState.ended:
        statusText = 'CALL ENDED';
        statusColor = Colors.redAccent;
        break;
      case VoipCallState.timeout:
        statusText = 'DATA CONNECTION UNREACHABLE';
        statusColor = Colors.amber;
        break;
      case VoipCallState.idle:
        statusText = 'CONNECTING ENCRYPTED AUDIO...';
        statusColor = Colors.grey;
        break;
    }

    return Container(
      height: MediaQuery.of(context).size.height * 0.62,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        border: Border.all(
          color: isDark ? AppTheme.outlineGold.withValues(alpha: 0.3) : AppTheme.porcelainOutline,
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 30,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          // Drag handle
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? Colors.white24 : Colors.black12,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),

          // Security pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
            decoration: BoxDecoration(
              color: accent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: accent.withValues(alpha: 0.35)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.lock_rounded, size: 12, color: accent),
                const SizedBox(width: 6),
                Text(
                  'ENCRYPTED IN-APP VOIP • ZERO AIRTIME COST',
                  style: GoogleFonts.inter(
                    color: accent,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
          ),

          const Spacer(),

          // Pulsing Avatar
          AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: (state == VoipCallState.outgoingCalling || state == VoipCallState.incomingRinging)
                    ? _pulseAnimation.value
                    : 1.0,
                child: child,
              );
            },
            child: Container(
              width: 96,
              height: 96,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    accent.withValues(alpha: 0.3),
                    accent.withValues(alpha: 0.05),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border.all(color: accent, width: 2.5),
                boxShadow: [
                  BoxShadow(
                    color: accent.withValues(alpha: 0.25),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: ClipOval(
                child: widget.peerAvatar != null
                    ? Image.network(widget.peerAvatar!, fit: BoxFit.cover)
                    : Icon(
                        Icons.person_rounded,
                        size: 52,
                        color: accent,
                      ),
              ),
            ),
          ),

          const SizedBox(height: 18),

          Text(
            widget.peerName,
            style: GoogleFonts.inter(
              color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            widget.peerVehicle,
            style: GoogleFonts.inter(
              color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
              fontSize: 12.5,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            statusText,
            style: GoogleFonts.inter(
              color: statusColor,
              fontSize: 12,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
            ),
          ),

          const Spacer(),

          // Controls Row
          if (state == VoipCallState.timeout) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.signal_cellular_connected_no_internet_4_bar_rounded,
                          color: Colors.amber,
                          size: 24,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Data network timeout (CGNAT / 3G drop). Audio packet relay blocked.',
                            style: GoogleFonts.inter(
                              color: isDark ? Colors.white70 : Colors.black87,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(46),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      icon: const Icon(Icons.phone_in_talk_rounded, size: 18),
                      label: Text(
                        'SWITCH TO MASKED CELLULAR CALL',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                      ),
                      onPressed: () async {
                        await comm.switchToMaskedCellularCall();
                        if (context.mounted) Navigator.of(context).maybePop();
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () {
                comm.endCall();
                Navigator.of(context).maybePop();
              },
              child: Text(
                'Dismiss',
                style: GoogleFonts.inter(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.w600),
              ),
            ),
          ] else if (state == VoipCallState.incomingRinging) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  // Decline
                  _CallActionCircle(
                    icon: Icons.call_end_rounded,
                    color: Colors.redAccent,
                    label: 'DECLINE',
                    onTap: () {
                      comm.declineCall();
                      Navigator.of(context).maybePop();
                    },
                  ),
                  // Accept
                  _CallActionCircle(
                    icon: Icons.call_rounded,
                    color: const Color(0xFF10B981),
                    label: 'ACCEPT',
                    onTap: () {
                      comm.acceptCall();
                    },
                  ),
                ],
              ),
            ),
          ] else ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  // Mute toggle
                  _CallActionCircle(
                    icon: _isMuted ? Icons.mic_off_rounded : Icons.mic_rounded,
                    color: _isMuted ? Colors.amber : (isDark ? Colors.white24 : const Color(0xFFE5E7EB)),
                    iconColor: _isMuted ? Colors.black : (isDark ? Colors.white : Colors.black87),
                    label: _isMuted ? 'MUTED' : 'MUTE',
                    onTap: () => setState(() => _isMuted = !_isMuted),
                  ),
                  // End Call (Red)
                  _CallActionCircle(
                    icon: Icons.call_end_rounded,
                    color: Colors.redAccent,
                    iconColor: Colors.white,
                    label: 'END',
                    onTap: () {
                      comm.endCall();
                      Navigator.of(context).maybePop();
                    },
                  ),
                  // Speaker toggle
                  _CallActionCircle(
                    icon: _isSpeaker ? Icons.volume_up_rounded : Icons.volume_down_rounded,
                    color: _isSpeaker ? accent : (isDark ? Colors.white24 : const Color(0xFFE5E7EB)),
                    iconColor: _isSpeaker ? Colors.black : (isDark ? Colors.white : Colors.black87),
                    label: _isSpeaker ? 'SPEAKER' : 'EARPIECE',
                    onTap: () => setState(() => _isSpeaker = !_isSpeaker),
                  ),
                ],
              ),
            ),
            if (state == VoipCallState.outgoingCalling) ...[
              const SizedBox(height: 14),
              TextButton.icon(
                icon: const Icon(Icons.phone_in_talk_outlined, size: 14, color: Colors.grey),
                label: Text(
                  'Prefer cellular? Use Masked Phone Call',
                  style: GoogleFonts.inter(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w600),
                ),
                onPressed: () async {
                  await comm.switchToMaskedCellularCall();
                  if (context.mounted) Navigator.of(context).maybePop();
                },
              ),
            ],
          ],

          const SizedBox(height: 36),
        ],
      ),
    );
  }
}

class _CallActionCircle extends StatelessWidget {
  final IconData icon;
  final Color color;
  final Color iconColor;
  final String label;
  final VoidCallback onTap;

  const _CallActionCircle({
    required this.icon,
    required this.color,
    this.iconColor = Colors.white,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: color.withValues(alpha: 0.35),
                  blurRadius: 14,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: iconColor, size: 28),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 10.5,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.6,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }
}
