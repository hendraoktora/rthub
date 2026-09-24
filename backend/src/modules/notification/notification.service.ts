import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private firebaseApp: admin.app.App | null = null;

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (admin.apps.length > 0) {
        this.firebaseApp = admin.apps[0];
        return;
      }

      // 1. Cek apakah ada file firebase-key.json atau serviceAccountKey.json
      const keyPaths = [
        path.resolve(process.cwd(), 'firebase-key.json'),
        path.resolve(process.cwd(), 'serviceAccountKey.json'),
        path.resolve(__dirname, '../../../../firebase-key.json'),
        path.resolve(__dirname, '../../../firebase-key.json'),
        path.resolve(__dirname, '../../firebase-key.json'),
        path.resolve(__dirname, 'firebase-key.json'),
      ];

      let keyFilePath: string | null = null;
      for (const p of keyPaths) {
        if (fs.existsSync(p)) {
          keyFilePath = p;
          break;
        }
      }

      if (keyFilePath) {
        const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log(`[FCM] Firebase Admin successfully initialized using key file: ${keyFilePath}`);
        return;
      }

      // 2. Cek apakah ada environment variables
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const projectId = process.env.FIREBASE_PROJECT_ID || 'rthub-byhendraoktora';

      if (clientEmail && privateKey) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.logger.log(`[FCM] Firebase Admin initialized with env credentials for project: ${projectId}`);
        return;
      }

      this.logger.warn('[FCM] Firebase credentials not found (firebase-key.json or FIREBASE_CLIENT_EMAIL). Push notifications will be skipped until key is added.');
    } catch (error) {
      this.logger.error('[FCM] Failed to initialize Firebase Admin SDK:', error);
    }
  }

  async sendToTopic(topic: string, title: string, body: string, data: Record<string, string> = {}) {
    if (!this.firebaseApp) {
      this.logger.warn(`[FCM] Push skipped (Firebase not active). Topic: [${topic}], Title: [${title}]`);
      return null;
    }

    try {
      // Normalisasi nama topic FCM: hanya izinkan [a-zA-Z0-9-_.~%]
      const cleanTopic = topic.replace(/[^a-zA-Z0-9-_.~%]/g, '_');
      const isPanic = data?.type === 'PANIC';
      
      const payload: admin.messaging.Message = {
        topic: cleanTopic,
        notification: {
          title,
          body,
        },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          ...data,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: isPanic ? 'rthub_panic_channel' : 'rthub_high_importance_channel',
            sound: isPanic ? 'siren' : 'default',
            priority: isPanic ? 'max' : 'high',
            visibility: 'public',
            defaultSound: !isPanic,
            defaultVibrateTimings: true,
          },
        },
      };

      const response = await admin.messaging().send(payload);
      this.logger.log(`[FCM] Push notification sent to topic [${cleanTopic}] (isPanic: ${isPanic}): ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`[FCM] Error sending push to topic [${topic}]:`, error);
      return null;
    }
  }

  async sendToDevice(fcmToken: string, title: string, body: string, data: Record<string, string> = {}) {
    if (!this.firebaseApp || !fcmToken) return null;

    try {
      const response = await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          ...data,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'rthub_high_importance_channel',
            sound: 'default',
            priority: 'high',
          },
        },
      });
      return response;
    } catch (error) {
      this.logger.error(`[FCM] Error sending push to device token:`, error);
      return null;
    }
  }
}
