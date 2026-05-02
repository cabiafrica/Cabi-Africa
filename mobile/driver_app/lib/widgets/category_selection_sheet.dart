import 'package:flutter/material.dart';

class VehicleCategory {
  final String id;
  final String name;
  final String description;
  final String icon;
  final bool isEligible;
  bool isSelected;

  VehicleCategory({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    this.isEligible = true,
    this.isSelected = false,
  });
}

class CategorySelectionSheet extends StatefulWidget {
  final List<VehicleCategory> categories;
  final ValueChanged<List<String>> onSave;

  const CategorySelectionSheet({
    super.key,
    required this.categories,
    required this.onSave,
  });

  @override
  State<CategorySelectionSheet> createState() => _CategorySelectionSheetState();
}

class _CategorySelectionSheetState extends State<CategorySelectionSheet> {
  late List<VehicleCategory> _categories;

  @override
  void initState() {
    super.initState();
    _categories = widget.categories;
  }

  void _toggleCategory(int index) {
    if (!_categories[index].isEligible) return;

    setState(() {
      _categories[index].isSelected = !_categories[index].isSelected;
    });
  }

  void _save() {
    final selectedIds =
        _categories.where((c) => c.isSelected).map((c) => c.id).toList();
    widget.onSave(selectedIds);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Ride Preferences',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Select the ride types you want to accept requests for.',
            style: TextStyle(color: Colors.grey[600], fontSize: 14),
          ),
          const SizedBox(height: 24),
          ...List.generate(_categories.length, (index) {
            final category = _categories[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: InkWell(
                onTap: () => _toggleCategory(index),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: category.isSelected
                        ? const Color(0x1AFBBF24)
                        : Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: category.isSelected
                          ? const Color(0xFFFBBF24)
                          : Colors.grey.shade200,
                      width: 2,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          category.icon,
                          style: const TextStyle(fontSize: 20),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              category.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (!category.isEligible)
                              Text(
                                'Not eligible for current vehicle',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.red.shade400,
                                ),
                              )
                            else
                              Text(
                                category.description,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                          ],
                        ),
                      ),
                      if (category.isEligible)
                        Switch(
                          value: category.isSelected,
                          onChanged: (val) => _toggleCategory(index),
                          activeThumbColor: const Color(0xFFFBBF24),
                        ),
                    ],
                  ),
                ),
              ),
            );
          }),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: const Color(0xFFFBBF24),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Save Preferences'),
            ),
          ),
        ],
      ),
    );
  }
}


