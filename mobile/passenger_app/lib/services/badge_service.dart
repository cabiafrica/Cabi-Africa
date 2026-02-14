import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

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

class BadgeService {
  String get _baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3334/api';
    }
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3334/api';
    }
    return 'http://localhost:3334/api';
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
