import 'dart:developer' as developer;
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  developer.log('Handling background message: ${message.messageId}', name: 'FCM');
}

class NotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static String? cachedToken;

  static Future<void> initialize({
    Function(RemoteMessage message)? onMessageReceived,
    Function(RemoteMessage message)? onMessageOpenedApp,
  }) async {
    try {
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Request permissions (especially for Android 13+ and iOS)
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        announcement: false,
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
        developer.log('User granted permission: ${settings.authorizationStatus}', name: 'FCM');
      }

      // Get device FCM Token
      cachedToken = await _messaging.getToken();
      if (cachedToken != null) {
        developer.log('FCM Token: $cachedToken', name: 'FCM');
      }

      // Foreground message stream
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        developer.log('Foreground message received: ${message.notification?.title}', name: 'FCM');
        if (onMessageReceived != null) {
          onMessageReceived(message);
        }
      });

      // App opened from background message
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        developer.log('App opened from notification: ${message.notification?.title}', name: 'FCM');
        if (onMessageOpenedApp != null) {
          onMessageOpenedApp(message);
        }
      });

      // Subscribe to general RT broadcast topic
      await _messaging.subscribeToTopic('rthub_broadcast');
    } catch (e) {
      developer.log('NotificationService initialization error: $e', name: 'FCM');
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
