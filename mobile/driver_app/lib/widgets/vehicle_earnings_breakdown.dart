import 'package:flutter/material.dart';

class VehicleEarningsBreakdown extends StatefulWidget {
  final Map<String, Map<String, dynamic>> vehicleData;
  final String currencySymbol;

  const VehicleEarningsBreakdown({
    super.key,
    required this.vehicleData,
    this.currencySymbol = '\$',
  });

  @override
  State<VehicleEarningsBreakdown> createState() =>
      _VehicleEarningsBreakdownState();
}

class _VehicleEarningsBreakdownState extends State<VehicleEarningsBreakdown>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedPeriod = 'Weekly'; // Weekly, Monthly, Yearly

  @override
  void initState() {
    super.initState();
    _tabController =
        TabController(length: widget.vehicleData.length + 1, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Calculate totals for "All Vehicles" tab
    double totalEarnings = 0;
    int totalTrips = 0;
    double totalHours = 0;

    widget.vehicleData.forEach((key, data) {
      totalEarnings += data['earnings'];
      totalTrips += data['trips'] as int;
      totalHours += data['hours'];
    });

    return Column(
      children: [
        // Period Selector
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Performance',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              DropdownButton<String>(
                value: _selectedPeriod,
                underline: const SizedBox(),
                items: ['Weekly', 'Monthly', 'Yearly']
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedPeriod = val);
                },
              ),
            ],
          ),
        ),

        // Tabs
        TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: Colors.black,
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFFFBBF24),
          indicatorWeight: 3,
          tabs: [
            const Tab(text: 'All Vehicles'),
            ...widget.vehicleData.values.map((v) => Tab(text: v['name'])),
          ],
        ),

        const SizedBox(height: 16),

        // Content
        SizedBox(
          height: 220,
          child: TabBarView(
            controller: _tabController,
            children: [
              // All Vehicles Summary
              _buildSummaryCard(
                'All Vehicles',
                totalEarnings,
                totalTrips,
                totalHours,
                true,
              ),
              // Individual Vehicles
              ...widget.vehicleData.values.map((v) => _buildSummaryCard(
                    v['name'],
                    v['earnings'],
                    v['trips'],
                    v['hours'],
                    false,
                  )),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(String title, double earnings, int trips,
      double hours, bool isAggegrate) {
    final earningsPerHour = hours > 0 ? earnings / hours : 0;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isAggegrate
              ? [const Color(0xFF1F2937), const Color(0xFF111827)]
              : [Colors.white, Colors.white],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: isAggegrate ? null : Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: TextStyle(
                  color: isAggegrate ? Colors.grey[400] : Colors.grey[600],
                  fontSize: 14,
                ),
              ),
              if (!isAggegrate)
                const Icon(Icons.directions_car, color: Colors.grey, size: 20),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '${widget.currencySymbol}${earnings.toStringAsFixed(2)}',
            style: TextStyle(
              color: isAggegrate ? const Color(0xFFFBBF24) : Colors.black,
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          const Divider(height: 24, color: Colors.grey),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildStat('Trips', '$trips', isAggegrate),
              _buildStat('Hours', '${hours.toStringAsFixed(1)}h', isAggegrate),
              _buildStat(
                  'Avg/Hr',
                  '${widget.currencySymbol}${earningsPerHour.toStringAsFixed(2)}',
                  isAggegrate),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String label, String value, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: TextStyle(
            color: isDark ? Colors.white : Colors.black,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: isDark ? Colors.grey[500] : Colors.grey[500],
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}
