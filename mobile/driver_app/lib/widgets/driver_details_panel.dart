import 'package:flutter/material.dart';

class DriverDetailsPanel extends StatelessWidget {
  const DriverDetailsPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Center(child: Text('Driver details will be displayed here.')),
      ),
    );
  }
}
