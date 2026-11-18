import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class AccountDeletionScreen extends StatefulWidget {
  const AccountDeletionScreen({super.key});

  @override
  State<AccountDeletionScreen> createState() => _AccountDeletionScreenState();
}

class _AccountDeletionScreenState extends State<AccountDeletionScreen> {
  int _currentStep = 0;
  final TextEditingController _confirmationController = TextEditingController();
  bool _isDeleting = false;
  final List<bool> _reasonsSelected = List.filled(6, false);

  final List<String> _deletionReasons = [
    'I don\'t drive anymore',
    'Privacy concerns',
    'Found better opportunities',
    'Low earnings',
    'Poor platform experience',
    'Other',
  ];

  @override
  void dispose() {
    _confirmationController.dispose();
    super.dispose();
  }

  Future<void> _deleteAccount() async {
    setState(() {
      _isDeleting = true;
    });

    final selectedList = <String>[];
    for (int i = 0; i < _deletionReasons.length; i++) {
      if (_reasonsSelected[i]) selectedList.add(_deletionReasons[i]);
    }
    final reasonString = selectedList.isNotEmpty ? selectedList.join(', ') : 'Driver requested account closure';

    final result = await AuthService().deleteAccount(reason: reasonString);

    if (!mounted) return;

    if (!result.isSignedIn && result.error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Driver account deactivated. PII anonymized and vehicle unassigned.'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 4),
        ),
      );
      Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
    } else {
      setState(() {
        _isDeleting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.error ?? 'Failed to delete account. Please complete active trips first.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppTheme.obsidianCanvas : AppTheme.porcelainCanvas;
    final surfaceColor = isDark ? AppTheme.darkSurface : AppTheme.porcelainSurface;
    final textColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subtextColor = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text(
          'CAPTAIN ACCOUNT DELETION',
          style: GoogleFonts.inter(
            color: Colors.redAccent,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
            fontSize: 13.5,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: textColor),
      ),
      body: _isDeleting
          ? _buildDeletingState(isDark, textColor, subtextColor)
          : Theme(
              data: Theme.of(context).copyWith(
                colorScheme: Theme.of(context).colorScheme.copyWith(
                  primary: Colors.redAccent,
                  surface: surfaceColor,
                ),
              ),
              child: Stepper(
                currentStep: _currentStep,
                onStepContinue: () {
                  if (_currentStep < 2) {
                    setState(() {
                      _currentStep++;
                    });
                  } else {
                    if (_confirmationController.text.trim().toUpperCase() == 'DELETE') {
                      _deleteAccount();
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Please type DELETE to confirm'),
                          backgroundColor: Colors.redAccent,
                        ),
                      );
                    }
                  }
                },
                onStepCancel: () {
                  if (_currentStep > 0) {
                    setState(() {
                      _currentStep--;
                    });
                  } else {
                    Navigator.pop(context);
                  }
                },
                controlsBuilder: (context, details) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 20),
                    child: Row(
                      children: [
                        if (_currentStep < 2)
                          Expanded(
                            child: ElevatedButton(
                              onPressed: details.onStepContinue,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.redAccent,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              child: Text(
                                'Continue',
                                style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        if (_currentStep == 2)
                          Expanded(
                            child: ElevatedButton(
                              onPressed: _confirmationController.text.trim().toUpperCase() == 'DELETE'
                                  ? details.onStepContinue
                                  : null,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red[800],
                                foregroundColor: Colors.white,
                                disabledBackgroundColor: Colors.red.withValues(alpha: 0.3),
                                disabledForegroundColor: Colors.white38,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              child: Text(
                                'Deactivate Captain Account',
                                style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: details.onStepCancel,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: subtextColor,
                              side: BorderSide(
                                color: isDark ? Colors.white24 : Colors.grey.shade300,
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: Text(
                              _currentStep > 0 ? 'Back' : 'Cancel',
                              style: GoogleFonts.inter(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
                steps: [
                  // Step 1: Warning
                  Step(
                    title: Text(
                      'Important Driver Notice',
                      style: GoogleFonts.inter(color: textColor, fontWeight: FontWeight.bold),
                    ),
                    content: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.redAccent.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.redAccent.withValues(alpha: 0.35)),
                          ),
                          child: Column(
                            children: [
                              const Icon(
                                Icons.warning_amber_rounded,
                                color: Colors.redAccent,
                                size: 44,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Permanent Driver Account Closure',
                                style: GoogleFonts.inter(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.redAccent,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Deactivating your captain account will immediately turn your status OFFLINE, unbind your vehicle assignments, and anonymize your driver PII in accordance with Kenya Data Protection Act 2019.',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: subtextColor,
                                  height: 1.35,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        ...[
                          'Vehicle assignment and active shifts will be unlinked',
                          'Sacco daily remittance ledgers will be frozen for settlement',
                          'Your driver rating (Gold/Sovereign tier) will be archived',
                          'You will not receive any dispatch orders',
                        ].map((item) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 5),
                              child: Row(
                                children: [
                                  const Icon(Icons.remove_circle_outline,
                                      color: Colors.redAccent, size: 18),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      item,
                                      style: GoogleFonts.inter(fontSize: 12.5, color: textColor),
                                    ),
                                  ),
                                ],
                              ),
                            )),
                      ],
                    ),
                    isActive: _currentStep >= 0,
                    state: _currentStep > 0 ? StepState.complete : StepState.indexed,
                  ),

                  // Step 2: Feedback
                  Step(
                    title: Text(
                      'Reason for Leaving',
                      style: GoogleFonts.inter(color: textColor, fontWeight: FontWeight.bold),
                    ),
                    content: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Please tell us why you are leaving Cabi Drive:',
                          style: GoogleFonts.inter(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w600,
                            color: textColor,
                          ),
                        ),
                        const SizedBox(height: 12),
                        ..._deletionReasons.asMap().entries.map((entry) {
                          return CheckboxListTile(
                            title: Text(
                              entry.value,
                              style: GoogleFonts.inter(color: textColor, fontSize: 13),
                            ),
                            value: _reasonsSelected[entry.key],
                            onChanged: (value) {
                              setState(() {
                                _reasonsSelected[entry.key] = value ?? false;
                              });
                            },
                            activeColor: accent,
                            checkColor: Colors.black,
                            contentPadding: EdgeInsets.zero,
                          );
                        }),
                      ],
                    ),
                    isActive: _currentStep >= 1,
                    state: _currentStep > 1 ? StepState.complete : StepState.indexed,
                  ),

                  // Step 3: Final Confirmation
                  Step(
                    title: Text(
                      'Final Confirmation',
                      style: GoogleFonts.inter(color: textColor, fontWeight: FontWeight.bold),
                    ),
                    content: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.redAccent.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.redAccent.withValues(alpha: 0.4)),
                          ),
                          child: Column(
                            children: [
                              const Icon(
                                Icons.delete_forever_rounded,
                                color: Colors.redAccent,
                                size: 40,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Type DELETE to confirm closure',
                                style: GoogleFonts.inter(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.redAccent,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Ensure all cash collections and wallet balances are cleared before confirming.',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: subtextColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 18),
                        TextField(
                          controller: _confirmationController,
                          style: GoogleFonts.inter(color: textColor, fontWeight: FontWeight.bold),
                          decoration: InputDecoration(
                            hintText: 'Type DELETE here',
                            hintStyle: TextStyle(color: subtextColor.withValues(alpha: 0.5)),
                            filled: true,
                            fillColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(
                                color: isDark ? Colors.white12 : Colors.grey.shade300,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Colors.redAccent, width: 2),
                            ),
                          ),
                          onChanged: (_) => setState(() {}),
                        ),
                      ],
                    ),
                    isActive: _currentStep >= 2,
                    state: StepState.indexed,
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildDeletingState(bool isDark, Color textColor, Color subtextColor) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Colors.redAccent),
          ),
          const SizedBox(height: 24),
          Text(
            'Closing Captain account...',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Releasing vehicle assignment and anonymizing records',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: subtextColor,
            ),
          ),
        ],
      ),
    );
  }
}
