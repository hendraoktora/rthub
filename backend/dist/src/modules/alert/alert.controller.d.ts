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
    getActive(user: any, lat?: string, lng?: string): Promise<({
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
    resolve(id: string): Promise<{
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
