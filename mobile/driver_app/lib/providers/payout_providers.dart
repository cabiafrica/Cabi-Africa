import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:driver_app/models/payout_dto.dart';
import '../services/payout_api_service.dart';

/// Provider to fetch the driver's available earnings.
final availableEarningsProvider = FutureProvider.autoDispose<double>((ref) {
  final payoutApiService = ref.watch(payoutApiServiceProvider);
  // Mocking driverId, in a real app this would come from the auth state.
  const mockDriverId = 'driver-123';
  return payoutApiService.getAvailableEarnings(mockDriverId);
});

/// Controller for handling the payout request logic.
final requestPayoutControllerProvider = StateNotifierProvider.autoDispose<
        RequestPayoutController, AsyncValue<void>>(
    (ref) => RequestPayoutController(ref.watch(payoutApiServiceProvider)));

class RequestPayoutController extends StateNotifier<AsyncValue<void>> {
  final PayoutApiService _payoutApiService;

  RequestPayoutController(this._payoutApiService)
      : super(const AsyncData(null));

  Future<void> submitRequest(RequestPayoutDto request) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => _payoutApiService.requestPayout(request),
    );
  }
}
