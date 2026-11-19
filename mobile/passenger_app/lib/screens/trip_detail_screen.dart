import 'package:flutter/material.dart';
import '../widgets/tip_selection_widget.dart';
import 'trip_dispute_screen.dart';
import 'report_lost_item_screen.dart';

class TripDetailScreen extends StatefulWidget {
  final String tripId;

  const TripDetailScreen({super.key, required this.tripId});

  @override
  State<TripDetailScreen> createState() => _TripDetailScreenState();
}

class _TripDetailScreenState extends State<TripDetailScreen> {
  // Mock trip data
  final _fareAmount = 2550.00;
  bool _tipAdded = false;
  double _tipAmount = 0.0;
  final _tripDate = DateTime.now().subtract(const Duration(hours: 2));
  bool _isFavoriteDriver = false;

  bool get _canAddTip {
    // Allow tipping within 72 hours
    final hoursSinceTrip = DateTime.now().difference(_tripDate).inHours;
    return !_tipAdded && hoursSinceTrip < 72;
  }

  void _showTipDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
          top: 16,
          left: 16,
          right: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Add a tip for your driver',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TipSelectionWidget(
              fareAmount: _fareAmount,
              onTipSelected: (amount) {
                // Store selected amount
              },
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                // API call to process tip
                setState(() {
                  _tipAdded = true;
                  _tipAmount = 500.0; // Mock
                });
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('Tip sent! Your driver will be notified.')),
                );
              },
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
              ),
              child: const Text('CONFIRM TIP'),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Trip Details')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Trip Summary Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const CircleAvatar(
                          child: Icon(Icons.person),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Driver: John Smith',
                                  style:
                                      TextStyle(fontWeight: FontWeight.bold)),
                              Text(
                                  '${_tripDate.hour}:${_tripDate.minute.toString().padLeft(2, '0')} • ${_tripDate.day}/${_tripDate.month}/${_tripDate.year}'),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.green[100],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text('Completed',
                              style: TextStyle(
                                  color: Colors.green,
                                  fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const Divider(height: 24),
                    _buildLocationRow(Icons.radio_button_checked, 'Pickup',
                        '123 Main St, New York'),
                    const SizedBox(height: 8),
                    _buildLocationRow(
                        Icons.location_on, 'Dropoff', '456 Park Ave, New York'),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Favorite Driver',
                            style: TextStyle(fontWeight: FontWeight.w500)),
                        IconButton(
                          icon: Icon(
                            _isFavoriteDriver
                                ? Icons.favorite
                                : Icons.favorite_border,
                            color: _isFavoriteDriver ? Colors.red : Colors.grey,
                          ),
                          onPressed: () {
                            setState(() {
                              _isFavoriteDriver = !_isFavoriteDriver;
                            });
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(_isFavoriteDriver
                                    ? 'Driver added to favorites'
                                    : 'Driver removed from favorites'),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Fare Breakdown Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Fare Breakdown',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 12),
                    _buildFareRow('Base Fare', 1500.00),
                    _buildFareRow('Distance (5.2 mi)', 850.00),
                    _buildFareRow('Time (12 min)', 200.00),
                    if (_tipAdded) _buildFareRow('Tip', _tipAmount),
                    const Divider(),
                    _buildFareRow('Total', _fareAmount + _tipAmount,
                        isBold: true),
                  ],
                ),
              ),
            ),

            // Add Tip Button
            if (_canAddTip) ...[
              const SizedBox(height: 16),
              Card(
                color: Colors.pink[50],
                child: InkWell(
                  onTap: _showTipDialog,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Icon(Icons.favorite, color: Colors.pink[700]),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Add a tip',
                                  style:
                                      TextStyle(fontWeight: FontWeight.bold)),
                              Text('Show your appreciation',
                                  style: TextStyle(fontSize: 12)),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right),
                      ],
                    ),
                  ),
                ),
              ),
            ],

            if (_tipAdded) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green[200]!),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green[700]),
                    const SizedBox(width: 8),
                    const Text('Tip sent! Your driver has been notified.'),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 24),
            const Text(
              'Trip Support & Incident Reporting',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),

            // Dispute Fare / Route Detour Card
            Card(
              elevation: 0.5,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: BorderSide(color: Colors.grey.shade300),
              ),
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Color(0x1F00A859),
                  child: Icon(Icons.alt_route, color: Color(0xFF00A859)),
                ),
                title: const Text(
                  'Dispute Fare / Report Detour',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                subtitle: const Text(
                  'Audit GPS trajectory and claim automatic fare recalculation',
                  style: TextStyle(fontSize: 12),
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (ctx) => TripDisputeScreen(
                        tripId: widget.tripId,
                        driverId: 'drv_sample_442',
                        driverName: 'John Smith',
                        fareAmount: _fareAmount,
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 8),

            // Report Lost Item Card
            Card(
              elevation: 0.5,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: BorderSide(color: Colors.grey.shade300),
              ),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.blue.shade50,
                  child: Icon(Icons.find_in_page_outlined, color: Colors.blue.shade700),
                ),
                title: const Text(
                  'Lost an Item in this Vehicle?',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                subtitle: const Text(
                  'File an incident report, track return PIN, and escrow courier',
                  style: TextStyle(fontSize: 12),
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (ctx) => ReportLostItemScreen(
                        rideId: widget.tripId,
                        driverId: 'drv_sample_442',
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationRow(IconData icon, String label, String address) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: TextStyle(fontSize: 12, color: Colors.grey[600])),
              Text(address,
                  style: const TextStyle(fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFareRow(String label, double amount, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                  fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
          Text(
            'KES ${amount.toStringAsFixed(2)}',
            style: TextStyle(
                fontWeight: isBold ? FontWeight.bold : FontWeight.normal),
          ),
        ],
      ),
    );
  }
}
