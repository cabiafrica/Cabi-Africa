import 'package:flutter/material.dart';

class FamilyMember {
  final String id;
  final String name;
  final String email;
  final String role; // 'organizer', 'adult', 'teen'
  final String status; // 'active', 'pending'
  final int tripsThisMonth;
  final double spendingThisMonth;

  FamilyMember({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
    this.tripsThisMonth = 0,
    this.spendingThisMonth = 0,
  });
}

class FamilyProfileScreen extends StatefulWidget {
  const FamilyProfileScreen({super.key});

  @override
  State<FamilyProfileScreen> createState() => _FamilyProfileScreenState();
}

class _FamilyProfileScreenState extends State<FamilyProfileScreen> {
  bool isFamilyOrganizer = true;
  List<FamilyMember> familyMembers = [
    FamilyMember(
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'organizer',
      status: 'active',
      tripsThisMonth: 12,
      spendingThisMonth: 14550.00,
    ),
    FamilyMember(
      id: '2',
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      role: 'adult',
      status: 'active',
      tripsThisMonth: 8,
      spendingThisMonth: 8925.00,
    ),
    FamilyMember(
      id: '3',
      name: 'Emma Smith',
      email: 'emma@example.com',
      role: 'teen',
      status: 'active',
      tripsThisMonth: 5,
      spendingThisMonth: 4200.00,
    ),
    FamilyMember(
      id: '4',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'adult',
      status: 'pending',
    ),
  ];

  double get totalSpending => familyMembers
      .where((m) => m.status == 'active')
      .fold(0, (sum, m) => sum + m.spendingThisMonth);

  int get totalTrips => familyMembers
      .where((m) => m.status == 'active')
      .fold(0, (sum, m) => sum + m.tripsThisMonth);

  void _inviteMember() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Invite Family Member'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: const InputDecoration(
                labelText: 'Email Address',
                prefixIcon: Icon(Icons.email),
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Role',
                prefixIcon: Icon(Icons.person),
              ),
              items: const [
                DropdownMenuItem(value: 'adult', child: Text('Adult')),
                DropdownMenuItem(value: 'teen', child: Text('Teen (13-17)')),
              ],
              onChanged: (value) {},
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Invitation sent!'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFBBF24),
              foregroundColor: Colors.black,
            ),
            child: const Text('Send Invite'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Family Profile',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFFFBBF24),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
        actions: [
          if (isFamilyOrganizer)
            IconButton(
              icon: const Icon(Icons.person_add),
              onPressed: _inviteMember,
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFFBBF24).withValues(alpha: 0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                const Icon(
                  Icons.family_restroom,
                  size: 48,
                  color: Colors.black,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Smith Family',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${familyMembers.where((m) => m.status == 'active').length} Active Members',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.black.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Stats
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Total Trips',
                  totalTrips.toString(),
                  Icons.directions_car,
                  Colors.blue,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Total Spent',
                  'KES ${totalSpending.toStringAsFixed(2)}',
                  Icons.attach_money,
                  Colors.green,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Family Members Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Family Members',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (isFamilyOrganizer)
                TextButton.icon(
                  onPressed: _inviteMember,
                  icon: const Icon(Icons.add),
                  label: const Text('Invite'),
                  style: TextButton.styleFrom(
                    foregroundColor: const Color(0xFFF59E0B),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 12),

          // Active Members
          ...familyMembers.where((m) => m.status == 'active').map((member) {
            return _buildMemberCard(member);
          }),

          // Pending Invitations
          if (familyMembers.any((m) => m.status == 'pending')) ...[
            const SizedBox(height: 16),
            const Text(
              'Pending Invitations',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...familyMembers.where((m) => m.status == 'pending').map((member) {
              return _buildMemberCard(member);
            }),
          ],

          const SizedBox(height: 24),

          // Benefits Section
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFBBF24).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.star,
                        color: Color(0xFFF59E0B),
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Family Benefits',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildBenefitItem('Shared payment method'),
                _buildBenefitItem('Track all family trips'),
                _buildBenefitItem('Real-time trip notifications'),
                _buildBenefitItem('Set spending limits'),
                _buildBenefitItem('Teen account supervision'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMemberCard(FamilyMember member) {
    final isPending = member.status == 'pending';
    final isOrganizer = member.role == 'organizer';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPending ? Colors.orange.shade200 : Colors.grey.shade200,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: const Color(0xFFFBBF24),
                child: Text(
                  member.name[0].toUpperCase(),
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          member.name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (isOrganizer)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFBBF24),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'ORGANIZER',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                          ),
                        if (member.role == 'teen')
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.blue.shade100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'TEEN',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue.shade900,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      member.email,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              if (isPending)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'Pending',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.orange.shade900,
                    ),
                  ),
                ),
            ],
          ),
          if (!isPending && !isOrganizer) ...[
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text(
                      member.tripsThisMonth.toString(),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Trips',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
                Container(
                  height: 30,
                  width: 1,
                  color: Colors.grey[300],
                ),
                Column(
                  children: [
                    Text(
                      'KES ${member.spendingThisMonth.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Spent',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBenefitItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          const Icon(
            Icons.check_circle,
            color: Color(0xFFF59E0B),
            size: 20,
          ),
          const SizedBox(width: 12),
          Text(
            text,
            style: const TextStyle(fontSize: 14),
          ),
        ],
      ),
    );
  }
}
