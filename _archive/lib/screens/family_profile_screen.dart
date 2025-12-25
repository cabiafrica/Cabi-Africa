import 'package:flutter/material.dart';

// --- Data Models & Mock Service ---

class TeenPolicy {
  bool curfewEnabled;
  int curfewStartHour;
  int curfewEndHour;
  bool geofenceEnabled;
  double geofenceRadiusKm;

  TeenPolicy({
    this.curfewEnabled = false,
    this.curfewStartHour = 22,
    this.curfewEndHour = 6,
    this.geofenceEnabled = false,
    this.geofenceRadiusKm = 5.0,
  });
}

class TeenMember {
  final String id;
  final String name;
  TeenPolicy policies;

  TeenMember({required this.id, required this.name, required this.policies});
}

class FamilyProfileService {
  Future<void> saveTeenPolicies(String teenId, TeenPolicy policies) async {
    await Future.delayed(const Duration(milliseconds: 500));
    print('Saving policies for teen $teenId...');
    print(
      'Curfew: ${policies.curfewEnabled}, ${policies.curfewStartHour}:00 - ${policies.curfewEndHour}:00',
    );
    print(
      'Geofence: ${policies.geofenceEnabled}, Radius: ${policies.geofenceRadiusKm}km',
    );
  }
}

// --- UI Implementation ---

class FamilyProfileScreen extends StatefulWidget {
  const FamilyProfileScreen({super.key});

  @override
  State<FamilyProfileScreen> createState() => _FamilyProfileScreenState();
}

class _FamilyProfileScreenState extends State<FamilyProfileScreen> {
  final _familyService = FamilyProfileService();

  // Mock data for a family member
  final _teenMember = TeenMember(
    id: 'teen-1',
    name: 'Alex',
    policies: TeenPolicy(),
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Family Profile')),
      body: ListView(
        padding: const EdgeInsets.all(8.0),
        children: [
          Text(
            'Manage Teen Accounts',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Card(
            child: ExpansionTile(
              leading: const CircleAvatar(child: Text('A')),
              title: Text(_teenMember.name),
              subtitle: const Text('Teen Member'),
              children: [_buildPolicyEditor(_teenMember)],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPolicyEditor(TeenMember teen) {
    final hours = List.generate(24, (index) => index);

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Curfew Policy
          SwitchListTile(
            title: const Text('Enforce Curfew'),
            value: teen.policies.curfewEnabled,
            onChanged: (value) =>
                setState(() => teen.policies.curfewEnabled = value),
          ),
          if (teen.policies.curfewEnabled)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                const Text('From:'),
                DropdownButton<int>(
                  value: teen.policies.curfewStartHour,
                  items: hours
                      .map(
                        (h) => DropdownMenuItem(value: h, child: Text('$h:00')),
                      )
                      .toList(),
                  onChanged: (v) =>
                      setState(() => teen.policies.curfewStartHour = v!),
                ),
                const Text('To:'),
                DropdownButton<int>(
                  value: teen.policies.curfewEndHour,
                  items: hours
                      .map(
                        (h) => DropdownMenuItem(value: h, child: Text('$h:00')),
                      )
                      .toList(),
                  onChanged: (v) =>
                      setState(() => teen.policies.curfewEndHour = v!),
                ),
              ],
            ),
          const Divider(height: 32),

          // Geofence Policy
          SwitchListTile(
            title: const Text('Enforce Geofence'),
            value: teen.policies.geofenceEnabled,
            onChanged: (value) =>
                setState(() => teen.policies.geofenceEnabled = value),
          ),
          if (teen.policies.geofenceEnabled)
            Column(
              children: [
                Text(
                  'Approved Zone Radius: ${teen.policies.geofenceRadiusKm.toStringAsFixed(1)} km',
                ),
                Slider(
                  value: teen.policies.geofenceRadiusKm,
                  min: 1,
                  max: 20,
                  divisions: 19,
                  label:
                      '${teen.policies.geofenceRadiusKm.toStringAsFixed(1)} km',
                  onChanged: (value) =>
                      setState(() => teen.policies.geofenceRadiusKm = value),
                ),
              ],
            ),
          const Divider(height: 32),

          // Save Button
          Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton(
              onPressed: () async {
                await _familyService.saveTeenPolicies(teen.id, teen.policies);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Policies saved!')),
                  );
                }
              },
              child: const Text('Save Policies'),
            ),
          ),
        ],
      ),
    );
  }
}
