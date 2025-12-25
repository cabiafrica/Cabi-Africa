import 'package:flutter/material.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();

  void _returnLocation(String name) {
    Navigator.of(context).pop({
      'name': name,
      'latitude': -1.2921, // Mock
      'longitude': 36.8219, // Mock
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          decoration: const InputDecoration(
            hintText: 'Search location...',
            border: InputBorder.none,
          ),
          autofocus: true,
          onSubmitted: (value) => _returnLocation(value),
        ),
      ),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('Home'),
            onTap: () => _returnLocation('Home'),
          ),
          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('Work'),
            onTap: () => _returnLocation('Work'),
          ),
          ListTile(
            leading: const Icon(Icons.location_on),
            title: const Text('Generic Location'),
            onTap: () => _returnLocation('Generic Location'),
          ),
        ],
      ),
    );
  }
}
