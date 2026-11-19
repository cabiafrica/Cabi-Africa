import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:url_launcher/url_launcher.dart';

class PromotionalCarousel extends StatelessWidget {
  const PromotionalCarousel({super.key});

  static const List<Map<String, String>> blogPosts = [
    {
      'slug': 'future-urban-mobility',
      'title': 'The Future of Urban Mobility in Kenya',
      'category': 'Technology',
      'readTime': '5 min read',
      'image': 'assets/images/future-urban-mobility.jpg',
      'summary':
          'How Cabi is transforming the way Nairobi moves with decentralized ride-hailing, electric bodas, and fair driver revenue sharing.',
      'quote':
          'Fees charged are not for corporate enrichment, but are actively recycled into Cabi Legacy equity and driver vehicle ownership.',
      'author': 'Cabi Operations Team',
    },
    {
      'slug': 'the-road-to-dignity-why-drivers-choose-cabi',
      'title': 'The Road to Dignity: Why Drivers Choose Cabi',
      'category': 'Community',
      'readTime': '3 min read',
      'image': 'assets/images/driver-economic-growth.jpg',
      'summary':
          'A candid look at how reusable commissions and Cabi Legacy programs turn daily miles into real asset ownership and long-term security.',
      'quote':
          '"For the first time in five years of driving, I am not just surviving day-to-day. My daily trips now contribute automatically to my Cabi Legacy fund." — Samuel M., Driver Partner',
      'author': 'Cabi Editorial Desk',
    },
    {
      'slug': 'the-sacred-promise-of-every-journey-safety-first',
      'title': 'The Sacred Promise of Every Journey: Safety First',
      'category': 'Safety & Trust',
      'readTime': '4 min read',
      'image': 'assets/images/digital-trust-safety.jpg',
      'summary':
          'Safety is the unspoken promise that you will return home. Mandatory 4-digit start PINs and rejecting offline trips protect both passengers and drivers.',
      'quote':
          'Never accept the "Offline Deal" (Hapa Kando). The moment you cancel, the entire safety net collapses. A few saved shillings are never worth your life.',
      'author': 'Cabi Safety Advisory Council',
    },
    {
      'slug': 'the-power-of-warmth-courtesy-and-tipping',
      'title': 'The Power of Warmth: Courtesy and Tipping',
      'category': 'Community & Culture',
      'readTime': '3 min read',
      'image': 'assets/images/kindness-courtesy-tipping.jpg',
      'summary':
          'A vehicle or boda is a shared human sanctuary. How a kind greeting, patience in traffic, and 100% direct driver tips create solidarity across our cities.',
      'quote':
          '100% of every tip goes directly to the driver with 0% platform deductions. Every shilling settles immediately into their mobile money wallet.',
      'author': 'Grace W., Community Lead',
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
        itemCount: blogPosts.length,
        options: CarouselOptions(
          height: 155,
          viewportFraction: 0.90,
          enableInfiniteScroll: true,
          autoPlay: true,
          autoPlayInterval: const Duration(seconds: 5),
          autoPlayAnimationDuration: const Duration(milliseconds: 800),
          enlargeCenterPage: true,
          scrollDirection: Axis.horizontal,
        ),
        itemBuilder: (context, index, realIndex) {
          final post = blogPosts[index];
          return _buildBannerItem(context, post);
        },
      ),
    );
  }

  Widget _buildBannerItem(BuildContext context, Map<String, String> post) {
    return GestureDetector(
      onTap: () => _launchBlogWebsite(context, post['slug'] ?? 'future-urban-mobility'),
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
                  post['image']!,
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
                          post['category']!.toUpperCase(),
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
                        post['readTime']!,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 10.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white10,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.open_in_browser, color: Color(0xFFF2CA50), size: 12),
                            SizedBox(width: 3),
                            Text(
                              'Web',
                              style: TextStyle(color: Color(0xFFF2CA50), fontSize: 9.5, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    post['title']!,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13.5,
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
                        post['author']!,
                        style: const TextStyle(
                          color: Color(0xFFD0C5AF),
                          fontSize: 10.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Spacer(),
                      const Text(
                        'Read on Website ›',
                        style: TextStyle(
                          color: Color(0xFFF2CA50),
                          fontSize: 10.5,
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
