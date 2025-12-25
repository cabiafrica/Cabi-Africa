import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// Mock DTO
class EarningsGoalDto {
  final double weeklyGoalAmount;
  final double currentWeeklyEarnings;

  EarningsGoalDto({
    required this.weeklyGoalAmount,
    required this.currentWeeklyEarnings,
  });
}

class EarningsGoalScreen extends StatefulWidget {
  const EarningsGoalScreen({super.key});

  @override
  State<EarningsGoalScreen> createState() => _EarningsGoalScreenState();
}

class _EarningsGoalScreenState extends State<EarningsGoalScreen> {
  late Future<EarningsGoalDto> _goalFuture;
  EarningsGoalDto? _currentGoal;
  final _goalController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _goalFuture = _fetchGoal();
  }

  Future<EarningsGoalDto> _fetchGoal() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));
    final goal = EarningsGoalDto(
      weeklyGoalAmount: 500.00,
      currentWeeklyEarnings: 350.50,
    );
    setState(() {
      _currentGoal = goal;
      _goalController.text = goal.weeklyGoalAmount.toStringAsFixed(0);
    });
    return goal;
  }

  Future<void> _setGoal() async {
    final newGoalAmount = double.tryParse(_goalController.text);
    if (newGoalAmount == null || newGoalAmount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid goal amount.')),
      );
      return;
    }

    // Mock API call
    print('Setting new weekly goal: $newGoalAmount');
    await Future.delayed(const Duration(seconds: 1));

    setState(() {
      if (_currentGoal != null) {
        _currentGoal = EarningsGoalDto(
          weeklyGoalAmount: newGoalAmount,
          currentWeeklyEarnings: _currentGoal!.currentWeeklyEarnings,
        );
      }
    });

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Earnings goal updated!')));
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Earnings Goal')),
      body: FutureBuilder<EarningsGoalDto>(
        future: _goalFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Could not load earnings goal.'));
          }

          final goal = _currentGoal!;
          final progress = (goal.currentWeeklyEarnings / goal.weeklyGoalAmount)
              .clamp(0.0, 1.0);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'This Week\'s Goal',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),
                LinearProgressIndicator(value: progress, minHeight: 10),
                const SizedBox(height: 8),
                Text(
                  'You have earned \$${goal.currentWeeklyEarnings.toStringAsFixed(2)} of your \$${goal.weeklyGoalAmount.toStringAsFixed(2)} goal.',
                ),
                const SizedBox(height: 32),
                Text(
                  'Set Your Weekly Goal',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _goalController,
                  decoration: const InputDecoration(
                    labelText: 'Weekly Earnings Goal',
                    prefixText: '\$',
                  ),
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _setGoal,
                  child: const Text('Set Goal'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
