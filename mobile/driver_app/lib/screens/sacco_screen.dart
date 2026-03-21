import 'package:flutter/material.dart';
import '../widgets/secure_webview.dart';
import '../config/app_config.dart';

class SaccoScreen extends StatelessWidget {
  const SaccoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SecureWebView(
      title: 'Driver Sacco',
      url: '${AppConfig.userPortalUrl}/drivers/sacco',
    );
  }
}
