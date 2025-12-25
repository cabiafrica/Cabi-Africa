import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class EmergencyContact {
  final String id;
  final String name;
  final String phone;

  EmergencyContact({required this.id, required this.name, required this.phone});

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'phone': phone};

  factory EmergencyContact.fromJson(Map<String, dynamic> json) {
    return EmergencyContact(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
    );
  }
}

class EmergencyContactService {
  static const _contactsKey = 'emergency_contacts';

  Future<List<EmergencyContact>> getContacts() async {
    final prefs = await SharedPreferences.getInstance();
    final contactsJson = prefs.getStringList(_contactsKey) ?? [];
    return contactsJson
        .map((json) => EmergencyContact.fromJson(jsonDecode(json)))
        .toList();
  }

  Future<void> addContact(EmergencyContact contact) async {
    final prefs = await SharedPreferences.getInstance();
    final contacts = await getContacts();
    if (contacts.any((c) => c.id == contact.id)) return; // Avoid duplicates
    contacts.add(contact);
    final contactsJson = contacts.map((c) => jsonEncode(c.toJson())).toList();
    await prefs.setStringList(_contactsKey, contactsJson);
  }

  Future<void> deleteContact(String contactId) async {
    final prefs = await SharedPreferences.getInstance();
    final contacts = await getContacts();
    contacts.removeWhere((c) => c.id == contactId);
    final contactsJson = contacts.map((c) => jsonEncode(c.toJson())).toList();
    await prefs.setStringList(_contactsKey, contactsJson);
  }

  void notifyContacts(List<EmergencyContact> contacts, String rideId) {
    debugPrint(
      'Simulating sending emergency alert for ride $rideId to ${contacts.length} contacts.',
    );
    for (var contact in contacts) {
      debugPrint('Notifying ${contact.name} at ${contact.phone}');
    }
  }
}
