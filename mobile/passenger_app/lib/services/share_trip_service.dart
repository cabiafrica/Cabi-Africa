import 'package:share_plus/share_plus.dart';

class ShareTripService {
  Future<void> shareTripDetails({
    required String driverName,
    required String licensePlate,
    required String passengerName,
    required String eta,
  }) async {
    final String message =
        'Track my ride with CABI!\n\n'
        'Driver: $driverName\n'
        'Vehicle: $licensePlate\n'
        'Passenger: $passengerName\n'
        'ETA: $eta\n\n'
        'Live Location: https://cabi.app/track/ride-123'; // Mock URL

    await Share.share(message, subject: 'CABI Trip Status: $driverName');
  }
}
