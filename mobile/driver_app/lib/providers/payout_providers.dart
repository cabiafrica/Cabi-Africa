import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/models/payout_dto.dart';
import '../services/payout_api_service.dart';

/// Provider to fetch the driver's available earnings.
final availableEarningsProvider = FutureProvider.autoDispose<double>((ref) {
  final payoutApiService = ref.watch(payoutApiServiceProvider);
  final auth = ref.watch(authProvider);
  final driverId = auth.userId ?? 'driver-default';
  return payoutApiService.getAvailableEarnings(driverId);
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
