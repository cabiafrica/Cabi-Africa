class RequestPayoutDto {
  final double amount;
  final String paymentMethod;
  // add other fields as needed based on usage or typescript definition

  RequestPayoutDto({required this.amount, required this.paymentMethod});

  Map<String, dynamic> toJson() {
    return {
      'amount': amount,
      'paymentMethod': paymentMethod,
    };
  }
}

class PayoutDto {
  final String id;
  final double amount;
  final String status;
  final DateTime date;

  PayoutDto({
    required this.id,
    required this.amount,
    required this.status,
    required this.date,
  });

  factory PayoutDto.fromJson(Map<String, dynamic> json) {
    return PayoutDto(
      id: json['id'] as String,
      amount: (json['amount'] as num).toDouble(),
      status: json['status'] as String,
      date: DateTime.parse(json['date'] as String),
    );
  }
}
