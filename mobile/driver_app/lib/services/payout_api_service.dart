import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';
import 'package:driver_app/models/payout_dto.dart';

// In a real app, the Dio instance would be configured and provided globally.
final dioProvider = Provider((ref) {
  final baseUrl = AppConfig.authApiUrl;
  return Dio(BaseOptions(baseUrl: baseUrl));
});

final payoutApiServiceProvider = Provider<PayoutApiService>((ref) {
  return PayoutApiService(ref.watch(dioProvider));
});

class PayoutApiService {
  final Dio _dio;

  PayoutApiService(this._dio);

  /// Mocks fetching the driver's available earnings.
  Future<double> getAvailableEarnings(String driverId) async {
    // In a real app, this would call an endpoint like `GET /earnings/balance`.
    // For now, we return a mock value.
    await Future.delayed(const Duration(milliseconds: 500));
    return 250.00;
  }

  /// Calls the backend to request a new payout.
  Future<PayoutDto> requestPayout(RequestPayoutDto request) async {
    final response = await _dio.post(
      '/payouts/request',
      data: request.toJson(), // Assuming DTOs have toJson methods
    );
    return PayoutDto.fromJson(response.data);
  }
}
