import { OnModuleInit } from '@nestjs/common';
export declare class NotificationService implements OnModuleInit {
    private readonly logger;
    private firebaseApp;
    onModuleInit(): void;
    private initializeFirebase;
    sendToTopic(topic: string, title: string, body: string, data?: Record<string, string>): Promise<string>;
    sendToDevice(fcmToken: string, title: string, body: string, data?: Record<string, string>): Promise<string>;
}
