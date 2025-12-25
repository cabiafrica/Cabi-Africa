import 'package:flutter/material.dart';
import '../screens/document_upload_screen.dart';

// A placeholder home screen for demonstration purposes.
// In a real app, this would be part of the main driver dashboard.
class OnboardingHomeScreen extends StatelessWidget {
  const OnboardingHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Welcome, Driver!')),
      body: Center(
        child: ElevatedButton(
          child: const Text('Complete Your Profile: Upload Documents'),
          onPressed: () {
            Navigator.of(context).pushNamed(AppRouter.documentUploadRoute);
          },
        ),
      ),
    );
  }
}

class AppRouter {
  static const String homeRoute = '/';
  static const String documentUploadRoute = '/document-upload';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case homeRoute:
        return MaterialPageRoute(builder: (_) => const OnboardingHomeScreen());
      case documentUploadRoute:
        return MaterialPageRoute(builder: (_) => const DocumentUploadScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('No route defined for ${settings.name}')),
          ),
        );
    }
  }
}
