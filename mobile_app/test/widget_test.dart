import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:rthub_mobile/main.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('RtHubApp smoke test renders successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const RtHubApp());
    await tester.pumpAndSettle();

    expect(find.byType(RtHubApp), findsOneWidget);
  });
}
