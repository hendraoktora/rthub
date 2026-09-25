import 'package:flutter_test/flutter_test.dart';
import 'package:rthub_mobile/core/services/notification_service.dart';

void main() {
  setUp(() {
    NotificationService.currentUserId = 'me';
    NotificationService.currentUserPhone = '0852 8003 9433';
    NotificationService.lastSelfTriggeredAlertId = 'own-alert';
    NotificationService.lastSelfTriggeredAlertTime = DateTime.now();
  });

  test(
    'Self SOS matches sender identity or known alert ID without Firebase initialization',
    () {
      expect(
        NotificationService.isSelfTriggered({'senderUserId': 'me'}),
        isTrue,
      );
      expect(
        NotificationService.isSelfTriggered({
          'senderPhone': '+62-852-8003-9433',
        }),
        isTrue,
      );
      expect(
        NotificationService.isSelfTriggered({'alertId': 'own-alert'}),
        isTrue,
      );
    },
  );

  test(
    'Another resident remains audible even immediately after a local SOS',
    () {
      expect(
        NotificationService.isSelfTriggered({'senderUserId': 'neighbor'}),
        isFalse,
      );
      expect(
        NotificationService.isSelfTriggered({'senderPhone': '081200000000'}),
        isFalse,
      );
      expect(
        NotificationService.isSelfTriggered({'alertId': 'neighbor-alert'}),
        isFalse,
      );
      NotificationService.currentUserId = null;
      NotificationService.currentUserPhone = null;
      NotificationService.lastSelfTriggeredAlertId = null;
      expect(
        NotificationService.isSelfTriggered({
          'senderUserId': 'unknown-neighbor',
        }),
        isFalse,
      );
    },
  );

  test(
    'Timestamp suppression applies only to recent legacy payloads with no identifiers',
    () {
      expect(
        NotificationService.isSelfTriggered({'catatan': 'Legacy message'}),
        isTrue,
      );
      NotificationService.lastSelfTriggeredAlertTime = DateTime.now().subtract(
        const Duration(minutes: 3),
      );
      expect(NotificationService.isSelfTriggered({}), isFalse);
      NotificationService.lastSelfTriggeredAlertTime = DateTime.now().add(
        const Duration(minutes: 1),
      );
      expect(NotificationService.isSelfTriggered({}), isFalse);
    },
  );
}
