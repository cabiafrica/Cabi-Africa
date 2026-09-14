import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:passenger_app/theme/app_theme.dart';

ImageProvider getPassengerAvatarProvider(dynamic userOrUrl) {
  if (userOrUrl is Map) {
    final photo = userOrUrl['profilePicture'] ?? userOrUrl['passportPhotoUrl'] ?? userOrUrl['avatar'];
    if (photo != null && photo.toString().trim().isNotEmpty) {
      final str = photo.toString().trim();
      if (str.startsWith('http://') || str.startsWith('https://')) {
        return NetworkImage(str);
      } else if (str.startsWith('data:')) {
        try {
          return MemoryImage(base64Decode(str.split(',').last));
        } catch (_) {}
      } else if (str.startsWith('assets/')) {
        return AssetImage(str);
      }
    }
  } else if (userOrUrl is String && userOrUrl.trim().isNotEmpty) {
    final str = userOrUrl.trim();
    if (str.startsWith('http://') || str.startsWith('https://')) {
      return NetworkImage(str);
    } else if (str.startsWith('data:')) {
      try {
        return MemoryImage(base64Decode(str.split(',').last));
      } catch (_) {}
    } else if (str.startsWith('assets/')) {
      return AssetImage(str);
    }
  }
  return const NetworkImage(
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  );
}

class ProfileAvatarWithQr extends StatelessWidget {
  final dynamic user;
  final String imageUrl;
  final bool isNetworkImage;
  final double radius;
  final String qrData;
  final bool showQrIcon;

  const ProfileAvatarWithQr({
    super.key,
    this.user,
    this.imageUrl = '',
    this.isNetworkImage = false,
    this.radius = 20,
    required this.qrData,
    this.showQrIcon = true,
  });

  void _showQrDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: AppTheme.darkSurface,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: BorderSide(color: AppTheme.primaryColor.withValues(alpha: 0.1))),
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'PRESTIGE IDENTITY',
                style: AppTheme.outfit(
                  color: AppTheme.primaryColor,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'MY QR CODE',
                style: AppTheme.inter(
                  color: Colors.white38,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: QrImageView(
                  data: qrData,
                  version: QrVersions.auto,
                  size: 200,
                  eyeStyle: const QrEyeStyle(
                    eyeShape: QrEyeShape.square,
                    color: Colors.black,
                  ),
                  dataModuleStyle: const QrDataModuleStyle(
                    dataModuleShape: QrDataModuleShape.square,
                    color: Colors.black,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                qrData,
                style: AppTheme.inter(
                  color: Colors.white24,
                  fontSize: 11,
                  letterSpacing: 1,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.verified_user,
                        color: AppTheme.primaryColor, size: 14),
                    const SizedBox(width: 8),
                    Text(
                      'SECURE VERIFICATION',
                      style: AppTheme.inter(
                        color: AppTheme.primaryColor,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  ImageProvider _resolveAvatar() {
    if (user != null) {
      return getPassengerAvatarProvider(user);
    }
    if (imageUrl.isNotEmpty) {
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return NetworkImage(imageUrl);
      }
      return AssetImage(imageUrl);
    }
    return getPassengerAvatarProvider(null);
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          padding: const EdgeInsets.all(2.5),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: AppTheme.primaryColor, width: 2),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.35),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: CircleAvatar(
            radius: radius,
            backgroundColor: const Color(0xFF1E1E1E),
            backgroundImage: _resolveAvatar(),
          ),
        ),
        if (showQrIcon)
          Positioned(
            bottom: 0,
            right: 0,
            child: GestureDetector(
              onTap: () => _showQrDialog(context),
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.black, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.4),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    )
                  ],
                ),
                child: const Icon(
                  Icons.qr_code_rounded,
                  size: 14,
                  color: Colors.black,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

