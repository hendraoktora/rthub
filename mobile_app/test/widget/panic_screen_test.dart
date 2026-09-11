import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:rthub_mobile/features/panic/panic_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  Widget createPanicScreen() {
    return const MaterialApp(
      home: Scaffold(
        body: PanicScreen(),
      ),
    );
  }

  testWidgets('PanicScreen renders Emergency SOS title and button', (WidgetTester tester) async {
    await tester.pumpWidget(createPanicScreen());
    await tester.pumpAndSettle();

    expect(find.textContaining('PANIC BUTTON'), findsWidgets);
    expect(find.text('SOS'), findsOneWidget);
    expect(find.byIcon(Icons.crisis_alert_rounded), findsOneWidget);
  });
}
