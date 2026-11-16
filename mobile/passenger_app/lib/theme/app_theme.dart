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
    return GoogleFonts.inter(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
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
    return GoogleFonts.inter(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
  }

  static TextStyle plusJakartaSans({double? fontSize, FontWeight? fontWeight, Color? color, double? letterSpacing, FontStyle? fontStyle, double? height, TextDecoration? decoration, Color? decorationColor}) {
    if (!useGoogleFonts) {
      return TextStyle(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
    }
    return GoogleFonts.inter(fontSize: fontSize, fontWeight: fontWeight, color: color, letterSpacing: letterSpacing, fontStyle: fontStyle, height: height, decoration: decoration, decorationColor: decorationColor);
  }

  // Stitch Lustre Platinum Gold Dual-Theme (stitch_cabi_africa.zip)
  static const Color primaryColor = Color(0xFFD4AF37); // Metallic Aurum Gold
  static const Color primaryDark = Color(0xFFB89028);  // Burnished Gold
  static const Color primaryLight = Color(0xFFF2CA50); // Lustre Gold Highlight
  static const Color executiveGold = Color(0xFFD4AF37); // Executive Metallic Gold
  static const Color lustreGold = Color(0xFFF2CA50);
  static const Color warmStone = Color(0xFFD0C5AF);

  static const Color secondaryAmber = Color(0xFFF2CA50); // Lustre Gold Accent
  static const Color successGreen = Color(0xFF10B981);   // Verified Emerald
  static const Color errorRed = Color(0xFFEF4444);
  static const Color telemetryCyan = Color(0xFF22D3EE);
  static const Color telemetryIndigo = Color(0xFF6366F1);

  // Stitch Design System Tokens (Lustre Platinum Gold Dark Surfaces)
  static const Color obsidianCanvas = Color(0xFF131313); // #131313 obsidian canvas
  static const Color surfaceDim = Color(0xFF0E0E0E);
  static const Color surfaceBright = Color(0xFF2A2A2A);
  static const Color surfaceContainer = Color(0xFF1C1B1B); // #1C1B1B card surface
  static const Color surfaceContainerHigh = Color(0xFF201F1F);
  static const Color surfaceContainerHighest = Color(0xFF2A2A2A);
  static const Color surfaceContainerLow = Color(0xFF171616);
  static const Color surfaceContainerLowest = Color(0xFF0C0C0C);
  static const Color outlineBorder = Color(0x1AFFFFFF); // rgba(255, 255, 255, 0.10)
  static const Color outlineGold = Color(0x4DD4AF37);   // rgba(212, 175, 55, 0.30)
  static const Color primaryContainer = Color(0x26D4AF37); // rgba(212, 175, 55, 0.15)
  static const Color electricBlue = Color(0xFF067FF9);
  static const Color electricBlueContainer = Color(0x26067FF9); // rgba(6, 127, 249, 0.15)
  static const Color accentYellow = Color(0xFFF2CA50);

  // Lustre Platinum Gold Gradients
  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFD4AF37), Color(0xFFF2CA50)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Light Mode Colors (Daytime Porcelain / Lustre Platinum Dual-Theme)
  static const Color porcelainCanvas = Color(0xFFFCF9F8);
  static const Color porcelainSurface = Colors.white;
  static const Color porcelainSurfaceContainer = Color(0xFFF6F3F2);
  static const Color porcelainSurfaceHigh = Color(0xFFEBE7E7);
  static const Color porcelainOutline = Color(0x141C1B1B); // Subtle hairline matching Stitch Lustre Platinum
  static const Color porcelainTextPrimary = Color(0xFF1C1B1B);
  static const Color porcelainTextSecondary = Color(0xFF4D4635);
  static const Color aurumBronze = Color(0xFF735C00); // Rich Aurum for high-sun legibility
  static const Color royalBlue = Color(0xFF0260C4); // GPS route in light mode

  static const Color lightBackground = Color(0xFFFCF9F8);
  static const Color lightSurface = Colors.white;
  static const Color lightTextPrimary = Color(0xFF1C1B1B);
  static const Color lightTextSecondary = Color(0xFF4D4635);
  static const Color lightDivider = Color(0x0F1C1B1B); // Ultra-soft hairline divider

  // Dark Mode Colors (Lustre Platinum Gold Obsidian)
  static const Color darkBackground = Color(0xFF131313); // Deep Obsidian Canvas
  static const Color darkSurface = Color(0xFF1C1B1B); // Elevated Card Surface
  static const Color darkTextPrimary = Color(0xFFE5E2E1);
  static const Color darkTextSecondary = Color(0xFFD0C5AF);
  static const Color darkDivider = Color(0x1AFFFFFF);

  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    fontFamily: useGoogleFonts ? GoogleFonts.inter().fontFamily : null,
    colorScheme: const ColorScheme.light(
      primary: primaryColor,
      secondary: executiveGold,
      surface: lightSurface,
      error: errorRed,
      onPrimary: Colors.black,
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
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: porcelainOutline, width: 1),
      ),
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.black,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        textStyle: _getStyle(GoogleFonts.inter, fontWeight: FontWeight.w700, fontSize: 15),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: lightTextPrimary,
        side: const BorderSide(color: executiveGold, width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        textStyle: _getStyle(GoogleFonts.inter, fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: lightDivider),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: lightDivider),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    dividerTheme: const DividerThemeData(
      color: lightDivider,
      thickness: 1,
    ),
    textTheme: TextTheme(
      headlineLarge: _getStyle(GoogleFonts.inter,
          fontSize: 32, fontWeight: FontWeight.w800, color: lightTextPrimary),
      headlineMedium: _getStyle(GoogleFonts.inter,
          fontSize: 24, fontWeight: FontWeight.w700, color: lightTextPrimary),
      headlineSmall: _getStyle(GoogleFonts.inter,
          fontSize: 20, fontWeight: FontWeight.w600, color: lightTextPrimary),
      titleLarge: _getStyle(GoogleFonts.inter,
          fontSize: 18, fontWeight: FontWeight.w600, color: lightTextPrimary),
      bodyLarge: _getStyle(GoogleFonts.inter, fontSize: 16, color: lightTextPrimary),
      bodyMedium: _getStyle(GoogleFonts.inter, fontSize: 14, color: lightTextSecondary),
    ),
  );

  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    fontFamily: useGoogleFonts ? GoogleFonts.inter().fontFamily : null,
    colorScheme: const ColorScheme.dark(
      primary: primaryColor,
      secondary: executiveGold,
      surface: surfaceContainer,
      error: errorRed,
      onPrimary: Colors.black,
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
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: outlineGold, width: 1),
      ),
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.black,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        textStyle: _getStyle(GoogleFonts.inter, fontWeight: FontWeight.w700, fontSize: 15),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryColor,
        side: const BorderSide(color: executiveGold, width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        textStyle: _getStyle(GoogleFonts.inter, fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceContainerHigh,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: outlineBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: outlineBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
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
      headlineLarge: _getStyle(GoogleFonts.inter,
          fontSize: 32, fontWeight: FontWeight.w800, color: darkTextPrimary),
      headlineMedium: _getStyle(GoogleFonts.inter,
          fontSize: 24, fontWeight: FontWeight.w700, color: darkTextPrimary),
      headlineSmall: _getStyle(GoogleFonts.inter,
          fontSize: 20, fontWeight: FontWeight.w600, color: darkTextPrimary),
      titleLarge: _getStyle(GoogleFonts.inter,
          fontSize: 18, fontWeight: FontWeight.w600, color: darkTextPrimary),
      bodyLarge: _getStyle(GoogleFonts.inter, fontSize: 16, color: darkTextPrimary),
      bodyMedium: _getStyle(GoogleFonts.inter, fontSize: 14, color: darkTextSecondary),
    ),
  );
}
