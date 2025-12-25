import 'package:flutter/material.dart';

enum RideTimeOption { now, later }

/// A panel for booking a ride, with options to ride now or schedule for later.
class RideBookingPanel extends StatefulWidget {
  final Function(DateTime) onScheduleConfirm;
  final Function() onRideNowConfirm;

  const RideBookingPanel({
    Key? key,
    required this.onScheduleConfirm,
    required this.onRideNowConfirm,
  }) : super(key: key);

  @override
  _RideBookingPanelState createState() => _RideBookingPanelState();
}

class _RideBookingPanelState extends State<RideBookingPanel> {
  RideTimeOption _selectedOption = RideTimeOption.now;
  DateTime? _scheduledTime;

  /// Shows the date and time pickers and updates the state.
  Future<void> _selectDateTime(BuildContext context) async {
    final now = DateTime.now();
    // Business rule: Must be at least 60 minutes in the future
    final initialDate = now.add(const Duration(minutes: 60));

    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: initialDate,
      // Business rule: No more than 30 days in advance
      lastDate: now.add(const Duration(days: 30)),
    );

    if (pickedDate == null) return;

    final TimeOfDay? pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(initialDate),
    );

    if (pickedTime == null) return;

    setState(() {
      _scheduledTime = DateTime(
        pickedDate.year,
        pickedDate.month,
        pickedDate.day,
        pickedTime.hour,
        pickedTime.minute,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Mock destination inputs
          const TextField(
            decoration: InputDecoration(labelText: 'Pickup Location'),
          ),
          const SizedBox(height: 8),
          const TextField(
            decoration: InputDecoration(labelText: 'Destination'),
          ),
          const SizedBox(height: 16),

          ToggleButtons(
            isSelected: [
              _selectedOption == RideTimeOption.now,
              _selectedOption == RideTimeOption.later,
            ],
            onPressed: (index) {
              setState(() {
                _selectedOption = RideTimeOption.values[index];
                if (_selectedOption == RideTimeOption.later &&
                    _scheduledTime == null) {
                  _selectDateTime(context);
                }
              });
            },
            children: const [Text('Ride Now'), Text('Schedule')],
          ),

          if (_selectedOption == RideTimeOption.later)
            ListTile(
              title: Text(
                _scheduledTime == null
                    ? 'Select a time'
                    : 'Scheduled for: ${_scheduledTime?.toLocal()}',
              ),
              trailing: const Icon(Icons.calendar_today),
              onTap: () => _selectDateTime(context),
            ),

          const Spacer(),
          ElevatedButton(
            onPressed: () {
              if (_selectedOption == RideTimeOption.now) {
                widget.onRideNowConfirm();
              } else if (_scheduledTime != null) {
                widget.onScheduleConfirm(_scheduledTime!);
              }
            },
            child: const Text('Confirm Ride'),
          ),
        ],
      ),
    );
  }
}
