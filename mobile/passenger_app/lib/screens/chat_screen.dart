import 'package:flutter/material.dart';
import 'dart:async';

// Mock Service for Driver App (Self-contained for MVP)
class DriverChatService {
  final StreamController<List<Map<String, dynamic>>> _controller =
      StreamController.broadcast();
  final List<Map<String, dynamic>> _messages = [
    {'text': 'Where exactly are you standing?', 'isMe': true},
    {'text': 'I am near the main gate.', 'isMe': false},
  ];

  Stream<List<Map<String, dynamic>>> get messages => _controller.stream;

  void loadMessages(String rideId) {
    _controller.add(List.from(_messages));
  }

  void sendMessage(String text) {
    _messages.add({'text': text, 'isMe': true});
    _controller.add(List.from(_messages));
  }

  void dispose() {
    _controller.close();
  }
}

class ChatScreen extends StatefulWidget {
  final String rideId;

  const ChatScreen({super.key, required this.rideId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final DriverChatService _chatService = DriverChatService();
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _chatService.loadMessages(widget.rideId);
  }

  @override
  void dispose() {
    _chatService.dispose();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _handleSend() {
    if (_textController.text.trim().isEmpty) return;
    _chatService.sendMessage(_textController.text);
    _textController.clear();
    // Scroll logic omitted for brevity in driver mock
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat with Passenger'),
        backgroundColor: Colors.black87,
      ),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder<List<Map<String, dynamic>>>(
              stream: _chatService.messages,
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                final messages = snapshot.data!;

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16.0),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    final isMe = msg['isMe'] as bool;
                    return Align(
                      alignment: isMe
                          ? Alignment.centerRight
                          : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.symmetric(vertical: 4.0),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16.0,
                          vertical: 10.0,
                        ),
                        decoration: BoxDecoration(
                          color: isMe ? Colors.green[700] : Colors.grey[300],
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          msg['text'],
                          style: TextStyle(
                            color: isMe ? Colors.white : Colors.black87,
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: _textController,
              decoration: const InputDecoration(
                hintText: 'Message passenger...',
                suffixIcon: Icon(Icons.send),
              ),
              onSubmitted: (_) => _handleSend(),
            ),
          ),
        ],
      ),
    );
  }
}
