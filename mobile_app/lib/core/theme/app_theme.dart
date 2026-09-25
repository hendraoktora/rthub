import 'package:flutter/material.dart';

class AppTheme {
  // RT Hub / Porcelain Neighbourhood design tokens.
  static const Color primaryNavy = Color(0xFF0F172A);
  static const Color primaryBlue = Color(0xFF1E293B);
  static const Color electricBlue = Color(0xFF2563EB);
  static const Color skyAzure = Color(0xFF38BDF8);

  // Background & Surfaces
  static const Color background = Color(0xFFF8FAFC);
  static const Color surfaceWhite = Color(0xFFFFFFFF);
  static const Color slateBorder = Color(0xFFE2E8F0);
  static const Color slateLight = Color(0xFFF1F5F9);

  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF94A3B8);

  // Functional Colors
  static const Color successGreen = Color(0xFF10B981);
  static const Color alertRed = Color(0xFFEF4444);
  static const Color warningAmber = Color(0xFFF59E0B);
  static const Color purpleIndigo = Color(0xFF6366F1);
  static const Color blueMist = Color(0xFFEBF2FF);
  static const Color emeraldMist = Color(0xFFE8F7F0);
  static const Color warmPaper = Color(0xFFFFF7E8);
  static const double pagePadding = 22;
  static const double cardRadius = 26;

  static const List<BoxShadow> softShadow = [
    BoxShadow(color: Color(0x070F172A), blurRadius: 24, offset: Offset(0, 10)),
    BoxShadow(color: Color(0x0B0F172A), blurRadius: 2, offset: Offset(0, 2)),
  ];

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'PlusJakartaSans',
      scaffoldBackgroundColor: background,
      colorScheme: const ColorScheme.light(
        primary: electricBlue,
        secondary: successGreen,
        onPrimary: Colors.white,
        onSecondary: primaryNavy,
        onSurface: textPrimary,
        outline: slateBorder,
        surface: surfaceWhite,
        error: alertRed,
      ),
      textTheme:
          const TextTheme(
            headlineLarge: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w800,
              letterSpacing: -1.2,
              height: 1.15,
            ),
            headlineMedium: TextStyle(
              fontSize: 27,
              fontWeight: FontWeight.w800,
              letterSpacing: -.8,
              height: 1.2,
            ),
            titleLarge: TextStyle(
              fontSize: 21,
              fontWeight: FontWeight.w800,
              letterSpacing: -.55,
            ),
            titleMedium: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              letterSpacing: -.25,
            ),
            bodyLarge: TextStyle(fontSize: 15, height: 1.5),
            bodyMedium: TextStyle(fontSize: 14, height: 1.5),
            bodySmall: TextStyle(fontSize: 12, height: 1.45),
            labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
            labelMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
            labelSmall: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: .3,
            ),
          ).apply(
            fontFamily: 'PlusJakartaSans',
            bodyColor: textPrimary,
            displayColor: textPrimary,
          ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surfaceWhite,
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        centerTitle: false,
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: slateBorder,
        thickness: 1,
        space: 24,
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(
          minimumSize: const Size(48, 48),
          foregroundColor: primaryNavy,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: electricBlue,
          foregroundColor: Colors.white,
          minimumSize: const Size(48, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryNavy,
          minimumSize: const Size(48, 50),
          side: const BorderSide(color: slateBorder),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
        ),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surfaceWhite,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        clipBehavior: Clip.antiAlias,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: primaryNavy,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryNavy,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceWhite,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 16,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: slateBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: slateBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: electricBlue, width: 1.5),
        ),
        hintStyle: const TextStyle(color: textMuted, fontSize: 14),
      ),
    );
  }
}
