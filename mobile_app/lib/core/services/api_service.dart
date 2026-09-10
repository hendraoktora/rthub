import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String defaultUrl = 'https://rthub.hendraoktora.com/api';

  static const List<String> candidateUrls = [
    'https://rthub.hendraoktora.com/api',
    'https://rthub.vercel.app/api',
    'http://192.168.100.49:3000/api',
    'http://10.0.2.2:3000/api',
    'http://127.0.0.1:3000/api',
    'http://localhost:3000/api',
  ];

  static Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('server_base_url');
    if (saved == null ||
        saved.contains('localhost') ||
        saved.contains('10.0.2.2') ||
        saved.contains('192.168.') ||
        saved.contains('127.0.0.1')) {
      return defaultUrl;
    }
    return saved;
  }

  static Future<void> setBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('server_base_url', url.trim());
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', token);
  }

  static Future<void> saveUserData(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_data', jsonEncode(user));
  }

  static Future<Map<String, dynamic>?> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('user_data');
    if (raw == null) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  static Future<Map<String, dynamic>?> getCurrentUser() async => getUserData();

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('user_data');
  }

  /// Send request directly with automatic recovery to production domain
  static Future<http.Response> _postWithFallback(String path, Map<String, dynamic> body) async {
    final configuredUrl = await getBaseUrl();
    try {
      final res = await http.post(
        Uri.parse('$configuredUrl$path'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 15));
      return res;
    } catch (e) {
      if (configuredUrl != defaultUrl) {
        try {
          final res = await http.post(
            Uri.parse('$defaultUrl$path'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          ).timeout(const Duration(seconds: 15));
          await setBaseUrl(defaultUrl);
          return res;
        } catch (_) {}
      }
      throw Exception('Gagal menghubungi server backend: $e');
    }
  }

  static Future<http.Response> _getWithFallback(String path, {String? token}) async {
    final configuredUrl = await getBaseUrl();
    try {
      final res = await http.get(
        Uri.parse('$configuredUrl$path'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));
      return res;
    } catch (e) {
      if (configuredUrl != defaultUrl) {
        try {
          final res = await http.get(
            Uri.parse('$defaultUrl$path'),
            headers: {
              'Content-Type': 'application/json',
              if (token != null) 'Authorization': 'Bearer $token',
            },
          ).timeout(const Duration(seconds: 15));
          await setBaseUrl(defaultUrl);
          return res;
        } catch (_) {}
      }
      throw Exception('Gagal memuat data dari server backend: $e');
    }
  }

  /// Real Live Database Login
  static Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await _postWithFallback(
      '/auth/login',
      {'username': username.trim(), 'password': password.trim()},
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 || response.statusCode == 201) {
      if (data['accessToken'] != null) {
        await saveToken(data['accessToken']);
      }
      if (data['user'] != null) {
        await saveUserData(data['user']);
      }
      return data;
    } else {
      // Server returned an error (e.g. 401 Unauthorized, 400 Bad Request)
      final errorMsg = data['message'] ?? 'Nomor WhatsApp atau kata sandi salah.';
      throw Exception(errorMsg is List ? errorMsg.join(', ') : errorMsg.toString());
    }
  }

  static Future<Map<String, dynamic>> registerRT(Map<String, dynamic> data) async {
    final response = await _postWithFallback('/auth/register-rt', data);
    final body = jsonDecode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body;
    } else {
      final msg = body['message'] ?? 'Pendaftaran RT gagal';
      throw Exception(msg is List ? msg.join(', ') : msg.toString());
    }
  }

  static Future<Map<String, dynamic>> registerWarga(Map<String, dynamic> data) async {
    final response = await _postWithFallback('/auth/register-warga', data);
    final body = jsonDecode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body;
    } else {
      final msg = body['message'] ?? 'Pendaftaran Warga gagal';
      throw Exception(msg is List ? msg.join(', ') : msg.toString());
    }
  }

  static Future<Map<String, dynamic>> sendOtp(String target, {String channel = 'WHATSAPP', String purpose = 'REGISTRASI'}) async {
    final response = await _postWithFallback('/auth/send-otp', {
      'target': target.trim(),
      'channel': channel,
      'purpose': purpose,
    });
    final body = jsonDecode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body;
    } else {
      final msg = body['message'] ?? 'Gagal mengirim kode OTP';
      throw Exception(msg is List ? msg.join(', ') : msg.toString());
    }
  }

  static Future<Map<String, dynamic>> verifyOtp(String target, String code) async {
    final response = await _postWithFallback('/auth/verify-otp', {
      'target': target.trim(),
      'code': code.trim(),
    });
    final body = jsonDecode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body;
    } else {
      final msg = body['message'] ?? 'Kode OTP salah atau kedaluwarsa';
      throw Exception(msg is List ? msg.join(', ') : msg.toString());
    }
  }

  static Future<Map<String, dynamic>> verifyDocument(Map<String, dynamic> data) async {
    final response = await _postWithFallback('/auth/verify-document', data);
    final body = jsonDecode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return body;
    } else {
      final msg = body['message'] ?? 'Verifikasi dokumen gagal';
      throw Exception(msg is List ? msg.join(', ') : msg.toString());
    }
  }

  static Future<List<dynamic>> getPublicRtList() async {
    try {
      final response = await _getWithFallback('/auth/list-rt');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return [];
  }

  static Future<Map<String, dynamic>> getKasSummary() async {
    try {
      final token = await getToken();
      final response = await _getWithFallback('/kas/summary', token: token);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}

    return {
      'saldoKas': 0,
      'totalPemasukan': 0,
      'totalPengeluaran': 0,
      'recentTransactions': [],
    };
  }

  static Future<Map<String, dynamic>> createMutasiKas(Map<String, dynamic> data) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.post(
      Uri.parse('$configuredUrl/kas'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    ).timeout(const Duration(seconds: 5));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    throw Exception('Gagal mencatat mutasi kas ke database');
  }

  static Future<List<dynamic>> getTagihanSaya() async {
    try {
      final token = await getToken();
      final response = await _getWithFallback('/tagihan/saya', token: token);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}

    return [];
  }

  // Real Database Agenda API
  static Future<List<dynamic>> getAgendaList() async {
    try {
      final token = await getToken();
      final response = await _getWithFallback('/agenda', token: token);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return [];
  }

  static Future<Map<String, dynamic>> createAgenda(Map<String, dynamic> data) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.post(
      Uri.parse('$configuredUrl/agenda'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    ).timeout(const Duration(seconds: 5));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Gagal membuat agenda kegiatan');
  }

  static Future<void> deleteAgenda(String id) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.delete(
      Uri.parse('$configuredUrl/agenda/$id'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    ).timeout(const Duration(seconds: 5));

    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception('Gagal menghapus agenda');
    }
  }

  // Real Database Berita / Pengumuman API
  static Future<List<dynamic>> getBeritaFeed() async {
    try {
      final token = await getToken();
      final response = await _getWithFallback('/berita/feed', token: token);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return [];
  }

  static Future<Map<String, dynamic>> createBerita(Map<String, dynamic> data) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.post(
      Uri.parse('$configuredUrl/berita'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    ).timeout(const Duration(seconds: 5));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Gagal mempublikasikan pengumuman');
  }

  static Future<void> deleteBerita(String id) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.delete(
      Uri.parse('$configuredUrl/berita/$id'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    ).timeout(const Duration(seconds: 5));

    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception('Gagal menghapus pengumuman');
    }
  }

  // Real Database Lapak UMKM API
  static Future<List<dynamic>> getLapakList() async {
    try {
      final token = await getToken();
      final response = await _getWithFallback('/lapak', token: token);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return [];
  }

  static Future<Map<String, dynamic>> createLapak(Map<String, dynamic> data) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.post(
      Uri.parse('$configuredUrl/lapak'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    ).timeout(const Duration(seconds: 5));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Gagal memasang produk lapak');
  }

  static Future<void> deleteLapak(String id) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.delete(
      Uri.parse('$configuredUrl/lapak/$id'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    ).timeout(const Duration(seconds: 5));

    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception('Gagal menghapus produk lapak');
    }
  }

  // Real Database Laporan / Keluhan RT API
  static Future<List<dynamic>> getLaporanList() async {
    try {
      final token = await getToken();
      final response = await _getWithFallback('/laporan', token: token);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return [];
  }

  static Future<Map<String, dynamic>> createLaporan(Map<String, dynamic> data) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.post(
      Uri.parse('$configuredUrl/laporan'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    ).timeout(const Duration(seconds: 5));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Gagal mengirim laporan keluhan');
  }

  // Real Database Payment Tagihan IPL
  static Future<Map<String, dynamic>> payTagihan(String tagihanId, String paymentMethod) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.post(
      Uri.parse('$configuredUrl/tagihan/$tagihanId/bayar'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'paymentMethod': paymentMethod}),
    ).timeout(const Duration(seconds: 6));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Pembayaran tagihan gagal');
  }

  // Real Database Pengurus & Wilayah API
  static Future<List<dynamic>> getPengurusList({String? rtId}) async {
    try {
      final token = await getToken();
      String? targetRtId = rtId;
      if (targetRtId == null || targetRtId.isEmpty) {
        final user = await getCurrentUser();
        targetRtId = user?['rtId'] ?? 'rt-sukamaju-03';
      }
      final response = await _getWithFallback('/wilayah/rt/$targetRtId/pengurus', token: token);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return [];
  }

  static Future<Map<String, dynamic>> addOrUpdatePengurus(Map<String, dynamic> data, {String? rtId}) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    String? targetRtId = rtId;
    if (targetRtId == null || targetRtId.isEmpty) {
      final user = await getCurrentUser();
      targetRtId = user?['rtId'] ?? 'rt-sukamaju-03';
    }

    final res = await http.post(
      Uri.parse('$configuredUrl/wilayah/rt/$targetRtId/pengurus'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    ).timeout(const Duration(seconds: 6));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Gagal menyimpan pengurus');
  }

  static Future<void> deletePengurus(String userId, {String? rtId}) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    String? targetRtId = rtId;
    if (targetRtId == null || targetRtId.isEmpty) {
      final user = await getCurrentUser();
      targetRtId = user?['rtId'] ?? 'rt-sukamaju-03';
    }

    final res = await http.delete(
      Uri.parse('$configuredUrl/wilayah/rt/$targetRtId/pengurus/$userId'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    ).timeout(const Duration(seconds: 6));

    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception('Gagal menghapus pengurus');
    }
  }

  // Real Database Warga API
  static Future<Map<String, dynamic>> getWargaList({String? rtId}) async {
    try {
      final token = await getToken();
      String? targetRtId = rtId;
      if (targetRtId == null || targetRtId.isEmpty) {
        final user = await getCurrentUser();
        targetRtId = user?['rtId'] ?? 'rt-sukamaju-03';
      }
      final response = await _getWithFallback('/wilayah/rt/$targetRtId/warga', token: token);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return {
      'totalRumah': 0,
      'totalWarga': 0,
      'rumahList': [],
      'userList': [],
    };
  }

  static Future<Map<String, dynamic>> addWarga(Map<String, dynamic> data, {String? rtId}) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    String? targetRtId = rtId;
    if (targetRtId == null || targetRtId.isEmpty) {
      final user = await getCurrentUser();
      targetRtId = user?['rtId'] ?? 'rt-sukamaju-03';
    }

    final res = await http.post(
      Uri.parse('$configuredUrl/wilayah/rt/$targetRtId/warga'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    ).timeout(const Duration(seconds: 6));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Gagal menambahkan warga baru');
  }

  // Real Database Update Profile & Foto Profil
  static Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.post(
      Uri.parse('$configuredUrl/auth/profile'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    ).timeout(const Duration(seconds: 6));

    if (res.statusCode == 200 || res.statusCode == 201) {
      final body = jsonDecode(res.body);
      if (body['user'] != null) {
        await saveUserData(body['user']);
      }
      return body;
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Gagal menyimpan perubahan profil');
  }

  // Real Database Panic Alert Trigger
  static Future<Map<String, dynamic>> triggerPanicAlert({
    double? latitude,
    double? longitude,
    String? catatan,
  }) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final payload = <String, dynamic>{};
    if (latitude != null) payload['latitude'] = latitude;
    if (longitude != null) payload['longitude'] = longitude;
    if (catatan != null) payload['catatan'] = catatan;

    final res = await http.post(
      Uri.parse('$configuredUrl/alert/panic'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(payload),
    ).timeout(const Duration(seconds: 5));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Gagal mengaktifkan tombol panik darurat');
  }

  // Real Database Master Tagihan & Iuran Bulanan
  static Future<List<dynamic>> getMasterTagihan() async {
    try {
      final token = await getToken();
      final response = await _getWithFallback('/tagihan/master', token: token);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return [];
  }

  static Future<Map<String, dynamic>> setMasterTagihan(Map<String, dynamic> data) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.post(
      Uri.parse('$configuredUrl/tagihan/master'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    ).timeout(const Duration(seconds: 6));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Gagal menyimpan tarif iuran bulanan');
  }

  static Future<Map<String, dynamic>> generateTagihanBulanan(Map<String, dynamic> data) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.post(
      Uri.parse('$configuredUrl/tagihan/generate-bulanan'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    ).timeout(const Duration(seconds: 8));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Gagal menerbitkan tagihan bulanan');
  }

  static Future<Map<String, dynamic>> checkNikAvailability(String nik) async {
    final cleanNik = nik.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanNik.length != 16) {
      return {'available': true, 'valid': false, 'message': 'Panjang NIK harus 16 digit'};
    }
    try {
      final configuredUrl = await getBaseUrl();
      final res = await http.get(Uri.parse('$configuredUrl/auth/check-nik/$cleanNik')).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (_) {}
    return {'available': true, 'valid': true, 'message': 'NIK valid'};
  }

  // Real Database CCTV Lingkungan (Live Streaming)
  static Future<List<dynamic>> getCctvList() async {
    try {
      final token = await getToken();
      final response = await _getWithFallback('/cctv', token: token);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return [];
  }

  static Future<Map<String, dynamic>> createCctv(Map<String, dynamic> data) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.post(
      Uri.parse('$configuredUrl/cctv'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    ).timeout(const Duration(seconds: 6));

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    final body = jsonDecode(res.body);
    throw Exception(body['message'] ?? 'Gagal menambahkan titik CCTV');
  }

  static Future<void> deleteCctv(String id) async {
    final token = await getToken();
    final configuredUrl = await getBaseUrl();
    final res = await http.delete(
      Uri.parse('$configuredUrl/cctv/$id'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    ).timeout(const Duration(seconds: 6));

    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception('Gagal menghapus CCTV');
    }
  }
}

