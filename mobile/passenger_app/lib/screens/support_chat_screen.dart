import 'dart:async';
import 'package:flutter/material.dart';
import '../services/support_service.dart';
import '../theme/app_theme.dart';

class SupportChatScreen extends StatefulWidget {
  final String? ticketId;
  final String? tripId;

  const SupportChatScreen({super.key, this.ticketId, this.tripId});

  @override
  State<SupportChatScreen> createState() => _SupportChatScreenState();
}

class _SupportChatScreenState extends State<SupportChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final _supportService = SupportService();

  List<SupportMessageItem> _messages = [];
  SupportTicket? _activeTicket;
  bool _isLoading = true;
  bool _isSending = false;
  Timer? _pollingTimer;

  @override
  void initState() {
    super.initState();
    _loadConversation();
    // Periodic poll for agent responses every 10 seconds
    _pollingTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      if (_activeTicket != null && mounted) {
        _refreshMessages();
      }
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadConversation() async {
    setState(() => _isLoading = true);
    try {
      if (widget.ticketId != null) {
        final ticket = await _supportService.getTicket(widget.ticketId!);
        if (ticket != null && mounted) {
          setState(() {
            _activeTicket = ticket;
            _messages = List.from(ticket.messages);
          });
        }
      } else {
        final tickets = await _supportService.getMyTickets();
        final openTickets = tickets.where((t) => t.status != 'CLOSED').toList();
        if (openTickets.isNotEmpty && mounted) {
          final latest = openTickets.first;
          setState(() {
            _activeTicket = latest;
            _messages = List.from(latest.messages);
          });
        }
      }

      // If no existing messages, show initial greeting
      if (_messages.isEmpty && mounted) {
        _messages = [
          SupportMessageItem(
            id: 'greeting',
            senderRole: 'AGENT',
            senderName: 'VIP Concierge Team',
            message: 'Hello! Welcome to Cabi Africa VIP Concierge & Support. How may we assist you today?',
            createdAt: DateTime.now(),
          ),
        ];
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
        _scrollToBottom();
      }
    }
  }

  Future<void> _refreshMessages() async {
    if (_activeTicket == null) return;
    final updated = await _supportService.getTicket(_activeTicket!.id);
    if (updated != null && mounted) {
      if (updated.messages.length != _messages.length) {
        setState(() {
          _activeTicket = updated;
          _messages = List.from(updated.messages);
        });
        _scrollToBottom();
      }
    }
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

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isSending) return;

    _messageController.clear();
    setState(() => _isSending = true);

    try {
      if (_activeTicket == null) {
        // Create a new support ticket
        final newTicket = await _supportService.createTicket(
          subject: widget.tripId != null ? 'Trip Inquiries: ${widget.tripId}' : 'Passenger Inquiry',
          category: widget.tripId != null ? 'Ride Feedback' : 'Account Issue',
          description: text,
          rideId: widget.tripId,
        );

        if (mounted) {
          setState(() {
            _activeTicket = newTicket;
            _messages = List.from(newTicket.messages);
          });
        }
      } else {
        // Optimistically add user message
        final optimisticMsg = SupportMessageItem(
          id: 'temp-${DateTime.now().millisecondsSinceEpoch}',
          senderRole: 'USER',
          senderName: 'You',
          message: text,
          createdAt: DateTime.now(),
        );

        setState(() {
          _messages.add(optimisticMsg);
        });
        _scrollToBottom();

        // Send to backend
        final saved = await _supportService.replyToTicket(_activeTicket!.id, text);
        if (saved != null && mounted) {
          setState(() {
            final idx = _messages.indexWhere((m) => m.id == optimisticMsg.id);
            if (idx != -1) {
              _messages[idx] = saved;
            }
          });
        }
      }
    } catch (e) {
      debugPrint('[SupportChatScreen] Send error: $e');
    } finally {
      if (mounted) {
        setState(() => _isSending = false);
        _scrollToBottom();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gold = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final canvasColor = isDark ? const Color(0xFF0D0D0E) : AppTheme.porcelainCanvas;
    final surfaceColor = isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;

    return Scaffold(
      backgroundColor: canvasColor,
      appBar: AppBar(
        backgroundColor: surfaceColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'VIP Concierge Support',
              style: AppTheme.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: textPrimary,
              ),
            ),
            Row(
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
                  _activeTicket != null ? 'Ticket ${_activeTicket!.ticketNumber}' : '24/7 Live Desk',
                  style: AppTheme.inter(fontSize: 11, color: textSecondary),
                ),
              ],
            ),
          ],
        ),
        actions: [
          if (_activeTicket != null)
            Padding(
              padding: const EdgeInsets.only(right: 14),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: gold.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: gold.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    _activeTicket!.status,
                    style: AppTheme.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: gold,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: gold))
          : Column(
              children: [
                if (widget.tripId != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    color: gold.withValues(alpha: 0.08),
                    child: Row(
                      children: [
                        Icon(Icons.directions_car_rounded, size: 18, color: gold),
                        const SizedBox(width: 8),
                        Text(
                          'Inquiry regarding Trip: ${widget.tripId}',
                          style: AppTheme.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                Expanded(
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[index];
                      final isUser = !msg.isAgent;

                      return Align(
                        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width * 0.78,
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                          decoration: BoxDecoration(
                            color: isUser
                                ? gold
                                : (isDark ? const Color(0xFF1E1E24) : AppTheme.porcelainSurfaceContainer),
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(16),
                              topRight: const Radius.circular(16),
                              bottomLeft: Radius.circular(isUser ? 16 : 4),
                              bottomRight: Radius.circular(isUser ? 4 : 16),
                            ),
                            border: isUser
                                ? null
                                : Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (!isUser) ...[
                                Text(
                                  msg.senderName,
                                  style: AppTheme.inter(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: gold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                              ],
                              Text(
                                msg.message,
                                style: AppTheme.inter(
                                  fontSize: 14,
                                  color: isUser ? Colors.black : textPrimary,
                                  height: 1.35,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  decoration: BoxDecoration(
                    color: surfaceColor,
                    border: Border(
                      top: BorderSide(color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline),
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _messageController,
                          textCapitalization: TextCapitalization.sentences,
                          style: AppTheme.inter(color: textPrimary, fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'Type your message...',
                            hintStyle: AppTheme.inter(color: textSecondary, fontSize: 14),
                            filled: true,
                            fillColor: isDark ? const Color(0xFF0D0D0E) : AppTheme.porcelainSurfaceContainer,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(24),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          onSubmitted: (_) => _sendMessage(),
                        ),
                      ),
                      const SizedBox(width: 10),
                      GestureDetector(
                        onTap: _sendMessage,
                        child: Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: gold,
                            shape: BoxShape.circle,
                          ),
                          child: _isSending
                              ? const Center(
                                  child: SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                                  ),
                                )
                              : const Icon(Icons.send_rounded, color: Colors.black, size: 20),
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
