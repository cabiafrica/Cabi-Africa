import 'package:flutter/foundation.dart';

/// A service for fetching content like blog posts.
class ContentService {
  /// Fetches a list of blog post summaries.
  Future<List<Map<String, dynamic>>> getPosts() async {
    debugPrint("Simulating backend call for blog post list...");
    await Future.delayed(const Duration(seconds: 1));

    // In a real app, this would make an authenticated HTTP request to the Content Service.
    return [
      {
        'id': 'post-1',
        'title': 'CABI Launches in Nairobi!',
        'summary': 'We are excited to announce the official launch of our ride-hailing service in Nairobi. Learn more about our mission.',
        'imageUrl': 'https://plus.unsplash.com/premium_photo-1683121710572-77236b9c391d?q=80&w=2070',
        'publishedDate': '2024-05-20T10:00:00Z',
      },
      {
        'id': 'post-2',
        'title': 'Understanding Your Earnings: A Guide to the MLM System',
        'summary': 'Our unique MLM system is designed to help you earn more. This guide breaks down how commissions and bonuses work.',
        'imageUrl': 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974',
        'publishedDate': '2024-05-15T14:30:00Z',
      },
    ];
  }

  /// Fetches the full details of a single blog post.
  Future<Map<String, dynamic>> getPostDetails(String postId) async {
    debugPrint("Simulating backend call for blog post details for $postId...");
    await Future.delayed(const Duration(milliseconds: 500));

    // This would typically return data specific to the postId from the backend.
    return {
      'id': postId,
      'title': 'CABI Launches in Nairobi!',
      'authorName': 'CABI Team',
      'publishedDate': '2024-05-20T10:00:00Z',
      'imageUrl': 'https://plus.unsplash.com/premium_photo-1683121710572-77236b9c391d?q=80&w=2070',
      'content': """
        <h1>Welcome to CABI!</h1>
        <p>We are thrilled to bring our innovative ride-hailing platform to the vibrant city of Nairobi. Our mission is to provide safe, reliable, and affordable transportation while empowering our drivers through a unique multi-level marketing (MLM) structure.</p>
        <p>This is just the beginning of our journey, and we are excited to have you with us. Stay tuned for more updates!</p>
      """,
    };
  }
}