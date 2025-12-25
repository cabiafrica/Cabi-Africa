import 'package:flutter/material.dart';

class CommunityChatScreen extends StatefulWidget {
  const CommunityChatScreen({super.key});

  @override
  State<CommunityChatScreen> createState() => _CommunityChatScreenState();
}

class _CommunityChatScreenState extends State<CommunityChatScreen> {
  final List<Map<String, dynamic>> _messages = [
    {'sender': 'Driver A', 'text': 'Traffic is heavy on Main St.', 'isMe': false},
    {'sender': 'Me', 'text': 'Thanks for the update!', 'isMe': true},
  ];
  final TextEditingController _controller = TextEditingController();

  void _sendMessage({bool isHelp = false}) {
    if (_controller.text.isEmpty && !isHelp) return;

    final text = isHelp ? '🚨 HELP NEEDED! I have a flat tire near Airport.' : _controller.text;
    
    setState(() {
      _messages.add({
        'sender': 'Me', 
        'text': text, 
        'isMe': true,
        'isHelp': isHelp
      });
      _controller.clear();
    });
    
    // Simulate backend call
    debugPrint('Sent message: $text');
  }

  void _showTipDialog(BuildContext context, String recipient) {
      showDialog(
          context: context,
          builder: (ctx) => SimpleDialog(
              title: Text('Tip $recipient?'),
              children: [
                   const Padding(
                       padding: EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                       child: Text('Say thanks with a small tip from your wallet.'),
                   ),
                   SimpleDialogOption(onPressed: () => _processTip(ctx, recipient, 50), child: const Text('Tip KSh 50')),
                   SimpleDialogOption(onPressed: () => _processTip(ctx, recipient, 100), child: const Text('Tip KSh 100')),
                   SimpleDialogOption(onPressed: () => _processTip(ctx, recipient, 200), child: const Text('Tip KSh 200')),
                   Padding(
                       padding: const EdgeInsets.only(right: 16),
                       child: TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
                   )
              ],
          )
      );
  }

  void _processTip(BuildContext ctx, String recipient, int amount) {
      Navigator.pop(ctx);
      // Mock Payment Service Call
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sent KSh $amount tip to $recipient!')),
      );
  }

  final List<Map<String, dynamic>> _stories = [
    {'user': 'Me', 'image': 'https://via.placeholder.com/50', 'viewed': false, 'isMe': true},
    {'user': 'Sarah', 'image': 'https://via.placeholder.com/50', 'viewed': false, 'isMe': false},
    {'user': 'David', 'image': 'https://via.placeholder.com/50', 'viewed': true, 'isMe': false},
  ];

  Widget _buildStoriesBar() {
      return Container(
          height: 100,
          padding: const EdgeInsets.symmetric(vertical: 8),
          color: Colors.white,
          child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _stories.length,
              itemBuilder: (ctx, index) {
                  final story = _stories[index];
                  return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Column(
                          children: [
                              Container(
                                  padding: const EdgeInsets.all(3),
                                  decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                          color: story['viewed'] ? Colors.grey : Colors.deepPurple,
                                          width: 2,
                                      )
                                  ),
                                  child: CircleAvatar(
                                      radius: 30,
                                      backgroundColor: Colors.grey.shade200,
                                      child: story['isMe'] ? const Icon(Icons.add) : Icon(Icons.person), 
                                  ),
                              ),
                              const SizedBox(height: 4),
                              Text(story['user'], style: const TextStyle(fontSize: 12)),
                          ],
                      ),
                  );
              },
          ),
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Community Chat: NYC Downtown')),
      body: Column(
        children: [
          _buildStoriesBar(),
          const Divider(height: 1),
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isMe = msg['isMe'] as bool;
                final isHelp = msg['isHelp'] == true;
                
                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: GestureDetector(
                    onTap: isMe ? null : () {
                        // Tipping Flow (Story 62.4)
                        _showTipDialog(context, msg['sender']);
                    },
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isHelp ? Colors.red.shade100 : (isMe ? Colors.blue.shade100 : Colors.grey.shade200),
                        borderRadius: BorderRadius.circular(8),
                        border: isHelp ? Border.all(color: Colors.red, width: 2) : null,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (isHelp) const Text('🆘 REQUEST FOR HELP', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                           Row(
                               mainAxisSize: MainAxisSize.min,
                               children: [
                                   Text(msg['sender'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                   if (!isMe) const Icon(Icons.touch_app, size: 12, color: Colors.grey)
                               ]
                           ),
                           Text(msg['text']),
                        ],
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
                IconButton(
                  icon: const Icon(Icons.sos, color: Colors.red),
                  onPressed: () => _sendMessage(isHelp: true), // Story 48.2
                  tooltip: 'Request Help',
                ),
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(hintText: 'Type a message...'),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: () => _sendMessage(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
