import 'package:flutter/material.dart';

// --- MOCK MODELS AND SERVICES FOR DEMONSTRATION ---

class WeeklyStatement {
  final String weekOf;
  final double totalEarnings;
  final int tripCount;
  final String status;

  WeeklyStatement({
    required this.weekOf,
    required this.totalEarnings,
    required this.tripCount,
    required this.status,
  });

  factory WeeklyStatement.fromJson(Map<String, dynamic> json) {
    return WeeklyStatement(
      weekOf: json['weekOf'],
      totalEarnings: (json['totalEarnings'] as num).toDouble(),
      tripCount: json['tripCount'],
      status: json['status'],
    );
  }
}

class WeeklyStatementsService {
  const WeeklyStatementsService();

  Future<List<WeeklyStatement>> fetchWeeklyStatements() async {
    debugPrint("Fetching weekly statements from mock service...");
    await Future.delayed(const Duration(seconds: 1));
    // In a real app, this would make an HTTP GET request to `/api/earnings/weekly-statements`
    final mockApiResponse = [
      {
        "weekOf": "2024-08-19",
        "totalEarnings": 506.00,
        "tripCount": 15,
        "status": "Paid",
      },
      {
        "weekOf": "2024-08-12",
        "totalEarnings": 480.50,
        "tripCount": 14,
        "status": "Paid",
      },
      {
        "weekOf": "2024-08-05",
        "totalEarnings": 525.75,
        "tripCount": 16,
        "status": "Paid",
      },
    ];
    return mockApiResponse
        .map((data) => WeeklyStatement.fromJson(data))
        .toList();
  }
}

// --- WIDGET IMPLEMENTATION ---

class WeeklyStatementsScreen extends StatefulWidget {
  final WeeklyStatementsService statementsService;

  const WeeklyStatementsScreen({
    super.key,
    this.statementsService =
        const WeeklyStatementsService(), // Default to real service
  });

  @override
  State<WeeklyStatementsScreen> createState() => _WeeklyStatementsScreenState();
}

class _WeeklyStatementsScreenState extends State<WeeklyStatementsScreen> {
  late Future<List<WeeklyStatement>> _statementsFuture;

  @override
  void initState() {
    super.initState();
    _statementsFuture = widget.statementsService.fetchWeeklyStatements();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Weekly Statements')),
      body: FutureBuilder<List<WeeklyStatement>>(
        future: _statementsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No weekly statements found.'));
          }

          final statements = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(8.0),
            itemCount: statements.length,
            itemBuilder: (context, index) {
              final statement = statements[index];
              // A more sophisticated app would parse this into a proper date range
              final weekLabel = 'Week of ${statement.weekOf}';

              return Card(
                margin: const EdgeInsets.symmetric(
                  vertical: 6.0,
                  horizontal: 8.0,
                ),
                child: ListTile(
                  title: Text(
                    weekLabel,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text('${statement.tripCount} trips'),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '\$${statement.totalEarnings.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        statement.status,
                        style: TextStyle(
                          color: Colors.green.shade700,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  onTap: () {
                    // In a future story, this could navigate to a detailed breakdown for the week.
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Viewing details for $weekLabel')),
                    );
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}
