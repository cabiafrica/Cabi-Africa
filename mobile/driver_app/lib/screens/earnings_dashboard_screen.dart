import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:driver_app/providers/payout_providers.dart';
import 'request_payout_screen.dart';

class EarningsDashboardScreen extends ConsumerWidget {
  const EarningsDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final earningsAsync = ref.watch(availableEarningsProvider);

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('EARNINGS', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 14)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(availableEarningsProvider.future),
        color: AppTheme.primaryColor,
        backgroundColor: AppTheme.darkSurface,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Balance Card
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: AppTheme.darkSurface,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.1)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  )
                ],
              ),
              child: Column(
                children: [
                  const Text(
                    'AVAILABLE BALANCE',
                    style: TextStyle(color: AppTheme.darkTextSecondary, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 2),
                  ),
                  const SizedBox(height: 16),
                  earningsAsync.when(
                    data: (balance) => Text(
                      'KES ${balance.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: AppTheme.primaryColor,
                        fontSize: 42,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    loading: () => const SizedBox(
                      height: 50,
                      width: 50,
                      child: CircularProgressIndicator(color: AppTheme.primaryColor, strokeWidth: 3),
                    ),
                    error: (e, _) => const Text(
                      'KES --.--',
                      style: TextStyle(color: AppTheme.errorRed, fontSize: 32, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.account_balance_wallet, size: 20),
                      label: const Text('REQUEST INSTANT PAYOUT', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1, fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const RequestPayoutScreen(),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 40),
            const Text(
              'RECENT ACTIVITY',
              style: TextStyle(color: AppTheme.darkTextSecondary, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 2),
            ),
            const SizedBox(height: 16),
            _buildEmptyState(),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(40),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: const Column(
        children: [
          Icon(Icons.history, color: Colors.white24, size: 48),
          SizedBox(height: 16),
          Text(
            'No recent earnings activity found.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white38, fontSize: 14),
          ),
        ],
      ),
    );
  }
}

