class Driver {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String? vehicleType;
  final String? licensePlate;
  final double rating;
  final bool isOnline;

  Driver({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.vehicleType,
    this.licensePlate,
    this.rating = 0.0,
    this.isOnline = false,
  });

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      vehicleType: json['vehicleType'] as String?,
      licensePlate: json['licensePlate'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      isOnline: json['isOnline'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'vehicleType': vehicleType,
      'licensePlate': licensePlate,
      'rating': rating,
      'isOnline': isOnline,
    };
  }
}
