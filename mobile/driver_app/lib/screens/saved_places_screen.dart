import 'package:flutter/material.dart';

/// A saved location entry.
class SavedPlace {
  final String id;
  String label;
  String address;
  IconData icon;
  Color color;

  SavedPlace({
    required this.id,
    required this.label,
    required this.address,
    required this.icon,
    required this.color,
  });
}

class SavedPlacesScreen extends StatefulWidget {
  const SavedPlacesScreen({super.key});

  @override
  State<SavedPlacesScreen> createState() => _SavedPlacesScreenState();
}

class _SavedPlacesScreenState extends State<SavedPlacesScreen> {
  final List<SavedPlace> _places = [
    SavedPlace(
      id: 'home',
      label: 'Home',
      address: '14 Westlands Road, Nairobi',
      icon: Icons.home_outlined,
      color: Colors.green,
    ),
    SavedPlace(
      id: 'work',
      label: 'Work',
      address: 'CBD, Moi Avenue, Nairobi',
      icon: Icons.work_outline,
      color: Colors.blue,
    ),
  ];

  void _addPlace() {
    _showPlaceDialog();
  }

  void _editPlace(SavedPlace place) {
    _showPlaceDialog(existing: place);
  }

  void _deletePlace(SavedPlace place) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Place'),
        content: Text('Remove "${place.label}" from your saved places?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red, foregroundColor: Colors.white),
            onPressed: () {
              setState(() => _places.remove(place));
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('"${place.label}" removed.')),
              );
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showPlaceDialog({SavedPlace? existing}) {
    final labelController = TextEditingController(text: existing?.label ?? '');
    final addressController =
        TextEditingController(text: existing?.address ?? '');
    IconData selectedIcon = existing?.icon ?? Icons.location_on_outlined;
    Color selectedColor = existing?.color ?? Colors.orange;

    final iconOptions = [
      (Icons.home_outlined, Colors.green, 'Home'),
      (Icons.work_outline, Colors.blue, 'Work'),
      (Icons.school_outlined, Colors.purple, 'School'),
      (Icons.local_hospital_outlined, Colors.red, 'Hospital'),
      (Icons.shopping_cart_outlined, Colors.orange, 'Market'),
      (Icons.location_on_outlined, Colors.teal, 'Other'),
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                existing == null ? 'Add Saved Place' : 'Edit Place',
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),

              // Icon picker
              const Text('Category',
                  style: TextStyle(fontSize: 13, color: Colors.grey)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 10,
                children: iconOptions.map((opt) {
                  final (icon, color, _) = opt;
                  final isSelected = selectedIcon == icon;
                  return GestureDetector(
                    onTap: () => setModalState(() {
                      selectedIcon = icon;
                      selectedColor = color;
                    }),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? color.withValues(alpha: 0.15)
                            : Colors.grey.shade100,
                        shape: BoxShape.circle,
                        border: isSelected
                            ? Border.all(color: color, width: 2)
                            : null,
                      ),
                      child: Icon(icon,
                          color: isSelected ? color : Colors.grey, size: 22),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              TextField(
                controller: labelController,
                decoration: InputDecoration(
                  labelText: 'Place Name',
                  prefixIcon: Icon(selectedIcon, color: selectedColor),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),

              TextField(
                controller: addressController,
                decoration: InputDecoration(
                  labelText: 'Address',
                  prefixIcon: const Icon(Icons.place_outlined),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFD700),
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    minimumSize: const Size.fromHeight(48),
                  ),
                  onPressed: () {
                    final label = labelController.text.trim();
                    final address = addressController.text.trim();
                    if (label.isEmpty || address.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Please fill in all fields.')),
                      );
                      return;
                    }
                    setState(() {
                      if (existing != null) {
                        existing.label = label;
                        existing.address = address;
                        existing.icon = selectedIcon;
                        existing.color = selectedColor;
                      } else {
                        _places.add(SavedPlace(
                          id: 'place-${DateTime.now().millisecondsSinceEpoch}',
                          label: label,
                          address: address,
                          icon: selectedIcon,
                          color: selectedColor,
                        ));
                      }
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                          content: Text(existing == null
                              ? '"$label" saved.'
                              : '"$label" updated.')),
                    );
                  },
                  child: Text(existing == null ? 'Save Place' : 'Update'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Places'),
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addPlace,
        backgroundColor: const Color(0xFFFFD700),
        foregroundColor: Colors.black,
        icon: const Icon(Icons.add),
        label: const Text('Add Place'),
      ),
      body: _places.isEmpty
          ? _EmptyState(onAdd: _addPlace)
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
              itemCount: _places.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final place = _places[index];
                return _PlaceCard(
                  place: place,
                  onEdit: () => _editPlace(place),
                  onDelete: () => _deletePlace(place),
                );
              },
            ),
    );
  }
}

class _PlaceCard extends StatelessWidget {
  final SavedPlace place;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _PlaceCard({
    required this.place,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.07),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: place.color.withValues(alpha: 0.12),
          child: Icon(place.icon, color: place.color, size: 22),
        ),
        title: Text(place.label,
            style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(place.address,
            style: const TextStyle(color: Colors.grey, fontSize: 12)),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            if (value == 'edit') onEdit();
            if (value == 'delete') onDelete();
          },
          itemBuilder: (context) => const [
            PopupMenuItem(value: 'edit', child: Text('Edit')),
            PopupMenuItem(
                value: 'delete',
                child: Text('Delete', style: TextStyle(color: Colors.red))),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final VoidCallback onAdd;
  const _EmptyState({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.bookmark_border, size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          const Text('No saved places yet',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Add your home, work or frequently visited places.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
            label: const Text('Add a Place'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFFD700),
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }
}
