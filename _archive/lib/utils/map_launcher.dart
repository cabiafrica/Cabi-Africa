import 'package:url_launcher/url_launcher.dart';

// This enum should be shared across the app, but is redefined here for clarity.
enum NavigationApp { inApp, googleMaps, waze }

class MapLauncher {
  /// Launches the specified navigation app with the given coordinates.
  ///
  /// For this to work, the `url_launcher` package must be added to `pubspec.yaml`.
  /// Additionally, URL scheme configurations are needed in `Info.plist` (for iOS)
  /// and `AndroidManifest.xml` (for Android).
  static Future<void> launchCoordinates(
    double latitude,
    double longitude,
    NavigationApp app,
  ) async {
    Uri? uri;

    switch (app) {
      case NavigationApp.googleMaps:
        // Universal URL for Google Maps
        uri = Uri.parse(
          'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude',
        );
        break;
      case NavigationApp.waze:
        // Waze deep link URL
        uri = Uri.parse(
          'https://waze.com/ul?ll=$latitude,$longitude&navigate=yes',
        );
        break;
      case NavigationApp.inApp:
        // In a real app, this would trigger navigation to an in-app map screen.
        print('In-app navigation selected. (Not implemented in this story)');
        return;
    }

    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      throw 'Could not launch $uri';
    }
  }
}
