import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
export declare class AlertService {
    private prisma;
    private notificationService;
    constructor(prisma: PrismaService, notificationService: NotificationService);
    triggerPanic(user: any, data: {
        latitude?: number;
        longitude?: number;
        catatan?: string;
    }): Promise<{
        message: string;
        alert: {
            user: {
                phone: string;
                profile: {
                    namaLengkap: string;
                    noRumah: string;
                };
            };
        } & {
            id: string;
            kelurahanId: string | null;
            rwId: string | null;
            rtId: string;
            userId: string;
            rumahId: string | null;
            status: import(".prisma/client").$Enums.StatusAlert;
            latitude: number | null;
            longitude: number | null;
            catatan: string | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
        };
    }>;
    getActiveAlerts(user: any, userLat?: number, userLng?: number): Promise<({
        user: {
            phone: string;
            profile: {
                namaLengkap: string;
                noRumah: string;
            };
        };
        rt: {
            nomor: string;
        };
    } & {
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string;
        userId: string;
        rumahId: string | null;
        status: import(".prisma/client").$Enums.StatusAlert;
        latitude: number | null;
        longitude: number | null;
        catatan: string | null;
        triggeredAt: Date;
        resolvedAt: Date | null;
    })[]>;
    resolveAlert(alertId: string): Promise<{
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string;
        userId: string;
        rumahId: string | null;
        status: import(".prisma/client").$Enums.StatusAlert;
        latitude: number | null;
        longitude: number | null;
        catatan: string | null;
        triggeredAt: Date;
        resolvedAt: Date | null;
    }>;
}
