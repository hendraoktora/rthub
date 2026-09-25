import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rthub_mobile/core/services/notification_service.dart';
import 'package:rthub_mobile/features/panic/emergency_alert_dialog.dart';
import 'package:rthub_mobile/features/panic/panic_gateway.dart';
import 'package:rthub_mobile/features/panic/panic_screen.dart';

class _FakeGateway implements PanicGateway {
  _FakeGateway({this.fail = false, this.location});
  bool fail;
  final PanicLocation? location;
  int calls = 0;
  PanicLocation? sentLocation;
  String? sentCategory;

  @override
  Future<PanicLocationResult> locate() async => PanicLocationResult(
    location: location,
    message: location == null
        ? 'Lokasi belum tersedia.'
        : 'GPS tersedia · akurasi ±12 m',
  );

  @override
  Future<Map<String, dynamic>> send({
    required String categoryLabel,
    PanicLocation? location,
  }) async {
    calls++;
    sentLocation = location;
    sentCategory = categoryLabel;
    if (fail) throw Exception('Offline');
    return {
      'alert': {'id': 'test-alert'},
    };
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  const channel = MethodChannel('com.rthub.rthub_mobile/widget');
  final alarmCalls = <String>[];

  setUp(() {
    NotificationService.lastSelfTriggeredAlertTime = null;
    NotificationService.lastSelfTriggeredAlertId = null;
    NotificationService.currentUserId = null;
    NotificationService.currentUserPhone = null;
    alarmCalls.clear();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, (call) async {
          alarmCalls.add(call.method);
          return true;
        });
  });

  tearDown(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, null);
  });

  Future<void> pumpHost(
    WidgetTester tester, {
    PanicGateway? gateway,
    Map<String, dynamic>? alert,
    double textScale = 1,
  }) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      MaterialApp(
        builder: (context, child) => MediaQuery(
          data: MediaQuery.of(context).copyWith(
            disableAnimations: true,
            textScaler: TextScaler.linear(textScale),
          ),
          child: child!,
        ),
        home: Scaffold(
          body: Builder(
            builder: (context) => Center(
              child: TextButton(
                onPressed: () {
                  if (alert != null) {
                    showEmergencyAlertDialog(context, alert);
                  } else {
                    showModalBottomSheet<void>(
                      context: context,
                      isScrollControlled: true,
                      builder: (_) => PanicScreen(gateway: gateway!),
                    );
                  }
                },
                child: const Text('Open'),
              ),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();
  }

  Future<void> tapSend(WidgetTester tester) async {
    final button = find.byKey(const ValueKey('send-panic'));
    await tester.ensureVisible(button);
    await tester.tap(button);
    await tester.pumpAndSettle();
  }

  test('Coordinates reject malformed, nonfinite and out-of-range values', () {
    for (final pair in [
      ['NaN', '106'],
      ['91', '106'],
      ['-6', '181'],
      ['', '1'],
      ['0', 'Infinity'],
    ]) {
      expect(PanicLocation.tryParse(pair[0], pair[1]), isNull);
    }
    final location = PanicLocation.tryParse('-6.2', '106.816666')!;
    expect(location.mapsUri.queryParameters['query'], '-6.2,106.816666');
    expect(PanicLocation.tryParse(0, 0), isNotNull);
  });

  testWidgets(
    'SOS requires explicit confirmation and preserves category and GPS',
    (tester) async {
      final gateway = _FakeGateway(
        location: const PanicLocation(latitude: -6.2, longitude: 106.8),
      );
      await pumpHost(tester, gateway: gateway);
      await tester.ensureVisible(find.text('Medis'));
      await tester.tap(find.text('Medis'));
      await tapSend(tester);
      expect(gateway.calls, 0);
      expect(find.text('Kirim SOS sekarang'), findsOneWidget);
      await tapSend(tester);
      expect(gateway.calls, 1);
      expect(gateway.sentCategory, 'Medis');
      expect(gateway.sentLocation?.latitude, -6.2);
      expect(NotificationService.lastSelfTriggeredAlertId, 'test-alert');
      expect(find.byType(PanicScreen), findsNothing);
      expect(
        find.text('SOS dan titik GPS berhasil dikirim ke pengurus RT.'),
        findsOneWidget,
      );
    },
  );

  testWidgets('Failed delivery stays open, reports failure, and allows retry', (
    tester,
  ) async {
    final gateway = _FakeGateway(fail: true);
    await pumpHost(tester, gateway: gateway);
    await tapSend(tester);
    await tapSend(tester);
    expect(find.byType(PanicScreen), findsOneWidget);
    expect(
      find.textContaining('Pengiriman SOS belum terkonfirmasi'),
      findsOneWidget,
    );
    expect(find.textContaining('berhasil dikirim'), findsNothing);
    expect(NotificationService.lastSelfTriggeredAlertTime, isNull);
    gateway.fail = false;
    await tapSend(tester);
    expect(gateway.calls, 2);
    expect(gateway.sentLocation, isNull);
    expect(
      find.text('SOS berhasil dikirim. Titik GPS belum tersedia.'),
      findsOneWidget,
    );
  });

  testWidgets(
    'Incoming mute is immediate and survives scroll with large text',
    (tester) async {
      await pumpHost(
        tester,
        textScale: 1.8,
        alert: {
          'alertId': 'other-alert',
          'namaPelapor': 'Ibu Sari',
          'noRumah': '12A',
          'catatan': 'Mohon bantuan medis untuk warga.',
          'latitude': '-6.2',
          'longitude': '106.8',
        },
      );
      expect(alarmCalls, contains('playPanicAlarm'));
      final mute = find.byKey(const ValueKey('mute-alarm'));
      expect(tester.getTopLeft(mute).dy, lessThan(180));
      await tester.tap(mute);
      await tester.pumpAndSettle();
      expect(alarmCalls, contains('stopPanicAlarm'));
      expect(find.text('Sirine dimatikan'), findsOneWidget);
      expect(find.byType(EmergencyAlertDialog), findsOneWidget);
      await tester.ensureVisible(find.byKey(const ValueKey('open-panic-map')));
      expect(tester.getTopLeft(mute).dy, lessThan(180));
      expect(tester.takeException(), isNull);
      await tester.tap(find.byTooltip('Tutup peringatan'));
      await tester.pumpAndSettle();
      expect(find.byType(EmergencyAlertDialog), findsNothing);
    },
  );

  testWidgets(
    'Invalid coordinates never show map action and back stops alarm',
    (tester) async {
      await pumpHost(
        tester,
        alert: {
          'alertId': 'gps-invalid',
          'latitude': 'NaN',
          'longitude': '106',
        },
      );
      expect(find.byKey(const ValueKey('open-panic-map')), findsNothing);
      expect(find.text('Titik GPS belum tersedia'), findsOneWidget);
      alarmCalls.clear();
      await tester.binding.handlePopRoute();
      await tester.pumpAndSettle();
      expect(find.byType(EmergencyAlertDialog), findsNothing);
      expect(alarmCalls, contains('stopPanicAlarm'));
    },
  );

  testWidgets('Own alerts do not open a dialog or play an alarm', (
    tester,
  ) async {
    NotificationService.currentUserId = 'resident-1';
    await pumpHost(
      tester,
      alert: {'alertId': 'own-alert', 'senderUserId': 'resident-1'},
    );
    expect(find.byType(EmergencyAlertDialog), findsNothing);
    expect(alarmCalls, isEmpty);
  });

  testWidgets('Missing native alarm support keeps the incoming alert usable', (
    tester,
  ) async {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(
          channel,
          (call) async => throw MissingPluginException(),
        );
    await pumpHost(tester, alert: {'alertId': 'no-plugin'});
    expect(find.text('Suara tidak tersedia'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.tap(find.byTooltip('Tutup peringatan'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });
}
