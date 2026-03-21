import 'package:flutter/material.dart';
import '../widgets/secure_webview.dart';
import '../config/app_config.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SecureWebView(
      title: 'Earnings & Wallet',
      url: '${AppConfig.userPortalUrl}/drivers/wallet',
    );
  }
}
