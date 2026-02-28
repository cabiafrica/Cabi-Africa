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
    final Map<String, dynamic> badgeData =
        (json['badge'] != null) ? json['badge'] : json;

    return Badge(
      id: badgeData['id'] ?? '',
      code: badgeData['code'] ?? '',
      name: badgeData['name'] ?? '',
      description: badgeData['description'] ?? '',
      iconUrl: badgeData['iconUrl'],
      category: badgeData['category'] ?? 'ACHIEVEMENT',
      tier: badgeData['tier'] ?? 'BRONZE',
      earnedAt:
          json['earnedAt'] != null ? DateTime.tryParse(json['earnedAt']) : null,
      progress: json['progress'],
      isEarned: json['isEarned'] ?? false,
    );
  }
}

class DriverBadgeTier {
  final String? tier;
  final bool isActive;
  final DateTime? earnedAt;
  final DateTime? expiresAt;
  final Map<String, dynamic>? metricsSnapshot;

  DriverBadgeTier({
    this.tier,
    this.isActive = false,
    this.earnedAt,
    this.expiresAt,
    this.metricsSnapshot,
  });

  factory DriverBadgeTier.fromJson(Map<String, dynamic> json) {
    return DriverBadgeTier(
      tier: json['tier'],
      isActive: json['isActive'] ?? false,
      earnedAt:
          json['earnedAt'] != null ? DateTime.tryParse(json['earnedAt']) : null,
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt'])
          : null,
      metricsSnapshot: json['metricsSnapshot'],
    );
  }
}

class DriverPrivileges {
  final bool hasPriorityDispatch;
  final bool hasZoneSelection;
  final double commissionRebatePercent;
  final double saccoBonusPercent;
  final double saccoMatchPercent;
  final double maxCreditLimit;
  final double loanRateReduction;

  DriverPrivileges({
    this.hasPriorityDispatch = false,
    this.hasZoneSelection = false,
    this.commissionRebatePercent = 0,
    this.saccoBonusPercent = 0,
    this.saccoMatchPercent = 0,
    this.maxCreditLimit = 50000,
    this.loanRateReduction = 0,
  });

  factory DriverPrivileges.fromJson(Map<String, dynamic> json) {
    return DriverPrivileges(
      hasPriorityDispatch: json['hasPriorityDispatch'] ?? false,
      hasZoneSelection: json['hasZoneSelection'] ?? false,
      commissionRebatePercent:
          (json['commissionRebatePercent'] ?? 0).toDouble(),
      saccoBonusPercent: (json['saccoBonusPercent'] ?? 0).toDouble(),
      saccoMatchPercent: (json['saccoMatchPercent'] ?? 0).toDouble(),
      maxCreditLimit: (json['maxCreditLimit'] ?? 50000).toDouble(),
      loanRateReduction: (json['loanRateReduction'] ?? 0).toDouble(),
    );
  }
}

class SavingsPreference {
  final String id;
  final String driverProfileId;
  final double personalSavingRate;
  final bool isAutoSavingsEnabled;
  final List<String> preferredZoneIds;

  SavingsPreference({
    required this.id,
    required this.driverProfileId,
    this.personalSavingRate = 0,
    this.isAutoSavingsEnabled = false,
    this.preferredZoneIds = const [],
  });

  factory SavingsPreference.fromJson(Map<String, dynamic> json) {
    return SavingsPreference(
      id: json['id'] ?? '',
      driverProfileId: json['driverProfileId'] ?? '',
      personalSavingRate: (json['personalSavingRate'] ?? 0).toDouble(),
      isAutoSavingsEnabled: json['isAutoSavingsEnabled'] ?? false,
      preferredZoneIds: List<String>.from(json['preferredZoneIds'] ?? []),
    );
  }
}

class SaccoSummary {
  final int totalTransactions;
  final double totalSaccoDeposits;
  final double totalBadgeBonuses;
  final double totalPersonalSavings;

  SaccoSummary({
    this.totalTransactions = 0,
    this.totalSaccoDeposits = 0,
    this.totalBadgeBonuses = 0,
    this.totalPersonalSavings = 0,
  });

  factory SaccoSummary.fromJson(Map<String, dynamic> json) {
    return SaccoSummary(
      totalTransactions: json['totalTransactions'] ?? 0,
      totalSaccoDeposits: (json['totalSaccoDeposits'] ?? 0).toDouble(),
      totalBadgeBonuses: (json['totalBadgeBonuses'] ?? 0).toDouble(),
      totalPersonalSavings: (json['totalPersonalSavings'] ?? 0).toDouble(),
    );
  }
}

class BadgeService {
  String get _baseUrl => AppConfig.authApiUrl;

  Future<List<Badge>> getUserBadges(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/badges/users/$userId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List badgesJson = data['data'] ?? [];
        return badgesJson.map((json) => Badge.fromJson(json)).toList();
      } else {
        debugPrint('Failed to load badges: ${response.statusCode}');
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

  Future<String?> getDriverBadgeTier(String driverProfileId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/badges/driver/$driverProfileId/tier'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data']?['tier'];
      }
    } catch (e) {
      debugPrint('Error fetching driver badge tier: $e');
    }
    return null;
  }

  Future<List<DriverBadgeTier>> getDriverAllBadgeTiers(
      String driverProfileId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/badges/driver/$driverProfileId/tiers'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List tiersJson = data['data'] ?? [];
        return tiersJson.map((json) => DriverBadgeTier.fromJson(json)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching driver badge tiers: $e');
    }
    return [];
  }

  Future<DriverPrivileges> getDriverPrivileges(String driverProfileId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/commission/privileges/$driverProfileId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return DriverPrivileges.fromJson(data['data'] ?? {});
      }
    } catch (e) {
      debugPrint('Error fetching driver privileges: $e');
    }
    return DriverPrivileges();
  }

  Future<SavingsPreference> getSavingsPreference(String driverProfileId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/commission/savings/$driverProfileId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return SavingsPreference.fromJson(data['data'] ?? {});
      }
    } catch (e) {
      debugPrint('Error fetching savings preference: $e');
    }
    return SavingsPreference(id: '', driverProfileId: driverProfileId);
  }

  Future<bool> updateSavingsPreference(
    String driverProfileId, {
    double? personalSavingRate,
    bool? isAutoSavingsEnabled,
    List<String>? preferredZoneIds,
  }) async {
    try {
      final response = await http.put(
        Uri.parse('$_baseUrl/commission/savings/$driverProfileId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          if (personalSavingRate != null)
            'personalSavingRate': personalSavingRate,
          if (isAutoSavingsEnabled != null)
            'isAutoSavingsEnabled': isAutoSavingsEnabled,
          if (preferredZoneIds != null) 'preferredZoneIds': preferredZoneIds,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating savings preference: $e');
    }
    return false;
  }

  Future<SaccoSummary> getSaccoSummary(String driverProfileId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/commission/sacco-summary/$driverProfileId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return SaccoSummary.fromJson(data['data'] ?? {});
      }
    } catch (e) {
      debugPrint('Error fetching sacco summary: $e');
    }
    return SaccoSummary();
  }
}
