import 'package:flutter/material.dart';

// Mock DTO - In a real app, this would be generated.
class VehicleCategoryDto {
  final String id;
  final String name;
  final String description;
  final double estimatedFare;

  VehicleCategoryDto({
    required this.id,
    required this.name,
    required this.description,
    required this.estimatedFare,
  });
}

class VehicleSelectionWidget extends StatefulWidget {
  const VehicleSelectionWidget({super.key});

  @override
  State<VehicleSelectionWidget> createState() => _VehicleSelectionWidgetState();
}

class _VehicleSelectionWidgetState extends State<VehicleSelectionWidget> {
  late Future<List<VehicleCategoryDto>> _categoriesFuture;
  String? _selectedCategoryId;

  @override
  void initState() {
    super.initState();
    _categoriesFuture = _fetchVehicleCategories();
  }

  Future<List<VehicleCategoryDto>> _fetchVehicleCategories() async {
    // Mock API call
    await Future.delayed(const Duration(milliseconds: 500));
    final categories = [
      VehicleCategoryDto(
        id: 'cat-1',
        name: 'Standard',
        description: 'Up to 4 seats',
        estimatedFare: 2000.00,
      ),
      VehicleCategoryDto(
        id: 'cat-2',
        name: 'Premium',
        description: 'Luxury vehicle',
        estimatedFare: 3500.00,
      ),
      VehicleCategoryDto(
        id: 'cat-3',
        name: 'XL',
        description: 'Up to 6 seats',
        estimatedFare: 3000.00,
      ),
    ];
    // Set default selection
    if (mounted) {
      setState(() {
        _selectedCategoryId = categories.first.id;
      });
    }
    return categories;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<VehicleCategoryDto>>(
      future: _categoriesFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text('No vehicle types available.'));
        }

        return SizedBox(
          height: 100,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: snapshot.data!.length,
            itemBuilder: (context, index) {
              final category = snapshot.data![index];
              final isSelected = category.id == _selectedCategoryId;
              return GestureDetector(
                onTap: () => setState(() => _selectedCategoryId = category.id),
                child: Card(
                  color:
                      isSelected ? Theme.of(context).primaryColorLight : null,
                  child: Container(
                    width: 120,
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          category.name,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(category.description),
                        Text(
                            'KES ${category.estimatedFare.toStringAsFixed(2)}'),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}
