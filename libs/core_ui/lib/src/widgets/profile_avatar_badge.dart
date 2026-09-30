import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';

/// Luxury avatar widget that displays a profile photo or falls back to a high-contrast
/// prestige initials badge with Cabi gold accents.
class ProfileAvatarBadge extends StatelessWidget {
  final String? imageUrl;
  final File? imageFile;
  final String? name;
  final String? fallbackName;
  final double radius;
  final double? size;
  final Color? borderColor;
  final double borderWidth;
  final bool showBorder;

  const ProfileAvatarBadge({
    super.key,
    this.imageUrl,
    this.imageFile,
    this.name,
    this.fallbackName,
    this.radius = 28,
    this.size,
    this.borderColor,
    this.borderWidth = 1.5,
    this.showBorder = true,
  });

  double get effectiveRadius => (size != null && size! > 0) ? (size! / 2) : radius;

  String get effectiveName => (name != null && name!.trim().isNotEmpty)
      ? name!.trim()
      : ((fallbackName != null && fallbackName!.trim().isNotEmpty) ? fallbackName!.trim() : 'User');

  String get initials {
    final clean = effectiveName.trim();
    if (clean.isEmpty) return 'C';
    final parts = clean.split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.length == 1) {
      return parts[0][0].toUpperCase();
    }
    return '${parts[0][0]}${parts[parts.length - 1][0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    const goldColor = Color(0xFFD4AF37);
    final border = borderColor ?? goldColor;
    final r = effectiveRadius;

    Widget avatarContent;

    if (imageFile != null && imageFile!.existsSync()) {
      avatarContent = ClipOval(
        child: Image.file(
          imageFile!,
          width: r * 2,
          height: r * 2,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _buildInitialsFallback(goldColor, r),
        ),
      );
    } else if (imageUrl != null && imageUrl!.startsWith('data:')) {
      try {
        final bytes = base64Decode(imageUrl!.split(',').last);
        avatarContent = ClipOval(
          child: Image.memory(
            bytes,
            width: r * 2,
            height: r * 2,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _buildInitialsFallback(goldColor, r),
          ),
        );
      } catch (_) {
        avatarContent = _buildInitialsFallback(goldColor, r);
      }
    } else if (imageUrl != null &&
        imageUrl!.trim().isNotEmpty &&
        (imageUrl!.startsWith('http://') || imageUrl!.startsWith('https://'))) {
      avatarContent = ClipOval(
        child: Image.network(
          imageUrl!,
          width: r * 2,
          height: r * 2,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _buildInitialsFallback(goldColor, r),
        ),
      );
    } else {
      avatarContent = _buildInitialsFallback(goldColor, r);
    }

    if (!showBorder) return avatarContent;

    return Container(
      width: r * 2,
      height: r * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: border, width: borderWidth),
        boxShadow: [
          BoxShadow(
            color: border.withOpacity(0.2),
            blurRadius: 6,
            spreadRadius: 1,
          ),
        ],
      ),
      child: avatarContent,
    );
  }

  Widget _buildInitialsFallback(Color goldColor, double r) {
    return Container(
      width: r * 2,
      height: r * 2,
      alignment: Alignment.center,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF2A2A2A),
            Color(0xFF141414),
          ],
        ),
      ),
      child: Text(
        initials,
        style: TextStyle(
          color: goldColor,
          fontWeight: FontWeight.bold,
          fontSize: r * 0.72,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
