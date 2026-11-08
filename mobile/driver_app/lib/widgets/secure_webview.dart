import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:url_launcher/url_launcher.dart';

class SecureWebView extends StatefulWidget {
  final String url;
  final String title;

  const SecureWebView({super.key, required this.url, required this.title});

  @override
  State<SecureWebView> createState() => _SecureWebViewState();
}

class _SecureWebViewState extends State<SecureWebView> {
  WebViewController? _controller;
  bool _isLoading = true;
  final _storage = const FlutterSecureStorage();

  bool _isTrustedOrigin(String rawUrl) {
    final parsed = Uri.tryParse(rawUrl);
    if (parsed == null) return false;
    final host = parsed.host.toLowerCase();
    if (host == 'cabi.africa' ||
        host.endsWith('.cabi.africa') ||
        host == 'cabi-africa.com' ||
        host.endsWith('.cabi-africa.com')) {
      return parsed.scheme == 'https';
    }
    if (kDebugMode &&
        (host == 'localhost' || host == '127.0.0.1' || host == '10.0.2.2')) {
      return true;
    }
    return false;
  }

  @override
  void initState() {
    super.initState();
    if (!kIsWeb) {
      _initWebView();
    } else {
      _isLoading = false;
    }
  }

  Future<void> _initWebView() async {
    try {
      final uri = Uri.parse(widget.url);
      final finalUrl = uri.replace(queryParameters: {
        ...uri.queryParameters,
        'source': 'driver_app',
      }).toString();

      final controller = WebViewController();
      controller
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(AppTheme.darkBackground)
        ..setNavigationDelegate(
          NavigationDelegate(
            onNavigationRequest: (NavigationRequest request) {
              if (_isTrustedOrigin(request.url)) {
                return NavigationDecision.navigate;
              }
              return NavigationDecision.prevent;
            },
            onPageStarted: (String url) {
              if (mounted) setState(() => _isLoading = true);
            },
            onPageFinished: (String url) async {
              if (_isTrustedOrigin(url)) {
                final token = await _storage.read(key: 'jwt_token');
                if (token != null) {
                  final safeTokenLiteral = jsonEncode(token);
                  await controller.runJavaScript("localStorage.setItem('token', $safeTokenLiteral);");
                }
              }
              if (mounted) {
                setState(() => _isLoading = false);
              }
            },
          ),
        )
        ..loadRequest(Uri.parse(finalUrl));

      if (mounted) {
        setState(() {
          _controller = controller;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
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
      body: kIsWeb
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.open_in_browser_rounded, size: 56, color: AppTheme.primaryColor),
                    const SizedBox(height: 16),
                    Text(
                      widget.title,
                      style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Web portal view for ${widget.title}',
                      style: GoogleFonts.outfit(color: Colors.white70, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.launch, size: 18),
                      label: const Text('Open in New Tab', style: TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: () => launchUrl(Uri.parse(widget.url), mode: LaunchMode.externalApplication),
                    ),
                  ],
                ),
              ),
            )
          : Stack(
              children: [
                if (_controller != null) WebViewWidget(controller: _controller!),
                if (_isLoading)
                  const Center(
                    child: CircularProgressIndicator(color: AppTheme.primaryColor),
                  ),
              ],
            ),
    );
  }
}
