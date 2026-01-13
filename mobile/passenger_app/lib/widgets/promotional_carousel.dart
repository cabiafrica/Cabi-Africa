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
            'https://via.placeholder.com/600x250/C62828/FFFFFF?text=Explore+City',
            Colors.red.shade900,
          ),
          _buildBannerItem(
            'Food Delivered Fast\nTry Cabi Eats Today',
            'https://via.placeholder.com/600x250/FFD700/000000?text=Cabi+Eats',
            Colors.amber.shade800,
          ),
          _buildBannerItem(
            'Send Packages\nSecure & Reliable',
            'https://via.placeholder.com/600x250/2E7D32/FFFFFF?text=Cabi+Send',
            Colors.green.shade900,
          ),
          _buildBannerItem(
            'Ride in Style\nGet 20% off Premium',
            'https://via.placeholder.com/600x250/1565C0/FFFFFF?text=Premium+Rides',
            Colors.blue.shade900,
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
                fontSize: 18,
              ),
            ),
          )
        ],
      ),
    );
  }
}
