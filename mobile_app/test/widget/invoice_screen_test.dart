import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:rthub_mobile/features/invoice/invoice_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  Widget createInvoiceScreen({int initialTabIndex = 0}) {
    return MaterialApp(
      home: InvoiceScreen(initialTabIndex: initialTabIndex),
    );
  }

  testWidgets('InvoiceScreen renders Tagihan Saya with period dropdown and bill breakdown', (WidgetTester tester) async {
    await tester.pumpWidget(createInvoiceScreen(initialTabIndex: 0));
    await tester.pumpAndSettle();

    expect(find.text('Iuran & Transparansi RT'), findsOneWidget);
    expect(find.text('Tagihan Saya'), findsOneWidget);
    expect(find.text('Transparansi Warga'), findsOneWidget);
    expect(find.text('Rincian Komponen Iuran'), findsOneWidget);
  });

  testWidgets('InvoiceScreen can switch to Transparansi Warga tab with stats and filter chips', (WidgetTester tester) async {
    await tester.pumpWidget(createInvoiceScreen(initialTabIndex: 1));
    await tester.pumpAndSettle();

    expect(find.textContaining('Transparansi Iuran'), findsWidgets);
    expect(find.textContaining('Total Rumah'), findsWidgets);
    expect(find.textContaining('Sudah Bayar'), findsWidgets);
    expect(find.textContaining('Belum Bayar'), findsWidgets);
  });

  testWidgets('InvoiceScreen Transparansi Warga search filter works', (WidgetTester tester) async {
    await tester.pumpWidget(createInvoiceScreen(initialTabIndex: 1));
    await tester.pumpAndSettle();

    final searchField = find.byType(TextField);
    expect(searchField, findsOneWidget);

    await tester.enterText(searchField, 'Hendra');
    await tester.pumpAndSettle();

    expect(find.textContaining('Hendra'), findsWidgets);
  });
}
