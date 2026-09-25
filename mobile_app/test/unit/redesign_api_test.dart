import 'dart:convert';
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
    await ApiService.saveToken('test-token');
    await ApiService.saveUserData({'id': 'resident-1'});
  });

  tearDown(() {
    ApiService.setClientForTesting(http.Client());
  });

  test(
    'strict empty catalog does not seed demo products or local promotions',
    () async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        'local_custom_lapak',
        jsonEncode([
          {'id': 'offline', 'isPromoted': true},
        ]),
      );
      ApiService.setClientForTesting(
        MockClient((request) async => http.Response('[]', 200)),
      );
      expect(await ApiService.getLapakList(allowFallback: false), isEmpty);
    },
  );

  test('strict failed kas cannot be displayed as zero balance', () async {
    ApiService.setClientForTesting(
      MockClient((request) async => http.Response('{}', 503)),
    );
    await expectLater(
      ApiService.getKasSummary(allowFallback: false),
      throwsException,
    );
  });

  test(
    'strict catalog marks ownership only from signed-in seller id',
    () async {
      ApiService.setClientForTesting(
        MockClient(
          (request) async => http.Response(
            jsonEncode([
              {'id': 'a', 'sellerId': 'resident-1'},
              {'id': 'b', 'sellerId': 'other'},
            ]),
            200,
          ),
        ),
      );
      final list = await ApiService.getLapakList(allowFallback: false);
      expect(list[0]['isOwner'], isTrue);
      expect(list[1]['isOwner'], isFalse);
    },
  );

  test('failed boost never stores a sponsored claim locally', () async {
    ApiService.setClientForTesting(
      MockClient(
        (request) async => http.Response('{"message":"Ditolak"}', 403),
      ),
    );
    await expectLater(
      ApiService.boostLapakProduk(
        'product-1',
        packageType: 'IKLAN_RT',
        durationDays: 7,
        price: 10000,
        scope: 'RT',
      ),
      throwsException,
    );
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('local_custom_lapak'), isNull);
  });

  test('create failure never creates a pretend published product', () async {
    ApiService.setClientForTesting(
      MockClient((request) async => http.Response('{}', 500)),
    );
    await expectLater(
      ApiService.createLapak({'judul': 'Produk'}),
      throwsException,
    );
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('local_custom_lapak'), isNull);
  });

  test(
    'global package uses backend SEMUA scope and reports only server success',
    () async {
      late Map<String, dynamic> sent;
      ApiService.setClientForTesting(
        MockClient((request) async {
          expect(request.url.path, '/api/lapak/product-1/boost');
          expect(request.headers['Authorization'], 'Bearer test-token');
          sent = jsonDecode(request.body) as Map<String, dynamic>;
          return http.Response('{"id":"product-1","isPromoted":true}', 201);
        }),
      );
      await ApiService.boostLapakProduk(
        'product-1',
        packageType: 'IKLAN_GLOBAL',
        durationDays: 30,
        price: 100000,
        scope: 'SEMUA',
      );
      expect(sent['scope'], 'SEMUA');
      expect(sent['paymentMethod'], isNull);
    },
  );

  test('unsupported editing never deletes existing product', () async {
    final methods = <String>[];
    ApiService.setClientForTesting(
      MockClient((request) async {
        methods.add(request.method);
        return http.Response('{}', 404);
      }),
    );
    await expectLater(
      ApiService.updateLapak('existing', {'judul': 'Edit'}),
      throwsA(
        predicate((error) => error.toString().contains('tetap tersimpan')),
      ),
    );
    expect(methods, ['PATCH']);
  });
}
