import 'package:flutter/material.dart';

/// A screen that allows users to search for a destination.
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  // In a real app, this would come from a Places API
  final List<String> _suggestions = [
    '123 Main St, Anytown, USA',
    '456 Oak Ave, Sometown, USA',
    '789 Pine Ln, Otherville, USA',
    'Central Park',
    'Empire State Building',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search for a destination...',
            border: InputBorder.none,
          ),
          onChanged: (value) {
            // In a real app, filter suggestions based on input
          },
        ),
      ),
      body: ListView.builder(
        itemCount: _suggestions.length,
        itemBuilder: (context, index) {
          final suggestion = _suggestions[index];
          return ListTile(
            leading: const Icon(Icons.location_on),
            title: Text(suggestion),
            onTap: () {
              // Return the selected destination to the previous screen
              Navigator.of(context).pop(suggestion);
            },
          );
        },
      ),
    );
  }
}
