import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:rthub_mobile/features/lapor/lapor_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  Widget createLaporScreen() {
    return const MaterialApp(
      home: LaporScreen(),
    );
  }

  testWidgets('LaporScreen renders title and new report action button', (WidgetTester tester) async {
    await tester.pumpWidget(createLaporScreen());
    await tester.pumpAndSettle();

    expect(find.textContaining('Lapor & Pengaduan Warga'), findsOneWidget);
    expect(find.text('Buat Laporan'), findsOneWidget);
  });

  testWidgets('LaporScreen displays floating action button and refresh option', (WidgetTester tester) async {
    await tester.pumpWidget(createLaporScreen());
    await tester.pumpAndSettle();

    expect(find.byType(FloatingActionButton), findsOneWidget);
    expect(find.byIcon(Icons.refresh_rounded), findsOneWidget);
  });
}
