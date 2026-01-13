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
          height: 120,
          viewportFraction: 0.92,
          enableInfiniteScroll: true,
          autoPlay: true,
          autoPlayInterval: const Duration(seconds: 5),
          enlargeCenterPage: true,
          scrollDirection: Axis.horizontal,
        ),
        items: [
          _buildBannerItem(
            'Upgrade to Gold Tier\nGet 0% Commission',
            'https://via.placeholder.com/600x200/C62828/FFFFFF?text=Cabi+Gold',
            Colors.red.shade900,
          ),
          _buildBannerItem(
            'Earn More with\nCabi Prime',
            'https://via.placeholder.com/600x200/FFD700/000000?text=Cabi+Prime',
            Colors.amber.shade800,
          ),
          _buildBannerItem(
            'Safe Driving Tips\nCheck the new guide',
            'https://via.placeholder.com/600x200/2E7D32/FFFFFF?text=Safety+First',
            Colors.green.shade900,
          ),
          _buildBannerItem(
            'Refer a Friend\nGet KES 500 Bonus',
            'https://via.placeholder.com/600x200/1565C0/FFFFFF?text=Referral+Bonus',
            Colors.blue.shade900,
          ),
          _buildBannerItem(
            'New Feature Alert\nScheduled Rides are here!',
            'https://via.placeholder.com/600x200/6A1B9A/FFFFFF?text=Scheduled+Rides',
            Colors.purple.shade900,
          ),
        ],
      ),
    );
  }

  Widget _buildBannerItem(String text, String imageUrl, Color overlayColor) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: overlayColor,
        borderRadius: BorderRadius.circular(16),
        image: DecorationImage(
          image: NetworkImage(imageUrl),
          fit: BoxFit.cover,
        ),
      ),
      child: Stack(
        children: [
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
          Positioned(
            bottom: 16,
            left: 16,
            child: Text(
              text,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          )
        ],
      ),
    );
  }
}
