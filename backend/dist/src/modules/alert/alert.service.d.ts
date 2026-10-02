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
                profile: {
                    namaLengkap: string;
                    noRumah: string;
                };
                phone: string;
            };
        } & {
            id: string;
            rwId: string | null;
            rtId: string;
            kelurahanId: string | null;
            userId: string;
            status: import(".prisma/client").$Enums.StatusAlert;
            rumahId: string | null;
            latitude: number | null;
            longitude: number | null;
            catatan: string | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
        };
    }>;
    getActiveAlerts(user: any, userLat?: number, userLng?: number): Promise<({
        rt: {
            nomor: string;
        };
        user: {
            profile: {
                namaLengkap: string;
                noRumah: string;
            };
            phone: string;
        };
    } & {
        id: string;
        rwId: string | null;
        rtId: string;
        kelurahanId: string | null;
        userId: string;
        status: import(".prisma/client").$Enums.StatusAlert;
        rumahId: string | null;
        latitude: number | null;
        longitude: number | null;
        catatan: string | null;
        triggeredAt: Date;
        resolvedAt: Date | null;
    })[]>;
    resolveAlert(alertId: string): Promise<{
        id: string;
        rwId: string | null;
        rtId: string;
        kelurahanId: string | null;
        userId: string;
        status: import(".prisma/client").$Enums.StatusAlert;
        rumahId: string | null;
        latitude: number | null;
        longitude: number | null;
        catatan: string | null;
        triggeredAt: Date;
        resolvedAt: Date | null;
    }>;
}
