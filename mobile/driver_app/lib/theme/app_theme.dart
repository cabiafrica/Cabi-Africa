import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Stitch Lustre Platinum Gold Dual-Theme (stitch_cabi_africa.zip)
  static const Color primaryColor = Color(0xFFD4AF37); // Classic Metallic Gold
  static const Color primaryDark = Color(0xFFB89028);  // Burnished Royal Gold
  static const Color primaryLight = Color(0xFFF2CA50); // Lustre Gold Highlight
  static const Color executiveGold = Color(0xFFD4AF37);
  static const Color lustreGold = Color(0xFFF2CA50);
  static const Color warmStone = Color(0xFFD0C5AF);

  static const Color secondaryAmber = Color(0xFFF2CA50);
  static const Color successGreen = Color(0xFF10B981);
  static const Color errorRed = Color(0xFFEF4444);
  static const Color telemetryCyan = Color(0xFF22D3EE);

  // Luxury Gold Gradients
  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFD4AF37), Color(0xFFF2CA50)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkGoldSurfaceGradient = LinearGradient(
    colors: [Color(0xFF201F1F), Color(0xFF131313)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Stitch Design System Tokens (Lustre Platinum Gold Dark Surfaces)
  static const Color obsidianCanvas = Color(0xFF131313);
  static const Color surfaceDim = Color(0xFF0E0E0E);
  static const Color surfaceBright = Color(0xFF2A2A2A);
  static const Color surfaceContainer = Color(0xFF1C1B1B);
  static const Color surfaceContainerHigh = Color(0xFF201F1F);
  static const Color surfaceContainerHighest = Color(0xFF2A2A2A);
  static const Color outlineBorder = Color(0x1AFFFFFF);
  static const Color outlineGold = Color(0x4DD4AF37); // rgba(212, 175, 55, 0.3)
  static const Color primaryContainer = Color(0x26D4AF37); // rgba(212, 175, 55, 0.15)
  static const Color electricBlue = Color(0xFF067FF9);
  static const Color electricBlueContainer = Color(0x26067FF9); // rgba(6, 127, 249, 0.15)
  static const Color accentYellow = Color(0xFFF2CA50);

  // Light Mode Colors (Porcelain Dual-Theme)
  static const Color lightBackground = Color(0xFFFCF9F8);
  static const Color lightSurface = Colors.white;
  static const Color lightTextPrimary = Color(0xFF1C1B1B);
  static const Color lightTextSecondary = Color(0xFF4D4635);
  static const Color lightDivider = Color(0xFFD0C5AF);

  // Dark Mode Colors (Lustre Platinum Gold Obsidian)
  static const Color darkBackground = Color(0xFF131313); // Deep Obsidian Canvas
  static const Color darkSurface = Color(0xFF1C1B1B); // Surface Container
  static const Color darkTextPrimary = Color(0xFFE5E2E1);
  static const Color darkTextSecondary = Color(0xFFD0C5AF);
  static const Color darkDivider = Color(0x1AFFFFFF);

  // Light Mode Colors (Daytime Porcelain / Stitch Dual-Theme)
  static const Color porcelainCanvas = Color(0xFFFCF9F8);
  static const Color porcelainSurface = Colors.white;
  static const Color porcelainSurfaceContainer = Color(0xFFF6F3F2);
  static const Color porcelainSurfaceHigh = Color(0xFFEBE7E7);
  static const Color porcelainOutline = Color(0xFFD0C5AF);
  static const Color porcelainTextPrimary = Color(0xFF1C1B1B);
  static const Color porcelainTextSecondary = Color(0xFF4D4635);
  static const Color aurumBronze = Color(0xFF735C00);
  static const Color royalBlue = Color(0xFF0260C4);

  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    fontFamily: GoogleFonts.outfit().fontFamily,
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
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.black,
        side: const BorderSide(color: primaryColor, width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
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
      headlineLarge: GoogleFonts.outfit(
          fontSize: 32, fontWeight: FontWeight.bold, color: lightTextPrimary),
      headlineMedium: GoogleFonts.outfit(
          fontSize: 24, fontWeight: FontWeight.bold, color: lightTextPrimary),
      headlineSmall: GoogleFonts.outfit(
          fontSize: 20, fontWeight: FontWeight.w600, color: lightTextPrimary),
      titleLarge: GoogleFonts.outfit(
          fontSize: 18, fontWeight: FontWeight.w600, color: lightTextPrimary),
      bodyLarge: GoogleFonts.outfit(fontSize: 16, color: lightTextPrimary),
      bodyMedium: GoogleFonts.outfit(fontSize: 14, color: lightTextSecondary),
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    fontFamily: GoogleFonts.outfit().fontFamily,
    colorScheme: const ColorScheme.dark(
      primary: primaryColor,
      secondary: secondaryAmber,
      surface: darkSurface,
      error: errorRed,
      onPrimary: Colors.black, // Gold needs dark text
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
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryColor,
        side: const BorderSide(color: primaryColor, width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFF1F1F1F), // Slightly lighter than black
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
      headlineLarge: GoogleFonts.outfit(
          fontSize: 32, fontWeight: FontWeight.bold, color: darkTextPrimary),
      headlineMedium: GoogleFonts.outfit(
          fontSize: 24, fontWeight: FontWeight.bold, color: darkTextPrimary),
      headlineSmall: GoogleFonts.outfit(
          fontSize: 20, fontWeight: FontWeight.w600, color: darkTextPrimary),
      titleLarge: GoogleFonts.outfit(
          fontSize: 18, fontWeight: FontWeight.w600, color: darkTextPrimary),
      bodyLarge: GoogleFonts.outfit(fontSize: 16, color: darkTextPrimary),
      bodyMedium: GoogleFonts.outfit(fontSize: 14, color: darkTextSecondary),
    ),
  );

  // Font Helpers for specific styles not covered by theme
  static TextStyle outfit({
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
  }) {
    return GoogleFonts.outfit(
      textStyle: textStyle,
      color: color,
      backgroundColor: backgroundColor,
      fontSize: fontSize,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      letterSpacing: letterSpacing,
      wordSpacing: wordSpacing,
      textBaseline: textBaseline,
      height: height,
      locale: locale,
      foreground: foreground,
      background: background,
      shadows: shadows,
      fontFeatures: fontFeatures,
      decoration: decoration,
      decorationColor: decorationColor,
      decorationStyle: decorationStyle,
      decorationThickness: decorationThickness,
    );
  }

  static TextStyle inter({
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
  }) {
    return GoogleFonts.inter(
      textStyle: textStyle,
      color: color,
      backgroundColor: backgroundColor,
      fontSize: fontSize,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      letterSpacing: letterSpacing,
      wordSpacing: wordSpacing,
      textBaseline: textBaseline,
      height: height,
      locale: locale,
      foreground: foreground,
      background: background,
      shadows: shadows,
      fontFeatures: fontFeatures,
      decoration: decoration,
      decorationColor: decorationColor,
      decorationStyle: decorationStyle,
      decorationThickness: decorationThickness,
    );
  }

  static TextStyle montserrat({
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
  }) {
    return GoogleFonts.montserrat(
      textStyle: textStyle,
      color: color,
      backgroundColor: backgroundColor,
      fontSize: fontSize,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      letterSpacing: letterSpacing,
      wordSpacing: wordSpacing,
      textBaseline: textBaseline,
      height: height,
      locale: locale,
      foreground: foreground,
      background: background,
      shadows: shadows,
      fontFeatures: fontFeatures,
      decoration: decoration,
      decorationColor: decorationColor,
      decorationStyle: decorationStyle,
      decorationThickness: decorationThickness,
    );
  }

  static TextStyle plusJakartaSans({
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
  }) {
    return GoogleFonts.plusJakartaSans(
      textStyle: textStyle,
      color: color,
      backgroundColor: backgroundColor,
      fontSize: fontSize,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      letterSpacing: letterSpacing,
      wordSpacing: wordSpacing,
      textBaseline: textBaseline,
      height: height,
      locale: locale,
      foreground: foreground,
      background: background,
      shadows: shadows,
      fontFeatures: fontFeatures,
      decoration: decoration,
      decorationColor: decorationColor,
      decorationStyle: decorationStyle,
      decorationThickness: decorationThickness,
    );
  }
}
