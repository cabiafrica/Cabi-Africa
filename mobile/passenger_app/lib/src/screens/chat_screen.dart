import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

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
    Key? key,
    required this.tripId,
    required this.currentUserId,
  }) : super(key: key);

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  late IO.Socket _socket;
  final TextEditingController _textController = TextEditingController();
  final List<Message> _messages = [];

  @override
  void initState() {
    super.initState();
    _connectToSocket();
  }

  void _connectToSocket() {
    // In a real app, this URL and token would come from a config/auth provider
    _socket = IO.io('http://localhost:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'extraHeaders': {'Authorization': 'Bearer mock-jwt'},
    });

    _socket.connect();

    _socket.onConnect((_) {
      print('Connected to chat server');
      _socket.emit('joinRoom', widget.tripId);
    });

    _socket.on('newMessage', (data) {
      setState(() {
        _messages.add(
          Message(
            text: data['text'],
            senderId: data['user'],
            isSentByMe: data['user'] == widget.currentUserId,
          ),
        );
      });
    });

    _socket.onDisconnect((_) => print('Disconnected from chat server'));
  }

  void _sendMessage() {
    if (_textController.text.isNotEmpty) {
      _socket.emit('sendMessage', {
        'tripId': widget.tripId,
        'message': _textController.text,
      });
      // Add message locally for immediate feedback
      setState(() {
        _messages.add(
          Message(
            text: _textController.text,
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
    _socket.dispose();
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
