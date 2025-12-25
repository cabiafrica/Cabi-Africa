class Trip {
  final String id;
  final String driverId;
  final String passengerId;
  final String pickupAddress;
  final String dropoffAddress;
  final double fare;
  final String status;
  final DateTime? createdAt;

  Trip({
    required this.id,
    required this.driverId,
    required this.passengerId,
    required this.pickupAddress,
    required this.dropoffAddress,
    required this.fare,
    required this.status,
    this.createdAt,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    return Trip(
      id: json['id'] as String,
      driverId: json['driverId'] as String,
      passengerId: json['passengerId'] as String,
      pickupAddress: json['pickupAddress'] as String,
      dropoffAddress: json['dropoffAddress'] as String,
      fare: (json['fare'] as num).toDouble(),
      status: json['status'] as String,
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'driverId': driverId,
      'passengerId': passengerId,
      'pickupAddress': pickupAddress,
      'dropoffAddress': dropoffAddress,
      'fare': fare,
      'status': status,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
