import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:rthub_mobile/features/lapak/lapak_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  Widget createLapakScreen() {
    return const MaterialApp(
      home: LapakScreen(),
    );
  }

  testWidgets('LapakScreen renders Appbar and 2 Tab navigation items', (WidgetTester tester) async {
    await tester.pumpWidget(createLapakScreen());
    await tester.pumpAndSettle();

    expect(find.text('Lapak Warga & UMKM RT'), findsOneWidget);
    expect(find.textContaining('Semua Lapak'), findsOneWidget);
    expect(find.textContaining('Lapak Saya'), findsOneWidget);
  });

  testWidgets('LapakScreen displays + Pasang Iklan floating action button', (WidgetTester tester) async {
    await tester.pumpWidget(createLapakScreen());
    await tester.pumpAndSettle();

    expect(find.text('+ Pasang Iklan'), findsOneWidget);
  });

  testWidgets('LapakScreen can switch to Lapak Saya tab', (WidgetTester tester) async {
    await tester.pumpWidget(createLapakScreen());
    await tester.pumpAndSettle();

    // Tap on Lapak Saya tab
    await tester.tap(find.textContaining('Lapak Saya'));
    await tester.pumpAndSettle();

    expect(find.textContaining('Kelola Lapak'), findsOneWidget);
  });
}
