import 'dart:developer' as developer;
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  developer.log(
    'Handling background message: ${message.messageId} - Type: ${message.data['type']}',
    name: 'FCM',
  );
  if (message.data['type'] == 'PANIC') {
    if (!NotificationService.isSelfTriggered(message.data)) {
      try {
        await const MethodChannel(
          'com.rthub.rthub_mobile/widget',
        ).invokeMethod('playPanicAlarm');
      } catch (_) {}
    }
  }
}

class NotificationService {
  static FirebaseMessaging get _messaging => FirebaseMessaging.instance;
  static String? cachedToken;

  static DateTime? lastSelfTriggeredAlertTime;
  static String? lastSelfTriggeredAlertId;
  static String? currentUserId;
  static String? currentUserPhone;

  static bool isSelfTriggered(Map<String, dynamic> data) {
    final alertId = _identifier(data['alertId']);
    final senderId = _identifier(data['senderUserId']);
    final senderPhone = _normalizedPhone(data['senderPhone']);
    if (alertId != null && alertId == _identifier(lastSelfTriggeredAlertId)) {
      return true;
    }
    if (senderId != null && senderId == _identifier(currentUserId)) {
      return true;
    }
    if (senderPhone != null &&
        senderPhone == _normalizedPhone(currentUserPhone)) {
      return true;
    }
    // A recent local SOS must not hide another resident's identifiable alert.
    // Time-only suppression is retained for legacy payloads without identifiers.
    if (alertId != null || senderId != null || senderPhone != null)
      return false;
    final triggeredAt = lastSelfTriggeredAlertTime;
    if (triggeredAt != null) {
      final elapsed = DateTime.now().difference(triggeredAt);
      return !elapsed.isNegative && elapsed < const Duration(seconds: 120);
    }
    return false;
  }

  static String? _identifier(Object? value) {
    final text = value?.toString().trim();
    return text == null || text.isEmpty ? null : text;
  }

  static String? _normalizedPhone(Object? value) {
    var digits = value?.toString().replaceAll(RegExp(r'[^0-9]'), '') ?? '';
    if (digits.isEmpty) return null;
    if (digits.startsWith('0')) digits = '62${digits.substring(1)}';
    return digits;
  }

  /// Callbacks for Emergency Panic Alert
  static Function(Map<String, dynamic> data)? onPanicAlertReceived;
  static Function(Map<String, dynamic> data)? onPanicAlertOpened;

  /// Callbacks for Earthquake Alert
  static Function(Map<String, dynamic> data)? onGempaAlertReceived;
  static Function(Map<String, dynamic> data)? onGempaAlertOpened;

  static Future<void> initialize({
    Function(RemoteMessage message)? onMessageReceived,
    Function(RemoteMessage message)? onMessageOpenedApp,
  }) async {
    try {
      FirebaseMessaging.onBackgroundMessage(
        _firebaseMessagingBackgroundHandler,
      );

      // Request permissions (especially for Android 13+ and iOS)
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        announcement: true,
        badge: true,
        carPlay: false,
        criticalAlert: true,
        provisional: false,
        sound: true,
      );

      // Presentation options when app is in foreground
      await _messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      if (kDebugMode) {
        developer.log(
          'User granted permission: ${settings.authorizationStatus}',
          name: 'FCM',
        );
      }

      // Get device FCM Token
      cachedToken = await _messaging.getToken();
      if (cachedToken != null) {
        developer.log('FCM Token: $cachedToken', name: 'FCM');
      }

      // Foreground message stream
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        developer.log(
          'Foreground message received: ${message.notification?.title}',
          name: 'FCM',
        );

        if (message.data['type'] == 'PANIC') {
          onPanicAlertReceived?.call(message.data);
        } else if (message.data['type'] == 'GEMPA') {
          onGempaAlertReceived?.call(message.data);
        }

        if (onMessageReceived != null) {
          onMessageReceived(message);
        }
      });

      // App opened from background message
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        developer.log(
          'App opened from notification: ${message.notification?.title}',
          name: 'FCM',
        );

        if (message.data['type'] == 'PANIC') {
          onPanicAlertOpened?.call(message.data);
        } else if (message.data['type'] == 'GEMPA') {
          onGempaAlertOpened?.call(message.data);
        }

        if (onMessageOpenedApp != null) {
          onMessageOpenedApp(message);
        }
      });

      // Subscribe to general RT broadcast topic
      await _messaging.subscribeToTopic('rthub_broadcast');
    } catch (e) {
      developer.log(
        'NotificationService initialization error: $e',
        name: 'FCM',
      );
    }
  }

  static Future<RemoteMessage?> getInitialMessage() async {
    try {
      return await _messaging.getInitialMessage();
    } catch (e) {
      developer.log('Error getting initial FCM message: $e', name: 'FCM');
      return null;
    }
  }

  static Future<void> subscribeToRt(String rtId) async {
    try {
      final topic = 'rt_$rtId'.replaceAll(RegExp(r'[^a-zA-Z0-9-_.~%]'), '_');
      await _messaging.subscribeToTopic(topic);
    } catch (e) {
      developer.log('Error subscribing to RT topic: $e', name: 'FCM');
    }
  }

  static Future<String?> getToken() async {
    try {
      return await _messaging.getToken();
    } catch (_) {
      return null;
    }
  }
}
