import 'package:flutter/material.dart';

class AddStopsScreen extends StatefulWidget {
  final String pickup;
  final String destination;

  const AddStopsScreen({
    super.key,
    required this.pickup,
    required this.destination,
  });

  @override
  State<AddStopsScreen> createState() => _AddStopsScreenState();
}

class _AddStopsScreenState extends State<AddStopsScreen> {
  final List<String> _stops = [];

  void _addStop() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Stop'),
        content: const TextField(
          decoration: InputDecoration(
            hintText: 'Search for a location...',
            prefixIcon: Icon(Icons.search),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _stops.add('789 Stop St'); // Mock
              });
              Navigator.pop(ctx);
            },
            child: const Text('ADD'),
          ),
        ],
      ),
    );
  }

  void _removeStop(int index) {
    setState(() {
      _stops.removeAt(index);
    });
  }

  void _reorderStops(int oldIndex, int newIndex) {
    setState(() {
      if (newIndex > oldIndex) newIndex--;
      final stop = _stops.removeAt(oldIndex);
      _stops.insert(newIndex, stop);
    });
  }

  double _calculateFare() {
    // Base fare + extra per stop
    return 1500.00 + (_stops.length * 500.00);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Stops'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context, {
                'stops': _stops,
                'fare': _calculateFare(),
              });
            },
            child: const Text('DONE', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ReorderableListView(
              padding: const EdgeInsets.all(16),
              onReorder: _reorderStops,
              children: [
                // Pickup (fixed)
                _buildLocationTile(
                  key: const ValueKey('pickup'),
                  icon: Icons.radio_button_checked,
                  label: 'Pickup',
                  address: widget.pickup,
                  color: Colors.green,
                  isFixed: true,
                ),

                // Stops (reorderable)
                for (int i = 0; i < _stops.length; i++)
                  _buildLocationTile(
                    key: ValueKey('stop_$i'),
                    icon: Icons.location_on,
                    label: 'Stop ${i + 1}',
                    address: _stops[i],
                    color: Colors.orange,
                    onRemove: () => _removeStop(i),
                  ),

                // Destination (fixed)
                _buildLocationTile(
                  key: const ValueKey('destination'),
                  icon: Icons.location_on,
                  label: 'Destination',
                  address: widget.destination,
                  color: Colors.red,
                  isFixed: true,
                ),
              ],
            ),
          ),

          // Add Stop Button
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Column(
              children: [
                OutlinedButton.icon(
                  onPressed: _addStop,
                  icon: const Icon(Icons.add),
                  label: const Text('Add Another Stop'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(50),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Estimated Fare:',
                        style: TextStyle(fontSize: 16)),
                    Text(
                      'KES ${_calculateFare().toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                if (_stops.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      '+KES ${(_stops.length * 500.00).toStringAsFixed(2)} for ${_stops.length} stop(s)',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLocationTile({
    required Key key,
    required IconData icon,
    required String label,
    required String address,
    required Color color,
    bool isFixed = false,
    VoidCallback? onRemove,
  }) {
    return Card(
      key: key,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: color),
        title: Text(label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        subtitle: Text(address),
        trailing: isFixed
            ? Icon(Icons.lock, color: Colors.grey[400], size: 20)
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.drag_handle, color: Colors.grey[400]),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.red),
                    onPressed: onRemove,
                  ),
                ],
              ),
      ),
    );
  }
}

