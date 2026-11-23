import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

class SupportTicket {
  final String id;
  final String ticketNumber;
  final String subject;
  final String category;
  final String description;
  final String status;
  final String priority;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<SupportMessageItem> messages;

  SupportTicket({
    required this.id,
    required this.ticketNumber,
    required this.subject,
    required this.category,
    required this.description,
    required this.status,
    required this.priority,
    required this.createdAt,
    required this.updatedAt,
    this.messages = const [],
  });

  factory SupportTicket.fromJson(Map<String, dynamic> json) {
    return SupportTicket(
      id: json['id']?.toString() ?? '',
      ticketNumber: json['ticketNumber']?.toString() ?? 'TK-PENDING',
      subject: json['subject']?.toString() ?? 'Support Request',
      category: json['category']?.toString() ?? 'Other',
      description: json['description']?.toString() ?? '',
      status: json['status']?.toString() ?? 'NEW',
      priority: json['priority']?.toString() ?? 'MEDIUM',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      messages: (json['messages'] as List<dynamic>?)
              ?.map((m) => SupportMessageItem.fromJson(m))
              .toList() ??
          [],
    );
  }
}

class SupportMessageItem {
  final String id;
  final String senderRole;
  final String senderName;
  final String message;
  final DateTime createdAt;

  SupportMessageItem({
    required this.id,
    required this.senderRole,
    required this.senderName,
    required this.message,
    required this.createdAt,
  });

  bool get isAgent => senderRole.toUpperCase() == 'AGENT';

  factory SupportMessageItem.fromJson(Map<String, dynamic> json) {
    return SupportMessageItem(
      id: json['id']?.toString() ?? '',
      senderRole: json['senderRole']?.toString() ?? 'USER',
      senderName: json['senderName']?.toString() ?? 'Client',
      message: json['message']?.toString() ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class SupportService {
  static final SupportService _instance = SupportService._internal();
  factory SupportService() => _instance;
  SupportService._internal();

  final _storage = const FlutterSecureStorage();

  String get _baseUrl => '${AppConfig.authApiUrl}/support';

  Future<Map<String, String>> _getHeaders() async {
    final token = await _storage.read(key: 'jwt_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  /// Creates a live support ticket and initial message in the backend
  Future<SupportTicket> createTicket({
    required String subject,
    required String category,
    required String description,
    String? rideId,
  }) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/tickets');

      final body = jsonEncode({
        'subject': subject,
        'category': category,
        'description': description,
        if (rideId != null) 'rideId': rideId,
        'userType': 'PASSENGER',
      });

      final response = await http.post(uri, headers: headers, body: body).timeout(
            const Duration(seconds: 10),
          );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        return SupportTicket.fromJson(data);
      } else {
        throw Exception('Failed to create ticket: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('[SupportService] createTicket error: $e. Falling back to local offline ticket.');
      final ts = DateTime.now().millisecondsSinceEpoch.toString();
      final shortTs = ts.length > 6 ? ts.substring(ts.length - 6) : ts;
      return SupportTicket(
        id: 'local-$ts',
        ticketNumber: 'TK-$shortTs',
        subject: subject,
        category: category,
        description: description,
        status: 'NEW',
        priority: 'MEDIUM',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        messages: [
          SupportMessageItem(
            id: 'm-1',
            senderRole: 'USER',
            senderName: 'You',
            message: description,
            createdAt: DateTime.now(),
          ),
        ],
      );
    }
  }

  /// Fetches active tickets for the current authenticated passenger
  Future<List<SupportTicket>> getMyTickets() async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/tickets/my');

      final response = await http.get(uri, headers: headers).timeout(
            const Duration(seconds: 8),
          );

      if (response.statusCode == 200) {
        final List<dynamic> list = jsonDecode(response.body);
        return list.map((item) => SupportTicket.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('[SupportService] getMyTickets error: $e');
    }
    return [];
  }

  /// Fetches a specific ticket thread with full messages
  Future<SupportTicket?> getTicket(String ticketId) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/tickets/$ticketId');

      final response = await http.get(uri, headers: headers).timeout(
            const Duration(seconds: 8),
          );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return SupportTicket.fromJson(data);
      }
    } catch (e) {
      debugPrint('[SupportService] getTicket error: $e');
    }
    return null;
  }

  /// Sends a reply message to an existing support ticket
  Future<SupportMessageItem?> replyToTicket(String ticketId, String text) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/tickets/$ticketId/reply');

      final body = jsonEncode({
        'text': text,
        'senderName': 'Passenger',
      });

      final response = await http.post(uri, headers: headers, body: body).timeout(
            const Duration(seconds: 8),
          );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        return SupportMessageItem.fromJson(data);
      }
    } catch (e) {
      debugPrint('[SupportService] replyToTicket error: $e');
    }
    return null;
  }

  /// Submits customer satisfaction rating (1 to 5)
  Future<bool> submitCsat(String ticketId, int rating, [String? feedback]) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/tickets/$ticketId/csat');

      final body = jsonEncode({
        'rating': rating,
        if (feedback != null) 'feedback': feedback,
      });

      final response = await http.post(uri, headers: headers, body: body).timeout(
            const Duration(seconds: 6),
          );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('[SupportService] submitCsat error: $e');
      return false;
    }
  }
}
