import 'package:flutter/material.dart';

class VehicleType {
  final String id;
  final String name;
  final String description;
  final IconData icon;
  final int capacity;
  final double baseFare;
  final double estimatedFare;

  VehicleType({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.capacity,
    required this.baseFare,
    required this.estimatedFare,
  });
}

class VehicleTypeSelector extends StatelessWidget {
  final List<VehicleType> vehicleTypes;
  final String? selectedVehicleTypeId;
  final Function(String) onVehicleTypeSelected;

  const VehicleTypeSelector({
    super.key,
    required this.vehicleTypes,
    required this.selectedVehicleTypeId,
    required this.onVehicleTypeSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Text(
            'Choose your ride',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ),
        SizedBox(
          height: 160,
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: vehicleTypes.length,
            itemBuilder: (context, index) {
              final vehicleType = vehicleTypes[index];
              final isSelected = vehicleType.id == selectedVehicleTypeId;

              return GestureDetector(
                onTap: () => onVehicleTypeSelected(vehicleType.id),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                  width: 140,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    gradient: isSelected
                        ? const LinearGradient(
                            colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          )
                        : null,
                    color: isSelected ? null : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFFF59E0B)
                          : Colors.grey.shade300,
                      width: isSelected ? 2 : 1,
                    ),
                    boxShadow: [
                      if (isSelected)
                        BoxShadow(
                          color: const Color(0xFFFBBF24).withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Icon and Name
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? Colors.black.withValues(alpha: 0.2)
                                    : const Color(0xFFFBBF24)
                                        .withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                vehicleType.icon,
                                color: isSelected
                                    ? Colors.black
                                    : const Color(0xFFF59E0B),
                                size: 24,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              vehicleType.name,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color:
                                    isSelected ? Colors.black : Colors.black87,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(
                                  Icons.person,
                                  size: 14,
                                  color: isSelected
                                      ? Colors.black.withValues(alpha: 0.7)
                                      : Colors.grey.shade600,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${vehicleType.capacity}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isSelected
                                        ? Colors.black.withValues(alpha: 0.7)
                                        : Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),

                        // Price
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'KES ${vehicleType.estimatedFare.toStringAsFixed(2)}',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color:
                                    isSelected ? Colors.black : Colors.black87,
                              ),
                            ),
                            Text(
                              vehicleType.description,
                              style: TextStyle(
                                fontSize: 11,
                                color: isSelected
                                    ? Colors.black.withValues(alpha: 0.6)
                                    : Colors.grey.shade500,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

// Example usage with mock data
class VehicleTypeSelectorExample extends StatefulWidget {
  const VehicleTypeSelectorExample({super.key});

  @override
  State<VehicleTypeSelectorExample> createState() =>
      _VehicleTypeSelectorExampleState();
}

class _VehicleTypeSelectorExampleState
    extends State<VehicleTypeSelectorExample> {
  String? selectedVehicleTypeId;

  final List<VehicleType> vehicleTypes = [
    VehicleType(
      id: 'standard',
      name: 'Standard',
      description: 'Affordable rides',
      icon: Icons.directions_car,
      capacity: 4,
      baseFare: 5.0,
      estimatedFare: 12.50,
    ),
    VehicleType(
      id: 'comfort',
      name: 'Comfort',
      description: 'Premium cars',
      icon: Icons.drive_eta,
      capacity: 4,
      baseFare: 8.0,
      estimatedFare: 18.75,
    ),
    VehicleType(
      id: 'xl',
      name: 'XL',
      description: 'Extra space',
      icon: Icons.airport_shuttle,
      capacity: 6,
      baseFare: 10.0,
      estimatedFare: 22.00,
    ),
    VehicleType(
      id: 'green',
      name: 'Green',
      description: 'Eco-friendly',
      icon: Icons.eco,
      capacity: 4,
      baseFare: 6.0,
      estimatedFare: 13.25,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Select Vehicle Type'),
        backgroundColor: const Color(0xFFFBBF24),
      ),
      body: Column(
        children: [
          const SizedBox(height: 20),
          VehicleTypeSelector(
            vehicleTypes: vehicleTypes,
            selectedVehicleTypeId: selectedVehicleTypeId,
            onVehicleTypeSelected: (id) {
              setState(() {
                selectedVehicleTypeId = id;
              });
            },
          ),
          const SizedBox(height: 20),
          if (selectedVehicleTypeId != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFBBF24).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFFFBBF24).withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.info_outline,
                      color: Color(0xFFF59E0B),
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'You selected ${vehicleTypes.firstWhere((v) => v.id == selectedVehicleTypeId).name}',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[700],
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
