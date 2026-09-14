import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';
import 'package:driver_app/models/payout_dto.dart';

// In a real app, the Dio instance would be configured and provided globally.
final dioProvider = Provider((ref) {
  return Dio(BaseOptions(baseUrl: AppConfig.authApiUrl));
});

final payoutApiServiceProvider = Provider<PayoutApiService>((ref) {
  return PayoutApiService(ref.watch(dioProvider));
});

class PayoutApiService {
  final Dio _dio;

  PayoutApiService(this._dio);

  /// Fetches the driver's available earnings balance from the backend.
  Future<double> getAvailableEarnings(String driverId) async {
    try {
      final response = await _dio.get(
        '/earnings/balance',
        queryParameters: {'driverId': driverId},
      );
      final data = response.data;
      if (data != null && data['balance'] != null) {
        return (data['balance'] as num).toDouble();
      }
    } on DioException catch (e) {
      // Log but don't crash — return 0 so UI degrades gracefully
      if (e.response != null) {
        // ignore: avoid_print
        print(
            'getAvailableEarnings HTTP error: ${e.response?.statusCode} ${e.response?.data}');
      } else {
        // ignore: avoid_print
        print('getAvailableEarnings network error: ${e.message}');
      }
    }
    return 0.0;
  }

  /// Calls the backend to request a new payout.
  Future<PayoutDto> requestPayout(RequestPayoutDto request) async {
    final response = await _dio.post(
      '/payouts/request',
      data: request.toJson(),
    );
    return PayoutDto.fromJson(response.data);
  }
}
