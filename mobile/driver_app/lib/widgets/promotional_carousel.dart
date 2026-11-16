import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:url_launcher/url_launcher.dart';

class PromotionalCarousel extends StatelessWidget {
  const PromotionalCarousel({super.key});

  static const List<Map<String, String>> driverArticles = [
    {
      'slug': 'the-road-to-dignity-why-drivers-choose-cabi',
      'title': 'The Road to Dignity: Reusable Commissions & Asset Ownership',
      'category': 'Driver Wealth',
      'readTime': '3 min read',
      'image': 'assets/images/driver-economic-growth.jpg',
      'author': 'Cabi Operations Desk',
    },
    {
      'slug': 'the-power-of-warmth-courtesy-and-tipping',
      'title': '100% Direct Driver Tips: Zero Platform Deductions',
      'category': 'Earnings',
      'readTime': '3 min read',
      'image': 'assets/images/kindness-courtesy-tipping.jpg',
      'author': 'Driver Support Team',
    },
    {
      'slug': 'future-urban-mobility',
      'title': 'Electric Boda Fleet & Low-Interest Financing in Kenya',
      'category': 'Future Mobility',
      'readTime': '5 min read',
      'image': 'assets/images/future-urban-mobility.jpg',
      'author': 'Fleet Management',
    },
    {
      'slug': 'the-sacred-promise-of-every-journey-safety-first',
      'title': 'Safety Guidelines & Rejecting Uninsured Offline Rides',
      'category': 'Safety & Trust',
      'readTime': '4 min read',
      'image': 'assets/images/digital-trust-safety.jpg',
      'author': 'Safety Advisory Council',
    },
  ];

  Future<void> _launchBlogWebsite(BuildContext context, String slug) async {
    final uri = Uri.parse('https://cabi.africa/blog/$slug');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
      }
    } catch (e) {
      debugPrint('Error launching blog URL $uri: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 0),
      child: CarouselSlider.builder(
        itemCount: driverArticles.length,
        options: CarouselOptions(
          height: 140,
          viewportFraction: 0.92,
          enableInfiniteScroll: true,
          autoPlay: true,
          autoPlayInterval: const Duration(seconds: 5),
          enlargeCenterPage: true,
          scrollDirection: Axis.horizontal,
        ),
        itemBuilder: (context, index, realIndex) {
          final article = driverArticles[index];
          return _buildBannerItem(context, article);
        },
      ),
    );
  }

  Widget _buildBannerItem(BuildContext context, Map<String, String> article) {
    return GestureDetector(
      onTap: () => _launchBlogWebsite(context, article['slug'] ?? 'the-road-to-dignity-why-drivers-choose-cabi'),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: const Color(0xFF141312),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.25), width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.35),
              blurRadius: 16,
              spreadRadius: 1,
              offset: const Offset(0, 6),
            )
          ],
        ),
        child: Stack(
          children: [
            // Background Image
            ClipRRect(
              borderRadius: BorderRadius.circular(15),
              child: SizedBox(
                width: double.infinity,
                height: double.infinity,
                child: Image.asset(
                  article['image']!,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF241A00), Color(0xFF121212)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: const Center(
                      child: Icon(Icons.article_outlined, color: Color(0xFFD4AF37), size: 36),
                    ),
                  ),
                ),
              ),
            ),
            // High-Contrast Gradient
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                gradient: LinearGradient(
                  colors: [
                    Colors.black.withValues(alpha: 0.88),
                    Colors.black.withValues(alpha: 0.45),
                    Colors.transparent,
                  ],
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  stops: const [0.0, 0.55, 1.0],
                ),
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD4AF37).withValues(alpha: 0.20),
                          borderRadius: BorderRadius.circular(5),
                          border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          article['category']!.toUpperCase(),
                          style: const TextStyle(
                            color: Color(0xFFF2CA50),
                            fontSize: 9.5,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        article['readTime']!,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 10.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Spacer(),
                      const Icon(Icons.open_in_browser, color: Color(0xFFF2CA50), size: 14),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    article['title']!,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      height: 1.25,
                      shadows: [
                        Shadow(color: Colors.black, blurRadius: 4, offset: Offset(0, 1)),
                      ],
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        article['author']!,
                        style: const TextStyle(
                          color: Color(0xFFD0C5AF),
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Spacer(),
                      const Text(
                        'Read on Website ›',
                        style: TextStyle(
                          color: Color(0xFFF2CA50),
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
