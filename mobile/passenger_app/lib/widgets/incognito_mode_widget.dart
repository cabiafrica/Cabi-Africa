import 'package:flutter/material.dart';

class IncognitoModeWidget extends StatelessWidget {
  final bool isIncognito;
  final ValueChanged<bool> onChanged;

  const IncognitoModeWidget({
    super.key,
    required this.isIncognito,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: isIncognito ? 4 : 1,
      color: isIncognito ? Colors.grey.shade900 : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.visibility_off,
                  color: isIncognito ? Colors.white : Colors.grey.shade700,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Incognito Mode',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isIncognito ? Colors.white : Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isIncognito
                            ? 'This trip will be hidden from your history'
                            : 'Take a private trip',
                        style: TextStyle(
                          fontSize: 13,
                          color: isIncognito
                              ? Colors.grey.shade400
                              : Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: isIncognito,
                  onChanged: onChanged,
                  activeTrackColor: const Color(0xFF1A3A3A),
                  activeColor: const Color(0xFF0F9B8E),
                ),
              ],
            ),
            if (isIncognito) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade800,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade700),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline,
                        color: Colors.grey.shade400, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Trip will be saved for billing & safety but hidden from your main history',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade300,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
