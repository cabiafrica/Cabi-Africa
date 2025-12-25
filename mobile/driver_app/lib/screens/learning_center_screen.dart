import 'package:flutter/material.dart';

class LearningCenterScreen extends StatefulWidget {
  const LearningCenterScreen({super.key});

  @override
  State<LearningCenterScreen> createState() => _LearningCenterScreenState();
}

class _LearningCenterScreenState extends State<LearningCenterScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Learning Center'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'VIDEOS'),
            Tab(text: 'ARTICLES'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildVideoList(),
          _buildArticleList(),
        ],
      ),
    );
  }

  Widget _buildVideoList() {
    final videos = [
      {'title': '5 Tips for 5-Star Ratings', 'duration': '3:45'},
      {'title': 'How to Maximize Earnings', 'duration': '5:20'},
      {'title': 'Safety First: Driving at Night', 'duration': '4:10'},
      {'title': 'Understanding Surge Pricing', 'duration': '2:55'},
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: videos.length,
      itemBuilder: (ctx, index) {
        final video = videos[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                height: 150,
                color: Colors.black87,
                child: const Center(
                  child: Icon(Icons.play_circle_fill, color: Colors.white, size: 50),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                        Text(video['title']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(video['duration']!, style: const TextStyle(color: Colors.grey)),
                    ]
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildArticleList() {
    final articles = [
      {'title': 'Tax Guide for Independent Contractors', 'readTime': '5 min read'},
      {'title': 'Vehicle Maintenance Checklist', 'readTime': '3 min read'},
      {'title': 'Providing Great Customer Service', 'readTime': '4 min read'},
      {'title': 'Community Guidelines Update', 'readTime': '2 min read'},
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: articles.length,
      itemBuilder: (ctx, index) {
        final article = articles[index];
        return Card(
          child: ListTile(
            leading: const Icon(Icons.article, color: Colors.deepPurple),
            title: Text(article['title']!),
            subtitle: Text(article['readTime']!),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
                // Simulate opening article
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Opening article...')));
            },
          ),
        );
      },
    );
  }
}
