import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class EmergencyContact {
  final String id;
  final String name;
  final String phone;

  EmergencyContact({required this.id, required this.name, required this.phone});

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'phone': phone};

  factory EmergencyContact.fromJson(Map<String, dynamic> json) {
    return EmergencyContact(
      id: json['id'] ?? 'contact_${DateTime.now().millisecondsSinceEpoch}',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
    );
  }
}

class EmergencyContactService {
  static const _contactsKey = 'emergency_contacts';
  final String baseUrl;
  final FlutterSecureStorage _storage;

  EmergencyContactService({
    String? baseUrl,
    FlutterSecureStorage? storage,
  })  : baseUrl = baseUrl ?? AppConfig.dispatchApiUrl,
        _storage = storage ?? const FlutterSecureStorage();

  Future<String?> _resolveAuthToken() async {
    try {
      final token = await _storage.read(key: 'jwt_token');
      if (token != null && token.isNotEmpty) return token;
    } catch (_) {}

    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token') ?? prefs.getString('authToken') ?? prefs.getString('token');
  }

  /**
   * Retrieves emergency contacts with cloud-sync and local cache fallback
   */
  Future<List<EmergencyContact>> getContacts() async {
    final prefs = await SharedPreferences.getInstance();
    final token = await _resolveAuthToken();

    // 1. Try fetching from backend cloud API if authenticated
    if (token != null && token.isNotEmpty) {
      try {
        final response = await http.get(
          Uri.parse('$baseUrl/safety/emergency-contacts'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ).timeout(const Duration(seconds: 5));

        if (response.statusCode == 200) {
          final dynamic data = jsonDecode(response.body);
          final List list = data is List ? data : (data['emergencyContacts'] ?? []);
          final contacts = list.map((item) => EmergencyContact.fromJson(item)).toList();

          // Update local cache
          final contactsJson = contacts.map((c) => jsonEncode(c.toJson())).toList();
          await prefs.setStringList(_contactsKey, contactsJson);
          return contacts;
        }
      } catch (e) {
        debugPrint('[EmergencyContactService] Cloud fetch failed, falling back to cache: $e');
      }
    }

    // 2. Offline / local cache fallback
    final contactsJson = prefs.getStringList(_contactsKey) ?? [];
    return contactsJson
        .map((json) => EmergencyContact.fromJson(jsonDecode(json)))
        .toList();
  }

  /**
   * Adds an emergency contact and syncs with cloud database
   */
  Future<void> addContact(EmergencyContact contact) async {
    final prefs = await SharedPreferences.getInstance();
    final contacts = await getContacts();
    if (contacts.any((c) => c.phone == contact.phone || c.id == contact.id)) {
      return; // Avoid duplicate phone numbers
    }
    contacts.add(contact);

    // Save to local cache
    final contactsJson = contacts.map((c) => jsonEncode(c.toJson())).toList();
    await prefs.setStringList(_contactsKey, contactsJson);

    // Sync to backend cloud database
    await _syncContactsToCloud(contacts);
  }

  /**
   * Deletes an emergency contact and syncs with cloud database
   */
  Future<void> deleteContact(String contactId) async {
    final prefs = await SharedPreferences.getInstance();
    final contacts = await getContacts();
    contacts.removeWhere((c) => c.id == contactId);

    // Save to local cache
    final contactsJson = contacts.map((c) => jsonEncode(c.toJson())).toList();
    await prefs.setStringList(_contactsKey, contactsJson);

    // Sync to backend cloud database
    await _syncContactsToCloud(contacts);
  }

  Future<void> _syncContactsToCloud(List<EmergencyContact> contacts) async {
    final token = await _resolveAuthToken();
    if (token == null || token.isEmpty) return;

    try {
      final payload = jsonEncode({
        'contacts': contacts.map((c) => c.toJson()).toList(),
      });

      await http.post(
        Uri.parse('$baseUrl/safety/emergency-contacts'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: payload,
      ).timeout(const Duration(seconds: 5));
    } catch (e) {
      debugPrint('[EmergencyContactService] Failed to sync contacts to cloud: $e');
    }
  }
}
