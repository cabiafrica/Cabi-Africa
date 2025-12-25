import 'dart:async';

class ChatMessage {
  final String id;
  final String senderId; // 'passenger' or 'driver'
  final String text;
  final DateTime timestamp;
  final bool isMe;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.text,
    required this.timestamp,
    required this.isMe,
  });
}

class ChatService {
  // Mock storage
  final List<ChatMessage> _messages = [
    ChatMessage(
      id: '1',
      senderId: 'driver',
      text: 'Hello! I am on my way to the pickup point.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
      isMe: false,
    ),
  ];

  final _controller = StreamController<List<ChatMessage>>.broadcast();

  Stream<List<ChatMessage>> get messages => _controller.stream;

  void dispose() {
    _controller.close();
  }

  // Simulate fetching initial history
  void loadMessages(String rideId) {
    // In a real app, fetch from backend using rideId
    _controller.add(List.from(_messages));
  }

  Future<void> sendMessage(String rideId, String text) async {
    // Add user message immediately (Optimistic UI)
    final newMessage = ChatMessage(
      id: DateTime.now().toString(),
      senderId: 'passenger',
      text: text,
      timestamp: DateTime.now(),
      isMe: true,
    );
    _messages.add(newMessage);
    _controller.add(List.from(_messages));

    // Simulate driver reply after a delay
    await Future.delayed(const Duration(seconds: 3));
    final reply = ChatMessage(
      id: DateTime.now().toString(),
      senderId: 'driver',
      text: "Got it. See you soon!",
      timestamp: DateTime.now(),
      isMe: false,
    );
    _messages.add(reply);
    _controller.add(List.from(_messages));
  }
}
