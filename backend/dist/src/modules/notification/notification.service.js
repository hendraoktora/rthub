"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let NotificationService = NotificationService_1 = class NotificationService {
    constructor() {
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.firebaseApp = null;
    }
    onModuleInit() {
        this.initializeFirebase();
    }
    initializeFirebase() {
        try {
            if (admin.apps.length > 0) {
                this.firebaseApp = admin.apps[0];
                return;
            }
            const keyPaths = [
                path.resolve(process.cwd(), 'firebase-key.json'),
                path.resolve(process.cwd(), 'serviceAccountKey.json'),
                path.resolve(__dirname, '../../../../firebase-key.json'),
                path.resolve(__dirname, '../../../firebase-key.json'),
                path.resolve(__dirname, '../../firebase-key.json'),
                path.resolve(__dirname, 'firebase-key.json'),
            ];
            let keyFilePath = null;
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
        }
        catch (error) {
            this.logger.error('[FCM] Failed to initialize Firebase Admin SDK:', error);
        }
    }
    async sendToTopic(topic, title, body, data = {}) {
        if (!this.firebaseApp) {
            this.logger.warn(`[FCM] Push skipped (Firebase not active). Topic: [${topic}], Title: [${title}]`);
            return null;
        }
        try {
            const cleanTopic = topic.replace(/[^a-zA-Z0-9-_.~%]/g, '_');
            const isPanic = data?.type === 'PANIC';
            const payload = {
                topic: cleanTopic,
                notification: {
                    title,
                    body,
                },
                data: {
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    channel_id: isPanic ? 'rthub_sos_alarm_v3' : 'rthub_high_importance_channel',
                    sound: isPanic ? 'siren' : 'default',
                    ...data,
                },
                android: {
                    priority: 'high',
                    notification: {
                        channelId: isPanic ? 'rthub_sos_alarm_v3' : 'rthub_high_importance_channel',
                        sound: isPanic ? 'siren' : 'default',
                        priority: isPanic ? 'max' : 'high',
                        visibility: 'public',
                        defaultVibrateTimings: true,
                    },
                },
            };
            const response = await admin.messaging().send(payload);
            this.logger.log(`[FCM] Push notification sent to topic [${cleanTopic}] (isPanic: ${isPanic}): ${response}`);
            return response;
        }
        catch (error) {
            this.logger.error(`[FCM] Error sending push to topic [${topic}]:`, error);
            return null;
        }
    }
    async sendToDevice(fcmToken, title, body, data = {}) {
        if (!this.firebaseApp || !fcmToken)
            return null;
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
        }
        catch (error) {
            this.logger.error(`[FCM] Error sending push to device token:`, error);
            return null;
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)()
], NotificationService);
//# sourceMappingURL=notification.service.js.map