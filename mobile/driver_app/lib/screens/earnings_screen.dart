import 'package:flutter/material.dart';
import '../widgets/secure_webview.dart';
import '../config/app_config.dart';

class EarningsScreen extends StatelessWidget {
  const EarningsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SecureWebView(
      title: 'Earnings Statements',
      url: '${AppConfig.userPortalUrl}/drivers/earnings',
    );
  }
}
