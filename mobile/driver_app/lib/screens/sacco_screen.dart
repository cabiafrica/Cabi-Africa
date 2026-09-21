import 'package:flutter/material.dart';
import '../widgets/secure_webview.dart';
import '../widgets/sos_button.dart';
import '../config/app_config.dart';

class SaccoScreen extends StatelessWidget {
  const SaccoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        SecureWebView(
          title: 'Driver Sacco',
          url: '${AppConfig.userPortalUrl}/drivers/sacco',
        ),
        Positioned(
          top: MediaQuery.of(context).padding.top + 70,
          right: 16,
          child: const SosButton(size: 46),
        ),
      ],
    );
  }
}
