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
    getActive(user: any, lat?: string, lng?: string): Promise<({
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
    resolve(id: string): Promise<{
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
