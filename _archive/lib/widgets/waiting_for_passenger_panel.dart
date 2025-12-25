import 'package:flutter/material.dart';
import 'dart:async';

const int GRACE_PERIOD_SECONDS = 120; // 2 minutes from acceptance criteria

class WaitingForPassengerPanel extends StatefulWidget {
  final DateTime driverArrivalTime;
  final VoidCallback onStartTrip;

  const WaitingForPassengerPanel({
    super.key,
    required this.driverArrivalTime,
    required this.onStartTrip,
  });

  @override
  State<WaitingForPassengerPanel> createState() =>
      _WaitingForPassengerPanelState();
}

class _WaitingForPassengerPanelState extends State<WaitingForPassengerPanel> {
  Timer? _timer;
  Duration _elapsed = Duration.zero;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _elapsed = DateTime.now().difference(widget.driverArrivalTime);
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(Duration d) {
    return d.toString().split('.').first.padLeft(8, "0");
  }

  @override
  Widget build(BuildContext context) {
    final bool isGracePeriod = _elapsed.inSeconds < GRACE_PERIOD_SECONDS;
    final gracePeriodRemaining = GRACE_PERIOD_SECONDS - _elapsed.inSeconds;

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            isGracePeriod
                ? 'Grace period ends in: ${gracePeriodRemaining}s'
                : 'Wait time fee is active',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isGracePeriod ? Colors.black87 : Colors.red,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Time Waited: ${_formatDuration(_elapsed)}',
            style: const TextStyle(fontSize: 16, fontFamily: 'monospace'),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: widget.onStartTrip,
              child: const Text('Start Trip'),
            ),
          ),
        ],
      ),
    );
  }
}
