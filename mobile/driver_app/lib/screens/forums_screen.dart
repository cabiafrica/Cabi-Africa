import 'package:flutter/material.dart';

class ForumsScreen extends StatefulWidget {
  const ForumsScreen({super.key});

  @override
  State<ForumsScreen> createState() => _ForumsScreenState();
}

class _ForumsScreenState extends State<ForumsScreen> {
  // Mock Data
  final List<Map<String, dynamic>> _channels = [
    {'id': '1', 'name': 'General Chat', 'desc': 'Talk about anything related to driving.', 'posts': 120},
    {'id': '2', 'name': 'Airport Tips', 'desc': 'Best times for airport pickups and dropoffs.', 'posts': 45},
    {'id': '3', 'name': 'Traffic Updates', 'desc': 'Share real-time traffic info.', 'posts': 89},
    {'id': '4', 'name': 'Events & Meetups', 'desc': 'Organize meetups with other drivers.', 'posts': 12},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Driver Forums')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _channels.length,
        itemBuilder: (ctx, index) {
          final channel = _channels[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: const Color(0xFF1A1510),
                child: const Icon(Icons.forum, color: const Color(0xFFD4AF37)),
              ),
              title: Text(channel['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(channel['desc']),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                    Text('${channel['posts']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    const Text('Posts', style: TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              ),
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => ChannelDetailScreen(channelName: channel['name'])));
              },
            ),
          );
        },
      ),
    );
  }
}

class ChannelDetailScreen extends StatefulWidget {
  final String channelName;
  const ChannelDetailScreen({super.key, required this.channelName});

  @override
  State<ChannelDetailScreen> createState() => _ChannelDetailScreenState();
}

class _ChannelDetailScreenState extends State<ChannelDetailScreen> {
  final List<Map<String, String>> _posts = [
    {'author': 'Driver A', 'time': '2h ago', 'content': 'Has anyone tried the new parking spot downtown?'},
    {'author': 'Driver B', 'time': '1h ago', 'content': 'Yes! It is much cheaper and safe.'},
    {'author': 'Driver C', 'time': '30m ago', 'content': 'Traffic is crazy on the highway right now.'},
  ];

  final TextEditingController _controller = TextEditingController();

  void _addPost() {
      if (_controller.text.isEmpty) return;
      setState(() {
          _posts.insert(0, {
              'author': 'Me',
              'time': 'Just now',
              'content': _controller.text,
          });
          _controller.clear();
      });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: Text(widget.channelName)),
        body: Column(
            children: [
                Expanded(
                    child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _posts.length,
                        itemBuilder: (ctx, index) {
                            final post = _posts[index];
                            return Card(
                                margin: const EdgeInsets.only(bottom: 12),
                                child: Padding(
                                    padding: const EdgeInsets.all(12),
                                    child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                            Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                    Text(post['author']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                                                    Text(post['time']!, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                                ],
                                            ),
                                            const SizedBox(height: 8),
                                            Text(post['content']!),
                                            const SizedBox(height: 8),
                                            Row(
                                                children: [
                                                    IconButton(icon: const Icon(Icons.thumb_up_alt_outlined, size: 16), onPressed: (){}),
                                                    const Text('Like', style: TextStyle(fontSize: 12)),
                                                    const SizedBox(width: 16),
                                                    IconButton(icon: const Icon(Icons.reply, size: 16), onPressed: (){}),
                                                    const Text('Reply', style: TextStyle(fontSize: 12)),
                                                ],
                                            )
                                        ],
                                    ),
                                ),
                            );
                        },
                    ),
                ),
                Container(
                    padding: const EdgeInsets.all(8),
                    color: Colors.white,
                    child: Row(
                        children: [
                            Expanded(child: TextField(
                                controller: _controller,
                                decoration: const InputDecoration(hintText: 'Start a discussion...'),
                            )),
                            IconButton(icon: const Icon(Icons.send, color: const Color(0xFFD4AF37)), onPressed: _addPost),
                        ],
                    ),
                )
            ],
        ),
    );
  }
}
