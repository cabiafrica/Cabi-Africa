import '../config/app_config.dart';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class PassengerVerificationService {
  String get _verificationBaseUrl =>
      '${AppConfig.verificationApiUrl}/passenger';

  // Image compression quality (0-100) - lower = smaller size
  static const int imageQuality = 70;
  // Max image dimensions
  static const int maxImageWidth = 1024;
  static const int maxImageHeight = 1024;

  Future<PassengerVerificationStatus> getVerificationStatus(
      String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$_verificationBaseUrl/status/$userId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return PassengerVerificationStatus.fromJson(data);
      } else {
        throw Exception('Failed to get verification status');
      }
    } catch (e) {
      // Return default status if service is unavailable
      return PassengerVerificationStatus(
        userId: userId,
        isVerified: false,
        verificationLevel: VerificationLevel.none,
        remainingFreeTrips: 1,
        requiresVerification: false,
        requiredDocuments: [
          'National ID',
          'Passport Photo',
          'Selfie Verification'
        ],
      );
    }
  }

  Future<bool> canRequestTrip(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$_verificationBaseUrl/can-request/$userId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['canRequest'] ?? true;
      }
      return true; // Default to allowing if service unavailable
    } catch (e) {
      return true; // Default to allowing if service unavailable
    }
  }

  Future<VerificationResult> uploadIdDocument({
    required String userId,
    required String idNumber,
    required String fullName,
    required File idImage,
  }) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$_verificationBaseUrl/id'),
      );

      request.fields['userId'] = userId;
      request.fields['idNumber'] = idNumber;
      request.fields['fullName'] = fullName;
      request.files
          .add(await http.MultipartFile.fromPath('document', idImage.path));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return VerificationResult.fromJson(data);
      } else {
        throw Exception('Failed to upload ID document');
      }
    } catch (e) {
      return VerificationResult(
        success: false,
        message: 'Failed to upload: $e',
      );
    }
  }

  Future<VerificationResult> uploadPassengerPhoto({
    required String userId,
    required File photo,
  }) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$_verificationBaseUrl/photo'),
      );

      request.fields['userId'] = userId;
      request.files.add(await http.MultipartFile.fromPath('photo', photo.path));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return VerificationResult.fromJson(data);
      } else {
        throw Exception('Failed to upload photo');
      }
    } catch (e) {
      return VerificationResult(
        success: false,
        message: 'Failed to upload: $e',
      );
    }
  }

  Future<VerificationResult> uploadSelfie({
    required String userId,
    required String documentVerificationId,
    required File selfie,
  }) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$_verificationBaseUrl/selfie'),
      );

      request.fields['userId'] = userId;
      request.fields['documentVerificationId'] = documentVerificationId;
      request.files
          .add(await http.MultipartFile.fromPath('selfie', selfie.path));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return VerificationResult.fromJson(data);
      } else {
        throw Exception('Failed to upload selfie');
      }
    } catch (e) {
      return VerificationResult(
        success: false,
        message: 'Failed to upload: $e',
      );
    }
  }

  Future<VerificationResult> uploadCertificateOfGoodConduct({
    required String userId,
    required String certificateNumber,
    required String fullName,
    required File certificate,
  }) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$_verificationBaseUrl/certificate'),
      );

      request.fields['userId'] = userId;
      request.fields['certificateNumber'] = certificateNumber;
      request.fields['fullName'] = fullName;
      request.files
          .add(await http.MultipartFile.fromPath('document', certificate.path));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return VerificationResult.fromJson(data);
      } else {
        throw Exception('Failed to upload certificate');
      }
    } catch (e) {
      return VerificationResult(
        success: false,
        message: 'Failed to upload: $e',
      );
    }
  }

  Future<bool> verifyFingerprint({
    required String userId,
    required String fingerprintData,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_verificationBaseUrl/fingerprint'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'fingerprintData': fingerprintData,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['success'] ?? false;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

enum VerificationLevel {
  none,
  basic,
  selfie,
  biometric,
}

class PassengerVerificationStatus {
  final String userId;
  final bool isVerified;
  final VerificationLevel verificationLevel;
  final int remainingFreeTrips;
  final bool requiresVerification;
  final List<String> requiredDocuments;
  final String? message;

  PassengerVerificationStatus({
    required this.userId,
    required this.isVerified,
    required this.verificationLevel,
    required this.remainingFreeTrips,
    required this.requiresVerification,
    required this.requiredDocuments,
    this.message,
  });

  factory PassengerVerificationStatus.fromJson(Map<String, dynamic> json) {
    return PassengerVerificationStatus(
      userId: json['userId'] ?? '',
      isVerified: json['isVerified'] ?? false,
      verificationLevel: _parseLevel(json['verificationLevel']),
      remainingFreeTrips: json['remainingFreeTrips'] ?? 0,
      requiresVerification: json['requiresVerification'] ?? false,
      requiredDocuments: List<String>.from(json['requiredDocuments'] ?? []),
      message: json['message'],
    );
  }

  static VerificationLevel _parseLevel(String? level) {
    switch (level) {
      case 'BASIC':
        return VerificationLevel.basic;
      case 'SELFIE':
        return VerificationLevel.selfie;
      case 'BIOMETRIC':
        return VerificationLevel.biometric;
      default:
        return VerificationLevel.none;
    }
  }
}

class VerificationResult {
  final bool success;
  final String? verificationId;
  final String? status;
  final String message;
  final String? nextStep;
  final bool requiresSelfie;

  VerificationResult({
    required this.success,
    this.verificationId,
    this.status,
    required this.message,
    this.nextStep,
    this.requiresSelfie = false,
  });

  factory VerificationResult.fromJson(Map<String, dynamic> json) {
    return VerificationResult(
      success: json['success'] ?? false,
      verificationId: json['verificationId'],
      status: json['status'],
      message: json['message'] ?? '',
      nextStep: json['nextStep'],
      requiresSelfie: json['requiresSelfie'] ?? false,
    );
  }
}
