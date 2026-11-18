import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/trip_communication_service.dart';
import '../theme/app_theme.dart';
import 'in_app_call_modal.dart';

class TripChatModal extends StatefulWidget {
  final String peerName;
  final String peerRole;
  final String peerVehicle;
  final String? peerAvatar;

  const TripChatModal({
    super.key,
    required this.peerName,
    required this.peerRole,
    required this.peerVehicle,
    this.peerAvatar,
  });

  static Future<void> show(
    BuildContext context, {
    required String peerName,
    required String peerRole,
    required String peerVehicle,
    String? peerAvatar,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => TripChatModal(
        peerName: peerName,
        peerRole: peerRole,
        peerVehicle: peerVehicle,
        peerAvatar: peerAvatar,
      ),
    );
  }

  @override
  State<TripChatModal> createState() => _TripChatModalState();
}

class _TripChatModalState extends State<TripChatModal> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<String> _quickPresets = [
    'I am at Gate 2 lobby',
    'Waiting at reception',
    'Please turn on AC',
    'I have 2 luggage bags',
    'Heading down now',
  ];

  @override
  void initState() {
    super.initState();
    TripCommunicationService.instance.addListener(_onMessagesUpdated);
  }

  void _onMessagesUpdated() {
    if (mounted) {
      setState(() {});
      _scrollToBottom();
    }
  }

  @override
  void dispose() {
    TripCommunicationService.instance.removeListener(_onMessagesUpdated);
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent + 60,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _send([String? presetText]) {
    final text = presetText ?? _textController.text.trim();
    if (text.isEmpty) return;

    TripCommunicationService.instance.sendMessage(text);
    if (presetText == null) {
      _textController.clear();
    }
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final bg = isDark ? const Color(0xFF141416) : Colors.white;
    final bubbleMe = AppTheme.goldGradient;
    final bubblePeer = isDark ? AppTheme.surfaceContainerHigh : const Color(0xFFF3F4F6);
    final textPeer = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final messages = TripCommunicationService.instance.messages;

    return Container(
      height: MediaQuery.of(context).size.height * 0.78,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
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
          const SizedBox(height: 10),
          // Drag handle
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? Colors.white24 : Colors.black12,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: accent, width: 1.5),
                  ),
                  child: ClipOval(
                    child: widget.peerAvatar != null
                        ? Image.network(widget.peerAvatar!, fit: BoxFit.cover)
                        : Icon(Icons.person_rounded, color: accent, size: 26),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              widget.peerName,
                              style: GoogleFonts.inter(
                                color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                                fontWeight: FontWeight.w800,
                                fontSize: 15,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'ENCRYPTED',
                              style: GoogleFonts.inter(
                                color: const Color(0xFF10B981),
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        widget.peerVehicle,
                        style: GoogleFonts.inter(
                          color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
                          fontSize: 11.5,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                // Call icon
                IconButton(
                  icon: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.phone_rounded, color: Color(0xFF10B981), size: 18),
                  ),
                  tooltip: 'Call Captain (VoIP)',
                  onPressed: () {
                    Navigator.of(context).pop();
                    InAppCallModal.show(
                      context,
                      peerName: widget.peerName,
                      peerRole: widget.peerRole,
                      peerVehicle: widget.peerVehicle,
                      peerAvatar: widget.peerAvatar,
                      isIncoming: false,
                    );
                    TripCommunicationService.instance.startCall();
                  },
                ),
                IconButton(
                  icon: Icon(Icons.close_rounded, color: isDark ? Colors.white70 : Colors.black54),
                  onPressed: () => Navigator.of(context).maybePop(),
                ),
              ],
            ),
          ),

          const Divider(height: 20),

          // Messages list
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final msg = messages[index];
                final isMe = msg.isMe;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      if (!isMe) ...[
                        Container(
                          width: 28,
                          height: 28,
                          margin: const EdgeInsets.only(right: 8, bottom: 2),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: accent.withValues(alpha: 0.15),
                            border: Border.all(color: accent, width: 1),
                          ),
                          child: Icon(Icons.local_taxi_rounded, size: 14, color: accent),
                        ),
                      ],
                      Flexible(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            gradient: isMe ? bubbleMe : null,
                            color: isMe ? null : bubblePeer,
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(16),
                              topRight: const Radius.circular(16),
                              bottomLeft: Radius.circular(isMe ? 16 : 4),
                              bottomRight: Radius.circular(isMe ? 4 : 16),
                            ),
                            border: Border.all(
                              color: isMe
                                  ? Colors.transparent
                                  : (isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                            children: [
                              Text(
                                msg.text,
                                style: GoogleFonts.inter(
                                  color: isMe ? const Color(0xFF1E1602) : textPeer,
                                  fontSize: 13.5,
                                  fontWeight: isMe ? FontWeight.w700 : FontWeight.w500,
                                  height: 1.3,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    '${msg.timestamp.hour.toString().padLeft(2, '0')}:${msg.timestamp.minute.toString().padLeft(2, '0')}',
                                    style: GoogleFonts.inter(
                                      color: isMe
                                          ? const Color(0xFF1E1602).withValues(alpha: 0.6)
                                          : (isDark ? Colors.white38 : Colors.black38),
                                      fontSize: 9.5,
                                    ),
                                  ),
                                  if (isMe) ...[
                                    const SizedBox(width: 4),
                                    const Icon(
                                      Icons.done_all_rounded,
                                      size: 13,
                                      color: Color(0xFF1E1602),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          // Quick Presets Bar
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _quickPresets.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final preset = _quickPresets[index];
                return InkWell(
                  onTap: () => _send(preset),
                  borderRadius: BorderRadius.circular(18),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.surfaceContainerHigh : const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: isDark ? AppTheme.outlineGold.withValues(alpha: 0.3) : AppTheme.porcelainOutline,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        preset,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white70 : AppTheme.porcelainTextPrimary,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 10),

          // Bottom Input Bar
          Container(
            padding: EdgeInsets.fromLTRB(16, 8, 16, MediaQuery.of(context).viewInsets.bottom + 14),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.surfaceContainer : Colors.white,
              border: Border(
                top: BorderSide(
                  color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.obsidianCanvas : const Color(0xFFF9FAFB),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isDark ? AppTheme.outlineBorder : const Color(0xFFE5E7EB),
                      ),
                    ),
                    child: TextField(
                      controller: _textController,
                      style: GoogleFonts.inter(
                        color: isDark ? Colors.white : Colors.black87,
                        fontSize: 13.5,
                      ),
                      onSubmitted: (_) => _send(),
                      decoration: InputDecoration(
                        hintText: 'Message Captain...',
                        hintStyle: GoogleFonts.inter(
                          color: isDark ? Colors.white38 : Colors.black38,
                          fontSize: 13,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => _send(),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      gradient: AppTheme.goldGradient,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.arrow_upward_rounded,
                      color: Color(0xFF1E1602),
                      size: 22,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
