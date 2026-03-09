import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';

class PromotionalCarousel extends StatelessWidget {
  const PromotionalCarousel({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 0),
      child: CarouselSlider(
        options: CarouselOptions(
          height: 140, // Increased height slightly for passenger app context
          viewportFraction: 0.92,
          enableInfiniteScroll: true,
          autoPlay: true,
          autoPlayInterval: const Duration(seconds: 5),
          enlargeCenterPage: true,
          scrollDirection: Axis.horizontal,
        ),
        items: [
          _buildBannerItem(
            'Explore the City\nTop 10 Hidden Gems',
            'assets/images/hidden_gems_bg.png',
            Colors.black,
          ),
          _buildBannerItem(
            'Food Delivered Fast\nTry Cabi Eats Today',
            'assets/images/food_bg.png',
            Colors.black,
          ),
          _buildBannerItem(
            'Send Packages\nSecure & Reliable',
            'assets/images/package_bg.png',
            Colors.black,
          ),
          _buildBannerItem(
            'Ride in Style\nGet 20% off Premium',
            'assets/images/tours_bg.png',
            Colors.black,
          ),
        ],
      ),
    );
  }

  Widget _buildBannerItem(String text, String imageUrl, Color overlayColor) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A), // Dark fallback color
        borderRadius: BorderRadius.circular(16),
      ),
      child: Stack(
        children: [
          // Background Image with fallback
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: SizedBox(
              width: double.infinity,
              height: double.infinity,
              child: Image.asset(
                imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: Colors.black45,
                  child: const Center(
                    child: Icon(Icons.image_not_supported_outlined,
                        color: Colors.white24, size: 40),
                  ),
                ),
              ),
            ),
          ),
          // Overlay Gradient
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                colors: [
                  Colors.black.withValues(alpha: 0.7),
                  Colors.transparent
                ],
                begin: Alignment.bottomLeft,
                end: Alignment.topRight,
              ),
            ),
          ),
          // Text Content
          Positioned(
            bottom: 16,
            left: 16,
            child: Text(
              text,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          )
        ],
      ),
    );
  }
}
