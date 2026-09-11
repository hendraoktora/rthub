import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:rthub_mobile/features/home/home_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  Widget createHomeScreen() {
    return const MaterialApp(
      home: HomeScreen(),
    );
  }

  testWidgets('HomeScreen renders header, greeting, and community details', (WidgetTester tester) async {
    await tester.pumpWidget(createHomeScreen());
    await tester.pumpAndSettle();

    expect(find.textContaining('Halo'), findsWidgets);
    expect(find.textContaining('RT 03'), findsWidgets);
  });

  testWidgets('HomeScreen renders Quick Action buttons', (WidgetTester tester) async {
    await tester.pumpWidget(createHomeScreen());
    await tester.pumpAndSettle();

    expect(find.text('Bayar IPL'), findsOneWidget);
    expect(find.text('Lapor RT'), findsOneWidget);
    expect(find.text('Lapak RT'), findsOneWidget);
    expect(find.text('Agenda RT'), findsOneWidget);
    expect(find.text('CCTV Live'), findsOneWidget);
  });

  testWidgets('HomeScreen renders Floating Emergency SOS Button', (WidgetTester tester) async {
    await tester.pumpWidget(createHomeScreen());
    await tester.pumpAndSettle();

    expect(find.text('SOS'), findsWidgets);
    expect(find.byIcon(Icons.crisis_alert_rounded), findsWidgets);
  });

  testWidgets('HomeScreen renders Kas card with balance and details button', (WidgetTester tester) async {
    await tester.pumpWidget(createHomeScreen());
    await tester.pumpAndSettle();

    expect(find.textContaining('Saldo Kas Terbuka'), findsOneWidget);
    expect(find.text('Lihat Rincian'), findsOneWidget);
  });
}
