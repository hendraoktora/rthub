import { PrismaService } from '../../prisma/prisma.service';
export declare class AlertService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getActiveAlerts(rtId: string): Promise<({
        user: {
            phone: string;
            profile: {
                namaLengkap: string;
                noRumah: string;
            };
        };
    } & {
        id: string;
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
