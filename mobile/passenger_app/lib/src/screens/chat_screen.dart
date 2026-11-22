import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../config/app_config.dart';

class Message {
  final String text;
  final String senderId;
  final bool isSentByMe;

  Message({
    required this.text,
    required this.senderId,
    required this.isSentByMe,
  });
}

class ChatScreen extends StatefulWidget {
  final String tripId;
  final String currentUserId;

  const ChatScreen({
    super.key,
    required this.tripId,
    required this.currentUserId,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  io.Socket? _socket;
  final TextEditingController _textController = TextEditingController();
  final List<Message> _messages = [];

  @override
  void initState() {
    super.initState();
    _connectToSocket();
  }

  Future<String?> _resolveAuthToken() async {
    try {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'jwt_token');
      if (token != null && token.isNotEmpty) return token;
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString('auth_token') ?? prefs.getString('access_token');
    } catch (_) {
      return null;
    }
  }

  Future<void> _connectToSocket() async {
    final token = await _resolveAuthToken();
    final socketUrl = '${AppConfig.socketUrl}/chat';

    _socket = io.io(socketUrl, <String, dynamic>{
      'transports': ['websocket', 'polling'],
      'autoConnect': false,
      'auth': {'token': token ?? 'mock-jwt'},
      'extraHeaders': token != null ? {'Authorization': 'Bearer $token'} : {},
    });

    _socket?.connect();

    _socket?.onConnect((_) {
      debugPrint('Connected to chat server');
      _socket?.emit('joinRoom', {'tripId': widget.tripId});
    });

    _socket?.on('newMessage', (data) {
      if (!mounted || data == null) return;
      final sender = data['senderId'] ?? data['user'] ?? '';
      setState(() {
        _messages.add(
          Message(
            text: data['text'] ?? '',
            senderId: sender,
            isSentByMe: sender == widget.currentUserId,
          ),
        );
      });
    });

    _socket?.onDisconnect((_) => debugPrint('Disconnected from chat server'));
  }

  void _sendMessage() {
    if (_textController.text.isNotEmpty) {
      final text = _textController.text.trim();
      _socket?.emit('sendMessage', {
        'tripId': widget.tripId,
        'text': text,
      });
      setState(() {
        _messages.add(
          Message(
            text: text,
            senderId: widget.currentUserId,
            isSentByMe: true,
          ),
        );
      });
      _textController.clear();
    }
  }

  @override
  void dispose() {
    _socket?.dispose();
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Chat for Trip #${widget.tripId.substring(0, 6)}'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return Align(
                  alignment: message.isSentByMe
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(
                      vertical: 4,
                      horizontal: 8,
                    ),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: message.isSentByMe
                          ? Theme.of(context).primaryColor
                          : Colors.grey[300],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      message.text,
                      style: TextStyle(
                        color: message.isSentByMe ? Colors.white : Colors.black,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    decoration: InputDecoration(hintText: 'Type a message...'),
                  ),
                ),
                IconButton(icon: Icon(Icons.send), onPressed: _sendMessage),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
