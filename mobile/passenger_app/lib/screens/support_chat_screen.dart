import 'package:flutter/material.dart';

class SupportChatScreen extends StatefulWidget {
  final String? tripId;

  const SupportChatScreen({super.key, this.tripId});

  @override
  State<SupportChatScreen> createState() => _SupportChatScreenState();
}

class _SupportChatScreenState extends State<SupportChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isAgentTyping = false;

  @override
  void initState() {
    super.initState();
    // Initial greeting
    _messages.add({
      'text': 'Hi! How can I help you today?',
      'isAgent': true,
      'timestamp': DateTime.now(),
      'agentName': 'Support Team',
    });
  }

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;

    setState(() {
      _messages.add({
        'text': _messageController.text,
        'isAgent': false,
        'timestamp': DateTime.now(),
      });
    });

    _messageController.clear();

    // Scroll to bottom
    Future.delayed(const Duration(milliseconds: 100), () {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });

    // Mock agent response
    setState(() => _isAgentTyping = true);
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        _isAgentTyping = false;
        _messages.add({
          'text':
              'Thanks for reaching out! I\'m looking into this for you. Can you provide more details?',
          'isAgent': true,
          'timestamp': DateTime.now(),
          'agentName': 'Sarah (Support)',
        });
      });
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Support Chat'),
            Text('Usually replies in minutes', style: TextStyle(fontSize: 12)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Chat Info'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Session ID: #12345'),
                      if (widget.tripId != null)
                        Text('Trip ID: ${widget.tripId}'),
                      const SizedBox(height: 8),
                      const Text('Our support team is here to help 24/7'),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('CLOSE'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Trip Context Banner
          if (widget.tripId != null)
            Container(
              padding: const EdgeInsets.all(12),
              color: Colors.blue[50],
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: Colors.blue, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Chat about Trip ${widget.tripId}',
                      style: const TextStyle(fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),

          // Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (ctx, index) {
                final message = _messages[index];
                return _buildMessage(message);
              },
            ),
          ),

          // Typing Indicator
          if (_isAgentTyping)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildTypingDot(0),
                        const SizedBox(width: 4),
                        _buildTypingDot(1),
                        const SizedBox(width: 4),
                        _buildTypingDot(2),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          // Input Area
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Type your message...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                    ),
                    maxLines: null,
                    textCapitalization: TextCapitalization.sentences,
                  ),
                ),
                const SizedBox(width: 8),
                FloatingActionButton(
                  onPressed: _sendMessage,
                  mini: true,
                  child: const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessage(Map<String, dynamic> message) {
    final isAgent = message['isAgent'] as bool;
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment:
            isAgent ? MainAxisAlignment.start : MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isAgent) ...[
            CircleAvatar(
              radius: 16,
              backgroundColor: Colors.blue[100],
              child:
                  const Icon(Icons.support_agent, size: 18, color: Colors.blue),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment:
                  isAgent ? CrossAxisAlignment.start : CrossAxisAlignment.end,
              children: [
                if (isAgent && message['agentName'] != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(
                      message['agentName'],
                      style: const TextStyle(
                          fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isAgent ? Colors.grey[200] : Colors.blue,
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Text(
                    message['text'],
                    style: TextStyle(
                      color: isAgent ? Colors.black87 : Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _formatTime(message['timestamp']),
                  style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypingDot(int index) {
    return TweenAnimationBuilder(
      tween: Tween<double>(begin: 0, end: 1),
      duration: Duration(milliseconds: 600 + (index * 100)),
      builder: (context, double value, child) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: Colors.grey.withValues(alpha: 0.3 + (value * 0.7)),
            shape: BoxShape.circle,
          ),
        );
      },
      onEnd: () => setState(() {}),
    );
  }

  String _formatTime(DateTime time) {
    return '${time.hour}:${time.minute.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}

