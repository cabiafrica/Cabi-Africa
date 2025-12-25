import 'package:flutter/material.dart';

// Mock data models. In a real app, these would be generated from JSON.
class TrustedContact {
  final String id;
  final String name;
  final String phone;

  TrustedContact({required this.id, required this.name, required this.phone});
}

// Mock service. In a real app, this would make HTTP requests.
class TrustedContactsService {
  Future<List<TrustedContact>> getContacts() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      TrustedContact(id: 'c1', name: 'Mom', phone: '555-0101'),
      TrustedContact(id: 'c2', name: 'John Doe', phone: '555-0102'),
    ];
  }

  Future<void> addContact() async {
    // In a real app, this would use a plugin like `contacts_service`
    // to open the phone's contact picker.
    await Future.delayed(const Duration(milliseconds: 300));
    print('Opening contact picker to add a new trusted contact...');
  }

  Future<void> removeContact(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    print('Removing trusted contact: $id');
  }
}

class TrustedContactsScreen extends StatefulWidget {
  const TrustedContactsScreen({super.key});

  @override
  State<TrustedContactsScreen> createState() => _TrustedContactsScreenState();
}

class _TrustedContactsScreenState extends State<TrustedContactsScreen> {
  final TrustedContactsService _service = TrustedContactsService();
  late Future<List<TrustedContact>> _contactsFuture;

  @override
  void initState() {
    super.initState();
    _refreshContacts();
  }

  void _refreshContacts() {
    setState(() {
      _contactsFuture = _service.getContacts();
    });
  }

  Future<void> _handleRemove(String id) async {
    await _service.removeContact(id);
    _refreshContacts();
  }

  Future<void> _handleAdd() async {
    await _service.addContact();
    _refreshContacts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trusted Contacts'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _handleAdd),
        ],
      ),
      body: FutureBuilder<List<TrustedContact>>(
        future: _contactsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Could not load contacts.'));
          }
          final contacts = snapshot.data!;
          return ListView.builder(
            itemCount: contacts.length,
            itemBuilder: (context, index) {
              final contact = contacts[index];
              return ListTile(
                title: Text(contact.name),
                subtitle: Text(contact.phone),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline),
                  onPressed: () => _handleRemove(contact.id),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
