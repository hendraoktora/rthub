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
            kelurahanId: string | null;
            rwId: string | null;
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
        user: {
            profile: {
                namaLengkap: string;
                noRumah: string;
            };
            phone: string;
        };
        rt: {
            nomor: string;
        };
    } & {
        rtId: string;
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
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
        kelurahanId: string | null;
        rwId: string | null;
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
