import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

class ProfileAvatarWithQr extends StatelessWidget {
  final String imageUrl;
  final bool isNetworkImage;
  final double radius;
  final String qrData;
  final bool showQrIcon;

  const ProfileAvatarWithQr({
    super.key,
    required this.imageUrl,
    this.isNetworkImage = false,
    this.radius = 20,
    required this.qrData,
    this.showQrIcon = true,
  });

  void _showQrDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'My QR Code',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                height: 250,
                width: 250,
                child: QrImageView(
                  data: qrData,
                  version: QrVersions.auto,
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
              const SizedBox(height: 24),
              Text(
                qrData,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                'Scan to verify identity',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        CircleAvatar(
          radius: radius,
          backgroundColor: Colors.grey[200],
          backgroundImage: isNetworkImage
              ? NetworkImage(imageUrl)
              : AssetImage(imageUrl) as ImageProvider,
          child: (imageUrl.isEmpty)
              ? Icon(Icons.person, size: radius, color: Colors.grey)
              : null,
        ),
        if (showQrIcon)
          Positioned(
            bottom: 0,
            left: 0,
            child: GestureDetector(
              onTap: () => _showQrDialog(context),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 4,
                    )
                  ],
                ),
                child: const Icon(
                  Icons.qr_code,
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
