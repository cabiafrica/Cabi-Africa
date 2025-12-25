import 'package:flutter/material.dart';

class TrustedContactsScreen extends StatefulWidget {
  const TrustedContactsScreen({super.key});

  @override
  State<TrustedContactsScreen> createState() => _TrustedContactsScreenState();
}

class _TrustedContactsScreenState extends State<TrustedContactsScreen> {
  // Mock Data
  final List<Map<String, String>> _contacts = [
    {'id': '1', 'name': 'Mom', 'phone': '+254 700 123 456'},
    {'id': '2', 'name': 'Wife', 'phone': '+254 711 987 654'},
  ];

  void _addContact() {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Trusted Contact'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Name')),
            TextField(controller: phoneController, decoration: const InputDecoration(labelText: 'Phone Number')),
            const SizedBox(height: 12),
            OutlinedButton.icon(
                onPressed: () {
                    // Mock picking contact
                    nameController.text = "David Kamau";
                    phoneController.text = "+254 777 444 333";
                },
                icon: const Icon(Icons.contacts),
                label: const Text('Pick from Contacts'),
            )
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.isNotEmpty && phoneController.text.isNotEmpty) {
                setState(() {
                  _contacts.add({
                    'id': DateTime.now().toString(),
                    'name': nameController.text,
                    'phone': phoneController.text,
                  });
                });
                Navigator.pop(context);
              }
            },
            child: const Text('ADD'),
          ),
        ],
      ),
    );
  }

  void _shareTrip(String phone) {
      // Mock share logic
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Trip details shared via SMS to $phone')),
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Trusted Contacts')),
      floatingActionButton: FloatingActionButton(
        onPressed: _addContact,
        child: const Icon(Icons.add),
      ),
      body: _contacts.isEmpty 
        ? const Center(child: Text('No trusted contacts added yet.\nAdd someone to keep you safe!', textAlign: TextAlign.center))
        : ListView.builder(
            itemCount: _contacts.length,
            itemBuilder: (context, index) {
              final contact = _contacts[index];
              return ListTile(
                leading: const CircleAvatar(child: Icon(Icons.person)),
                title: Text(contact['name']!),
                subtitle: Text(contact['phone']!),
                trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                        TextButton.icon(
                            icon: const Icon(Icons.share, size: 16),
                            label: const Text('Share Trip'),
                            onPressed: () => _shareTrip(contact['phone']!),
                        ),
                        IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () {
                                setState(() {
                                    _contacts.removeAt(index);
                                });
                            },
                        )
                    ],
                ),
              );
            },
        ),
    );
  }
}
