import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:intl/intl.dart';
import '../services/content_service.dart';

class BlogDetailScreen extends StatefulWidget {
  final String postId;
  final ContentService? contentService;

  const BlogDetailScreen({
    super.key,
    required this.postId,
    this.contentService,
  });

  @override
  State<BlogDetailScreen> createState() => _BlogDetailScreenState();
}

class _BlogDetailScreenState extends State<BlogDetailScreen> {
  late final ContentService _contentService;
  Future<Map<String, dynamic>>? _postFuture;

  @override
  void initState() {
    super.initState();
    _contentService = widget.contentService ?? ContentService();
    _postFuture = _contentService.getPostDetails(widget.postId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Adding a key to the AppBar can be useful for testing
      // and ensures it has a unique identity.
      appBar: AppBar(key: const Key('blogDetailAppBar')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _postFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Failed to load post.'));
          }

          final post = snapshot.data!;
          final publishedDate = DateFormat.yMMMMd().format(
            DateTime.parse(post['publishedDate']),
          );

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CachedNetworkImage(
                  imageUrl: post['imageUrl'],
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: 200,
                  placeholder: (context, url) =>
                      const Center(child: CircularProgressIndicator()),
                  errorWidget: (context, url, error) => const Icon(Icons.error),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    post['title'],
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Text(
                    'By ${post['authorName']} on $publishedDate',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
                Html(
                  data: post['content'],
                  style: {"p": Style(fontSize: FontSize.large)},
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
