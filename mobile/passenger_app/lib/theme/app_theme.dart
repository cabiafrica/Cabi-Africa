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

  static TextStyle outfit({double? fontSize, FontWeight? fontWeight, Color? color, double? letterSpacing, FontStyle? fontStyle, double? height}) {
    if (!useGoogleFonts) {
      return TextStyle(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height);
    }
    return GoogleFonts.outfit(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height);
  }

  static TextStyle inter({double? fontSize, FontWeight? fontWeight, Color? color, double? letterSpacing, FontStyle? fontStyle, double? height}) {
    if (!useGoogleFonts) {
      return TextStyle(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height);
    }
    return GoogleFonts.inter(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height);
  }

  // Premium Color Palette - Luxury Metallic Gold
  static const Color primaryColor = Color(0xFFD4AF37); // Classic Metallic Gold
  static const Color primaryDark = Color(0xFFB89028);  // Burnished Royal Gold
  static const Color primaryLight = Color(0xFFF3E5AB); // Champagne Gold

  static const Color secondaryAmber = Color(0xFFC5A059); // Warm Satin Gold
  static const Color successGreen = Color(0xFF10B981);
  static const Color errorRed = Color(0xFFEF4444);

  // Luxury Gold Gradients
  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFF0D278), Color(0xFFD4AF37), Color(0xFFB89028)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Light Mode Colors
  static const Color lightBackground = Color(0xFFF3F4F6);
  static const Color lightSurface = Colors.white;
  static const Color lightTextPrimary = Color(0xFF111827);
  static const Color lightTextSecondary = Color(0xFF6B7280);
  static const Color lightDivider = Color(0xFFE5E7EB);

  // Dark Mode Colors ("New Dawn" Luxury)
  static const Color darkBackground = Color(0xFF0A0A0A); // Deep Prestige Black
  static const Color darkSurface = Color(0xFF141414); // Elevated Black Surface
  static const Color darkTextPrimary = Color(0xFFF9FAFB);
  static const Color darkTextSecondary = Color(0xFF9CA3AF);
  static const Color darkDivider = Color(0xFF1F1F1F);

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
    fontFamily: useGoogleFonts ? GoogleFonts.outfit().fontFamily : null,
    colorScheme: const ColorScheme.dark(
      primary: primaryColor,
      secondary: secondaryAmber,
      surface: darkSurface,
      error: errorRed,
      onPrimary: Colors.white,
      onSecondary: Colors.black,
      onSurface: darkTextPrimary,
    ),
    scaffoldBackgroundColor: darkBackground,
    appBarTheme: const AppBarTheme(
      backgroundColor: darkSurface,
      foregroundColor: darkTextPrimary,
      elevation: 0,
      centerTitle: true,
      scrolledUnderElevation: 0,
      iconTheme: IconThemeData(color: darkTextPrimary),
    ),
    cardTheme: CardThemeData(
      color: darkSurface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: darkDivider, width: 1),
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
        foregroundColor: Colors.white,
        side: const BorderSide(color: Colors.white, width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        textStyle: _getStyle(GoogleFonts.outfit, fontWeight: FontWeight.w600, fontSize: 16),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFF273546), // Slightly lighter than surface
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: darkDivider),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: darkDivider),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      hintStyle: const TextStyle(color: darkTextSecondary),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    dividerTheme: const DividerThemeData(
      color: darkDivider,
      thickness: 1,
    ),
    textTheme: TextTheme(
      headlineLarge: _getStyle(GoogleFonts.outfit,
          fontSize: 32, fontWeight: FontWeight.bold, color: darkTextPrimary),
      headlineMedium: _getStyle(GoogleFonts.outfit,
          fontSize: 24, fontWeight: FontWeight.bold, color: darkTextPrimary),
      headlineSmall: _getStyle(GoogleFonts.outfit,
          fontSize: 20, fontWeight: FontWeight.w600, color: darkTextPrimary),
      titleLarge: _getStyle(GoogleFonts.outfit,
          fontSize: 18, fontWeight: FontWeight.w600, color: darkTextPrimary),
      bodyLarge: _getStyle(GoogleFonts.outfit, fontSize: 16, color: darkTextPrimary),
      bodyMedium: _getStyle(GoogleFonts.outfit, fontSize: 14, color: darkTextSecondary),
    ),
  );
}
