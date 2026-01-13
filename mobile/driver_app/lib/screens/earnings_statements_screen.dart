import 'package:flutter/material.dart';

// Mock DTO - In a real app, this would be generated.
class EarningsStatementDto {
  final String id;
  final String periodName;
  final String downloadUrl;

  EarningsStatementDto({
    required this.id,
    required this.periodName,
    required this.downloadUrl,
  });
}

class EarningsStatementsScreen extends StatefulWidget {
  const EarningsStatementsScreen({super.key});

  @override
  State<EarningsStatementsScreen> createState() =>
      _EarningsStatementsScreenState();
}

class _EarningsStatementsScreenState extends State<EarningsStatementsScreen> {
  late Future<List<EarningsStatementDto>> _statementsFuture;

  @override
  void initState() {
    super.initState();
    _statementsFuture = _fetchStatements();
  }

  Future<List<EarningsStatementDto>> _fetchStatements() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));
    return [
      EarningsStatementDto(
        id: 'stmt-1',
        periodName: 'Week of Aug 19, 2024',
        downloadUrl: '/statements/weekly-2024-08-19.pdf',
      ),
      EarningsStatementDto(
        id: 'stmt-2',
        periodName: 'Week of Aug 12, 2024',
        downloadUrl: '/statements/weekly-2024-08-12.pdf',
      ),
      EarningsStatementDto(
        id: 'stmt-3',
        periodName: 'Month of July 2024',
        downloadUrl: '/statements/monthly-2024-07.pdf',
      ),
    ];
  }

  void _downloadStatement(String url) {
    // Mock download action
    debugPrint('Downloading statement from: $url');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Downloading statement... (mock)')),
    );
    // In a real app, you would use a package like `url_launcher` or `flutter_downloader`.
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Earnings Statements')),
      body: FutureBuilder<List<EarningsStatementDto>>(
        future: _statementsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError ||
              !snapshot.hasData ||
              snapshot.data!.isEmpty) {
            return const Center(child: Text('No statements available.'));
          }

          return ListView.builder(
            itemCount: snapshot.data!.length,
            itemBuilder: (context, index) {
              final statement = snapshot.data![index];
              return ListTile(
                title: Text(statement.periodName),
                trailing: IconButton(
                  icon: const Icon(Icons.download),
                  onPressed: () => _downloadStatement(statement.downloadUrl),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
