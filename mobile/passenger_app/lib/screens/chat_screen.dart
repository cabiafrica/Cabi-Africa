import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ChatMessageItem {
  final String id;
  final String text;
  final bool isMe;
  final String timestamp;
  final String? senderName;
  final String? role;
  final bool isDelivered;
  final String? imageUrl;
  final String? locationTag;

  const ChatMessageItem({
    required this.id,
    required this.text,
    required this.isMe,
    required this.timestamp,
    this.senderName,
    this.role,
    this.isDelivered = true,
    this.imageUrl,
    this.locationTag,
  });
}

class ChatScreen extends StatefulWidget {
  final String rideId;
  final String? driverName;
  final String? vehicleInfo;
  final String? driverRating;
  final String? driverPhone;

  const ChatScreen({
    super.key,
    required this.rideId,
    this.driverName,
    this.vehicleInfo,
    this.driverRating,
    this.driverPhone,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  late List<ChatMessageItem> _messages;

  final List<String> _quickPresets = [
    'I am at Gate 2 lobby',
    'Waiting at main reception',
    'Please turn on AC',
    'I have 2 large luggage bags',
    'Heading down in elevator',
  ];

  @override
  void initState() {
    super.initState();
    _messages = [];
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _handleSend([String? presetText]) {
    final text = presetText ?? _textController.text.trim();
    if (text.isEmpty) return;

    final now = DateTime.now();
    final timeStr = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';

    setState(() {
      _messages.add(
        ChatMessageItem(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          text: text,
          isMe: true,
          timestamp: timeStr,
          isDelivered: true,
        ),
      );
    });

    if (presetText == null) {
      _textController.clear();
    }

    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _makePhoneCall() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gold = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: isDark ? const Color(0xFF1E1E24) : AppTheme.porcelainSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline),
        ),
        content: Row(
          children: [
            Icon(Icons.phone_in_talk_rounded, color: gold),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Connecting encrypted call to ${widget.driverName ?? "Chauffeur"}...',
                style: AppTheme.outfit(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gold = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final driver = widget.driverName ?? 'Your Driver';
    final vehicle = widget.vehicleInfo ?? 'Assigned Vehicle';
    final rating = widget.driverRating ?? '—';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0D0D0E) : AppTheme.porcelainCanvas,
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF121215) : AppTheme.porcelainSurface,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'In Ride Live Chat',
          style: AppTheme.outfit(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: gold.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? AppTheme.outlineGold : gold.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.security_rounded, color: gold, size: 14),
                const SizedBox(width: 4),
                Text(
                  'VIP Safe',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: gold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
        ],
      ),
      body: Column(
        children: [
          // Chauffeur Card & Live ETA Sub-Banner
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline),
              boxShadow: [
                BoxShadow(
                  color: isDark ? const Color(0x18000000) : const Color(0x0A000000),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Stack(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: gold, width: 2),
                            color: isDark ? const Color(0xFF222228) : AppTheme.porcelainSurfaceContainer,
                          ),
                          child: Icon(Icons.person_rounded, color: gold, size: 28),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: AppTheme.successGreen,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
                                width: 2,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                driver,
                                style: AppTheme.outfit(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Icon(Icons.verified_rounded, color: gold, size: 16),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Text(
                                '★ $rating',
                                style: AppTheme.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: gold,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                '•',
                                style: TextStyle(
                                  color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary,
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  vehicle,
                                  style: AppTheme.inter(
                                    fontSize: 12,
                                    color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    InkWell(
                      onTap: _makePhoneCall,
                      borderRadius: BorderRadius.circular(22),
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: isDark ? null : AppTheme.aurumBronze,
                          gradient: isDark ? AppTheme.goldGradient : null,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: gold.withValues(alpha: 0.3),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.call_rounded,
                          color: isDark ? Colors.black : Colors.white,
                          size: 20,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // ETA Status Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1B1B22) : AppTheme.porcelainSurfaceContainer,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isDark ? Colors.white10 : AppTheme.porcelainOutline),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.near_me_rounded, color: gold, size: 15),
                          const SizedBox(width: 6),
                          Text(
                            'Arrived at Pickup • Gate 2',
                            style: AppTheme.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: gold.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: isDark ? AppTheme.outlineGold : gold.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          'VIP TIER',
                          style: AppTheme.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: gold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Quick Action Presets Horizontal Scroll
          SizedBox(
            height: 38,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: _quickPresets.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final preset = _quickPresets[index];
                return ActionChip(
                  label: Text(
                    preset,
                    style: AppTheme.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white70 : AppTheme.porcelainTextPrimary,
                    ),
                  ),
                  backgroundColor: isDark ? const Color(0xFF16161A) : AppTheme.porcelainSurface,
                  side: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  onPressed: () => _handleSend(preset),
                );
              },
            ),
          ),
          const SizedBox(height: 10),

          // Waiting telemetry pill
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF16161C) : AppTheme.porcelainSurface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.timer_rounded, color: gold, size: 13),
                  const SizedBox(width: 6),
                  Text(
                    'VIP Bay #4 • Free waiting: 4m rem.',
                    style: AppTheme.inter(
                      fontSize: 11,
                      color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildMessageBubble(msg, isDark, gold);
              },
            ),
          ),

          // Message Input Bar
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF121215) : AppTheme.porcelainSurface,
              border: Border(top: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline)),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: Icon(Icons.camera_alt_outlined, color: gold, size: 22),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Camera opened for gate verification photo')),
                    );
                  },
                ),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1C1C22) : AppTheme.porcelainSurfaceContainer,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
                    ),
                    child: TextField(
                      controller: _textController,
                      style: TextStyle(
                        color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                        fontSize: 13,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Message your executive chauffeur...',
                        hintStyle: TextStyle(
                          color: isDark ? Colors.white30 : AppTheme.porcelainTextSecondary,
                          fontSize: 12,
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      onSubmitted: (_) => _handleSend(),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                InkWell(
                  onTap: () => _handleSend(),
                  borderRadius: BorderRadius.circular(22),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: isDark ? null : AppTheme.aurumBronze,
                      gradient: isDark ? AppTheme.goldGradient : null,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.send_rounded,
                      color: isDark ? Colors.black : Colors.white,
                      size: 20,
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

  Widget _buildMessageBubble(ChatMessageItem msg, bool isDark, Color gold) {
    if (msg.isMe) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.only(bottom: 12, left: 60),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: isDark
                  ? const [Color(0xFFD4AF37), Color(0xFFB8860B)]
                  : const [AppTheme.aurumBronze, Color(0xFF7A5F1A)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(4),
              bottomLeft: Radius.circular(16),
              bottomRight: Radius.circular(16),
            ),
            boxShadow: [
              BoxShadow(
                color: gold.withValues(alpha: 0.2),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                msg.text,
                style: AppTheme.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.black : Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    msg.timestamp,
                    style: AppTheme.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.black54 : Colors.white70,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.done_all_rounded,
                    size: 14,
                    color: isDark ? Colors.black87 : Colors.white,
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    }

    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12, right: 60),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF16161B) : AppTheme.porcelainSurface,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(4),
            topRight: Radius.circular(16),
            bottomLeft: Radius.circular(16),
            bottomRight: Radius.circular(16),
          ),
          border: Border(
            left: BorderSide(color: gold, width: 3),
            top: BorderSide(color: isDark ? Colors.white10 : AppTheme.porcelainOutline),
            right: BorderSide(color: isDark ? Colors.white10 : AppTheme.porcelainOutline),
            bottom: BorderSide(color: isDark ? Colors.white10 : AppTheme.porcelainOutline),
          ),
          boxShadow: isDark
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  msg.senderName ?? 'Driver',
                  style: AppTheme.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  '•',
                  style: TextStyle(
                    color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary,
                    fontSize: 10,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  msg.role ?? 'Chauffeur',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: gold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              msg.text,
              style: AppTheme.inter(
                fontSize: 13,
                color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                height: 1.3,
              ),
            ),
            if (msg.locationTag != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF222228) : AppTheme.porcelainSurfaceContainer,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.local_parking_rounded, color: gold, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      msg.locationTag!,
                      style: AppTheme.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: gold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 4),
            Align(
              alignment: Alignment.centerRight,
              child: Text(
                msg.timestamp,
                style: AppTheme.inter(
                  fontSize: 10,
                  color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
