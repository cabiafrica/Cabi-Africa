class Passenger {
  final String id;
  final String name;
  final String email;
  final String phone;
  final double rating;

  Passenger({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.rating = 0.0,
  });

  factory Passenger.fromJson(Map<String, dynamic> json) {
    return Passenger(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'rating': rating,
    };
  }
}
