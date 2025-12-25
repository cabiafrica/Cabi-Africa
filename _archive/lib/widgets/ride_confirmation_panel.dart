import 'package:flutter/material.dart';

enum RideProfile { personal, business }

class RideConfirmationPanel extends StatefulWidget {
  final Function(RideProfile) onConfirm;

  const RideConfirmationPanel({super.key, required this.onConfirm});

  @override
  State<RideConfirmationPanel> createState() => _RideConfirmationPanelState();
}

class _RideConfirmationPanelState extends State<RideConfirmationPanel> {
  RideProfile _selectedProfile = RideProfile.personal;

  // Mock data to show whether a business profile exists
  final bool _hasBusinessProfile = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
        boxShadow: [
          BoxShadow(blurRadius: 10, color: Colors.black.withOpacity(0.1)),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Confirm Your Ride',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          if (_hasBusinessProfile)
            SegmentedButton<RideProfile>(
              segments: const [
                ButtonSegment<RideProfile>(
                  value: RideProfile.personal,
                  icon: Icon(Icons.person),
                  label: Text('Personal'),
                ),
                ButtonSegment<RideProfile>(
                  value: RideProfile.business,
                  icon: Icon(Icons.business_center),
                  label: Text('Business'),
                ),
              ],
              selected: {_selectedProfile},
              onSelectionChanged: (Set<RideProfile> newSelection) {
                setState(() {
                  _selectedProfile = newSelection.first;
                });
              },
              style: SegmentedButton.styleFrom(
                fixedSize: const Size.fromHeight(48),
              ),
            ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                textStyle: const TextStyle(fontSize: 18),
              ),
              onPressed: () {
                widget.onConfirm(_selectedProfile);
                print('Ride confirmed with profile: $_selectedProfile');
              },
              child: const Text('Confirm Pickup'),
            ),
          ),
        ],
      ),
    );
  }
}
