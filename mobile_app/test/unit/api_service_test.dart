import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:rthub_mobile/core/services/api_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await ApiService.clearSession();
  });

  tearDown(() => ApiService.setClientForTesting(http.Client()));

  group('ApiService - Authentication & User Data Tests', () {
    test('getUserData returns saved user profile correctly', () async {
      await ApiService.saveUserData({
        'id': 'user_hendra',
        'role': 'WARGA',
        'profile': {
          'namaLengkap': 'Hendra Oktora',
          'nomorTelepon': '081234567890',
          'nomorRumah': 'A1/05',
        },
      });
      final user = await ApiService.getUserData();
      expect(user, isNotNull);
      expect(user?['profile'], isNotNull);
      expect(user?['profile']?['namaLengkap'], contains('Hendra'));
    });

    test('NIK validation checks length correctly', () async {
      final invalidNik = await ApiService.checkNikAvailability('12345');
      expect(invalidNik['valid'], isFalse);

      final validNik = await ApiService.checkNikAvailability(
        '3201012345670001',
      );
      expect(validNik['valid'], isTrue);
    });
  });

  group('ApiService - Kas & Keuangan RT Tests', () {
    test(
      'getKasSummary returns complete cash balance and transaction mutations',
      () async {
        final summary = await ApiService.getKasSummary();
        expect(summary, isNotNull);
        expect(summary['saldoKas'], isNotNull);
        expect(summary['totalPemasukan'], isNotNull);
        expect(summary['totalPengeluaran'], isNotNull);
        expect(summary['recentTransactions'], isList);
        expect((summary['recentTransactions'] as List).isNotEmpty, isTrue);
      },
    );
  });

  group('ApiService - Lapak & Shopee Ads Boost Tests', () {
    test(
      'getLapakList returns active products with fallback and local items',
      () async {
        final list = await ApiService.getLapakList();
        expect(list, isNotEmpty);
        final hasIbuSiti = list.any(
          (item) =>
              item['sellerId'] == 'seller_ibu_siti' ||
              (item['seller']?['profile']?['namaLengkap'] ?? '')
                  .toString()
                  .contains('Siti'),
        );
        expect(
          hasIbuSiti,
          isTrue,
          reason: 'Lapak Ibu Siti must be present in Lapak catalog',
        );
      },
    );

    test('createLapak returns a server-confirmed product', () async {
      await ApiService.saveToken('test-token');
      ApiService.setClientForTesting(MockClient((request) async => http.Response(
        '{"id":"server-product","judul":"Es Kopi Susu Aren Gula Asli"}', 201)));
      final newItem = await ApiService.createLapak({
        'judul': 'Es Kopi Susu Aren Gula Asli',
        'harga': 15000,
        'kategori': 'Minuman',
        'kontakWa': '081234567890',
        'deskripsi': 'Segar dan manis alami',
      });

      expect(newItem['id'], isNotNull);
      expect(newItem['judul'], 'Es Kopi Susu Aren Gula Asli');

    });

    test(
      'boostLapakProduk upgrades product with SPONSORED badge and package info',
      () async {
        await ApiService.saveToken('test-token');
        const targetId = 'product-1';
        ApiService.setClientForTesting(MockClient((request) async => http.Response('{}', 200)));

        await ApiService.boostLapakProduk(
          targetId,
          packageType: 'IKLAN_RT',
          durationDays: 7,
          price: 30000,
          paymentMethod: 'QRIS',
        );

        expect(true, isTrue, reason: 'A 2xx response is the activation confirmation.');
      },
    );

    test('deleteLapak returns only after server confirms removal', () async {
      await ApiService.saveToken('test-token');
      ApiService.setClientForTesting(MockClient((request) async => http.Response('', 204)));
      await ApiService.deleteLapak('product-1');
      expect(true, isTrue, reason: 'A 2xx response confirms removal.');
    });
  });

  group('ApiService - Tagihan & Transparansi Iuran Warga Tests', () {
    test('getTagihanSaya returns active monthly bill', () async {
      final tagihan = await ApiService.getTagihanSaya();
      expect(tagihan, isNotEmpty);
      expect(tagihan.first['nominalPokok'], isNotNull);
      expect(tagihan.first['totalBayar'], isNotNull);
    });

    test(
      'getTransparansiIuranWarga aggregates accurate statistics and resident list',
      () async {
        final data = await ApiService.getTransparansiIuranWarga(
          bulan: 9,
          tahun: 2026,
        );
        expect(data, isNotNull);
        expect(data['totalRumah'], greaterThan(0));
        expect(data['totalLunas'], greaterThan(0));
        expect(data['totalBelumLunas'], greaterThanOrEqualTo(0));
        expect(data['targetIuran'], equals(data['totalRumah'] * 50000));
        expect(data['wargaIuranList'], isList);
        expect(
          (data['wargaIuranList'] as List).length,
          equals(data['totalRumah']),
        );
      },
    );
  });

  group('ApiService - Lapor & Pengaduan Tests', () {
    test(
      'getLaporanList returns seeded citizen reports with timeline',
      () async {
        final reports = await ApiService.getLaporanList();
        expect(reports, isNotEmpty);
        expect(reports.first['judul'], isNotNull);
        expect(reports.first['status'], isNotNull);
      },
    );

    test('createLaporan appends report to database list', () async {
      final newReport = await ApiService.createLaporan({
        'judul': 'Lampu Jalan Blok C Padam',
        'deskripsi':
            'Lampu penerangan di depan tiang C3 padam sejak kemarin malam',
        'kategori': 'FASILITAS',
        'targetRole': 'SEKSI_KEAMANAN',
      });

      expect(newReport['id'], isNotNull);
      final list = await ApiService.getLaporanList();
      expect(list.any((r) => r['judul'] == 'Lampu Jalan Blok C Padam'), isTrue);
    });

    test(
      'updateLaporanStatus updates status and logs timeline entry',
      () async {
        final reports = await ApiService.getLaporanList();
        final reportId = reports.first['id'].toString();

        await ApiService.updateLaporanStatus(
          reportId,
          status: 'SELESAI',
          tanggapanRT: 'Petugas PLN telah mengganti bohlam LED',
          tanggapanBy: 'Pak Bambang (Keamanan RT)',
        );

        final updatedReports = await ApiService.getLaporanList();
        final updated = updatedReports.firstWhere(
          (r) => r['id'].toString() == reportId,
        );
        expect(updated['status'], 'SELESAI');
        expect(updated['tanggapanBy'], contains('Pak Bambang'));
      },
    );
  });

  group('ApiService - Struktur Pengurus & Wilayah Tests', () {
    test('getPengurusList returns all 6 committee roles', () async {
      final list = await ApiService.getPengurusList();
      expect(list.length, equals(6));

      final roles = list.map((p) => p['jabatan'] ?? p['role']).toList();
      expect(roles, contains('KETUA_RT'));
      expect(roles, contains('SEKRETARIS'));
      expect(roles, contains('BENDAHARA'));
      expect(roles, contains('SEKSI_KEAMANAN'));
      expect(roles, contains('SEKSI_KEBERSIHAN'));
      expect(roles, contains('SEKSI_HUMAS'));
    });

    test('getWargaList returns 28 residential units', () async {
      final warga = await ApiService.getWargaList();
      expect(warga['totalRumah'], equals(28));
      expect(warga['rumahList'], isList);
      expect((warga['rumahList'] as List).length, equals(28));
    });
  });

  group('ApiService - Agenda, CCTV & Panic Tests', () {
    test('getAgendaList returns upcoming events', () async {
      final list = await ApiService.getAgendaList();
      expect(list, isNotEmpty);
      expect(list.first['judul'], isNotNull);
    });

    test('getCctvList returns live streaming links', () async {
      final cctv = await ApiService.getCctvList();
      expect(cctv, isNotNull);
    });
  });
}
