typedef MessageCallback = void Function(Map<String, dynamic> data);

class TripCommChannel {
  final String tripId;
  MessageCallback? onMessageReceived;

  TripCommChannel(this.tripId);

  void postMessage(Map<String, dynamic> message) {}

  void dispose() {}
}
