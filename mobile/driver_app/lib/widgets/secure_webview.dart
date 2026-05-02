import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:driver_app/theme/app_theme.dart';

class SecureWebView extends StatefulWidget {
  final String url;
  final String title;

  const SecureWebView({super.key, required this.url, required this.title});

  @override
  State<SecureWebView> createState() => _SecureWebViewState();
}

class _SecureWebViewState extends State<SecureWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;
  final _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  Future<void> _initWebView() async {
    // We add source=driver_app parameter so the web app knows it's embedded
    final uri = Uri.parse(widget.url);
    final finalUrl = uri.replace(queryParameters: {
      ...uri.queryParameters,
      'source': 'driver_app',
    }).toString();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(AppTheme.darkBackground)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            if (mounted) setState(() => _isLoading = true);
          },
          onPageFinished: (String url) async {
            // Inject JWT session into the web app's localStorage
            final token = await _storage.read(key: 'jwt_token');
            if (token != null) {
              await _controller.runJavaScript("localStorage.setItem('token', '$token');");
            }
            if (mounted) {
              setState(() => _isLoading = false);
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(finalUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: Text(
          widget.title,
          style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1A1A1A),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: AppTheme.primaryColor),
            ),
        ],
      ),
    );
  }
}
