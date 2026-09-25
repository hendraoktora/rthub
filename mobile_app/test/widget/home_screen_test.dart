import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rthub_mobile/features/home/home_repository.dart';
import 'package:rthub_mobile/features/home/home_screen.dart';

class _HomeFixture implements HomeRepository {
  @override
  Future<HomeSnapshot> load() async => HomeSnapshot(
        user: {
          'id': 'resident-1',
          'profile': {'namaLengkap': 'Hendra Oktora', 'noRumah': 'A1/05'},
          'rt': {'nomor': '03'},
          'rw': {'nomor': '08'},
        },
        kas: const {
          'saldoKas': 18450000,
          'totalPemasukan': 19400000,
          'totalPengeluaran': 950000,
        },
        invoices: const [],
        agenda: const [
          {'judul': 'Kerja bakti warga', 'tanggal': '2026-09-13T07:00:00Z'},
        ],
        announcements: const [
          {'judul': 'Portal ditutup pukul 22.00', 'konten': 'Info keamanan warga.'},
        ],
        products: const [],
        earthquake: const {
          'Magnitude': '3.2',
          'Wilayah': 'Jakarta Selatan',
          'Kedalaman': '10 Km',
        },
      );
}

Widget _host() => MediaQuery(
      data: const MediaQueryData(disableAnimations: true),
      child: MaterialApp(
        home: HomeScreen(repository: _HomeFixture(), enablePlatformListeners: false),
      ),
    );

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('dashboard renders identity, live cards, and five actions', (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(_host());
    await tester.pump();

    expect(find.textContaining('Halo, Hendra'), findsOneWidget);
    expect(find.text('RT 03 / RW 08'), findsOneWidget);
    final actions = find.byKey(const ValueKey('home-quick-actions'));
    expect(actions, findsOneWidget);
    for (final label in ['Iuran', 'Lapor', 'Lapak', 'Agenda', 'CCTV']) {
      expect(find.descendant(of: actions, matching: find.text(label)), findsOneWidget);
    }
    expect(find.textContaining('Saldo kas'), findsOneWidget);
    expect(find.text('M 3.2'), findsOneWidget);
    expect(find.bySemanticsLabel('SOS. Buka bantuan darurat'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('dashboard exposes partial data notice without replacing loaded data', (tester) async {
    await tester.pumpWidget(MediaQuery(
      data: const MediaQueryData(disableAnimations: true),
      child: MaterialApp(
        home: HomeScreen(repository: _FailingHomeFixture(), enablePlatformListeners: false),
      ),
    ));
    await tester.pump();
    expect(find.textContaining('Belum dapat memperbarui'), findsOneWidget);
    expect(find.textContaining('Data terakhir tetap ditampilkan'), findsOneWidget);
    expect(find.text('Rumah dekat.\nWarga erat.'), findsOneWidget);
  });
}

class _FailingHomeFixture implements HomeRepository {
  @override
  Future<HomeSnapshot> load() async => const HomeSnapshot(
        failedSections: {'kas', 'BMKG'},
        user: {
          'profile': {'namaLengkap': 'Warga'},
        },
      );
}
