import 'dart:io';

/// Konfigurasi Google AdMob untuk RtHub Mobile App
/// 
/// PANDUAN AKTIVASI ADMOB REAL (PRODUCTION):
/// 1. Buka Google AdMob Console (https://admob.google.com).
/// 2. Buat Aplikasi baru untuk Android & iOS.
/// 3. Salin "App ID" dan masukkan ke `AndroidManifest.xml` pada tag:
///    <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="..." />
/// 4. Buat Ad Unit jenis "Banner" (Ukuran Standard 320x50 atau Adaptive Banner).
/// 5. Ubah [isRealAdMob] di bawah menjadi `true`.
/// 6. Ganti [realBannerIdAndroid] & [realBannerIdIos] dengan Unit ID dari AdMob Console.
class AdMobConfig {
  /// Ubah menjadi `true` jika ingin menampilkan Iklan AdMob Asli / Real.
  /// CATATAN PENTING: Saat pengujian atau development di emulator/device pribadi,
  /// gunakan `false` agar akun AdMob tidak dibekukan/terkena penalti klik sendiri oleh Google.
  static const bool isRealAdMob = false;

  // ================= ADMOB APP ID =================
  // Contoh format App ID: ca-app-pub-3940256099942544~3347511713
  static const String testAppIdAndroid = 'ca-app-pub-3940256099942544~3347511713';
  static const String realAppIdAndroid = 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY'; // Masukkan App ID Real di sini

  // ================= ADMOB BANNER UNIT ID =================
  // Sample Official Google Test Banner Ad Unit ID
  static const String testBannerIdAndroid = 'ca-app-pub-3940256099942544/6300978111';
  static const String testBannerIdIos = 'ca-app-pub-3940256099942544/2934735716';

  // Masukkan Unit ID Banner Asli dari dashboard AdMob Anda di sini
  static const String realBannerIdAndroid = 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ';
  static const String realBannerIdIos = 'ca-app-pub-XXXXXXXXXXXXXXXX/WWWWWWWWWW';

  /// Mendapatkan Banner Ad Unit ID aktif sesuai platform & mode (Real vs Test)
  static String get bannerAdUnitId {
    if (Platform.isAndroid) {
      return isRealAdMob ? realBannerIdAndroid : testBannerIdAndroid;
    } else if (Platform.isIOS) {
      return isRealAdMob ? realBannerIdIos : testBannerIdIos;
    }
    return testBannerIdAndroid;
  }
}
