import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rthub_mobile/features/lapak/lapak_models.dart';
import 'package:rthub_mobile/features/lapak/lapak_repository.dart';
import 'package:rthub_mobile/features/lapak/lapak_screen.dart';

class _FakeLapakRepository extends LapakRepository {
  final products = <LapakProduct>[
    LapakProduct.fromJson(const {
      'id': 'p1',
      'judul': 'Kue basah Ibu Siti',
      'harga': 3500,
      'kategori': 'Kuliner',
      'sellerId': 'other',
      'seller': {'profile': {'namaLengkap': 'Ibu Siti'}},
      'isPromoted': true,
      'fotoUrl': '',
    }),
    LapakProduct.fromJson(const {
      'id': 'p2',
      'judul': 'Service AC Pak Joko',
      'harga': 65000,
      'kategori': 'Jasa',
      'sellerId': 'resident-1',
      'seller': {'profile': {'namaLengkap': 'Pak Joko'}},
    }),
  ];

  @override
  Future<List<LapakProduct>> loadProducts() async => products;

  @override
  Future<Map<String, dynamic>> loadUser() async => {'id': 'resident-1', 'role': 'WARGA'};

  @override
  Future<void> save(Map<String, dynamic> fields, {String? id}) async {}

  @override
  Future<void> delete(String id) async {}

  @override
  Future<void> promote(String id, AdPackage package) async {}
}

Widget _host() => MediaQuery(
      data: const MediaQueryData(disableAnimations: true),
      child: MaterialApp(home: LapakScreen(repository: _FakeLapakRepository())),
    );

void main() {
  testWidgets('Lapak renders sponsored showcase, catalog, and owner controls', (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(_host());
    await tester.pump();
    expect(find.text('Lapak warga'), findsOneWidget);
    expect(find.text('Sorotan lokal'), findsOneWidget);
    expect(find.text('SPONSORED'), findsWidgets);
    expect(find.text('Kue basah Ibu Siti'), findsWidgets);
    await tester.scrollUntilVisible(find.text('Semua lapak'), 480,
        scrollable: find.byType(Scrollable).first);
    expect(find.text('Semua lapak'), findsOneWidget);
    expect(find.text('Lapak saya'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Promosikan'), 480,
        scrollable: find.byType(Scrollable).first);
    expect(find.text('Promosikan'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Lapak owner filter uses signed-in seller id', (tester) async {
    await tester.pumpWidget(_host());
    await tester.pump();
    await tester.scrollUntilVisible(find.text('Lapak saya'), 500,
        scrollable: find.byType(Scrollable).first);
    await tester.tap(find.text('Lapak saya'));
    await tester.pump();
    expect(find.text('Service AC Pak Joko'), findsWidgets);
    expect(find.text('Kue basah Ibu Siti'), findsNothing);
  });
}
