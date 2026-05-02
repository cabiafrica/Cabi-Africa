import 'package:flutter/material.dart';
import 'dart:async';

class MindfulnessContentScreen extends StatefulWidget {
  const MindfulnessContentScreen({super.key});

  @override
  State<MindfulnessContentScreen> createState() =>
      _MindfulnessContentScreenState();
}

class _MindfulnessContentScreenState extends State<MindfulnessContentScreen> {
  // Mock Data
  final List<Map<String, dynamic>> _categories = [
    {
      'name': 'Breathing Exercises',
      'tracks': [
        {
          'title': '4-7-8 Breathing',
          'duration': '3:00',
          'color': Colors.blue.shade100
        },
        {
          'title': 'Box Breathing',
          'duration': '4:00',
          'color': Colors.blue.shade100
        },
      ]
    },
    {
      'name': 'Short Meditations',
      'tracks': [
        {
          'title': 'Morning Focus',
          'duration': '5:00',
          'color': Colors.purple.shade100
        },
        {
          'title': 'Mid-Shift Reset',
          'duration': '3:30',
          'color': Colors.purple.shade100
        },
      ]
    },
    {
      'name': 'Stress Relief',
      'tracks': [
        {
          'title': 'Calm in Traffic',
          'duration': '4:30',
          'color': Colors.green.shade100
        },
        {
          'title': 'Post-Shift Unwind',
          'duration': '5:00',
          'color': Colors.green.shade100
        },
      ]
    },
  ];

  Map<String, dynamic>? _currentTrack;
  bool _isPlaying = false;
  double _progress = 0.0;
  Timer? _timer;

  void _playTrack(Map<String, dynamic> track) {
    // If playing same track, toggle play/pause
    if (_currentTrack == track) {
      setState(() {
        _isPlaying = !_isPlaying;
      });
      if (_isPlaying) {
        _startTimer();
      } else {
        _stopTimer();
      }
      return;
    }

    // New track
    _stopTimer();
    setState(() {
      _currentTrack = track;
      _isPlaying = true;
      _progress = 0.0;
    });
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isPlaying) return;
      setState(() {
        _progress += 0.05; // Simulate progress
        if (_progress >= 1.0) {
          _progress = 0.0;
          _isPlaying = false;
          _stopTimer();
        }
      });
    });
  }

  void _stopTimer() {
    _timer?.cancel();
  }

  @override
  void dispose() {
    _stopTimer();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mindfulness & Relax'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories[index];
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      category['name'],
                      style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: Colors.teal),
                    ),
                    const SizedBox(height: 8),
                    ...category['tracks']
                        .map<Widget>((track) => Card(
                              margin: const EdgeInsets.only(bottom: 8),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: track['color'],
                                  child: const Icon(Icons.music_note,
                                      color: Colors.black54),
                                ),
                                title: Text(track['title']),
                                subtitle: Text(track['duration']),
                                trailing: IconButton(
                                  icon: Icon(
                                    _currentTrack == track && _isPlaying
                                        ? Icons.pause_circle
                                        : Icons.play_circle,
                                    color: Colors.teal,
                                    size: 32,
                                  ),
                                  onPressed: () => _playTrack(track),
                                ),
                                selected: _currentTrack == track,
                                selectedTileColor:
                                    Colors.teal.withValues(alpha: 0.05),
                              ),
                            ))
                        .toList(),
                    const SizedBox(height: 16),
                  ],
                );
              },
            ),
          ),
          // Player Bar
          if (_currentTrack != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: Offset(0, -2))
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.headphones, color: Colors.teal),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_currentTrack!['title'],
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold)),
                            const Text('Playing now...',
                                style: TextStyle(
                                    fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.skip_previous),
                        onPressed: () {},
                      ),
                      IconButton(
                        icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow),
                        iconSize: 40,
                        color: Colors.teal,
                        onPressed: () {
                          setState(() {
                            _isPlaying = !_isPlaying;
                            if (_isPlaying) {
                              _startTimer();
                            } else {
                              _stopTimer();
                            }
                          });
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.skip_next),
                        onPressed: () {},
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                      value: _progress,
                      color: Colors.teal,
                      backgroundColor: Colors.grey[200]),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

