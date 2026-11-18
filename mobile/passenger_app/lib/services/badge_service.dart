import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class Badge {
  final String id;
  final String code;
  final String name;
  final String description;
  final String? iconUrl;
  final String category;
  final String tier;
  final DateTime? earnedAt;
  final int? progress;
  final bool isEarned;

  Badge({
    required this.id,
    required this.code,
    required this.name,
    required this.description,
    this.iconUrl,
    required this.category,
    required this.tier,
    this.earnedAt,
    this.progress,
    this.isEarned = false,
  });

  factory Badge.fromJson(Map<String, dynamic> json) {
    final badge = json['badge'] ?? json;
    return Badge(
      id: badge['id'],
      code: badge['code'],
      name: badge['name'],
      description: badge['description'],
      iconUrl: badge['iconUrl'],
      category: badge['category'],
      tier: badge['tier'],
      earnedAt:
          json['earnedAt'] != null ? DateTime.parse(json['earnedAt']) : null,
      progress: json['progress'],
      isEarned: json['isEarned'] ?? false,
    );
  }
}

class PassengerLoyaltyData {
  final int points;
  final String currentTier;
  final int pointsToNextTier;
  final List<Map<String, String>> recentActivity;

  PassengerLoyaltyData({
    required this.points,
    required this.currentTier,
    required this.pointsToNextTier,
    required this.recentActivity,
  });

  factory PassengerLoyaltyData.fromJson(Map<String, dynamic> json) {
    final list = json['recentActivity'] as List? ?? [];
    return PassengerLoyaltyData(
      points: json['points'] ?? 0,
      currentTier: json['currentTier'] ?? 'BRONZE',
      pointsToNextTier: json['pointsToNextTier'] ?? 500,
      recentActivity: list.map<Map<String, String>>((item) {
        return {
          'id': item['id']?.toString() ?? '',
          'title': item['description']?.toString() ?? '',
          'points': item['points']?.toString() ?? '',
          'date': item['date']?.toString() ?? '',
        };
      }).toList(),
    );
  }
}

class BadgeService {
  String get _baseUrl => AppConfig.dispatchApiUrl;

  Future<PassengerLoyaltyData?> getPassengerPoints(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/badges/passenger/$userId/points'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['data'] != null) {
          return PassengerLoyaltyData.fromJson(data['data']);
        }
      }
    } catch (e) {
      debugPrint('Error fetching passenger points: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> redeemPassengerPoints({
    required String userId,
    required String couponId,
    required int cost,
    required String title,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/badges/passenger/$userId/redeem'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'couponId': couponId,
          'cost': cost,
          'title': title,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('Error redeeming passenger points: $e');
    }
    return null;
  }

  Future<List<Badge>> getUserBadges(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/badges/users/$userId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List badgesJson = data['data'] ?? [];
        return badgesJson.map((json) => Badge.fromJson(json)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching user badges: $e');
    }
    return [];
  }

  Future<List<Badge>> getAllBadges() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/badges'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List badgesJson = data['data'] ?? [];
        return badgesJson.map((json) => Badge.fromJson(json)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching all badges: $e');
    }
    return [];
  }
}
