import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import '../services/emergency_contact_service.dart';
import '../providers/providers.dart';

class EmergencyContactsScreen extends ConsumerStatefulWidget {
  const EmergencyContactsScreen({super.key});

  @override
  ConsumerState<EmergencyContactsScreen> createState() =>
      _EmergencyContactsScreenState();
}

class _EmergencyContactsScreenState
    extends ConsumerState<EmergencyContactsScreen> {
  late Future<List<EmergencyContact>> _contactsFuture;

  @override
  void initState() {
    super.initState();
    _loadContacts();
  }

  void _loadContacts() {
    setState(() {
      _contactsFuture = ref.read(emergencyContactServiceProvider).getContacts();
    });
  }

  Future<void> _addContact() async {
    if (await FlutterContacts.requestPermission()) {
      Contact? contact = await FlutterContacts.openExternalPick();
      if (contact != null && contact.phones.isNotEmpty) {
        final newContact = EmergencyContact(
          id: contact.id,
          name: contact.displayName,
          phone: contact.phones.first.number,
        );
        await ref.read(emergencyContactServiceProvider).addContact(newContact);
        _loadContacts();
      }
    }
  }

  Future<void> _deleteContact(String contactId) async {
    await ref.read(emergencyContactServiceProvider).deleteContact(contactId);
    _loadContacts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Emergency Contacts')),
      body: FutureBuilder<List<EmergencyContact>>(
        future: _contactsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
              child: Text('No emergency contacts added yet.'),
            );
          }

          final contacts = snapshot.data!;

          return ListView.builder(
            itemCount: contacts.length,
            itemBuilder: (context, index) {
              final contact = contacts[index];
              return ListTile(
                leading: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.5), width: 1.5),
                  ),
                  child: const CircleAvatar(
                    backgroundColor: Colors.black,
                    child: Icon(Icons.person_rounded, color: Color(0xFFF59E0B)),
                  ),
                ),
                title: Text(contact.name),
                subtitle: Text(contact.phone),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: () => _deleteContact(contact.id),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addContact,
        label: const Text('Add Contact'),
        icon: const Icon(Icons.add),
      ),
    );
  }
}
