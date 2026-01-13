import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// Mock DTOs - In a real app, these would be generated.
class ExpenseDto {
  final String id;
  final String description;
  final double amount;
  final String category;
  final DateTime date;

  ExpenseDto({
    required this.id,
    required this.description,
    required this.amount,
    required this.category,
    required this.date,
  });
}

class CreateExpenseDto {
  final String description;
  final double amount;
  final String category;
  final DateTime date;

  CreateExpenseDto({
    required this.description,
    required this.amount,
    required this.category,
    required this.date,
  });
}

class ExpenseTrackingScreen extends StatefulWidget {
  const ExpenseTrackingScreen({super.key});

  @override
  State<ExpenseTrackingScreen> createState() => _ExpenseTrackingScreenState();
}

class _ExpenseTrackingScreenState extends State<ExpenseTrackingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _amountController = TextEditingController();
  String _selectedCategory = 'Fuel';
  DateTime _selectedDate = DateTime.now();
  bool _isAddingExpense = false;

  final List<ExpenseDto> _expenses = [
    ExpenseDto(
      id: 'exp-1',
      description: 'Gas fill-up',
      amount: 45.50,
      category: 'Fuel',
      date: DateTime.now().subtract(const Duration(days: 2)),
    ),
    ExpenseDto(
      id: 'exp-2',
      description: 'Car wash',
      amount: 15.00,
      category: 'Maintenance',
      date: DateTime.now().subtract(const Duration(days: 5)),
    ),
  ];

  final List<String> _categories = ['Fuel', 'Maintenance', 'Tolls', 'Other'];

  Future<void> _addExpense() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() => _isAddingExpense = true);

    final newExpense = CreateExpenseDto(
      description: _descriptionController.text,
      amount: double.parse(_amountController.text),
      category: _selectedCategory,
      date: _selectedDate,
    );

    // Mock API call
    debugPrint('Adding expense: ${newExpense.description}');
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    setState(() {
      _expenses.add(
        ExpenseDto(
          id: 'exp-${_expenses.length + 1}',
          description: newExpense.description,
          amount: newExpense.amount,
          category: newExpense.category,
          date: newExpense.date,
        ),
      );
      _descriptionController.clear();
      _amountController.clear();
      _selectedCategory = 'Fuel';
      _selectedDate = DateTime.now();
      _isAddingExpense = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Expense added successfully!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Track Expenses')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _descriptionController,
                    decoration: const InputDecoration(labelText: 'Description'),
                    validator: (value) => value!.isEmpty ? 'Required' : null,
                  ),
                  TextFormField(
                    controller: _amountController,
                    decoration: const InputDecoration(labelText: 'Amount'),
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    validator: (value) => double.tryParse(value!) == null ||
                            double.parse(value) <= 0
                        ? 'Enter a valid amount'
                        : null,
                  ),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedCategory,
                    decoration: const InputDecoration(labelText: 'Category'),
                    items: _categories
                        .map(
                          (cat) =>
                              DropdownMenuItem(value: cat, child: Text(cat)),
                        )
                        .toList(),
                    onChanged: (value) =>
                        setState(() => _selectedCategory = value!),
                  ),
                  ListTile(
                    title: Text(
                      'Date: ${_selectedDate.toLocal().toString().split(' ')[0]}',
                    ),
                    trailing: const Icon(Icons.calendar_today),
                    onTap: () async {
                      final DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: _selectedDate,
                        firstDate: DateTime(2000),
                        lastDate: DateTime.now(),
                      );
                      if (picked != null && picked != _selectedDate) {
                        setState(() => _selectedDate = picked);
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                  _isAddingExpense
                      ? const CircularProgressIndicator()
                      : ElevatedButton(
                          onPressed: _addExpense,
                          child: const Text('Add Expense'),
                        ),
                ],
              ),
            ),
            const Divider(height: 32),
            Expanded(
              child: ListView.builder(
                itemCount: _expenses.length,
                itemBuilder: (context, index) {
                  final expense = _expenses[index];
                  return ListTile(
                    title: Text(expense.description),
                    subtitle: Text(
                      '${expense.category} - ${expense.date.toLocal().toString().split(' ')[0]}',
                    ),
                    trailing: Text('\$${expense.amount.toStringAsFixed(2)}'),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
