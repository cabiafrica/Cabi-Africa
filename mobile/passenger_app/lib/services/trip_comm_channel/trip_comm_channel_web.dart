// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'dart:convert';

typedef MessageCallback = void Function(Map<String, dynamic> data);

class TripCommChannel {
  final String tripId;
  html.BroadcastChannel? _bc;
  MessageCallback? onMessageReceived;

  TripCommChannel(this.tripId) {
    try {
      _bc = html.BroadcastChannel('cabi_trip_comm_$tripId');
      _bc?.onMessage.listen((event) {
        if (event.data != null) {
          try {
            final Map<String, dynamic> data = (event.data is Map)
                ? Map<String, dynamic>.from(event.data as Map)
                : jsonDecode(event.data.toString());
            onMessageReceived?.call(data);
          } catch (_) {}
        }
      });
    } catch (_) {}
  }

  void postMessage(Map<String, dynamic> message) {
    try {
      _bc?.postMessage(message);
    } catch (_) {}
  }

  void dispose() {
    try {
      _bc?.close();
    } catch (_) {}
  }
}
