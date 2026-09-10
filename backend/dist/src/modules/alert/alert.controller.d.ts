import { AlertService } from './alert.service';
export declare class AlertController {
    private readonly alertService;
    constructor(alertService: AlertService);
    triggerPanic(user: any, body: {
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
            rtId: string;
            id: string;
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
    getActive(user: any): Promise<({
        user: {
            profile: {
                namaLengkap: string;
                noRumah: string;
            };
            phone: string;
        };
    } & {
        rtId: string;
        id: string;
        userId: string;
        status: import(".prisma/client").$Enums.StatusAlert;
        rumahId: string | null;
        latitude: number | null;
        longitude: number | null;
        catatan: string | null;
        triggeredAt: Date;
        resolvedAt: Date | null;
    })[]>;
    resolve(id: string): Promise<{
        rtId: string;
        id: string;
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
