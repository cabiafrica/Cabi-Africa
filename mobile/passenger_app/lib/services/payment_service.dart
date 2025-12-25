class PaymentService {
  Future<void> payWithMpesa(String tripId, double amount) async {
    // Simulate API call
    await Future.delayed(const Duration(seconds: 2));
    // Implementation would go here
  }

  Future<void> verifyPayment(String paymentId) async {
    await Future.delayed(const Duration(seconds: 1));
  }
}
