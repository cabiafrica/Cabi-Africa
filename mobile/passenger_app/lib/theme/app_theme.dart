import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Optimizing GoogleFonts for Cabi apps
// This ensures that even if fetching fails, the app doesn't hang.

class AppTheme {
  static bool useGoogleFonts = !const bool.fromEnvironment('integration_test', defaultValue: false);

  static TextStyle _getStyle(TextStyle? Function({
    TextStyle? textStyle,
    Color? color,
    Color? backgroundColor,
    double? fontSize,
    FontWeight? fontWeight,
    FontStyle? fontStyle,
    double? letterSpacing,
    double? wordSpacing,
    TextBaseline? textBaseline,
    double? height,
    Locale? locale,
    Paint? foreground,
    Paint? background,
    List<Shadow>? shadows,
    List<FontFeature>? fontFeatures,
    TextDecoration? decoration,
    Color? decorationColor,
    TextDecorationStyle? decorationStyle,
    double? decorationThickness,
  }) fontFunc, {
    double? fontSize,
    FontWeight? fontWeight,
    Color? color,
  }) {
    if (!useGoogleFonts) {
      return TextStyle(fontSize: fontSize, fontWeight: fontWeight, color: color);
    }
    return fontFunc(fontSize: fontSize, fontWeight: fontWeight, color: color)!;
  }

  static TextStyle outfit({double? fontSize, FontWeight? fontWeight, Color? color, double? letterSpacing, FontStyle? fontStyle, double? height, TextDecoration? decoration, Color? decorationColor}) {
    if (!useGoogleFonts) {
      return TextStyle(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
    }
    return GoogleFonts.outfit(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
  }

  static TextStyle inter({double? fontSize, FontWeight? fontWeight, Color? color, double? letterSpacing, FontStyle? fontStyle, double? height, TextDecoration? decoration, Color? decorationColor}) {
    if (!useGoogleFonts) {
      return TextStyle(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
    }
    return GoogleFonts.inter(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
  }

  static TextStyle montserrat({double? fontSize, FontWeight? fontWeight, Color? color, double? letterSpacing, FontStyle? fontStyle, double? height, TextDecoration? decoration, Color? decorationColor}) {
    if (!useGoogleFonts) {
      return TextStyle(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
    }
    return GoogleFonts.montserrat(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
  }

  static TextStyle plusJakartaSans({double? fontSize, FontWeight? fontWeight, Color? color, double? letterSpacing, FontStyle? fontStyle, double? height, TextDecoration? decoration, Color? decorationColor}) {
    if (!useGoogleFonts) {
      return TextStyle(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
    }
    return GoogleFonts.plusJakartaSans(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
  }

  // Premium Color Palette - Luxury Metallic Gold
  static const Color primaryColor = Color(0xFFD4AF37); // Classic Metallic Gold
  static const Color primaryDark = Color(0xFFB89028);  // Burnished Royal Gold
  static const Color primaryLight = Color(0xFFF3E5AB); // Champagne Gold

  static const Color secondaryAmber = Color(0xFFC5A059); // Warm Satin Gold
  static const Color successGreen = Color(0xFF10B981);
  static const Color errorRed = Color(0xFFEF4444);

  // Stitch Design System Tokens (Project 5681992570744779348)
  static const Color obsidianCanvas = Color(0xFF121212);
  static const Color surfaceDim = Color(0xFF0A0A0A);
  static const Color surfaceBright = Color(0xFF1E1E1E);
  static const Color surfaceContainer = Color(0xFF1A1A1A);
  static const Color surfaceContainerHigh = Color(0xFF242424);
  static const Color surfaceContainerHighest = Color(0xFF2E2E2E);
  static const Color surfaceContainerLow = Color(0xFF1F1B13);
  static const Color surfaceContainerLowest = Color(0xFF110E07);
  static const Color outlineBorder = Color(0xFF27272A);
  static const Color outlineGold = Color(0x4DD4AF37); // rgba(212, 175, 55, 0.3)
  static const Color primaryContainer = Color(0x26D4AF37); // rgba(212, 175, 55, 0.15)
  static const Color electricBlue = Color(0xFF067FF9);
  static const Color electricBlueContainer = Color(0x26067FF9); // rgba(6, 127, 249, 0.15)
  static const Color accentYellow = Color(0xFFF9F906);

  // Luxury Gold Gradients
  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFF0D278), Color(0xFFD4AF37), Color(0xFFB89028)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Light Mode Colors (Daytime Porcelain / Stitch Dual-Theme)
  static const Color porcelainCanvas = Color(0xFFF8FAFC);
  static const Color porcelainSurface = Colors.white;
  static const Color porcelainSurfaceContainer = Color(0xFFF1F5F9);
  static const Color porcelainSurfaceHigh = Color(0xFFE2E8F0);
  static const Color porcelainOutline = Color(0xFFCBD5E1);
  static const Color porcelainTextPrimary = Color(0xFF0F172A); // Slate 900
  static const Color porcelainTextSecondary = Color(0xFF475569); // Slate 600
  static const Color aurumBronze = Color(0xFF8C6D1F); // Rich Aurum for high-sun legibility
  static const Color royalBlue = Color(0xFF0260C4); // GPS route in light mode

  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface = Colors.white;
  static const Color lightTextPrimary = Color(0xFF0F172A);
  static const Color lightTextSecondary = Color(0xFF475569);
  static const Color lightDivider = Color(0xFFCBD5E1);

  // Dark Mode Colors ("New Dawn" Luxury / Stitch Obsidian)
  static const Color darkBackground = Color(0xFF121212); // Deep Obsidian Canvas
  static const Color darkSurface = Color(0xFF1A1A1A); // Surface Container
  static const Color darkTextPrimary = Color(0xFFF9FAFB);
  static const Color darkTextSecondary = Color(0xFF9CA3AF);
  static const Color darkDivider = Color(0xFF27272A);

  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    fontFamily: useGoogleFonts ? GoogleFonts.outfit().fontFamily : null,
    colorScheme: const ColorScheme.light(
      primary: primaryColor,
      secondary: secondaryAmber,
      surface: lightSurface,
      error: errorRed,
      onPrimary: Colors.black, // Gold needs dark text
      onSecondary: Colors.black,
      onSurface: lightTextPrimary,
    ),
    scaffoldBackgroundColor: lightBackground,
    appBarTheme: const AppBarTheme(
      backgroundColor: lightSurface,
      foregroundColor: lightTextPrimary,
      elevation: 0,
      centerTitle: true,
      scrolledUnderElevation: 0,
      iconTheme: IconThemeData(color: lightTextPrimary),
    ),
    cardTheme: CardThemeData(
      color: lightSurface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFE5E7EB), width: 1),
      ),
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.black,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        textStyle: _getStyle(GoogleFonts.outfit, fontWeight: FontWeight.w600, fontSize: 16),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.black, // Dark text on Taxi Gold
        side: const BorderSide(color: primaryColor, width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        textStyle: _getStyle(GoogleFonts.outfit, fontWeight: FontWeight.w600, fontSize: 16),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: lightDivider),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: lightDivider),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    dividerTheme: const DividerThemeData(
      color: lightDivider,
      thickness: 1,
    ),
    textTheme: TextTheme(
      headlineLarge: _getStyle(GoogleFonts.outfit,
          fontSize: 32, fontWeight: FontWeight.bold, color: lightTextPrimary),
      headlineMedium: _getStyle(GoogleFonts.outfit,
          fontSize: 24, fontWeight: FontWeight.bold, color: lightTextPrimary),
      headlineSmall: _getStyle(GoogleFonts.outfit,
          fontSize: 20, fontWeight: FontWeight.w600, color: lightTextPrimary),
      titleLarge: _getStyle(GoogleFonts.outfit,
          fontSize: 18, fontWeight: FontWeight.w600, color: lightTextPrimary),
      bodyLarge: _getStyle(GoogleFonts.outfit, fontSize: 16, color: lightTextPrimary),
      bodyMedium: _getStyle(GoogleFonts.outfit, fontSize: 14, color: lightTextSecondary),
    ),
  );

  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    fontFamily: useGoogleFonts ? GoogleFonts.plusJakartaSans().fontFamily : null,
    colorScheme: const ColorScheme.dark(
      primary: primaryColor,
      secondary: secondaryAmber,
      surface: surfaceContainer,
      error: errorRed,
      onPrimary: Color(0xFF241A00), // Dark text on Gold
      onSecondary: Colors.black,
      onSurface: darkTextPrimary,
    ),
    scaffoldBackgroundColor: obsidianCanvas,
    appBarTheme: const AppBarTheme(
      backgroundColor: surfaceContainer,
      foregroundColor: darkTextPrimary,
      elevation: 0,
      centerTitle: true,
      scrolledUnderElevation: 0,
      iconTheme: IconThemeData(color: darkTextPrimary),
    ),
    cardTheme: CardThemeData(
      color: surfaceContainer,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: outlineGold, width: 1),
      ),
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: const Color(0xFF241A00),
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        textStyle: _getStyle(GoogleFonts.montserrat, fontWeight: FontWeight.w700, fontSize: 16),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryColor,
        side: const BorderSide(color: primaryColor, width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        textStyle: _getStyle(GoogleFonts.montserrat, fontWeight: FontWeight.w600, fontSize: 16),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceContainerHigh,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: outlineBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: outlineBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: primaryColor, width: 1.8),
      ),
      hintStyle: const TextStyle(color: darkTextSecondary),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    dividerTheme: const DividerThemeData(
      color: outlineBorder,
      thickness: 1,
    ),
    textTheme: TextTheme(
      headlineLarge: _getStyle(GoogleFonts.montserrat,
          fontSize: 32, fontWeight: FontWeight.w800, color: darkTextPrimary),
      headlineMedium: _getStyle(GoogleFonts.montserrat,
          fontSize: 24, fontWeight: FontWeight.w700, color: darkTextPrimary),
      headlineSmall: _getStyle(GoogleFonts.montserrat,
          fontSize: 20, fontWeight: FontWeight.w600, color: darkTextPrimary),
      titleLarge: _getStyle(GoogleFonts.plusJakartaSans,
          fontSize: 18, fontWeight: FontWeight.w600, color: darkTextPrimary),
      bodyLarge: _getStyle(GoogleFonts.plusJakartaSans, fontSize: 16, color: darkTextPrimary),
      bodyMedium: _getStyle(GoogleFonts.plusJakartaSans, fontSize: 14, color: darkTextSecondary),
    ),
  );
}
